import { ProductModel } from "../models/ProductModel";
import { BigPotatoDao } from "../models/types";
import { DatabaseConnection } from "../../config/DatabaseConnection";

export class ProductDAO implements BigPotatoDao<ProductModel, number> {
    private dbConnection = DatabaseConnection.getInstance();

    async create(product: ProductModel): Promise<ProductModel> {
        try {
            const result = await this.dbConnection.execute(
                `INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)`,
                [product.name, product.description, product.price, product.stock]
            );
            
            const createdProduct = await this.findById(Number(result.insertId));
            if (!createdProduct) {
                throw new Error('Failed to create product');
            }
            return createdProduct;
        } catch (error) {
            throw new Error(`Error creating product: ${error}`);
        }
    }

    async findById(id: number): Promise<ProductModel | null> {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM products WHERE id = ?`,
                [id]
            );
            
            if (!rows || rows.length === 0) return null;
            
            return ProductModel.fromJSON(rows[0]);
        } catch (error) {
            throw new Error(`Error finding product by ID: ${error}`);
        }
    }

    async findAll(): Promise<ProductModel[]> {
        try {
            const rows = await this.dbConnection.query(`SELECT * FROM products ORDER BY id`);
            return rows.map((row: any) => ProductModel.fromJSON(row));
        } catch (error) {
            throw new Error(`Error finding all products: ${error}`);
        }
    }

    async update(id: number, product: ProductModel): Promise<ProductModel> {
        try {
            await this.dbConnection.execute(
                `UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?`,
                [product.name, product.description, product.price, product.stock, id]
            );
            
            const updatedProduct = await this.findById(id);
            if (!updatedProduct) {
                throw new Error('ProductModel not found after update');
            }
            return updatedProduct;
        } catch (error) {
            throw new Error(`Error updating product: ${error}`);
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await this.dbConnection.execute(`DELETE FROM products WHERE id = ?`, [id]);
        } catch (error) {
            throw new Error(`Error deleting product: ${error}`);
        }
    }

    async findByName(name: string): Promise<ProductModel[]> {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM products WHERE name LIKE ? ORDER BY id`,
                [`%${name}%`]
            );
            return rows.map((row: any) => ProductModel.fromJSON(row));
        } catch (error) {
            throw new Error(`Error finding products by name: ${error}`);
        }
    }

    async findLowStockProducts(threshold: number): Promise<ProductModel[]> {
        try {
            const rows = await this.dbConnection.query(
                `SELECT * FROM products WHERE stock < ? ORDER BY stock ASC`,
                [threshold]
            );
            return rows.map((row: any) => ProductModel.fromJSON(row));
        } catch (error) {
            throw new Error(`Error finding low stock products: ${error}`);
        }
    }

    async updateStock(id: number, newStock: number): Promise<ProductModel> {
        try {
            await this.dbConnection.execute(
                `UPDATE products SET stock = ? WHERE id = ?`,
                [newStock, id]
            );
            
            const updatedProduct = await this.findById(id);
            if (!updatedProduct) {
                throw new Error('ProductModel not found after stock update');
            }
            return updatedProduct;
        } catch (error) {
            throw new Error(`Error updating product stock: ${error}`);
        }
    }
}