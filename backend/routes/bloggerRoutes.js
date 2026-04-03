// express — Node.js üçün veb framework.
// Router — URL-ləri controller funksiyalarına yönləndirən modul.
import express from "express";

// authController-dən lazımlı funksiyaları import edirik.
import {
    registerUser,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getStoreBySlug,
} from "../controller/authController.js";


// =====================================================================
// ROUTER YARATMA
// ---------------------------------------------------------------------
// express.Router() — mini Express tətbiqi kimidir.
// Route-ları qruplaşdırır — app.js-də bir dəfə mount edilir:
//   app.use("/commerce", authRouter)
//   → Bütün bu route-lar "/commerce/..." ilə başlayır.
//
// Niyə Router istifadə edilir, app birbaşa deyil?
//   Modulyarlıq: hər fayl öz route-larını idarə edir.
//   app.js-i şişirtmir — bütün route-lar ayrı faylda saxlanılır.
// =====================================================================
const router = express.Router();


// =====================================================================
// AUTENTİFİKASİYA ROUTE-LARI
// ---------------------------------------------------------------------
// Bu route-lar ictimai (public) — token tələb etmir.
// İstənilən ziyarətçi bu endpoint-lərə sorğu göndərə bilər.
// =====================================================================

// POST /commerce/register
// Yeni istifadəçi və ya admin qeydiyyatı.
// Body: { name, email, password, role?, storeName?, ... }
router.post("/register", registerUser);

// POST /commerce/login
// Email + şifrə ilə giriş → JWT token cookie-yə yazılır.
// Body: { email, password }
router.post("/login", login);

// GET /commerce/logout
// Cookie-dəki token-i silir → istifadəçi çıxış etmiş sayılır.
// Niyə GET? Heç bir data göndərilmir — yalnız cookie silinir.
router.get("/logout", logout);

// POST /commerce/password/forgot
// Email-ə şifrə sıfırlama linki göndərir.
// Body: { email }
router.post("/password/forgot", forgotPassword);

// PUT /commerce/password/reset/:token
// Email-dəki linkdən gələn token ilə yeni şifrə təyin edir.
// Params: token (URL-dən)
// Body: { password, confirmPassword }
// Niyə PUT? Mövcud resurs (şifrə) yenilənir — HTTP semantikasına uyğundur.
router.put("/password/reset/:token", resetPassword);


// =====================================================================
// MAĞAZA PROFİLİ ROUTE-U
// ---------------------------------------------------------------------
// GET /commerce/store/:slug
//
// İctimai route — heç bir token tələb etmir.
// Niyə ictimai?
//   Müştəri mağaza linkini paylaşa bilər — giriş etmədən baxılsın.
//   Məsələn: "vusal-market-4231" linkini WhatsApp-da paylaş.
//
// :slug — URL-dəki dəyişən hissə (dinamik parametr).
//   Məsələn: /store/vusal-market-4231
//   req.params.slug = "vusal-market-4231"
//
// getStoreBySlug:
//   Admin kolleksiyasında storeSlug ilə axtarır.
//   Mağaza məlumatları + həmin mağazanın məhsulları qaytarılır.
// =====================================================================
router.get("/store/:slug", getStoreBySlug);


export default router;