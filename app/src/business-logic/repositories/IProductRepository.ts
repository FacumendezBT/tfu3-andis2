import { ProductModel } from "../../persistence/models/ProductModel";
import { CategoryModel } from "../../persistence/models/CategoryModel";

export interface IProductRepository {
    // Product Methods
    create(product: ProductModel): Promise<ProductModel>;
    findById(id: number): Promise<ProductModel | null>;
    findAll(): Promise<ProductModel[]>;
    update(id: number, product: ProductModel): Promise<ProductModel>;
    delete(id: number): Promise<void>;
    findByCategory(categoryId: number): Promise<ProductModel[]>;
    updateStock(id: number, newStock: number): Promise<ProductModel>;
    findByName(name: string): Promise<ProductModel[]>;
    findLowStockProducts(threshold: number): Promise<ProductModel[]>;
    
    // Category Methods
    createCategory(category: CategoryModel): Promise<CategoryModel>;
    findCategoryById(id: number): Promise<CategoryModel | null>;
    findAllCategories(): Promise<CategoryModel[]>;
    updateCategory(id: number, category: CategoryModel): Promise<CategoryModel>;
    deleteCategory(id: number): Promise<void>;
    findCategoryByName(name: string): Promise<CategoryModel | null>;
    findCategoriesByProductId(productId: number): Promise<CategoryModel[]>;
}