import { BigPotatoDao } from '../models/types';
import { DatabaseConnection } from '../../config/DatabaseConnection';
import { OrderModel } from '../models/OrderModel';

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
            
            const createdOrder = await this.findById(Number(result.insertId));
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
            
            return OrderModel.fromJSON(rows[0]);
        } catch (error) {
            throw new Error(`Error finding order by ID: ${error}`);
        }
    }

    async findAll(): Promise<OrderModel[]> {
        try {
            const rows = await this.dbConnection.query(`SELECT * FROM orders ORDER BY order_date DESC`);
            return rows.map((row: any) => OrderModel.fromJSON(row));
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
            
            return rows.map((row: any) => OrderModel.fromJSON(row));
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
            
            return rows.map((row: any) => OrderModel.fromJSON(row));
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