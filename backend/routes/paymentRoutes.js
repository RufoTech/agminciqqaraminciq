import express from "express";
import { createPaymentSession } from "../controller/paymentController.js";
import { isAuthenticatedUser } from "../middleware/auth.js";

const router = express.Router();

router.post("/products/create-payment-intent", isAuthenticatedUser, createPaymentSession);

export default router;