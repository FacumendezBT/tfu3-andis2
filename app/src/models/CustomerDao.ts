import { BigPotatoDao } from './types';
import { DatabaseConnection } from './DatabaseConnection';
import { promisify } from 'util';
import { CustomerModel } from './CustomerModel';

export class CustomerDAO implements BigPotatoDao<CustomerModel, number> {
    private db = DatabaseConnection.getInstance().getDatabase();
    private run = promisify(this.db.run.bind(this.db));
    private get = promisify(this.db.get.bind(this.db));
    private all = promisify(this.db.all.bind(this.db));

    async create(customer: CustomerModel): Promise<CustomerModel> {
        try {
            const result = await this.run(
                `INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)`,
                [customer.name, customer.email, customer.phone, customer.address]
            );
            
            const createdCustomer = await this.findById((result as any).lastID);
            if (!createdCustomer) {
                throw new Error('Failed to create customer');
            }
            return createdCustomer;
        } catch (error) {
            throw new Error(`Error creating customer: ${error}`);
        }
    }

    async findById(id: number): Promise<CustomerModel | null> {
        try {
            const row = await this.get(
                `SELECT * FROM customers WHERE id = ?`,
                [id]
            );
            
            return row ? CustomerModel.fromJSON(row) : null;
        } catch (error) {
            throw new Error(`Error finding customer by ID: ${error}`);
        }
    }

    async findAll(): Promise<CustomerModel[]> {
        try {
            const rows = await this.all(`SELECT * FROM customers ORDER BY id`);
            return rows.map((row: any) => CustomerModel.fromJSON(row).toJSON());
        } catch (error) {
            throw new Error(`Error finding all customers: ${error}`);
        }
    }

    async update(id: number, customer: CustomerModel): Promise<CustomerModel> {
        try {
            await this.run(
                `UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?`,
                [customer.name, customer.email, customer.phone, customer.address, id]
            );
            
            const updatedCustomer = await this.findById(id);
            if (!updatedCustomer) {
                throw new Error('CustomerModel not found after update');
            }
            return updatedCustomer;
        } catch (error) {
            throw new Error(`Error updating customer: ${error}`);
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await this.run(`DELETE FROM customers WHERE id = ?`, [id]);
        } catch (error) {
            throw new Error(`Error deleting customer: ${error}`);
        }
    }

    async findByEmail(email: string): Promise<CustomerModel | null> {
        try {
            const row = await this.get(
                `SELECT * FROM customers WHERE email = ?`,
                [email]
            );
            
            return row ? CustomerModel.fromJSON(row) : null;
        } catch (error) {
            throw new Error(`Error finding customer by email: ${error}`);
        }
    }
}