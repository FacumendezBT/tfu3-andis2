export interface BigPotatoDao<T, ID> {
    create(entity: T): Promise<T>;
    findById(id: ID): Promise<T | null>;
    findAll(): Promise<T[]>;
    update(id: ID, entity: T): Promise<T>;
    delete(id: ID): Promise<void>;
}

// Entities
export interface Customer {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address: string;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: Category[];
}

export interface Order {
    id: number;
    customerId: number;
    orderDate: Date;
    status: OrderStatus;
    totalAmount: number;
    items: OrderItem[];
    updatedAt: Date;
}

// 3x monitor samsung + $500
// 3x monitor samsung - $50 (discount)

export enum OrderItemType {
    PRODUCT = 'PRODUCT',
    DISCOUNT = 'DISCOUNT',
}

export interface OrderItem {
    id: number;
    orderId: number;
    type: OrderItemType;
    productId: number;
    quantity: number;
    unitPrice: number; // Positive for products, negative for discounts
    subtotal: number;
}

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}