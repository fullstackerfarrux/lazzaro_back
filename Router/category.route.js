import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoriesNot,
} from "../Controller/category.controller.js";
const router = Router();

router.post("/category/create", createCategory);
router.post("/category/delete", deleteCategory);
router.get("/categories", getCategories);
router.get("/categories/not", getCategoriesNot);

export default router;
