// express — Node.js üçün veb framework.
import express from "express";

// orderController-dən lazımlı funksiyaları import edirik.
import {
    createOrder,       // Ödəniş sonrası sifariş yarat + səbəti sil
    getMyOrders,       // İstifadəçinin bütün sifarişləri
    getOrderById,      // Tək sifariş detalı
    getAdminOrders,    // Satıcının mağazasına aid sifarişlər
    updateOrderStatus, // Sifariş statusunu dəyiş
} from "../controller/orderController.js";

// isAuthenticatedUser — JWT token yoxlayır, req.user-ə yazır.
// authorizeRoles      — istifadəçinin rolunu yoxlayır.
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";


// =====================================================================
// ROUTER YARATMA
// ---------------------------------------------------------------------
// app.js-də: app.use("/commerce", orderRouter) (və ya ayrı prefix)
// → Route-lar müvafiq prefix ilə başlayır.
// =====================================================================
const router = express.Router();


// =====================================================================
// İSTİFADƏÇİ ROUTE-LARI
// ---------------------------------------------------------------------
// Bu route-lar yalnız token yoxlayır — hər giriş etmiş istifadəçi
// (role="user" və ya role="admin") istifadə edə bilər.
// =====================================================================

// POST /commerce/orders/create
// Stripe ödənişi tamamlandıqdan sonra çağırılır.
// Body: { stripePaymentIntentId, currency }
// İş axını: Stripe yoxla → sifariş yarat → komisya hesabla → stok azalt → səbəti sil
router.post("/orders/create",   isAuthenticatedUser, createOrder);

// GET /commerce/orders/my
// İstifadəçinin bütün sifarişləri — ən yeni üstdə.
// "Sifarişlərim" səhifəsi üçün.
router.get("/orders/my",        isAuthenticatedUser, getMyOrders);

// GET /commerce/orders/:id
// Tək sifariş detalı — istifadəçi yalnız öz sifarişini görə bilər.
// Başqasının sifarişinə baxmağa cəhd edilsə → 403 Forbidden.
//
// ⚠️ ROUTE SIRASI VACİBDİR:
//   "/orders/my" — "/orders/:id"-dən ƏVVƏL yazılmalıdır.
//   Əgər /:id əvvəl olsaydı → "my" id kimi qəbul edilərdi:
//   req.params.id = "my" → MongoDB-də yanlış axtarış → xəta.
router.get("/orders/:id",       isAuthenticatedUser, getOrderById);


// =====================================================================
// ADMİN ROUTE-LARI
// ---------------------------------------------------------------------
// Bu route-lar ikiqat qorunur:
//   1. isAuthenticatedUser  → token var və etibarlıdır?
//   2. authorizeRoles("admin") → role="admin"-dirmi?
//
// Niyə authorizeRoles, isApprovedSeller deyil?
//   authorizeRoles("admin") — yalnız rol yoxlayır.
//   isApprovedSeller — hem rol, həm sellerStatus yoxlayır.
//   Sifariş görmək/status dəyişdirmək üçün rol yetərlidir.
//   (sellerStatus yoxlaması əlavə etmək daha güvənli olar — gələcək inkişaf)
// =====================================================================

// GET /commerce/admin/orders
// Satıcının yalnız öz mağazasına aid sifarişlərini göstərir.
// Başqa mağazaların məhsulları süzülür — məxfilik qorunur.
router.get("/admin/orders",     isAuthenticatedUser, authorizeRoles("admin"), getAdminOrders);

// PUT /commerce/admin/orders/:id
// Sifariş statusunu dəyişdirir: pending → processing → shipped → delivered
// Yalnız həmin sifarişdə bu mağazanın məhsulu varsa icazə verilir.
// Status dəyişdikdə istifadəçiyə bildiriş göndərilir.
router.put("/admin/orders/:id", isAuthenticatedUser, authorizeRoles("admin"), updateOrderStatus);


export default router;