import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
} from "../Controller/category.controller.js";
const router = Router();

router.post("/category/create", createCategory);
router.post("/category/delete", deleteCategory);
router.get("/categories", getCategories);

export default router;
