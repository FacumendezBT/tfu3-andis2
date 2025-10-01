import { Router } from "express";
import * as ProductController from "../controllers/ProductController";

const router = Router();

// GET /products
router.get("/", ProductController.getAllProducts);

// GET /products/:id
router.get("/:id", ProductController.getProductById);

// POST /products
router.post("/", ProductController.createProduct);

// PUT /products/:id
router.put("/:id", ProductController.updateProduct);

// DELETE /products/:id
router.delete("/:id", ProductController.deleteProduct);

export default router;