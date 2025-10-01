import { OrderItemModel } from "./OrderItemModel";

export class OrderModel{
    public id: number;
    public customerId: number;
    public orderDate: Date;
    public status: any; // OrderStatus
    public totalAmount: number;
    public items: OrderItemModel[];
    public updatedAt: Date;

    constructor(data: Partial<OrderModel> = {}) {
        this.id = data.id || 0;
        this.customerId = data.customerId || 0;
        this.orderDate = data.orderDate || new Date();
        this.status = data.status || 'PENDING';
        this.totalAmount = data.totalAmount || 0;
        this.items = data.items || [];
        this.updatedAt = data.updatedAt || new Date();
    }

    public toJSON(): string { return JSON.stringify(this); }

    public static fromJSON(json: any): OrderModel {
        return new OrderModel({
            ...json,
            orderDate: new Date(json.orderDate || json.order_date),
            updatedAt: new Date(json.updatedAt || json.updated_at),
            customerId: json.customerId || json.customer_id,
            totalAmount: json.totalAmount || json.total_amount
        });
    }
}