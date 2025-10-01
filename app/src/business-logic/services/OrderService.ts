import { OrderDAO } from '../persistence/models/OrderDao';
import { OrderModel } from '../../persistence/models/OrderModel';
import { ProductDAO } from '../persistence/models/ProductDao';
import { OrderItemModel } from '../../persistence/models/OrderItemModel';

export class OrderService {
    private orderDAO: OrderDAO;
    private productDAO: ProductDAO;

    constructor() {
        this.orderDAO = new OrderDAO();
        this.productDAO = new ProductDAO();
    }

    /**
     * Obtiene todas las órdenes.
     */
    public async getAllOrders(): Promise<OrderModel[]> {
        return this.orderDAO.findAll();
    }

    /**
     * Obtiene una orden por su ID.
     * @param id El ID de la orden.
     */
    public async getOrderById(id: number): Promise<OrderModel | null> {
        // El DAO ya se encarga de buscar los items de la orden.
        return this.orderDAO.findById(id);
    }

    /**
     * Obtiene todas las órdenes de un cliente específico.
     * @param customerId El ID del cliente.
     */
    public async getOrdersByCustomerId(customerId: number): Promise<OrderModel[]> {
        return this.orderDAO.findByCustomerId(customerId);
    }

    /**
     * Crea una nueva orden, validando stock y calculando el total.
     * @param orderData Datos de la orden a crear.
     */
    public async createOrder(orderData: Partial<OrderModel>): Promise<OrderModel> {
        if (!orderData.items || orderData.items.length === 0) {
            throw new Error('La orden debe tener al menos un ítem.');
        }

        let totalAmount = 0;
        const itemsWithDetails: OrderItemModel[] = [];

        // 1. Validar stock y calcular precios y total
        for (const item of orderData.items) {
            const product = await this.productDAO.findById(item.productId);
            if (!product) {
                throw new Error(`El producto con ID ${item.productId} no existe.`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Stock insuficiente para el producto: ${product.name}.`);
            }

            item.unitPrice = product.price;
            item.subtotal = product.price * item.quantity;
            totalAmount += item.subtotal;
            itemsWithDetails.push(new OrderItemModel(item));
        }

        // 2. Crear el objeto de la orden completo
        const newOrder = new OrderModel({
            ...orderData,
            items: itemsWithDetails,
            totalAmount: totalAmount,
            status: 'PENDING', // Estado inicial por defecto
            orderDate: new Date(),
            updatedAt: new Date()
        });

        // 3. Crear la orden en la base de datos
        const createdOrder = await this.orderDAO.create(newOrder);

        // 4. Actualizar el stock de los productos
        for (const item of createdOrder.items) {
            await this.productDAO.updateStock(item.productId, -item.quantity); // Suponiendo que updateStock puede reducir
        }

        return createdOrder;
    }
    
    /**
     * Actualiza el estado de una orden.
     * @param id El ID de la orden.
     * @param status El nuevo estado.
     */
    public async updateOrderStatus(id: number, status: string): Promise<OrderModel | null> {
        return this.orderDAO.updateStatus(id, status);
    }

    /**
     * Elimina una orden y repone el stock de los productos.
     * @param id El ID de la orden a eliminar.
     */
    public async deleteOrder(id: number): Promise<void> {
        // 1. Obtener la orden para saber qué productos reponer
        const orderToDelete = await this.orderDAO.findById(id);
        if (orderToDelete && orderToDelete.items) {
            // 2. Reponer el stock
            for (const item of orderToDelete.items) {
                // Suponiendo que updateStock puede sumar si la cantidad es positiva
                await this.productDAO.updateStock(item.productId, item.quantity);
            }
        }

        // 3. Eliminar la orden
        return this.orderDAO.delete(id);
    }
}