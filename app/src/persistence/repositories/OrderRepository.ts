import { OrderModel } from '../models/OrderModel';
import { OrderDAO } from '../daos/OrderDao';
import { OrderItemDAO } from '../daos/OrderItemDao';
import { OrderStatus } from '../models/types';
import { IOrderRepository } from '../../business-logic/repositories/IOrderRepository';

export class OrderRepository implements IOrderRepository {
    private orderDAO: OrderDAO;
    private orderItemDAO: OrderItemDAO;

    constructor() {
        this.orderDAO = new OrderDAO();
        this.orderItemDAO = new OrderItemDAO();
    }

    async create(order: OrderModel): Promise<OrderModel> {
        try {
            this.validateOrder(order);
            this.calculateOrderTotal(order);

            // Repository coordinates: first create the order
            const createdOrder = await this.orderDAO.create(order);
            
            // Then create the order items if provided
            if (order.items && order.items.length > 0) {
                for (const item of order.items) {
                    item.orderId = createdOrder.id!;
                    await this.orderItemDAO.create(item);
                }
            }
            
            // Return complete order with items
            return await this.getOrderWithItems(createdOrder.id!);
        } catch (error) {
            throw new Error(`Error del repositorio creando orden: ${error}`);
        }
    }

    async findById(id: number): Promise<OrderModel | null> {
        try {
            if (id <= 0) {
                throw new Error('El ID de la orden debe ser un número positivo');
            }

            // Repository coordinates: get order and its items separately
            const order = await this.orderDAO.findById(id);
            if (!order) return null;
            
            return await this.getOrderWithItems(id);
        } catch (error) {
            throw new Error(`Error del repositorio buscando orden por ID: ${error}`);
        }
    }

    async findAll(): Promise<OrderModel[]> {
        try {
            const orders = await this.orderDAO.findAll();
            const ordersWithItems = [];
            
            // Repository coordinates: get each order with its items
            for (const order of orders) {
                const orderWithItems = await this.getOrderWithItems(order.id!);
                ordersWithItems.push(orderWithItems);
            }
            
            return ordersWithItems;
        } catch (error) {
            throw new Error(`Error del repositorio buscando todas las órdenes: ${error}`);
        }
    }

    async update(id: number, order: OrderModel): Promise<OrderModel> {
        try {
            if (id <= 0) {
                throw new Error('El ID de la orden debe ser un número positivo');
            }

            this.validateOrder(order);
            this.calculateOrderTotal(order);

            // Repository coordinates: update order first
            await this.orderDAO.update(id, order);
            
            // Then update order items - delete existing and recreate
            await this.orderItemDAO.deleteByOrderId(id);
            if (order.items && order.items.length > 0) {
                for (const item of order.items) {
                    item.orderId = id;
                    await this.orderItemDAO.create(item);
                }
            }
            
            return await this.getOrderWithItems(id);
        } catch (error) {
            throw new Error(`Error del repositorio actualizando orden: ${error}`);
        }
    }

    async delete(id: number): Promise<void> {
        try {
            if (id <= 0) {
                throw new Error('El ID de la orden debe ser un número positivo');
            }

            const existingOrder = await this.orderDAO.findById(id);
            if (existingOrder && existingOrder.status === OrderStatus.DELIVERED) {
                throw new Error('No se pueden eliminar órdenes entregadas');
            }

            // Repository coordina: primero elimina los items, luego la orden
            await this.orderItemDAO.deleteByOrderId(id);
            await this.orderDAO.delete(id);
        } catch (error) {
            throw new Error(`Error del repositorio eliminando orden: ${error}`);
        }
    }

    async findByCustomerId(customerId: number): Promise<OrderModel[]> {
        try {
            if (customerId <= 0) {
                throw new Error('El ID del cliente debe ser un número positivo');
            }

            const orders = await this.orderDAO.findByCustomerId(customerId);
            const ordersWithItems = [];
            
            for (const order of orders) {
                const orderWithItems = await this.getOrderWithItems(order.id!);
                ordersWithItems.push(orderWithItems);
            }
            
            return ordersWithItems;
        } catch (error) {
            throw new Error(`Error del repositorio buscando órdenes por ID de cliente: ${error}`);
        }
    }

    async findByStatus(status: OrderStatus): Promise<OrderModel[]> {
        try {
            if (!Object.values(OrderStatus).includes(status)) {
                throw new Error(`Estado de orden inválido: ${status}`);
            }

            const orders = await this.orderDAO.findByStatus(status);
            const ordersWithItems = [];
            
            for (const order of orders) {
                const orderWithItems = await this.getOrderWithItems(order.id!);
                ordersWithItems.push(orderWithItems);
            }
            
            return ordersWithItems;
        } catch (error) {
            throw new Error(`Error del repositorio buscando órdenes por estado: ${error}`);
        }
    }

