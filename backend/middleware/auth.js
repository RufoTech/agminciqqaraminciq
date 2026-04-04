// catchAsyncErrors — async funksiyalardakı xətaları avtomatik tutur,
// hər middleware-ə try/catch yazmaqdan xilas edir.
import catchAsyncErrors from "./catchAsyncErrors.js";

// ErrorHandler — özəl xəta sinifi.
// new ErrorHandler("mesaj", statusKod) şəklində istifadə olunur.
import ErrorHandler from "../utils/errorHandler.js";

// jwt (jsonwebtoken) — JSON Web Token kitabxanası.
// jwt.verify() — token-in doğruluğunu yoxlayır və içindəki məlumatları çıxarır.
import jwt from "jsonwebtoken";

// User — adi istifadəçi modeli ("users" kolleksiyası)
import User from "../model/User.js";

// Admin — satıcı/admin modeli ("admins" kolleksiyası).
// Token yaradılarkən hansı kolleksiyadan olduğu "model" sahəsi ilə işarələnir.
import Admin from "../model/Admin.js";

// SuperAdmin — sistem idarəçisi modeli ("superadmins" kolleksiyası).
import SuperAdmin from "../model/SuperAdmin.js";

// Blogger — bloger/referral sistemi istifadəçisi modeli ("bloggers" kolleksiyası).
import Blogger from "../model/Blogger.js";


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
//
// DƏYİŞİKLİK: Token yoxluğu ayrıca yoxlanır — əvvəl token yox idi,
//   jwt.verify() xəta atırdı, catch "Girish etmelisen" deyirdi.
//   İndi token yoxdursa daha aydın mesaj verilir.
//   Həmçinin Authorization header "Bearer " olmadan gəlsə də düzgün işlənir.
//   TokenExpiredError və JsonWebTokenError ayrıca tutulur.
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
    let token = null;

    if (req.cookies && req.cookies.token) {
        // Cookie-dən oxu (brauzer / frontend üçün)
        token = req.cookies.token;
    } else if (req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
            // "Bearer TOKEN" formatı — "Bearer " hissəsini kəs
            token = authHeader.split(" ")[1];
        } else {
            // Bəzən "Bearer " olmadan birbaşa token göndərilir
            token = authHeader;
        }
    }

    // DƏYİŞİKLİK: Token yoxdursa aydın mesajla 401 qaytar.
    // Əvvəl bu yoxlama yox idi — token undefined olaraq jwt.verify()-ə
    // gedirdi, xəta catch blokunda ümumi mesajla örtülürdü.
    if (!token) {
        return next(new ErrorHandler("Giriş tələb olunur. Zəhmət olmasa daxil olun.", 401));
    }

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
        let user = null;
        if (decoded.model === "SuperAdmin") {
            user = await SuperAdmin.findById(decoded.id);
        } else if (decoded.model === "Admin") {
            user = await Admin.findById(decoded.id);
        } else if (decoded.model === "Blogger") {
            user = await Blogger.findById(decoded.id);
        } else {
            user = await User.findById(decoded.id);
        }

        // ── FALLBACK YOXLAMASI ─────────────────────────────────────────
        // Əgər göstərilən modeldə tapılmadısa, digərlərində yoxla (resilience).
        // Bu, istifadəçi bir sistemdən digərinə keçdikdə köhnə tokenin işləməsini təmin edir.
        if (!user) {
            user = await User.findById(decoded.id) || 
                   await Admin.findById(decoded.id) || 
                   await Blogger.findById(decoded.id) || 
                   await SuperAdmin.findById(decoded.id);
        }

        if (!user) {
            console.error(`Auth Error: User with ID ${decoded.id} and model ${decoded.model} not found.`);
            return next(new ErrorHandler("Bu token-ə aid istifadəçi tapılmadı. Yenidən daxil olun.", 401));
        }

        req.user = user;

        // ── NULL YOXLAMASI ───────────────────────────────────────────
        // findById() istifadəçini tapa bilmədikdə null qaytarır.
        // null yoxlanmasa — authorizeRoles-da req.user.role oxuyanda
        // "Cannot read properties of null" xətası yaranır və server 500 qaytarır.
        // Bu yoxlama ilə düzgün 401 xətası göndərilir.
        if (!req.user) {
            return next(new ErrorHandler("Bu token-ə aid istifadəçi tapılmadı. Yenidən daxil olun.", 401));
        }

        // req.user artıq dolduruldu — növbəti middleware/controller-ə keç.
        // Bundan sonra req.user.id, req.user.role, req.user.sellerInfo
        // kimi sahələrə controller-lərdən daxil olmaq mümkündür.
        next();

    } catch (err) {
        // ── XƏTA HALLAŞI ────────────────────────────────────────────
        // DƏYİŞİKLİK: Əvvəl bütün xətalar eyni mesajla örtülürdü.
        // İndi xəta növünə görə aydın mesajlar verilir:
        //
        //   TokenExpiredError → token-in müddəti bitib (exp < cari vaxt)
        //   JsonWebTokenError → token-in imzası yanlışdır və ya formatı pozulub
        //   digər             → gözlənilməyən xəta
        //
        // 401 Unauthorized — istifadəçi kimliğini sübut edə bilmədi.
        if (err.name === "TokenExpiredError") {
            return next(new ErrorHandler("Sessiyanızın müddəti bitib. Zəhmət olmasa yenidən daxil olun.", 401));
        }
        if (err.name === "JsonWebTokenError") {
            return next(new ErrorHandler("Token etibarsızdır. Zəhmət olmasa yenidən daxil olun.", 401));
        }
        return next(new ErrorHandler("Giriş tələb olunur.", 401));
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

// =====================================================================
// YALNIZ SUPERADMIN ÜÇÜN — isSuperAdmin
// ---------------------------------------------------------------------
export const isSuperAdmin = catchAsyncErrors(async (req, res, next) => {
    if (!req.user) {
        return next(new ErrorHandler("Giriş tələb olunur", 401));
    }
    if (req.user.role !== "superadmin") {
        return next(new ErrorHandler("Bu əməliyyat yalnız superadmin üçündür", 403));
    }
    next();
});

// =====================================================================
// YALNIZ BLOGER ÜÇÜN — isBlogger
// ---------------------------------------------------------------------
export const isBlogger = catchAsyncErrors(async (req, res, next) => {
    if (!req.user) {
        return next(new ErrorHandler("Giriş tələb olunur", 401));
    }
    if (req.user.role !== "blogger") {
        return next(new ErrorHandler("Bu əməliyyat yalnız blogerlər üçündür", 403));
    }
    next();
});