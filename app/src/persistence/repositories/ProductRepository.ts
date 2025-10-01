import { ProductModel } from '../models/ProductModel';
import { CategoryModel } from '../models/CategoryModel';
import { ProductDAO } from '../daos/ProductDao';
import { CategoryDAO } from '../daos/CategoryDao';
import { DatabaseConnection } from '../../config/DatabaseConnection';
import { IProductRepository } from '../../business-logic/repositories/IProductRepository';

export class ProductRepository implements IProductRepository {
    private productDAO: ProductDAO;
    private categoryDAO: CategoryDAO;
    private dbConnection = DatabaseConnection.getInstance();

    constructor() {
        this.productDAO = new ProductDAO();
        this.categoryDAO = new CategoryDAO();
    }

    async create(product: ProductModel): Promise<ProductModel> {
        try {
            this.validateProduct(product);
            
            // Repository coordinates: first create the basic product
            const productToCreate = new ProductModel({
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock
            });
            
            const createdProduct = await this.productDAO.create(productToCreate);
            
            // Then associate categories if provided
            if (product.category && product.category.length > 0) {
                await this.associateCategories(createdProduct.id!, product.category);
            }
            
            // Return complete product with categories
            return await this.getProductWithCategories(createdProduct.id!);
        } catch (error) {
            throw new Error(`Error del repositorio creando producto: ${error}`);
        }
    }

    async findById(id: number): Promise<ProductModel | null> {
        try {
            if (id <= 0) {
                throw new Error('El ID del producto debe ser un número positivo');
            }
            
            const product = await this.productDAO.findById(id);
            if (!product) return null;
            
            // Repository coordinates: get product with its categories
            return await this.getProductWithCategories(id);
        } catch (error) {
            throw new Error(`Error del repositorio buscando producto por ID: ${error}`);
        }
    }

    async findAll(): Promise<ProductModel[]> {
        try {
            const products = await this.productDAO.findAll();
            const productsWithCategories = [];
            
            // Repository coordinates: get each product with its categories
            for (const product of products) {
                const fullProduct = await this.getProductWithCategories(product.id!);
                productsWithCategories.push(fullProduct);
            }
            
            return productsWithCategories;
        } catch (error) {
            throw new Error(`Error del repositorio buscando todos los productos: ${error}`);
        }
    }

    async update(id: number, product: ProductModel): Promise<ProductModel> {
        try {
            if (id <= 0) {
                throw new Error('El ID del producto debe ser un número positivo');
            }
            
            this.validateProduct(product);
            
            // Repository coordinates: update the basic product first
            const productToUpdate = new ProductModel({
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock
            });
            
            await this.productDAO.update(id, productToUpdate);
            
            // Update category associations
            await this.dbConnection.execute(
                `DELETE FROM product_categories WHERE product_id = ?`,
                [id]
            );
            
            if (product.category && product.category.length > 0) {
                await this.associateCategories(id, product.category);
            }
            
            return await this.getProductWithCategories(id);
        } catch (error) {
            throw new Error(`Error del repositorio actualizando producto: ${error}`);
        }
    }

    async delete(id: number): Promise<void> {
        try {
            if (id <= 0) {
                throw new Error('El ID del producto debe ser un número positivo');
            }
            
            // Repository coordinates: delete associations first, then product
            await this.dbConnection.execute(
                `DELETE FROM product_categories WHERE product_id = ?`,
                [id]
            );
            await this.productDAO.delete(id);
        } catch (error) {
            throw new Error(`Error del repositorio eliminando producto: ${error}`);
        }
    }

