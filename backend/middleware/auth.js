// catchAsyncErrors — async funksiyalardakı xətaları avtomatik tutur,
// hər middleware-ə try/catch yazmaqdan xilas edir.
import catchAsyncErrors from "./catchAsyncErrors.js";

// ErrorHandler — özəl xəta sinifi.
// new ErrorHandler("mesaj", statusKod) şəklində istifadə olunur.
import ErrorHandler from "../utils/errorHandler.js";

// jwt (jsonwebtoken) — JSON Web Token kitabxanası.
// jwt.verify() — token-in doğruluğunu yoxlayır və içindəki məlumatları çıxarır.
import jwt from "jsonwebtoken";

// User — adi istifadəçi modeli ("users" kolleksiyası).
import User from "../model/User.js";

// Admin — satıcı/admin modeli ("admins" kolleksiyası).
// Token yaradılarkən hansı kolleksiyadan olduğu "model" sahəsi ilə işarələnir.
import Admin from "../model/Admin.js";


// =====================================================================
// İSTİFADƏÇİ DOĞRULAMASI — isAuthenticatedUser
// ---------------------------------------------------------------------
// Bu middleware hər qorunan route-un ƏVVƏLINDƏN çağırılır.
// Məsələn: router.get("/profile", isAuthenticatedUser, getMyProfile)
//
// Nə edir:
//   1. Cookie-dən və ya Authorization header-dən token oxuyur
//   2. Token-i yoxlayır və içindəki məlumatları (id, model) çıxarır
//   3. Hansı kolleksiyada (Admin/User) olduğuna görə istifadəçini tapır
//   4. req.user-ə yazır — sonrakı middleware/controller bunu istifadə edir
//
// Niyə iki mənbədən token oxunur?
//   Cookie → brauzerdə işləyən frontend üçün (veb tətbiq)
//   Authorization header → Postman, mobil tətbiq, API client-lər üçün
//   İkisi birlikdə olduqunda cookie üstünlük qazanır (?. short-circuit).
// =====================================================================
export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {

    // ── TOKEN OXU ────────────────────────────────────────────────────
    // req?.cookies?.token           → "Bearer ..." olmadan birbaşa token
    // req?.headers?.authorization   → "Bearer eyJhbG..." formatında gəlir
    //   .split(" ")[1]              → "Bearer" sözünü kəsib yalnız tokeni götürür
    //
    // Niyə optional chaining (?.) istifadə olunur?
    //   cookies, headers və ya authorization mövcud olmaya bilər —
    //   birbaşa daxil olmaq TypeError atar. ?. null/undefined halında
    //   xəta vermək əvəzinə undefined qaytarır.
    const token = req?.cookies?.token || req?.headers?.authorization?.split(" ")[1];

    try {
        // ── TOKEN YOXLAMASI ──────────────────────────────────────────
        // jwt.verify() üç işi bir anda görür:
        //   1. Token-in imzasını yoxlayır (JWT_SECRET_KEY ilə)
        //   2. Token-in müddətinin keçib-keçmədiyini yoxlayır
        //   3. Token-in içindəki məlumatları (payload) deşifrə edib qaytarır
        //
        // decoded obyektinin içi: { id: "507f1f...", model: "Admin", iat: ..., exp: ... }
        //   id    → istifadəçinin MongoDB _id-si
        //   model → hansı kolleksiyada olduğu (sendToken-da doldurulub)
        //   iat   → token-in yaradılma tarixi (issued at)
        //   exp   → token-in bitmə tarixi (expiry)
        //
        // Token etibarsız olarsa — catch bloğuna düşür.
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Debug logu — inkişaf mərhələsində token məlumatlarını yoxlamaq üçün.
        // İstehsal mühitinə keçiddən əvvəl bu loqu silmək tövsiyə olunur.
        console.log(decoded);

        // ── KOLLEKSİYA SEÇIMI ───────────────────────────────────────
        // decoded.model — token yaradılarkən yazılan "Admin" və ya "User" dəyəridir.
        // Bu sayəsində iki fərqli kolleksiyada saxlanılan istifadəçilər
        // eyni middleware ilə doğrulana bilir.
        //
        // Niyə iki ayrı kolleksiya?
        //   Admin — mağaza məlumatları (sellerInfo) kimi əlavə sahələrə malikdir.
        //   User  — adi alıcı istifadəçilərdir.
        //   Hər ikisi eyni giriş formasından istifadə edir.
        if (decoded.model === "Admin") {
            req.user = await Admin.findById(decoded.id);
        } else {
            req.user = await User.findById(decoded.id);
        }

        // ── NULL YOXLAMASI ───────────────────────────────────────────
        // findById() istifadəçini tapa bilmədikdə null qaytarır.
        // null yoxlanmasa — authorizeRoles-da req.user.role oxuyanda
        // "Cannot read properties of null" xətası yaranır və server 500 qaytarır.
        // Bu yoxlama ilə düzgün 401 xətası göndərilir.
        if (!req.user) {
            return next(new ErrorHandler("İstifadəçi tapılmadı, yenidən giriş edin", 401));
        }

        // req.user artıq dolduruldu — növbəti middleware/controller-ə keç.
        // Bundan sonra req.user.id, req.user.role, req.user.sellerInfo
        // kimi sahələrə controller-lərdən daxil olmaq mümkündür.
        next();

    } catch (err) {
        // ── XƏTA HALLAŞI ────────────────────────────────────────────
        // Bu catch aşağıdakı hallar üçün işləyir:
        //   1. Token göndərilməyib (token = undefined)
        //   2. Token-in imzası yanlışdır (başqası dəyişdirib)
        //   3. Token-in müddəti keçib (exp < cari vaxt)
        //   4. Token formatı pozulub (truncated, corrupted)
        //
        // 401 Unauthorized — istifadəçi kimliğini sübut edə bilmədi.
        return next(new ErrorHandler("Girish etmelisen", 401));
    }
});


