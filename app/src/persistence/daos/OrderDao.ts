import { BigPotatoDao } from '../models/types';
import { DatabaseConnection } from '../../config/DatabaseConnection';
import { OrderModel } from '../models/OrderModel';
import { OrderItemModel } from '../models/OrderItemModel';

export class OrderDAO implements BigPotatoDao<OrderModel, number> {
    private dbConnection = DatabaseConnection.getInstance();

    async create(order: OrderModel): Promise<OrderModel> {
        try {
            const result = await this.dbConnection.execute(
                `INSERT INTO orders (customer_id, order_date, status, total_amount) 
                 VALUES (?, ?, ?, ?)`,
                [
                    order.customerId,
                    order.orderDate,
                    order.status,
                    order.totalAmount
                ]
            );
            
            const orderId = Number(result.insertId);
            
            // Create order items if provided
            if (order.items && order.items.length > 0) {
                for (const item of order.items) {
                    await this.dbConnection.execute(
                        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) 
                         VALUES (?, ?, ?, ?, ?)`,
                        [orderId, item.productId, item.quantity, item.unitPrice, item.quantity * item.unitPrice]
                    );
                }
            }
            
            const createdOrder = await this.findById(orderId);
            if (!createdOrder) {
                throw new Error('Failed to create order');
            }
            return createdOrder;
        } catch (error) {
            throw new Error(`Error creating order: ${error}`);
        }
    }

    async findById(id: number): Promise<OrderModel | null> {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM orders WHERE id = ?`,
                [id]
            );
            
            if (!rows || rows.length === 0) return null;
            const row = rows[0];
            
            // Get associated order items
            const itemRows = await this.dbConnection.query(
                `SELECT * FROM order_items WHERE order_id = ? ORDER BY id`,
                [id]
            );
            
            const order = OrderModel.fromJSON(row);
            order.items = itemRows.map((itemRow: any) => 
                OrderItemModel.fromJSON({
                    ...itemRow,
                    orderId: itemRow.order_id,
                    productId: itemRow.product_id,
                    unitPrice: itemRow.unit_price,
                    totalPrice: itemRow.total_price
                }).toJSON()
            );
            
            return order;
        } catch (error) {
            throw new Error(`Error finding order by ID: ${error}`);
        }
    }

    async findAll(): Promise<OrderModel[]> {
        try {
            const rows = await this.dbConnection.query(`SELECT * FROM orders ORDER BY order_date DESC`);
            const orders = [];
            
            for (const row of rows) {
                const order = await this.findById(row.id);
                if (order) orders.push(order);
            }
            
            return orders;
        } catch (error) {
            throw new Error(`Error finding all orders: ${error}`);
        }
    }

    async update(id: number, order: OrderModel): Promise<OrderModel> {
        try {
            await this.dbConnection.execute(
                `UPDATE orders SET customer_id = ?, status = ?, total_amount = ? WHERE id = ?`,
                [order.customerId, order.status, order.totalAmount, id]
            );
            
            // Update order items - delete existing and recreate
            await this.dbConnection.execute(`DELETE FROM order_items WHERE order_id = ?`, [id]);
            if (order.items && order.items.length > 0) {
                for (const item of order.items) {
                    await this.dbConnection.execute(
                        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) 
                         VALUES (?, ?, ?, ?, ?)`,
                        [id, item.productId, item.quantity, item.unitPrice, item.quantity * item.unitPrice]
                    );
                }
            }
            
            const updatedOrder = await this.findById(id);
            if (!updatedOrder) {
                throw new Error('OrderModel not found after update');
            }
            return updatedOrder;
        } catch (error) {
            throw new Error(`Error updating order: ${error}`);
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await this.dbConnection.execute(`DELETE FROM order_items WHERE order_id = ?`, [id]);
            await this.dbConnection.execute(`DELETE FROM orders WHERE id = ?`, [id]);
        } catch (error) {
            throw new Error(`Error deleting order: ${error}`);
        }
    }

    async findByCustomerId(customerId: number): Promise<OrderModel[]> {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM orders WHERE customer_id = ? ORDER BY order_date DESC`,
                [customerId]
            );
            
            const orders = [];
            for (const row of rows) {
                const order = await this.findById(row.id);
                if (order) orders.push(order);
            }
            
            return orders;
        } catch (error) {
            throw new Error(`Error finding orders by customer ID: ${error}`);
        }
    }

    async findByStatus(status: string): Promise<OrderModel[]> {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM orders WHERE status = ? ORDER BY order_date DESC`,
                [status]
            );
            
            const orders = [];
            for (const row of rows) {
                const order = await this.findById(row.id);
                if (order) orders.push(order);
            }
            
            return orders;
        } catch (error) {
            throw new Error(`Error finding orders by status: ${error}`);
        }
    }

    async updateStatus(id: number, status: string): Promise<OrderModel> {
        try {
            await this.dbConnection.execute(
                `UPDATE orders SET status = ? WHERE id = ?`,
                [status, id]
            );
            
            const updatedOrder = await this.findById(id);
            if (!updatedOrder) {
                throw new Error('OrderModel not found after status update');
            }
            return updatedOrder;
        } catch (error) {
            throw new Error(`Error updating order status: ${error}`);
        }
    }
}