    async findByCategory(categoryId: number): Promise<ProductModel[]> {
        try {
            if (categoryId <= 0) {
                throw new Error('El ID de la categoría debe ser un número positivo');
            }
            
            // Repository coordinates: find products by category using relation table
            const rows = await this.dbConnection.query(
                `SELECT p.id FROM products p 
                 INNER JOIN product_categories pc ON p.id = pc.product_id 
                 WHERE pc.category_id = ?`,
                [categoryId]
            );
            
            const products = [];
            for (const row of rows) {
                const product = await this.getProductWithCategories(row.id);
                products.push(product);
            }
            
            return products;
        } catch (error) {
            throw new Error(`Error del repositorio buscando productos por categoría: ${error}`);
        }
    }

    async updateStock(id: number, newStock: number): Promise<ProductModel> {
        try {
            if (id <= 0) {
                throw new Error('El ID del producto debe ser un número positivo');
            }
            
            if (newStock < 0) {
                throw new Error('El stock no puede ser negativo');
            }
            
            await this.productDAO.updateStock(id, newStock);
            return await this.getProductWithCategories(id);
        } catch (error) {
            throw new Error(`Error del repositorio actualizando stock del producto: ${error}`);
        }
    }

    async findByName(name: string): Promise<ProductModel[]> {
        try {
            if (!name || name.trim().length === 0) {
                throw new Error('El nombre no puede estar vacío');
            }
            
            const products = await this.productDAO.findByName(name);
            const productsWithCategories = [];
            
            for (const product of products) {
                const productWithCategories = await this.getProductWithCategories(product.id!);
                productsWithCategories.push(productWithCategories);
            }
            
            return productsWithCategories;
        } catch (error) {
            throw new Error(`Error del repositorio buscando productos por nombre: ${error}`);
        }
    }

    async findLowStockProducts(threshold: number = 10): Promise<ProductModel[]> {
        try {
            if (threshold < 0) {
                throw new Error('El umbral debe ser un número positivo');
            }
            
            const products = await this.productDAO.findLowStockProducts(threshold);
            const productsWithCategories = [];
            
            for (const product of products) {
                const productWithCategories = await this.getProductWithCategories(product.id!);
                productsWithCategories.push(productWithCategories);
            }
            
            return productsWithCategories;
        } catch (error) {
            throw new Error(`Error del repositorio buscando productos con stock bajo: ${error}`);
        }
    }

    private async getProductWithCategories(productId: number): Promise<ProductModel> {
        // Repository coordinates: get basic product and its categories separately
        const product = await this.productDAO.findById(productId);
        if (!product) {
            throw new Error(`Producto no encontrado con ID: ${productId}`);
        }

        // Get associated categories
        const categoryRows = await this.dbConnection.query(
            `SELECT c.* FROM categories c 
             INNER JOIN product_categories pc ON c.id = pc.category_id 
             WHERE pc.product_id = ?`,
            [productId]
        );

        // Convert categories using CategoryModel
        const categories = categoryRows.map((row: any) => CategoryModel.fromJSON(row));
        
        const fullProduct = this.mapToModel(product);
        fullProduct.category = categories;
        
        return fullProduct;
    }

    private async associateCategories(productId: number, categories: CategoryModel[]): Promise<void> {
        for (const category of categories) {
            if (!category.id) {
                throw new Error('Las categorías deben tener un ID válido para asociar al producto');
            }
            
            await this.dbConnection.execute(
                `INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)`,
                [productId, category.id]
            );
        }
    }

    private mapToModel(daoResult: ProductModel): ProductModel {
        if (!daoResult) {
            throw new Error('No se pueden mapear datos de producto nulos o indefinidos');
        }

        const product = new ProductModel({
            id: daoResult.id,
            name: daoResult.name,
            description: daoResult.description,
            price: daoResult.price,
            stock: daoResult.stock,
            category: daoResult.category
        });

        this.validateProduct(product);

        return product;
    }

    // Category Management Methods
    async createCategory(category: CategoryModel): Promise<CategoryModel> {
        try {
            this.validateCategory(category);
            
            const createdCategory = await this.categoryDAO.create(category);
            return this.mapCategoryToModel(createdCategory);
        } catch (error) {
            throw new Error(`Error del repositorio creando categoría: ${error}`);
        }
    }

