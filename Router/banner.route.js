import { Router } from "express";
import {
  createPhoto,
  deletePhoto,
  getPhoto,
} from "../Controller/banner.controller.js";

const router = Router();

router.post("/banner/create", createPhoto);
router.get("/banner/get", getPhoto);
router.post("/banner/delete", deletePhoto);

export default router;
