import { CategoryModel } from "../models/CategoryModel";
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
            
            const productId = result.insertId;
            
            // Associate categories if provided
            if (product.category && product.category.length > 0) {
                for (const category of product.category) {
                    await this.dbConnection.execute(
                        `INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)`,
                        [productId, category.id]
                    );
                }
            }
            
            const createdProduct = await this.findById(Number(productId));
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
            const row = rows[0];
            
            // Get associated categories
            const categories = await this.dbConnection.query(
                `SELECT c.* FROM categories c 
                 INNER JOIN product_categories pc ON c.id = pc.category_id 
                 WHERE pc.product_id = ?`,
                [id]
            );
            
            const product = ProductModel.fromJSON(row);
            product.category = categories.map((cat: any) => CategoryModel.fromJSON(cat).toJSON());
            
            return product;
        } catch (error) {
            throw new Error(`Error finding product by ID: ${error}`);
        }
    }

    async findAll(): Promise<ProductModel[]> {
        try {
            const rows = await this.dbConnection.query(`SELECT * FROM products ORDER BY id`);
            const products = [];
            
            for (const row of rows) {
                const product = await this.findById(row.id);
                if (product) products.push(product);
            }
            
            return products;
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
            
            // Update categories
            await this.dbConnection.execute(`DELETE FROM product_categories WHERE product_id = ?`, [id]);
            if (product.category && product.category.length > 0) {
                for (const category of product.category) {
                    await this.dbConnection.execute(
                        `INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)`,
                        [id, category.id]
                    );
                }
            }
            
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
            await this.dbConnection.execute(`DELETE FROM product_categories WHERE product_id = ?`, [id]);
            await this.dbConnection.execute(`DELETE FROM products WHERE id = ?`, [id]);
        } catch (error) {
            throw new Error(`Error deleting product: ${error}`);
        }
    }

    async findByCategory(categoryId: number): Promise<ProductModel[]> {
        try {
            const rows = await this.dbConnection.query(
                `SELECT p.* FROM products p 
                 INNER JOIN product_categories pc ON p.id = pc.product_id 
                 WHERE pc.category_id = ?`,
                [categoryId]
            );
            
            const products = [];
            for (const row of rows) {
                const product = await this.findById(row.id);
                if (product) products.push(product);
            }
            
            return products;
        } catch (error) {
            throw new Error(`Error finding products by category: ${error}`);
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