    async findCategoryById(id: number): Promise<CategoryModel | null> {
        try {
            if (id <= 0) {
                throw new Error('El ID de la categoría debe ser un número positivo');
            }

            const category = await this.categoryDAO.findById(id);
            return category ? this.mapCategoryToModel(category) : null;
        } catch (error) {
            throw new Error(`Error del repositorio buscando categoría por ID: ${error}`);
        }
    }

    async findAllCategories(): Promise<CategoryModel[]> {
        try {
            const categories = await this.categoryDAO.findAll();
            return categories.map(category => this.mapCategoryToModel(category));
        } catch (error) {
            throw new Error(`Error del repositorio buscando todas las categorías: ${error}`);
        }
    }

    async updateCategory(id: number, category: CategoryModel): Promise<CategoryModel> {
        try {
            if (id <= 0) {
                throw new Error('El ID de la categoría debe ser un número positivo');
            }

            this.validateCategory(category);

            const updatedCategory = await this.categoryDAO.update(id, category);
            return this.mapCategoryToModel(updatedCategory);
        } catch (error) {
            throw new Error(`Error del repositorio actualizando categoría: ${error}`);
        }
    }

    async deleteCategory(id: number): Promise<void> {
        try {
            if (id <= 0) {
                throw new Error('El ID de la categoría debe ser un número positivo');
            }

            // Check if category has associated products
            const associatedProducts = await this.dbConnection.query(
                `SELECT COUNT(*) as count FROM product_categories WHERE category_id = ?`,
                [id]
            );

            if (associatedProducts[0].count > 0) {
                throw new Error('No se puede eliminar una categoría que tiene productos asociados');
            }

            await this.categoryDAO.delete(id);
        } catch (error) {
            throw new Error(`Error del repositorio eliminando categoría: ${error}`);
        }
    }

    async findCategoryByName(name: string): Promise<CategoryModel | null> {
        try {
            if (!name || name.trim().length === 0) {
                throw new Error('El nombre no puede estar vacío');
            }

            const category = await this.categoryDAO.findByName(name);
            return category ? this.mapCategoryToModel(category) : null;
        } catch (error) {
            throw new Error(`Error del repositorio buscando categoría por nombre: ${error}`);
        }
    }

    async findCategoriesByProductId(productId: number): Promise<CategoryModel[]> {
        try {
            if (productId <= 0) {
                throw new Error('El ID del producto debe ser un número positivo');
            }

            const rows = await this.dbConnection.query(
                `SELECT c.* FROM categories c 
                 INNER JOIN product_categories pc ON c.id = pc.category_id 
                 WHERE pc.product_id = ?`,
                [productId]
            );

            return rows.map((row: any) => this.mapCategoryToModel(CategoryModel.fromJSON(row)));
        } catch (error) {
            throw new Error(`Error del repositorio buscando categorías por producto: ${error}`);
        }
    }

    private mapCategoryToModel(daoResult: CategoryModel): CategoryModel {
        if (!daoResult) {
            throw new Error('No se pueden mapear datos de categoría nulos o indefinidos');
        }

        const category = new CategoryModel({
            id: daoResult.id,
            name: daoResult.name,
            description: daoResult.description
        });

        this.validateCategory(category);

        return category;
    }

    private validateCategory(category: CategoryModel): void {
        if (!category.name || category.name.trim().length === 0) {
            throw new Error('El nombre de la categoría no puede estar vacío');
        }

        if (category.name.length > 100) {
            throw new Error('El nombre de la categoría no puede exceder 100 caracteres');
        }
    }

    private validateProduct(product: ProductModel): void {
        if (!product.name || product.name.trim().length === 0) {
            throw new Error('El nombre del producto no puede estar vacío');
        }

        if (product.price < 0) {
            throw new Error('El precio del producto no puede ser negativo');
        }

        if (product.stock < 0) {
            throw new Error('El stock del producto no puede ser negativo');
        }
    }
}