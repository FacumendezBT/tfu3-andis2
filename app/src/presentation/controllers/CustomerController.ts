import { Request, Response } from "express";
import { CustomerService } from "../services/CustomerService";

const customerService = new CustomerService();

export const getAllCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await customerService.getAllCustomers();
        res.status(200).json(customers);
    } catch (error: any) {
        res.status(500).json({ message: "Error al obtener los clientes", error: error.message });
    }
};

export const getCustomerById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const customer = await customerService.getCustomerById(id);
        
        if (!customer) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        
        res.status(200).json(customer);
    } catch (error: any) {
        res.status(500).json({ message: "Error al obtener el cliente", error: error.message });
    }
};

export const createCustomer = async (req: Request, res: Response) => {
    try {
        const newCustomer = await customerService.createCustomer(req.body);
        res.status(201).json(newCustomer);
    } catch (error: any) {
        res.status(500).json({ message: "Error al crear el cliente", error: error.message });
    }
};

export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const updatedCustomer = await customerService.updateCustomer(id, req.body);
        
        if (!updatedCustomer) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        
        res.status(200).json(updatedCustomer);
    } catch (error: any) {
        res.status(500).json({ message: "Error al actualizar el cliente", error: error.message });
    }
};

export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        await customerService.deleteCustomer(id);
        res.status(204).send(); // No content
    } catch (error: any) {
        res.status(500).json({ message: "Error al eliminar el cliente", error: error.message });
    }
};