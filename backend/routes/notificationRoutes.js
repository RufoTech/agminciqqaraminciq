// express — Node.js üçün veb framework.
import express from "express";

// notificationController-dən bütün lazımlı funksiyaları import edirik.
import {
    getMyNotifications,      // Bildirişləri səhifələmə ilə gətirir
    markAsRead,              // Tək bildirişi oxunmuş edir
    markAllAsRead,           // Bütün bildirişləri oxunmuş edir
    deleteNotification,      // Tək bildirişi silir
    deleteAllNotifications,  // Bütün bildirişləri silir
    getUnreadCount,          // Yalnız oxunmamış sayı qaytarır (navbar badge)
} from "../controller/notificationController.js";

// isAuthenticatedUser — JWT token yoxlayır, req.user-ə yazır.
import { isAuthenticatedUser } from "../middleware/authMiddleware.js";


// =====================================================================
// ROUTER YARATMA
// ---------------------------------------------------------------------
// app.js-də: app.use("/notifications", notificationRouter)
// → Bütün route-lar "/notifications/..." ilə başlayır.
// =====================================================================
const router = express.Router();


// =====================================================================
// QLOBAL MİDDLEWARE — router.use()
// ---------------------------------------------------------------------
// router.use(isAuthenticatedUser) — bu router-dəki BÜTÜN route-lara
// isAuthenticatedUser middleware-ini bir dəfəyə tətbiq edir.
//
// Hər route-da ayrıca yazmaq əvəzinə:
//   router.get("/", isAuthenticatedUser, getMyNotifications)    ← köhnə üsul
//   router.get("/unread-count", isAuthenticatedUser, getUnreadCount)
//
// Bir dəfə router.use() ilə yazmaq:
//   router.use(isAuthenticatedUser)  ← bütün route-lara tətbiq olunur
//   router.get("/", getMyNotifications)
//   router.get("/unread-count", getUnreadCount)
//
// Niyə bildirişlər üçün token məcburidir?
//   Bildirişlər şəxsidir — hər istifadəçi yalnız öz bildirişlərini görə bilər.
//   Anonim giriş mümkün deyil.
// =====================================================================
router.use(isAuthenticatedUser);


// =====================================================================
// BİLDİRİŞ ROUTE-LARI
// =====================================================================

// GET /notifications
// İstifadəçinin bildirişlərini qaytarır.
// Query parametrləri:
//   ?page=1      → neçənci səhifə (default: 1)
//   ?limit=20    → hər səhifədə neçə bildiriş (default: 20)
//   ?unreadOnly=true → yalnız oxunmamışları göstər
router.get("/", getMyNotifications);

// GET /notifications/unread-count
// Yalnız oxunmamış bildiriş sayını qaytarır.
// Navbar-dakı bildiriş nişanı (🔔 3) üçün ayrıca sürətli endpoint.
//
// ⚠️ ROUTE SIRASI VACİBDİR:
//   Bu route "/:id"-dən ƏVVƏL yazılmalıdır.
//   Əgər "/:id" əvvəl olsaydı — "unread-count" id kimi qəbul edilərdi:
//   req.params.id = "unread-count" → MongoDB-də yanlış axtarış.
//   Express route-ları yuxarıdan aşağıya oxuyur — əvvəl uyğun gələni seçir.
router.get("/unread-count", getUnreadCount);

// PUT /notifications/:id/read
// Tək bildirişi oxunmuş edir.
// Params: :id → bildirişin MongoDB _id-si
// İstifadəçi yalnız öz bildirişini oxunmuş edə bilər (controller-da yoxlanılır).
router.put("/:id/read", markAsRead);

// PUT /notifications/read-all
// Bütün oxunmamış bildirişləri bir əməliyyatla oxunmuş edir.
// "Hamısını oxunmuş et" düyməsi üçün.
router.put("/read-all", markAllAsRead);

// DELETE /notifications/:id
// Tək bildirişi silir.
// İstifadəçi yalnız öz bildirişini silə bilər (controller-da yoxlanılır).
router.delete("/:id", deleteNotification);

// DELETE /notifications
// Bütün bildirişləri bir əməliyyatla silir.
// "Hamısını sil / Səhifəni təmizlə" düyməsi üçün.
router.delete("/", deleteAllNotifications);


export default router;