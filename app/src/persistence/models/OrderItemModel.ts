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
        this.id = data.id || 0;
        this.orderId = data.orderId || 0;
        this.type = data.type   || OrderItemType.PRODUCT;
        this.productId = data.productId || 0;
        this.quantity = data.quantity || 0;
        this.unitPrice = data.unitPrice || 0;
        this.subtotal = data.subtotal || 0;
    }

    public toJSON(): string { return JSON.stringify(this); }

    public static fromJSON(json: any): OrderItemModel {
        return new OrderItemModel(json);
    }
}