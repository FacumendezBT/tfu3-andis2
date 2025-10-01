import { ProductDAO } from '../persistence/models/ProductDao';
import { ProductModel } from '../../persistence/models/ProductModel';
import { CategoryDAO } from '../persistence/models/CategoryDao';

export class ProductService {
    private productDAO: ProductDAO;
    private categoryDAO: CategoryDAO;

    constructor() {
        this.productDAO = new ProductDAO();
        this.categoryDAO = new CategoryDAO();
    }

    /**
     * Obtiene todos los productos.
     */
    public async getAllProducts(): Promise<ProductModel[]> {
        return this.productDAO.findAll();
    }

    /**
     * Obtiene un producto por su ID.
     * @param id El ID del producto.
     */
    public async getProductById(id: number): Promise<ProductModel | null> {
        // El DAO ya se encarga de buscar las categorías.
        return this.productDAO.findById(id);
    }
    
    /**
     * Obtiene productos por categoría.
     * @param categoryId El ID de la categoría.
     */
    public async getProductsByCategory(categoryId: number): Promise<ProductModel[]> {
        return this.productDAO.findByCategory(categoryId);
    }

    /**
     * Crea un nuevo producto.
     * @param productData Datos del producto a crear.
     */
    public async createProduct(productData: Partial<ProductModel>): Promise<ProductModel> {
        const newProduct = new ProductModel(productData);
        return this.productDAO.create(newProduct);
    }

    /**
     * Actualiza un producto existente.
     * @param id El ID del producto a actualizar.
     * @param productData Datos parciales para actualizar.
     */
    public async updateProduct(id: number, productData: Partial<ProductModel>): Promise<ProductModel | null> {
        const existingProduct = await this.productDAO.findById(id);
        if (!existingProduct) {
            return null; // O lanzar un error
        }

        // Fusiona los datos existentes con los nuevos
        const updatedProductData = new ProductModel({
            ...existingProduct,
            ...productData,
            id: id // Asegura que el ID no cambie
        });
        
        return this.productDAO.update(id, updatedProductData);
    }

    /**
     * Elimina un producto por su ID.
     * @param id El ID del producto a eliminar.
     */
    public async deleteProduct(id: number): Promise<void> {
        return this.productDAO.delete(id);
    }
}