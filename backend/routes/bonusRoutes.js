import express from "express";
import {
    getBonusConfig,
    getMyBonus,
    requestPhoneOtp,
    verifyPhoneOtp,
    redeemBonuses,
    cancelBonusRedeem,
    awardReviewBonus,
    getReferralInfo,
    getAdminConfig,
    updateAdminConfig,
    startCampaign,
    endCampaign,
    getAdminTransactions,
    getAnomalies,
} from "../controller/bonusController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// ── PUBLİK ─────────────────────────────────────────────────────────
// Bonus konfiqini hər kəs görmə bilər (UI-da göstərmək üçün)
router.get("/config", isAuthenticatedUser, getBonusConfig);

// ── İSTİFADƏÇİ (giriş tələb olunur) ────────────────────────────────
router.get("/my",             isAuthenticatedUser, getMyBonus);
router.get("/referral",       isAuthenticatedUser, getReferralInfo);
router.post("/phone/request", isAuthenticatedUser, requestPhoneOtp);
router.post("/phone/verify",  isAuthenticatedUser, verifyPhoneOtp);
router.post("/redeem",        isAuthenticatedUser, redeemBonuses);
router.post("/cancel-redeem", isAuthenticatedUser, cancelBonusRedeem);
router.post("/review/:productId", isAuthenticatedUser, awardReviewBonus);

// ── ADMİN (yalnız admin rollu istifadəçilər) ─────────────────────────
router.get(
    "/admin/config",
    isAuthenticatedUser,
    authorizeRoles("admin"),
    getAdminConfig
);
router.put(
    "/admin/config",
    isAuthenticatedUser,
    authorizeRoles("admin"),
    updateAdminConfig
);
router.post(
    "/admin/campaign",
    isAuthenticatedUser,
    authorizeRoles("admin"),
    startCampaign
);
router.delete(
    "/admin/campaign",
    isAuthenticatedUser,
    authorizeRoles("admin"),
    endCampaign
);
router.get(
    "/admin/transactions",
    isAuthenticatedUser,
    authorizeRoles("admin"),
    getAdminTransactions
);
router.get(
    "/admin/anomalies",
    isAuthenticatedUser,
    authorizeRoles("admin"),
    getAnomalies
);

export default router;
