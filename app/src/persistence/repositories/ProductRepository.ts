import { ProductModel } from '../models/ProductModel';
import { ProductDAO } from '../daos/ProductDao';
import { IProductRepository } from '../../business-logic/repositories/IProductRepository';

export class ProductRepository implements IProductRepository {
    private productDAO: ProductDAO;

    constructor() {
        this.productDAO = new ProductDAO();
    }

    async create(product: ProductModel): Promise<ProductModel> {
        try {
            const createdProduct = await this.productDAO.create(product);
            return this.mapToModel(createdProduct);
        } catch (error) {
            throw new Error(`Error del repositorio creando producto: ${error}`);
        }
    }

    async findById(id: number): Promise<ProductModel | null> {
        try {
            const product = await this.productDAO.findById(id);
            return product ? this.mapToModel(product) : null;
        } catch (error) {
            throw new Error(`Error del repositorio buscando producto por ID: ${error}`);
        }
    }

    async findAll(): Promise<ProductModel[]> {
        try {
            const products = await this.productDAO.findAll();
            return products.map(product => this.mapToModel(product));
        } catch (error) {
            throw new Error(`Error del repositorio buscando todos los productos: ${error}`);
        }
    }

    async update(id: number, product: ProductModel): Promise<ProductModel> {
        try {
            const updatedProduct = await this.productDAO.update(id, product);
            return this.mapToModel(updatedProduct);
        } catch (error) {
            throw new Error(`Error del repositorio actualizando producto: ${error}`);
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await this.productDAO.delete(id);
        } catch (error) {
            throw new Error(`Error del repositorio eliminando producto: ${error}`);
        }
    }

    async findByCategory(categoryId: number): Promise<ProductModel[]> {
        try {
            const products = await this.productDAO.findByCategory(categoryId);
            return products.map(product => this.mapToModel(product));
        } catch (error) {
            throw new Error(`Error del repositorio buscando productos por categoría: ${error}`);
        }
    }

    async updateStock(id: number, newStock: number): Promise<ProductModel> {
        try {
            const updatedProduct = await this.productDAO.updateStock(id, newStock);
            return this.mapToModel(updatedProduct);
        } catch (error) {
            throw new Error(`Error del repositorio actualizando stock del producto: ${error}`);
        }
    }

    async findByName(name: string): Promise<ProductModel[]> {
        try {
            const allProducts = await this.productDAO.findAll();
            const filteredProducts = allProducts.filter(product => 
                product.name.toLowerCase().includes(name.toLowerCase())
            );
            return filteredProducts.map(product => this.mapToModel(product));
        } catch (error) {
            throw new Error(`Error del repositorio buscando productos por nombre: ${error}`);
        }
    }

    async findLowStockProducts(threshold: number = 10): Promise<ProductModel[]> {
        try {
            const allProducts = await this.productDAO.findAll();
            const lowStockProducts = allProducts.filter(product => product.stock <= threshold);
            return lowStockProducts.map(product => this.mapToModel(product));
        } catch (error) {
            throw new Error(`Error del repositorio buscando productos con poco stock: ${error}`);
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