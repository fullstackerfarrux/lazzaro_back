import { Router } from "express";
import {
  getUsers,
  getUsersOrder,
  getUser,
  getUserLocation,
} from "../Controller/user.controller.js";
const router = Router();

router.get("/users", getUsers);
router.get("/users/order", getUsersOrder);
router.get("/user/:id", getUser);
router.get("/user_location/:id", getUserLocation);

export default router;
