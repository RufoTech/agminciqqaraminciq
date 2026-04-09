// ── commissionRouter.js — PashaPay Split-Payment Route-ları ─────────────────
//
// app.js-də: app.use("/commission", commissionRouter)
// Bütün route-lar "/commission/..." ilə başlayır.
//
// ⚠️  WEBHOOK XÜSUSIYYƏTI:
//   /webhook/pashapay route-u FƏRQLI middleware istifadə edir:
//     express.raw() → İmza yoxlaması üçün raw body lazımdır
//   Digər route-larda express.json() işləyir.
//
//   app.js-də bunu BU SIRADAN YAZIN:
//     app.use("/commission/webhook", express.raw({ type: "application/json" }));
//     app.use(express.json());
//     app.use("/commission", commissionRouter);
// ─────────────────────────────────────────────────────────────────────────────

import express from "express";
import {
    getOrderCommission,
    getSellerBalance,
    getMonthlyCommission,
    withdrawBalance,
    getAllCommissions,
    getAllSellerBalances,
    handlePashaPayWebhook,
    checkCommissionStatus,
    simulateWebhook,
} from "../controller/commissionController.js";

import { isAuthenticatedUser, isApprovedSeller, isSuperAdmin } from "../middleware/auth.js";

const router = express.Router();


// ════════════════════════════════════════════════════════════════════════════
//  WEBHOOK — PashaPay-dan gəlir (autentifikasiya YOX, imza yoxlaması VAR)
// ════════════════════════════════════════════════════════════════════════════

// POST /commission/webhook/pashapay
//
// Niyə isAuthenticatedUser yoxdur?
//   Bu endpoint PashaPay server-i çağırır — istifadəçi deyil.
//   PashaPay-ın JWT tokeni olmur.
//   Təhlükəsizlik: controller içindəki HMAC imza yoxlaması ilə qorunur.
//
// ⚠️  app.js-də bu route üçün express.raw() lazımdır — yuxarıdakı kommentə bax.
router.post("/webhook/pashapay", handlePashaPayWebhook);


// ════════════════════════════════════════════════════════════════════════════
//  SATICI ROUTE-LARI (isAuthenticatedUser + isApprovedSeller)
// ════════════════════════════════════════════════════════════════════════════

// GET /commission/order/:orderId
// Sifariş detallarında komisya bölgüsünü göstər
router.get("/order/:orderId",    isAuthenticatedUser, isApprovedSeller, getOrderCommission);

// GET /commission/balance/:sellerId
// Satıcının cari balansı: availableBalance, pendingEarning
router.get("/balance/:sellerId", isAuthenticatedUser, isApprovedSeller, getSellerBalance);

// GET /commission/monthly/:sellerId?month=3&year=2026
// Aylıq komisya hesabatı
router.get("/monthly/:sellerId", isAuthenticatedUser, isApprovedSeller, getMonthlyCommission);

// GET /commission/status/:orderId
// Müəyyən sifarişin komisya statusunu yoxla (webhook polling üçün)
router.get("/status/:orderId",   isAuthenticatedUser, isApprovedSeller, checkCommissionStatus);

// POST /commission/withdraw
// Body: { sellerId, amount }
// Satıcı availableBalance-ini çıxarır
router.post("/withdraw",         isAuthenticatedUser, isApprovedSeller, withdrawBalance);


// ════════════════════════════════════════════════════════════════════════════
//  ADMİN ROUTE-LARI
// ════════════════════════════════════════════════════════════════════════════

// GET /commission/admin/all?month=3&year=2026&status=settled&sellerId=X
// Bütün komisyalar — filter ilə
router.get("/admin/all",         isAuthenticatedUser, isApprovedSeller, getAllCommissions);

// GET /commission/admin/balances
// Bütün satıcı balansları
router.get("/admin/balances",    isAuthenticatedUser, isApprovedSeller, getAllSellerBalances);


// ════════════════════════════════════════════════════════════════════════════
//  DEMO / TEST — Yalnız simulation modunda
// ════════════════════════════════════════════════════════════════════════════

// POST /commission/simulate-webhook
// Body: { providerOrderId: "sim_order_...", eventType: "SETTLED" | "FAILED" }
// Demo-da pending → settled axınını göstərmək üçün istifadə olunur.
// Yalnız SuperAdmin çağıra bilər; production-da controller öz-özünə 403 qaytarır.
router.post("/simulate-webhook", isAuthenticatedUser, isSuperAdmin, simulateWebhook);


export default router;