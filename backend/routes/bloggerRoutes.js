// =====================================================================
// BLOGER ROUTES — routes/bloggerRoutes.js
// ---------------------------------------------------------------------
// Bütün bloger endpoint-ləri burada qeydiyyatdan keçir.
// Base path: /commerce/mehsullar
// =====================================================================

import express from "express";
import {
    // Admin
    createBlogger,
    getAllBloggers,
    getBloggerById,
    updateBlogger,
    updateCommissionRate,
    updateCommissionDuration,
    regenPromoCode,
    payCommission,
    deleteBlogger,
    getBloggersOverview,
    // Bloger
    registerBlogger,
    bloggerLogin,
    bloggerLogout,
    getBloggerProfile,
    getBloggerSales,
    // Public
    validatePromoCode,
    trackPromoLink,
} from "../controller/bloggerController.js";

import {
    getBloggerProducts,
    newBloggerProduct,
    updateBloggerProduct,
    deleteBloggerProduct,
} from "../controller/bloggerProductController.js";

import { 
    isAuthenticatedUser, 
    authorizeRoles, 
    isBlogger 
} from "../middleware/auth.js";

// uploadImages — multer middleware-i
import { uploadImages } from "../middleware/multer.js";

const router = express.Router();

// ── ADMIN ROUTES ─────────────────────────────────────────────────────
// Bütün admin route-ları isAuthenticatedUser + "admin" rolu tələb edir.

router.route("/superadmin/bloggers/stats/overview")
    .get(isAuthenticatedUser, authorizeRoles("admin", "superadmin"), getBloggersOverview);

router.route("/superadmin/bloggers")
    .get(isAuthenticatedUser, authorizeRoles("admin", "superadmin"), getAllBloggers);

router.route("/superadmin/bloggers/create")
    .post(isAuthenticatedUser, authorizeRoles("admin", "superadmin"), createBlogger);

router.route("/superadmin/bloggers/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin", "superadmin"), getBloggerById)
    .put(isAuthenticatedUser, authorizeRoles("admin", "superadmin"), updateBlogger)
    .delete(isAuthenticatedUser, authorizeRoles("admin", "superadmin"), deleteBlogger);

router.route("/superadmin/bloggers/:id/commission")
    .put(isAuthenticatedUser, authorizeRoles("admin", "superadmin"), updateCommissionRate);

router.route("/superadmin/bloggers/:id/commission-duration")
    .put(isAuthenticatedUser, authorizeRoles("admin", "superadmin"), updateCommissionDuration);

router.route("/superadmin/bloggers/:id/regen-promo")
    .put(isAuthenticatedUser, authorizeRoles("admin", "superadmin"), regenPromoCode);

router.route("/superadmin/bloggers/:id/pay-commission")
    .post(isAuthenticatedUser, authorizeRoles("admin", "superadmin"), payCommission);

// ── BLOGER ROUTES ─────────────────────────────────────────────────────
router.route("/blogger/register").post(registerBlogger);
router.route("/blogger/login").post(bloggerLogin);
router.route("/blogger/logout").get(bloggerLogout);

router.route("/blogger/profile")
    .get(isAuthenticatedUser, isBlogger, getBloggerProfile);

router.route("/blogger/sales")
    .get(isAuthenticatedUser, isBlogger, getBloggerSales);

// ── BLOGER PRODUCT ROUTES ─────────────────────────────────────────────
router.route("/blogger/products")
    .get(isAuthenticatedUser, isBlogger, getBloggerProducts)
    .post(isAuthenticatedUser, isBlogger, uploadImages, newBloggerProduct);

router.route("/blogger/products/:id")
    .put(isAuthenticatedUser, isBlogger, uploadImages, updateBloggerProduct)
    .delete(isAuthenticatedUser, isBlogger, deleteBloggerProduct);

// ── PUBLIC ROUTES ─────────────────────────────────────────────────────
router.route("/promo/validate/:code").get(validatePromoCode);
router.route("/promo/track/:code").get(trackPromoLink);

export default router;