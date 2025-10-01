import { OrderModel } from "../../persistence/models/OrderModel";
import { OrderStatus } from "../../persistence/models/types";

export interface IOrderRepository {
    create(order: OrderModel): Promise<OrderModel>;
    findById(id: number): Promise<OrderModel | null>;
    findAll(): Promise<OrderModel[]>;
    update(id: number, order: OrderModel): Promise<OrderModel>;
    delete(id: number): Promise<void>;
    findByCustomerId(customerId: number): Promise<OrderModel[]>;
    findByStatus(status: OrderStatus): Promise<OrderModel[]>;
    updateStatus(id: number, status: OrderStatus): Promise<OrderModel>;
    findOrdersByDateRange(startDate: Date, endDate: Date): Promise<OrderModel[]>;
    findPendingOrders(): Promise<OrderModel[]>;
    calculateTotalRevenue(): Promise<number>;
}