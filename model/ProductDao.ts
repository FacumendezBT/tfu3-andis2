import { BigPotatoDao} from './types';
import { DatabaseConnection } from './DatabaseConnection';
import { promisify } from 'util';
import { CategoryModel } from './CategoryModel';
import { ProductModel } from './ProductModel';

export class ProductDAO implements BigPotatoDao<ProductModel, number> {
    private db = DatabaseConnection.getInstance().getDatabase();
    private run = promisify(this.db.run.bind(this.db));
    private get = promisify(this.db.get.bind(this.db));
    private all = promisify(this.db.all.bind(this.db));

    async create(product: ProductModel): Promise<ProductModel> {
        try {
            const result = await this.run(
                `INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)`,
                [product.name, product.description, product.price, product.stock]
            );
            
            const productId = (result as any).lastID;
            
            // Associate categories if provided
            if (product.category && product.category.length > 0) {
                for (const category of product.category) {
                    await this.run(
                        `INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)`,
                        [productId, category.id]
                    );
                }
            }
            
            const createdProduct = await this.findById(productId);
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
            const row = await this.get(
                `SELECT * FROM products WHERE id = ?`,
                [id]
            );
            
            if (!row) return null;
            
            // Get associated categories
            const categories = await this.all(
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
            const rows = await this.all(`SELECT * FROM products ORDER BY id`);
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
            await this.run(
                `UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?`,
                [product.name, product.description, product.price, product.stock, id]
            );
            
            // Update categories
            await this.run(`DELETE FROM product_categories WHERE product_id = ?`, [id]);
            if (product.category && product.category.length > 0) {
                for (const category of product.category) {
                    await this.run(
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
            await this.run(`DELETE FROM product_categories WHERE product_id = ?`, [id]);
            await this.run(`DELETE FROM products WHERE id = ?`, [id]);
        } catch (error) {
            throw new Error(`Error deleting product: ${error}`);
        }
    }

    async findByCategory(categoryId: number): Promise<ProductModel[]> {
        try {
            const rows = await this.all(
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
            await this.run(
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