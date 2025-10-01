import { Router } from "express";
import * as OrderController from "../controllers/OrderController";

const router = Router();

// GET /orders
router.get("/", OrderController.getAllOrders);

// GET /orders/:id
router.get("/:id", OrderController.getOrderById);

// POST /orders
router.post("/", OrderController.createOrder);

// PUT /orders/:id
router.put("/:id", OrderController.updateOrder);

// DELETE /orders/:id
router.delete("/:id", OrderController.deleteOrder);

export default router;
