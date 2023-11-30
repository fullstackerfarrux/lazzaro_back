import { Router } from "express";
import {
  createProduct,
  getProducts,
  deleteProduct,
  changeStatusProduct,
  getProduct,
  editProduct,
} from "../Controller/products.controller.js";
const router = Router();

router.post("/product/create", createProduct);
router.get("/products", getProducts);
router.post("/product/delete", deleteProduct);
router.post("/product/status", changeStatusProduct);
router.post("/product", getProduct);
router.post("/product/edit", editProduct);
export default router;
