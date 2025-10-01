import { BigPotatoDao } from './types';
import { DatabaseConnection } from './DatabaseConnection';
import { promisify } from 'util';
import { OrderItemModel } from './OrderItemModel';

export class OrderItemDAO implements BigPotatoDao<OrderItemModel, number> {
    private db = DatabaseConnection.getInstance().getDatabase();
    private run = promisify(this.db.run.bind(this.db));
    private get = promisify(this.db.get.bind(this.db));
    private all = promisify(this.db.all.bind(this.db));

    async create(orderItem: OrderItemModel): Promise<OrderItemModel> {
        try {
            const result = await this.run(
                `INSERT INTO order_items (order_id, type, product_id, quantity, unit_price, subtotal) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    orderItem.orderId,
                    orderItem.type,
                    orderItem.productId,
                    orderItem.quantity,
                    orderItem.unitPrice,
                    orderItem.subtotal
                ]
            );
            
            const createdOrderItem = await this.findById((result as any).lastID);
            if (!createdOrderItem) {
                throw new Error('Failed to create order item');
            }
            return createdOrderItem;
        } catch (error) {
            throw new Error(`Error creating order item: ${error}`);
        }
    }

    async findById(id: number): Promise<OrderItemModel | null> {
        try {
            const row = await this.get(
                `SELECT * FROM order_items WHERE id = ?`,
                [id]
            );
            
            if (!row) return null;
            
            return OrderItemModel.fromJSON({
                ...row,
                orderId: row.order_id,
                productId: row.product_id,
                unitPrice: row.unit_price
            });
        } catch (error) {
            throw new Error(`Error finding order item by ID: ${error}`);
        }
    }

    async findAll(): Promise<OrderItemModel[]> {
        try {
            const rows = await this.all(`SELECT * FROM order_items ORDER BY id`);
            return rows.map((row: any) => 
                OrderItemModel.fromJSON({
                    ...row,
                    orderId: row.order_id,
                    productId: row.product_id,
                    unitPrice: row.unit_price
                }).toJSON()
            );
        } catch (error) {
            throw new Error(`Error finding all order items: ${error}`);
        }
    }

    async update(id: number, orderItem: OrderItemModel): Promise<OrderItemModel> {
        try {
            await this.run(
                `UPDATE order_items SET order_id = ?, type = ?, product_id = ?, quantity = ?, unit_price = ?, subtotal = ? WHERE id = ?`,
                [
                    orderItem.orderId,
                    orderItem.type,
                    orderItem.productId,
                    orderItem.quantity,
                    orderItem.unitPrice,
                    orderItem.subtotal,
                    id
                ]
            );
            
            const updatedOrderItem = await this.findById(id);
            if (!updatedOrderItem) {
                throw new Error('Order item not found after update');
            }
            return updatedOrderItem;
        } catch (error) {
            throw new Error(`Error updating order item: ${error}`);
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await this.run(`DELETE FROM order_items WHERE id = ?`, [id]);
        } catch (error) {
            throw new Error(`Error deleting order item: ${error}`);
        }
    }

    async findByOrderId(orderId: number): Promise<OrderItemModel[]> {
        try {
            const rows = await this.all(
                `SELECT * FROM order_items WHERE order_id = ? ORDER BY id`,
                [orderId]
            );
            
            return rows.map((row: any) => 
                OrderItemModel.fromJSON({
                    ...row,
                    orderId: row.order_id,
                    productId: row.product_id,
                    unitPrice: row.unit_price
                }).toJSON()
            );
        } catch (error) {
            throw new Error(`Error finding order items by order ID: ${error}`);
        }
    }

    async findByProductId(productId: number): Promise<OrderItemModel[]> {
        try {
            const rows = await this.all(
                `SELECT * FROM order_items WHERE product_id = ? ORDER BY id DESC`,
                [productId]
            );
            
            return rows.map((row: any) => 
                OrderItemModel.fromJSON({
                    ...row,
                    orderId: row.order_id,
                    productId: row.product_id,
                    unitPrice: row.unit_price
                }).toJSON()
            );
        } catch (error) {
            throw new Error(`Error finding order items by product ID: ${error}`);
        }
    }

    async deleteByOrderId(orderId: number): Promise<void> {
        try {
            await this.run(`DELETE FROM order_items WHERE order_id = ?`, [orderId]);
        } catch (error) {
            throw new Error(`Error deleting order items by order ID: ${error}`);
        }
    }
}