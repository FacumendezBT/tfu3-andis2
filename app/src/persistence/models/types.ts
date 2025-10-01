export interface BigPotatoDao<T, ID> {
    create(entity: T): Promise<T>;
    findById(id: ID): Promise<T | null>;
    findAll(): Promise<T[]>;
    update(id: ID, entity: T): Promise<T>;
    delete(id: ID): Promise<void>;
}

export enum OrderItemType {
    PRODUCT = 'PRODUCT',
    DISCOUNT = 'DISCOUNT',
}

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}