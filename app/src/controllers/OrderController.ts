import { Request, Response } from "express";
import { OrderService } from "../services/OrderService";

const orderService = new OrderService();

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await orderService.getAllOrders();
        res.status(200).json(orders);
    } catch (error: any) {
        res.status(500).json({ message: "Error al obtener las órdenes", error: error.message });
    }
};

export const getOrderById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const order = await orderService.getOrderById(id);
        
        if (!order) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }
        
        res.status(200).json(order);
    } catch (error: any) {
        res.status(500).json({ message: "Error al obtener la orden", error: error.message });
    }
};

export const createOrder = async (req: Request, res: Response) => {
    try {
        // El servicio se encargará de validar stock, calcular totales, etc.
        const newOrder = await orderService.createOrder(req.body);
        res.status(201).json(newOrder);
    } catch (error: any) {
        // Si el error es por falta de stock, el mensaje ya viene del servicio
        res.status(400).json({ message: "Error al crear la orden", error: error.message });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body; // Se espera un body como { "status": "COMPLETED" }

        if (!status) {
            return res.status(400).json({ message: "El estado (status) es requerido" });
        }

        const updatedOrder = await orderService.updateOrderStatus(id, status);

        if (!updatedOrder) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }
        
        res.status(200).json(updatedOrder);
    } catch (error: any) {
        res.status(500).json({ message: "Error al actualizar el estado de la orden", error: error.message });
    }
};

export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        await orderService.deleteOrder(id); // El servicio se encarga de reponer el stock
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: "Error al eliminar la orden", error: error.message });
    }
};