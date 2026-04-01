// express — Node.js üçün veb framework.
import express from "express";

// commissionController-dən bütün lazımlı funksiyaları import edirik.
import {
    getOrderCommission,    // Sifariş üzrə komisya detalları
    getSellerBalance,      // Satıcının cari balansı
    getMonthlyCommission,  // Aylıq komisya hesabatı
    transferCommission,    // Ay sonu komisyanı şirkətə köçür
    withdrawBalance,       // Satıcı öz qazancını çəkir
    getAllCommissions,      // Admin — bütün satıcıların komisyaları
    getAllSellerBalances,   // Admin — bütün satıcıların balansları
} from "../controller/commissionController.js";

// isAuthenticatedUser — JWT token yoxlayır, req.user-ə yazır.
// isApprovedSeller    — həm role="admin", həm sellerStatus="approved" yoxlayır.
import { isAuthenticatedUser, isApprovedSeller } from "../middleware/auth.js";


// =====================================================================
// ROUTER YARATMA
// ---------------------------------------------------------------------
// app.js-də: app.use("/commission", commissionRouter)
// → Bütün route-lar "/commission/..." ilə başlayır.
// =====================================================================
const router = express.Router();


// =====================================================================
// SATICI ROUTE-LARI
// ---------------------------------------------------------------------
// Bütün bu route-lar ikiqat qorunur:
//   1. isAuthenticatedUser → token var və etibarlıdır?
//   2. isApprovedSeller    → admin rolundadır + təsdiqlənib?
//
// Niyə ikiqat qoruma?
//   isAuthenticatedUser → "kim olduğunu" yoxlayır (autentifikasiya)
//   isApprovedSeller    → "bu resursa giriş icazəsi varmı?" (avtorizasiya)
//   Yalnız biri olsaydı:
//     Yalnız token yoxlanılsaydı → adi User-lər də bu route-lara girib bilərdi.
//     Yalnız status yoxlanılsaydı → kim olduğu bilinmədən icazə verilərdi.
// =====================================================================

// GET /commission/order/:orderId
// Müəyyən sifarişin komisya detallarını göstərir.
// Satıcı öz sifarişinin neçə faiz komisya verdiyini görür.
router.get("/order/:orderId",    isAuthenticatedUser, isApprovedSeller, getOrderCommission);

// GET /commission/balance/:sellerId
// Satıcının cari maliyyə vəziyyəti:
//   availableBalance  → çəkə biləcəyi pul
//   pendingCommission → şirkətin payı (toxuna bilməz)
router.get("/balance/:sellerId", isAuthenticatedUser, isApprovedSeller, getSellerBalance);

// GET /commission/monthly/:sellerId?month=3&year=2026
// Satıcının seçilmiş ay üzrə komisya hesabatı.
// Query parametrləri göndərilməsə → cari ay/il istifadə olunur.
router.get("/monthly/:sellerId", isAuthenticatedUser, isApprovedSeller, getMonthlyCommission);

// POST /commission/transfer
// Ay sonu komisyanı Stripe ilə şirkət hesabına köçürür.
// Body: { sellerId, sellerName, month, year, paymentMethodId }
// Niyə POST? Yeni köçürmə əməliyyatı yaradılır — resurs dəyişdirilir.
router.post("/transfer",         isAuthenticatedUser, isApprovedSeller, transferCommission);

// POST /commission/withdraw
// Satıcı öz availableBalance-indən pul çıxarır.
// Body: { sellerId, amount }
router.post("/withdraw",         isAuthenticatedUser, isApprovedSeller, withdrawBalance);


// =====================================================================
// ADMİN/SUPERADMİN ROUTE-LARI
// ---------------------------------------------------------------------
// "admin" prefiksi bu route-ların daha geniş icazə tələb etdiyini
// göstərir — bütün satıcıların məlumatlarını görə bilir.
//
// Niyə isApprovedSeller istifadə edilir, isSuperAdmin deyil?
//   Hazırki kodda superadmin yoxlaması yoxdur — bu route-lar
//   da təsdiqlənmiş adminlər üçün açıqdır.
//   Gələcəkdə daha ciddi qoruma üçün isSuperAdmin əlavə edilə bilər.
// =====================================================================

// GET /commission/admin/all?month=3&year=2026&status=pending
// Bütün satıcıların komisya qeydlərini göstərir.
// Query ilə filter qurula bilər: ay, il, status.
router.get("/admin/all",         isAuthenticatedUser, isApprovedSeller, getAllCommissions);

// GET /commission/admin/balances
// Bütün satıcıların maliyyə vəziyyətini göstərir.
// pendingCommission-a görə azalan sırada — ən çox borcu olan üstdə.
router.get("/admin/balances",    isAuthenticatedUser, isApprovedSeller, getAllSellerBalances);


export default router;
