// express — Node.js üçün veb framework.
import express from "express";

// paymentController-dən PaymentIntent yaratmaq funksiyasını import edirik.
import { createPaymentIntent } from "../controller/paymentController.js";

// isAuthenticatedUser — JWT token yoxlayır, req.user-ə yazır.
// Niyə token tələb olunur?
//   Anonim istifadəçi PaymentIntent yaratsaydı —
//   hər kəs ödəniş prosesini başlada bilərdi.
//   Token ilə yalnız giriş etmiş istifadəçilər ödəniş edə bilər.
import { isAuthenticatedUser } from "../middleware/auth.js";


// =====================================================================
// ROUTER YARATMA
// ---------------------------------------------------------------------
// app.js-də mount edildiyi yola görə tam URL:
//   POST /commerce/mehsullar/products/create-payment-intent
// =====================================================================
const router = express.Router();


// =====================================================================
// ÖDƏNIŞ NİYYƏTİ ROUTE-U
// ---------------------------------------------------------------------
// POST /products/create-payment-intent
//
// Ödəniş axını bu route ilə başlayır:
//   1. Frontend ödəniş səhifəsini açır
//   2. Bu endpoint çağırılır → Stripe-da PaymentIntent yaradılır
//   3. clientSecret frontend-ə qaytarılır
//   4. Frontend Stripe.js-ə clientSecret verir
//   5. İstifadəçi kart məlumatlarını birbaşa Stripe-a göndərir
//   6. Ödəniş uğurlu olduqda → createOrder çağırılır
//
// Niyə server tərəfdə yaradılır?
//   Frontend-də yaradılsaydı — istifadəçi məbləği dəyişdirə bilərdi.
//   Server tərəfi məbləği özü hesablayır → saxtakarlıq mümkün deyil.
//
// Body: { amount, currency }
//   amount   → qəpiklərə çevrilir (559.98 → 55998)
//   currency → "azn", "usd", "eur", "try" (default: "azn")
//
// Cavab: { success: true, clientSecret }
//   clientSecret → yalnız bu bir dəfəlik ödənişi tamamlamaq üçün istifadə olunur.
// =====================================================================
router.post("/products/create-payment-intent", isAuthenticatedUser, createPaymentIntent);


export default router;