import { OrderRepository } from '../../persistence/repositories/OrderRepository';
import { ProductRepository } from '../../persistence/repositories/ProductRepository';
import { OrderModel } from '../../persistence/models/OrderModel';
import { OrderItemModel } from '../../persistence/models/OrderItemModel';
import { OrderStatus } from '../../persistence/models/types';
import { IOrderRepository } from '../repositories/IOrderRepository';
import { IProductRepository } from '../repositories/IProductRepository';

export class OrderService {
    private orderRepository: IOrderRepository;
    private productRepository: IProductRepository;

    constructor() {
        this.orderRepository = new OrderRepository();
        this.productRepository = new ProductRepository();
    }

    /**
     * Obtiene todas las órdenes.
     */
    public async getAllOrders(): Promise<OrderModel[]> {
        return this.orderRepository.findAll();
    }

    /**
     * Obtiene una orden por su ID.
     * @param id El ID de la orden.
     */
    public async getOrderById(id: number): Promise<OrderModel | null> {
        // El Repository ya se encarga de buscar los items de la orden.
        return this.orderRepository.findById(id);
    }

    /**
     * Obtiene todas las órdenes de un cliente específico.
     * @param customerId El ID del cliente.
     */
    public async getOrdersByCustomerId(customerId: number): Promise<OrderModel[]> {
        return this.orderRepository.findByCustomerId(customerId);
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
            const product = await this.productRepository.findById(item.productId);
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
            status: OrderStatus.PENDING, // Estado inicial por defecto
            orderDate: new Date(),
            updatedAt: new Date()
        });

        // 3. Crear la orden en la base de datos
        const createdOrder = await this.orderRepository.create(newOrder);

        // 4. Actualizar el stock de los productos
        for (const item of createdOrder.items) {
            const currentProduct = await this.productRepository.findById(item.productId);
            if (currentProduct) {
                await this.productRepository.updateStock(item.productId, currentProduct.stock - item.quantity);
            }
        }

        return createdOrder;
    }
    
    /**
     * Actualiza el estado de una orden.
     * @param id El ID de la orden.
     * @param status El nuevo estado.
     */
    public async updateOrderStatus(id: number, status: OrderStatus): Promise<OrderModel | null> {
        return this.orderRepository.updateStatus(id, status);
    }

    /**
     * Elimina una orden y repone el stock de los productos.
     * @param id El ID de la orden a eliminar.
     */
    public async deleteOrder(id: number): Promise<void> {
        // 1. Obtener la orden para saber qué productos reponer
        const orderToDelete = await this.orderRepository.findById(id);
        if (orderToDelete && orderToDelete.items) {
            // 2. Reponer el stock
            for (const item of orderToDelete.items) {
                const currentProduct = await this.productRepository.findById(item.productId);
                if (currentProduct) {
                    await this.productRepository.updateStock(item.productId, currentProduct.stock + item.quantity);
                }
            }
        }

        // 3. Eliminar la orden
        return this.orderRepository.delete(id);
    }

    /**
     * Obtiene órdenes por estado.
     * @param status El estado de las órdenes a buscar.
     */
    public async getOrdersByStatus(status: OrderStatus): Promise<OrderModel[]> {
        return this.orderRepository.findByStatus(status);
    }

    /**
     * Obtiene todas las órdenes pendientes.
     */
    public async getPendingOrders(): Promise<OrderModel[]> {
        return this.orderRepository.findPendingOrders();
    }

    /**
     * Obtiene órdenes dentro de un rango de fechas.
     * @param startDate Fecha de inicio.
     * @param endDate Fecha de fin.
     */
    public async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<OrderModel[]> {
        return this.orderRepository.findOrdersByDateRange(startDate, endDate);
    }

    /**
     * Calcula el revenue total de órdenes entregadas.
     */
    public async calculateTotalRevenue(): Promise<number> {
        return this.orderRepository.calculateTotalRevenue();
    }
}