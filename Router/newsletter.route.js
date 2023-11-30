import { Router } from "express";
import { newsletter } from "../Controller/newsletter.controller.js";

const router = Router();

router.post("/newsletter", newsletter);

export default router;
