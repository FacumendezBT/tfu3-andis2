import { Request, Response } from "express";
import { CustomerService } from "../../business-logic/services/CustomerService";
import { RedisCache } from "../../config/RedisCache";

const customerService = new CustomerService();
const redis = RedisCache.getInstance();

export const getAllCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await customerService.getAllCustomers();
        res.status(200).json(customers);
    } catch (error: any) {
        res.status(500).json({ message: "Error al obtener los clientes", error: error.message });
    }
};

export const getCustomerById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const customer = await customerService.getCustomerById(id);

        if (!customer) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        return res.status(200).json(customer);
    } catch (error: any) {
        return res.status(500).json({ message: "Error al obtener el cliente", error: error.message });
    }
};

export const createCustomer = async (req: Request, res: Response) => {
    try {
        await redis.enqueue("queue:customer-events", {
            type: "CUSTOMER_CREATED",
            payload: { body: req.body },
            ts: Date.now(),
        });

        const newCustomer = await customerService.createCustomer(req.body);
        res.status(201).json();
    } catch (error: any) {
        res.status(500).json({ message: "Error al crear el cliente", error: error.message });
    }
};

export const updateCustomer = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const updatedCustomer = await customerService.getCustomerById(id);

        if (!updatedCustomer) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        await redis.enqueue("queue:customer-events", {
            type: "CUSTOMER_UPDATED",
            payload: { id: id, body: req.body },
            ts: Date.now(),
        });

        return res.status(200).send();
    } catch (error: any) {
        return res.status(500).json({ message: "Error al actualizar el cliente", error: error.message });
    }
};

export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        await redis.enqueue("queue:customer-events", {
            type: "CUSTOMER_DELETED",
            payload: { id: id },
            ts: Date.now(),
        });

        res.status(204).send(); // No content
    } catch (error: any) {
        res.status(500).json({ message: "Error al eliminar el cliente", error: error.message });
    }
};
