import { ProductModel } from "../../persistence/models/ProductModel";

export interface IProductRepository {
    create(product: ProductModel): Promise<ProductModel>;
    findById(id: number): Promise<ProductModel | null>;
    findAll(): Promise<ProductModel[]>;
    update(id: number, product: ProductModel): Promise<ProductModel>;
    delete(id: number): Promise<void>;
    findByCategory(categoryId: number): Promise<ProductModel[]>;
    updateStock(id: number, newStock: number): Promise<ProductModel>;
    findByName(name: string): Promise<ProductModel[]>;
    findLowStockProducts(threshold: number): Promise<ProductModel[]>;
}