import { OrderItemType } from "./types";

export class OrderItemModel{
    public id: number;
    public orderId: number;
    public type: OrderItemType;
    public productId: number;
    public quantity: number;
    public unitPrice: number;
    public subtotal: number;

    constructor(data: Partial<OrderItemModel> = {}) {
        this.id = data.id ? Number(data.id) : 0;
        this.orderId = data.orderId ? Number(data.orderId) : 0;
        this.type = data.type || OrderItemType.PRODUCT;
        this.productId = data.productId ? Number(data.productId) : 0;
        this.quantity = data.quantity ? Number(data.quantity) : 0;
        this.unitPrice = data.unitPrice ? Number(data.unitPrice) : 0;
        this.subtotal = data.subtotal ? Number(data.subtotal) : this.quantity * this.unitPrice;
    }

    public toJSON(): Record<string, unknown> {
        return {
            id: this.id,
            orderId: this.orderId,
            type: this.type,
            productId: this.productId,
            quantity: this.quantity,
            unitPrice: this.unitPrice,
            subtotal: this.subtotal
        };
    }

    public static fromJSON(json: any): OrderItemModel {
        return new OrderItemModel({
            ...json,
            orderId: json.orderId ?? json.order_id,
            productId: json.productId ?? json.product_id,
            unitPrice: json.unitPrice ?? json.unit_price,
            subtotal: json.subtotal ?? json.totalPrice ?? json.total_price
        });
    }
}