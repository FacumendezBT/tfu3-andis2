import { OrderItemModel } from "./OrderItemModel";
import { OrderStatus } from "./types";

export class OrderModel{
    public id: number;
    public customerId: number;
    public orderDate: Date;
    public status: OrderStatus;
    public totalAmount: number;
    public items: OrderItemModel[];
    public updatedAt: Date;

    constructor(data: Partial<OrderModel> = {}) {
        this.id = data.id ? Number(data.id) : 0;
        this.customerId = data.customerId ? Number(data.customerId) : 0;
        this.orderDate = data.orderDate ? new Date(data.orderDate) : new Date();
        this.status = data.status || OrderStatus.PENDING;
        this.totalAmount = data.totalAmount ? Number(data.totalAmount) : 0;
        this.items = (data.items ?? []).map((item) =>
            item instanceof OrderItemModel ? item : new OrderItemModel(item)
        );
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    }

    public toJSON(): Record<string, unknown> {
        return {
            id: this.id,
            customerId: this.customerId,
            orderDate: this.orderDate,
            status: this.status,
            totalAmount: this.totalAmount,
            items: this.items.map((item) =>
                item instanceof OrderItemModel ? item.toJSON() : item
            ),
            updatedAt: this.updatedAt
        };
    }

    public static fromJSON(json: any): OrderModel {
        return new OrderModel({
            ...json,
            id: json.id ?? json.ID,
            customerId: json.customerId ?? json.customer_id,
            orderDate: json.orderDate ?? json.order_date,
            totalAmount: json.totalAmount ?? json.total_amount,
            updatedAt: json.updatedAt ?? json.updated_at,
            items: (json.items ?? []).map((item: any) =>
                item instanceof OrderItemModel ? item : OrderItemModel.fromJSON(item)
            )
        });
    }
}