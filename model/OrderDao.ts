import { BigPotatoDao } from './types';
import { DatabaseConnection } from './DatabaseConnection';
import { promisify } from 'util';
import { OrderModel } from './OrderModel';
import { OrderItemModel } from './OrderItemModel';

export class OrderDAO implements BigPotatoDao<OrderModel, number> {
    private db = DatabaseConnection.getInstance().getDatabase();
    private run = promisify(this.db.run.bind(this.db));
    private get = promisify(this.db.get.bind(this.db));
    private all = promisify(this.db.all.bind(this.db));

    async create(order: OrderModel): Promise<OrderModel> {
        try {
            const result = await this.run(
                `INSERT INTO orders (customer_id, order_date, status, total_amount, updated_at) 
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    order.customerId,
                    order.orderDate.toISOString(),
                    order.status,
                    order.totalAmount,
                    order.updatedAt.toISOString()
                ]
            );
            
            const orderId = (result as any).lastID;
            
            // Create order items if provided
            if (order.items && order.items.length > 0) {
                for (const item of order.items) {
                    await this.run(
                        `INSERT INTO order_items (order_id, type, product_id, quantity, unit_price, subtotal) 
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [orderId, item.type, item.productId, item.quantity, item.unitPrice, item.subtotal]
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
            const row = await this.get(
                `SELECT * FROM orders WHERE id = ?`,
                [id]
            );
            
            if (!row) return null;
            
            // Get associated order items
            const itemRows = await this.all(
                `SELECT * FROM order_items WHERE order_id = ? ORDER BY id`,
                [id]
            );
            
            const order = OrderModel.fromJSON(row);
            order.items = itemRows.map((itemRow: any) => 
                OrderItemModel.fromJSON({
                    ...itemRow,
                    orderId: itemRow.order_id,
                    productId: itemRow.product_id,
                    unitPrice: itemRow.unit_price
                }).toJSON()
            );
            
            return order;
        } catch (error) {
            throw new Error(`Error finding order by ID: ${error}`);
        }
    }

    async findAll(): Promise<OrderModel[]> {
        try {
            const rows = await this.all(`SELECT * FROM orders ORDER BY order_date DESC`);
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
            await this.run(
                `UPDATE orders SET customer_id = ?, status = ?, total_amount = ?, updated_at = ? WHERE id = ?`,
                [order.customerId, order.status, order.totalAmount, new Date().toISOString(), id]
            );
            
            // Update order items - delete existing and recreate
            await this.run(`DELETE FROM order_items WHERE order_id = ?`, [id]);
            if (order.items && order.items.length > 0) {
                for (const item of order.items) {
                    await this.run(
                        `INSERT INTO order_items (order_id, type, product_id, quantity, unit_price, subtotal) 
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [id, item.type, item.productId, item.quantity, item.unitPrice, item.subtotal]
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
            await this.run(`DELETE FROM order_items WHERE order_id = ?`, [id]);
            await this.run(`DELETE FROM orders WHERE id = ?`, [id]);
        } catch (error) {
            throw new Error(`Error deleting order: ${error}`);
        }
    }

    async findByCustomerId(customerId: number): Promise<OrderModel[]> {
        try {
            const rows = await this.all(
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
            const rows = await this.all(
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
            await this.run(
                `UPDATE orders SET status = ?, updated_at = ? WHERE id = ?`,
                [status, new Date().toISOString(), id]
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