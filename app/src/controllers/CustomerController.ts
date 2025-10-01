import { Request, Response } from "express";

let customers = [
  { id: 1, name: "Juan Pérez", email: "juan@example.com" },
  { id: 2, name: "Ana López", email: "ana@example.com" },
];

export const getAllCustomers = (req: Request, res: Response) => {
  res.json(customers);
};

export const getCustomerById = (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const customer = customers.find(c => c.id === id);
  if (!customer) return res.status(404).json({ message: "Customer not found" });
  res.json(customer);
};

export const createCustomer = (req: Request, res: Response) => {
  const newCustomer = { id: customers.length + 1, ...req.body };
  customers.push(newCustomer);
  res.status(201).json(newCustomer);
};

export const updateCustomer = (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const index = customers.findIndex(c => c.id === id);
  if (index === -1) return res.status(404).json({ message: "Customer not found" });

  customers[index] = { ...customers[index], ...req.body };
  res.json(customers[index]);
};

export const deleteCustomer = (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  customers = customers.filter(c => c.id !== id);
  res.status(204).send();
};
