import { ProductRepository } from '../../persistence/repositories/ProductRepository';
import { ProductModel } from '../../persistence/models/ProductModel';
import { IProductRepository } from '../repositories/IProductRepository';

export class ProductService {
    private productRepository: IProductRepository;

    constructor() {
        this.productRepository = new ProductRepository();
    }

    /**
     * Obtiene todos los productos.
     */
    public async getAllProducts(): Promise<ProductModel[]> {
        return this.productRepository.findAll();
    }

    /**
     * Obtiene un producto por su ID.
     * @param id El ID del producto.
     */
    public async getProductById(id: number): Promise<ProductModel | null> {
        // El Repository ya se encarga de buscar las categorías.
        return this.productRepository.findById(id);
    }
    
    /**
     * Obtiene productos por categoría.
     * @param categoryId El ID de la categoría.
     */
    public async getProductsByCategory(categoryId: number): Promise<ProductModel[]> {
        return this.productRepository.findByCategory(categoryId);
    }

    /**
     * Crea un nuevo producto.
     * @param productData Datos del producto a crear.
     */
    public async createProduct(productData: Partial<ProductModel>): Promise<ProductModel> {
        const newProduct = new ProductModel(productData);
        return this.productRepository.create(newProduct);
    }

    /**
     * Actualiza un producto existente.
     * @param id El ID del producto a actualizar.
     * @param productData Datos parciales para actualizar.
     */
    public async updateProduct(id: number, productData: Partial<ProductModel>): Promise<ProductModel | null> {
        const existingProduct = await this.productRepository.findById(id);
        if (!existingProduct) {
            return null; // O lanzar un error
        }

        // Fusiona los datos existentes con los nuevos
        const updatedProductData = new ProductModel({
            ...existingProduct,
            ...productData,
            id: id // Asegura que el ID no cambie
        });
        
        return this.productRepository.update(id, updatedProductData);
    }

    /**
     * Elimina un producto por su ID.
     * @param id El ID del producto a eliminar.
     */
    public async deleteProduct(id: number): Promise<void> {
        return this.productRepository.delete(id);
    }

    /**
     * Busca productos por nombre.
     * @param name El nombre o parte del nombre a buscar.
     */
    public async searchProductsByName(name: string): Promise<ProductModel[]> {
        return this.productRepository.findByName(name);
    }

    /**
     * Obtiene productos con stock bajo.
     * @param threshold El umbral de stock bajo (por defecto 10).
     */
    public async getLowStockProducts(threshold: number = 10): Promise<ProductModel[]> {
        return this.productRepository.findLowStockProducts(threshold);
    }

    /**
     * Actualiza solo el stock de un producto.
     * @param id El ID del producto.
     * @param newStock El nuevo valor de stock.
     */
    public async updateProductStock(id: number, newStock: number): Promise<ProductModel> {
        return this.productRepository.updateStock(id, newStock);
    }
}