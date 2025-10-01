import { Request, Response } from "express";

let orders = [
  { id: 1, customerId: 1, items: [ { productId: 1, quantity: 2 } ], status: "PENDING" },
];

export const getAllOrders = (req: Request, res: Response) => {
  res.json(orders);
};

export const getOrderById = (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
};

export const createOrder = (req: Request, res: Response) => {
  const newOrder = { id: orders.length + 1, status: "PENDING", ...req.body };
  orders.push(newOrder);
  res.status(201).json(newOrder);
};

export const updateOrder = (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return res.status(404).json({ message: "Order not found" });

  orders[index] = { ...orders[index], ...req.body };
  res.json(orders[index]);
};

export const deleteOrder = (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  orders = orders.filter(o => o.id !== id);
  res.status(204).send();
};
