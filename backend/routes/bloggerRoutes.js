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
} from "../controllers/bloggerController.js";

import { isBloggerAuthenticated } from "../middleware/bloggerAuth.js";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js"; // mövcud admin auth

const router = express.Router();

// ── ADMIN ROUTES ─────────────────────────────────────────────────────
// Bütün admin route-ları isAuthenticatedUser + "admin" rolu tələb edir.

router.route("/superadmin/bloggers/stats/overview")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getBloggersOverview);

router.route("/superadmin/bloggers")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAllBloggers);

router.route("/superadmin/bloggers/create")
    .post(isAuthenticatedUser, authorizeRoles("admin"), createBlogger);

router.route("/superadmin/bloggers/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getBloggerById)
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateBlogger)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteBlogger);

router.route("/superadmin/bloggers/:id/commission")
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateCommissionRate);

router.route("/superadmin/bloggers/:id/commission-duration")
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateCommissionDuration);

router.route("/superadmin/bloggers/:id/regen-promo")
    .put(isAuthenticatedUser, authorizeRoles("admin"), regenPromoCode);

router.route("/superadmin/bloggers/:id/pay-commission")
    .post(isAuthenticatedUser, authorizeRoles("admin"), payCommission);

// ── BLOGER ROUTES ─────────────────────────────────────────────────────
router.route("/blogger/register").post(registerBlogger);
router.route("/blogger/login").post(bloggerLogin);
router.route("/blogger/logout").get(bloggerLogout);

router.route("/blogger/profile")
    .get(isBloggerAuthenticated, getBloggerProfile);

router.route("/blogger/sales")
    .get(isBloggerAuthenticated, getBloggerSales);

// ── PUBLIC ROUTES ─────────────────────────────────────────────────────
router.route("/promo/validate/:code").get(validatePromoCode);
router.route("/promo/track/:code").get(trackPromoLink);

export default router;