// =====================================================================
// ROL ÜZRƏ İCAZƏ — authorizeRoles
// ---------------------------------------------------------------------
// Bu middleware isAuthenticatedUser-dən SONRA çağırılır.
// İstifadəçinin rolunun bu route üçün uyğun olub olmadığını yoxlayır.
//
// İstifadəsi:
//   router.delete("/admin/product/:id",
//     isAuthenticatedUser,
//     authorizeRoles("admin", "superadmin"),
//     deleteProduct
//   )
//
// ...roles — "rest parameters": istənilən sayda rol qəbul edir.
//   authorizeRoles("admin")              → yalnız admin
//   authorizeRoles("admin", "superadmin")→ admin VƏ ya superadmin
// =====================================================================
export const authorizeRoles = (...roles) => {

    // Higher-order function — funksiya qaytarır.
    // Bu sayəsində roles parametri "closure" ilə yadda saxlanılır
    // və middleware çağırılanda istifadə olunur.
    return (req, res, next) => {

        // ── NULL YOXLAMASI ───────────────────────────────────────────
        // isAuthenticatedUser-dən sonra gəlsə də, əlavə təhlükəsizlik üçün
        // req.user-in mövcudluğunu burada da yoxlayırıq.
        // Middleware zəncirində gözlənilməz sıra dəyişikliyi olsa belə
        // "Cannot read properties of null" xətasından qorunur.
        if (!req.user) {
            return next(new ErrorHandler("Giriş tələb olunur", 401));
        }

        // req.user.role — isAuthenticatedUser tərəfindən doldurulmuşdur.
        // .includes() — istifadəçinin rolu icazə verilən rollar arasındadırmı yoxlayır.
        if (!roles.includes(req.user.role)) {

            // 403 Forbidden — istifadəçi kimliğini sübut etdi (401 deyil),
            // amma bu resursa girişi qadağandır (403).
            //
            // Xəta mesajında istifadəçinin rolu göstərilir —
            // debug etmək üçün faydalıdır.
            return next(new ErrorHandler(
                `Senin rolun ${req.user.role} ve senin bu resurslara girish icazen yoxdur!`,
                403
            ));
        }

        // Rol uyğundur — növbəti middleware/controller-ə keç
        next();
    };
};


// =====================================================================
// TƏSDİQLƏNMİŞ SATICIYOXLAMASI — isApprovedSeller
// ---------------------------------------------------------------------
// Bu middleware admin route-larında rol yoxlamasından SONRA çağırılır.
//
// Niyə ayrıca middleware lazımdır?
//   authorizeRoles("admin") — yalnız role="admin" yoxlayır.
//   Amma sellerStatus="pending" olan admin da role="admin"-dir —
//   o, hələ təsdiqlənməyib, mağazasına daxil olmamalıdır.
//
//   isApprovedSeller — həm role="admin", həm sellerStatus="approved"
//   şərtini birlikdə yoxlayır.
//
// İstifadə ssenarisı:
//   Satıcı qeydiyyat edib, superadmin hələ təsdiq etməyib (pending) →
//   isApprovedSeller ilə bloklanır, məhsul əlavə edə bilmir.
// =====================================================================
export const isApprovedSeller = catchAsyncErrors(async (req, res, next) => {

    // ── NULL YOXLAMASI ───────────────────────────────────────────────
    if (!req.user) {
        return next(new ErrorHandler("Giriş tələb olunur", 401));
    }

    // İKİ ŞƏRT BİRLİKDƏ yoxlanılır:
    //   req.user.role !== "admin"           → admin deyilsə qadağan
    //   req.user.sellerStatus !== "approved" → təsdiqlənməyibsə qadağan
    //
    // || (OR) operatoru: hər hansı biri yanlışdırsa — giriş rədd edilir.
    //   role="user"  + sellerStatus="approved" → rədd (user admin deyil)
    //   role="admin" + sellerStatus="pending"  → rədd (admin təsdiqlənməyib)
    //   role="admin" + sellerStatus="approved" → icazə verilir ✓
    if (req.user.role !== "admin" || req.user.sellerStatus !== "approved") {
        return next(
            new ErrorHandler("Bu səhifəyə yalnız satıcılar daxil ola bilər.", 403)
        );
    }

    // Hər iki şərt ödəndi — növbəti middleware/controller-ə keç
    next();
});