import { OrderItemModel } from "../models/OrderItemModel";
import { BigPotatoDao } from "../models/types";
import { DatabaseConnection } from "../../config/DatabaseConnection";

export class OrderItemDAO implements BigPotatoDao<OrderItemModel, number> {
    private dbConnection = DatabaseConnection.getInstance();

    async create(orderItem: OrderItemModel): Promise<OrderItemModel> {
        try {
            const result = await this.dbConnection.execute(
                `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) 
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    orderItem.orderId,
                    orderItem.productId,
                    orderItem.quantity,
                    orderItem.unitPrice,
                    orderItem.quantity * orderItem.unitPrice
                ]
            );
            
            const createdOrderItem = await this.findById(Number(result.insertId));
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
            const rows = await this.dbConnection.query(
                `SELECT * FROM order_items WHERE id = ?`,
                [id]
            );
            
            if (!rows || rows.length === 0) return null;
            const row = rows[0];
            
            return OrderItemModel.fromJSON({
                ...row,
                orderId: row.order_id,
                productId: row.product_id,
                unitPrice: row.unit_price,
                totalPrice: row.total_price
            });
        } catch (error) {
            throw new Error(`Error finding order item by ID: ${error}`);
        }
    }

    async findAll(): Promise<OrderItemModel[]> {
        try {
            const rows = await this.dbConnection.query(`SELECT * FROM order_items ORDER BY id`);
            return rows.map((row: any) => 
                OrderItemModel.fromJSON({
                    ...row,
                    orderId: row.order_id,
                    productId: row.product_id,
                    unitPrice: row.unit_price,
                    totalPrice: row.total_price
                }).toJSON()
            );
        } catch (error) {
            throw new Error(`Error finding all order items: ${error}`);
        }
    }

    async update(id: number, orderItem: OrderItemModel): Promise<OrderItemModel> {
        try {
            await this.dbConnection.execute(
                `UPDATE order_items SET order_id = ?, product_id = ?, quantity = ?, unit_price = ?, total_price = ? WHERE id = ?`,
                [
                    orderItem.orderId,
                    orderItem.productId,
                    orderItem.quantity,
                    orderItem.unitPrice,
                    orderItem.quantity * orderItem.unitPrice,
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
            await this.dbConnection.execute(`DELETE FROM order_items WHERE id = ?`, [id]);
        } catch (error) {
            throw new Error(`Error deleting order item: ${error}`);
        }
    }

    async findByOrderId(orderId: number): Promise<OrderItemModel[]> {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM order_items WHERE order_id = ? ORDER BY id`,
                [orderId]
            );
            
            return rows.map((row: any) => 
                OrderItemModel.fromJSON({
                    ...row,
                    orderId: row.order_id,
                    productId: row.product_id,
                    unitPrice: row.unit_price,
                    totalPrice: row.total_price
                }).toJSON()
            );
        } catch (error) {
            throw new Error(`Error finding order items by order ID: ${error}`);
        }
    }

    async findByProductId(productId: number): Promise<OrderItemModel[]> {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM order_items WHERE product_id = ? ORDER BY id DESC`,
                [productId]
            );
            
            return rows.map((row: any) => 
                OrderItemModel.fromJSON({
                    ...row,
                    orderId: row.order_id,
                    productId: row.product_id,
                    unitPrice: row.unit_price,
                    totalPrice: row.total_price
                }).toJSON()
            );
        } catch (error) {
            throw new Error(`Error finding order items by product ID: ${error}`);
        }
    }

    async deleteByOrderId(orderId: number): Promise<void> {
        try {
            await this.dbConnection.execute(`DELETE FROM order_items WHERE order_id = ?`, [orderId]);
        } catch (error) {
            throw new Error(`Error deleting order items by order ID: ${error}`);
        }
    }
}