    async updateStatus(id: number, status: OrderStatus): Promise<OrderModel> {
        try {
            if (id <= 0) {
                throw new Error('El ID de la orden debe ser un número positivo');
            }

            if (!Object.values(OrderStatus).includes(status)) {
                throw new Error(`Estado de orden inválido: ${status}`);
            }

            const existingOrder = await this.orderDAO.findById(id);
            if (existingOrder) {
                this.validateStatusTransition(existingOrder.status, status);
            }

            await this.orderDAO.updateStatus(id, status);
            return await this.getOrderWithItems(id);
        } catch (error) {
            throw new Error(`Error del repositorio actualizando estado de orden: ${error}`);
        }
    }

    async findOrdersByDateRange(startDate: Date, endDate: Date): Promise<OrderModel[]> {
        try {
            if (startDate > endDate) {
                throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
            }

            const allOrders = await this.orderDAO.findAll();
            const filteredOrders = allOrders.filter(order => {
                const orderDate = new Date(order.orderDate);
                return orderDate >= startDate && orderDate <= endDate;
            });

            const ordersWithItems = [];
            for (const order of filteredOrders) {
                const orderWithItems = await this.getOrderWithItems(order.id!);
                ordersWithItems.push(orderWithItems);
            }
            
            return ordersWithItems;
        } catch (error) {
            throw new Error(`Error del repositorio buscando órdenes por rango de fechas: ${error}`);
        }
    }

    async findPendingOrders(): Promise<OrderModel[]> {
        try {
            return await this.findByStatus(OrderStatus.PENDING);
        } catch (error) {
            throw new Error(`Error del repositorio buscando órdenes pendientes: ${error}`);
        }
    }

    async calculateTotalRevenue(): Promise<number> {
        try {
            const deliveredOrders = await this.orderDAO.findByStatus(OrderStatus.DELIVERED);
            return deliveredOrders.reduce((total, order) => total + order.totalAmount, 0);
        } catch (error) {
            throw new Error(`Error del repositorio calculando ingresos totales: ${error}`);
        }
    }

    private async getOrderWithItems(orderId: number): Promise<OrderModel> {
        // Repository coordinates: get order and its items separately
        const order = await this.orderDAO.findById(orderId);
        if (!order) {
            throw new Error(`Orden con ID ${orderId} no encontrada`);
        }
        
        // Get associated order items
        const items = await this.orderItemDAO.findByOrderId(orderId);
        
        // Combine order with items
        order.items = items;
        
        return this.mapToModel(order);
    }

    private mapToModel(daoResult: OrderModel): OrderModel {
        if (!daoResult) {
            throw new Error('No se pueden mapear datos de orden nulos o indefinidos');
        }

        const order = new OrderModel({
            id: daoResult.id,
            customerId: daoResult.customerId,
            orderDate: daoResult.orderDate,
            status: daoResult.status,
            totalAmount: daoResult.totalAmount,
            items: daoResult.items,
            updatedAt: daoResult.updatedAt
        });

        this.validateOrder(order);

        return order;
    }

    private validateOrder(order: OrderModel): void {
        if (order.customerId <= 0) {
            throw new Error('La orden debe tener un ID de cliente válido');
        }

        if (!order.items || order.items.length === 0) {
            throw new Error('La orden debe tener al menos un artículo');
        }

        if (order.totalAmount < 0) {
            throw new Error('El monto total de la orden no puede ser negativo');
        }

        if (!Object.values(OrderStatus).includes(order.status)) {
            throw new Error(`Estado de orden inválido: ${order.status}`);
        }

        for (const item of order.items) {
            if (!item.productId || item.productId <= 0) {
                throw new Error('El artículo de la orden debe tener un ID de producto válido');
            }
            if (!item.quantity || item.quantity <= 0) {
                throw new Error('La cantidad del artículo de la orden debe ser mayor a 0');
            }
            if (!item.unitPrice || item.unitPrice < 0) {
                throw new Error('El precio unitario del artículo no puede ser negativo');
            }
        }
    }

    private calculateOrderTotal(order: OrderModel): void {
        if (!order.items || order.items.length === 0) {
            order.totalAmount = 0;
            return;
        }

        order.totalAmount = order.items.reduce((total, item) => {
            return total + (item.quantity * item.unitPrice);
        }, 0);
    }

    private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
        const allowedTransitions: { [key in OrderStatus]: OrderStatus[] } = {
            [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
            [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
            [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
            [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
            [OrderStatus.DELIVERED]: [],
            [OrderStatus.CANCELLED]: []
        };

        const allowed = allowedTransitions[currentStatus] || [];
        if (!allowed.includes(newStatus)) {
            throw new Error(`No se puede cambiar de ${currentStatus} a ${newStatus}`);
        }
    }
}