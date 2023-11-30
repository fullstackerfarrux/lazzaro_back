import { Router } from "express";
import {
  createPromo,
  deletePromo,
  getForUse,
  getPromo,
} from "../Controller/promocode.controller.js";
const router = Router();

router.post("/promo/create", createPromo);
router.get("/promo/get", getPromo);
router.post("/promo/delete", deletePromo);
router.post("/promo/getforuse", getForUse);

export default router;
