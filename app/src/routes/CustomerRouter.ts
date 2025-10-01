import { Router } from "express";
import * as CustomerController from "../controllers/CustomerController";

const router = Router();

// GET /customers
router.get("/", CustomerController.getAllCustomers);

// GET /customers/:id
router.get("/:id", CustomerController.getCustomerById);

// POST /customers
router.post("/", CustomerController.createCustomer);

// PUT /customers/:id
router.put("/:id", CustomerController.updateCustomer);

// DELETE /customers/:id
router.delete("/:id", CustomerController.deleteCustomer);

export default router;
