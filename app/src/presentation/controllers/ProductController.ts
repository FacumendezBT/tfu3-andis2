import { Request, Response } from "express";
import { ProductService } from "../../business-logic/services/ProductService";

const productService = new ProductService();

export const getAllProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
        const products = await productService.getAllProducts();
        return res.status(200).json(products);
    } catch (error: any) {
        return res.status(500).json({ message: "Error al obtener los productos", error: error.message });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const product = await productService.getProductById(id);
        
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        
        return res.status(200).json(product);
    } catch (error: any) {
        return res.status(500).json({ message: "Error al obtener el producto", error: error.message });
    }
};

export const createProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
        const newProduct = await productService.createProduct(req.body);
        return res.status(201).json(newProduct);
    } catch (error: any) {
        return res.status(500).json({ message: "Error al crear el producto", error: error.message });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const updatedProduct = await productService.updateProduct(id, req.body);
        
        if (!updatedProduct) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        
        return res.status(200).json(updatedProduct);
    } catch (error: any) {
        return res.status(500).json({ message: "Error al actualizar el producto", error: error.message });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        await productService.deleteProduct(id);
        return res.status(204).send();
    } catch (error: any) {
        return res.status(500).json({ message: "Error al eliminar el producto", error: error.message });
    }
};