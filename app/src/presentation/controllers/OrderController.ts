import { Request, Response } from "express";
import { OrderService } from "../../business-logic/services/OrderService";
import { OrderStatus } from "../../persistence/models/types";

const orderService = new OrderService();

export const getAllOrders = async (req: Request, res: Response): Promise<Response> => {
    try {
        const orders = await orderService.getAllOrders();
        return res.status(200).json(orders);
    } catch (error: any) {
        return res.status(500).json({ message: "Error al obtener las órdenes", error: error.message });
    }
};

export const getOrderById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const order = await orderService.getOrderById(id);
        
        if (!order) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }
        
        return res.status(200).json(order);
    } catch (error: any) {
        return res.status(500).json({ message: "Error al obtener la orden", error: error.message });
    }
};

export const createOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
        // El servicio se encargará de validar stock, calcular totales, etc.
        const newOrder = await orderService.createOrder(req.body);
        return res.status(201).json(newOrder);
    } catch (error: any) {
        // Si el error es por falta de stock, el mensaje ya viene del servicio
        return res.status(400).json({ message: "Error al crear la orden", error: error.message });
    }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body; // Se espera un body como { "status": "delivered" }

        if (!status) {
            return res.status(400).json({ message: "El estado (status) es requerido" });
        }

        const normalizedStatus = String(status).toLowerCase() as OrderStatus;

        if (!Object.values(OrderStatus).includes(normalizedStatus)) {
            return res.status(400).json({ message: `Estado de orden inválido: ${status}` });
        }

        const updatedOrder = await orderService.updateOrderStatus(id, normalizedStatus);

        if (!updatedOrder) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }
        
        return res.status(200).json(updatedOrder);
    } catch (error: any) {
        return res.status(500).json({ message: "Error al actualizar el estado de la orden", error: error.message });
    }
};

export const deleteOrder = async (req: Request, res: Response): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        await orderService.deleteOrder(id); // El servicio se encarga de reponer el stock
        return res.status(204).send();
    } catch (error: any) {
        return res.status(500).json({ message: "Error al eliminar la orden", error: error.message });
    }
};