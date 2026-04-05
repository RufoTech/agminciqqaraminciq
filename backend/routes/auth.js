import express from "express";
import {
    registerUser,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getStoreSlugBySeller,
    getStoreBySlug,
} from "../controller/authController.js";
import { isAuthenticatedUser } from "../middleware/auth.js";

const router = express.Router();

router.post("/register",                registerUser);
router.post("/login",                   login);
router.get("/logout",                   isAuthenticatedUser, logout);
router.post("/password/forgot",         forgotPassword);
router.put("/password/reset/:token",    resetPassword);
router.get("/store/seller/:name",       getStoreSlugBySeller);
router.get("/store/:slug",              getStoreBySlug);

export default router;
