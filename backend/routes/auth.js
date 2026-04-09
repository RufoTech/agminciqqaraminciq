import express from "express";
import {
    registerUser,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getStoreSlugBySeller,
    getStoreBySlug,
    getAllStores,
    googleAuthRedirect,
    googleAuthCallback,
    appleAuthRedirect,
    appleAuthCallback,
} from "../controller/authController.js";
import { isAuthenticatedUser } from "../middleware/auth.js";

const router = express.Router();

router.post("/register",                registerUser);
router.post("/login",                   login);
router.get("/logout",                   isAuthenticatedUser, logout);
router.post("/password/forgot",         forgotPassword);
router.put("/password/reset/:token",    resetPassword);
router.get("/stores",                   getAllStores);
router.get("/store/seller/:name",       getStoreSlugBySeller);
router.get("/store/:slug",              getStoreBySlug);

// ── Google OAuth (redirect axını) ───────────────────────────────────
// Brauzeri Google-a yönləndir
router.get("/auth/google",              googleAuthRedirect);
// Google callback-i qəbul et
router.get("/auth/google/callback",     googleAuthCallback);

// ── Apple OAuth ──────────────────────────────────────────────────────
// Brauzeri Apple-a yönləndir
router.get("/auth/apple",               appleAuthRedirect);
// Apple callback-i qəbul et (Apple form_post ilə POST göndərir)
router.post("/auth/apple/callback",     appleAuthCallback);

export default router;
