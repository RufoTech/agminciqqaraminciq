// catchAsyncErrors — async funksiyalardakı xətaları avtomatik tutur.
import catchAsyncErrors from "./catchAsyncErrors.js";

// ErrorHandler — özəl xəta sinifi.
import ErrorHandler from "../utils/errorHandler.js";

// jwt — JSON Web Token yoxlama kitabxanası.
import jwt from "jsonwebtoken";

// Üç fərqli istifadəçi modeli — token-dəki "model" sahəsinə görə
// hansında axtarış ediləcəyi seçilir.
import SuperAdmin from "../model/SuperAdmin.js";
import Admin     from "../model/Admin.js";
import User      from "../model/User.js";


// =====================================================================
// GENİŞLƏNDİRİLMİŞ İSTİFADƏÇİ DOĞRULAMASI — isAuthenticatedUser
// ---------------------------------------------------------------------
// authMiddleware.js-dəki isAuthenticatedUser-dən fərqi:
//   Orada: 2 kolleksiya (Admin, User)
//   Burada: 3 kolleksiya (SuperAdmin, Admin, User)
//
// Bu versiya SuperAdmin route-larını da qoruya bilir.
// SuperAdmin panelinin bütün qorunan route-larında bu middleware istifadə olunur.
//
// DƏYİŞİKLİK: authMiddleware.js ilə eyni düzəlişlər tətbiq edildi:
//   - Token yoxluğu ayrıca yoxlanır (aydın mesaj)
//   - Authorization header "Bearer " olmadan da düzgün işlənir
//   - TokenExpiredError və JsonWebTokenError ayrıca tutulur
// =====================================================================
export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {

    // Cookie → veb tətbiq üçün
    // Authorization header → Postman / mobil tətbiq / API client üçün
    // Format: "Bearer eyJhbGci..." → split(" ")[1] → yalnız token hissəsi
    let token = null;

    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        } else {
            token = authHeader;
        }
    }

    // Token yoxdursa — aydın mesajla 401 qaytar
    if (!token) {
        return next(new ErrorHandler("Giriş tələb olunur. Zəhmət olmasa daxil olun.", 401));
    }

    try {
        // jwt.verify():
        //   1. İmzanı yoxlayır — token dəyişdirilub-dəyişdirilmədiyini
        //   2. Müddəti yoxlayır — token-in vaxtı keçibmi
        //   3. Payload-ı deşifrə edib qaytarır
        //
        // decoded = { id: "507f1f...", model: "SuperAdmin" | "Admin" | "User", iat, exp }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log(decoded); // İstehsal mühitinə keçdikdə bu logu silmək tövsiyə olunur

        // ── ÜÇ MƏRHƏLƏLİ KOLLEKSİYA SEÇİMİ ───────────────────────
        // Token yaradılarkən "model" sahəsi doldurulub (sendToken-da).
        // Bu sahəyə görə doğru kolleksiyada axtarış aparılır:
        //   "SuperAdmin" → superadmins kolleksiyası
        //   "Admin"      → admins kolleksiyası
        //   digər        → users kolleksiyası (default)
        if (decoded.model === "SuperAdmin") {
            req.user = await SuperAdmin.findById(decoded.id);
        } else if (decoded.model === "Admin") {
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
            return next(new ErrorHandler("Bu token-ə aid istifadəçi tapılmadı. Yenidən daxil olun.", 401));
        }

        // req.user dolduruldu — növbəti middleware/controller-ə keç
        next();

    } catch (err) {
        // DƏYİŞİKLİK: Xəta növünə görə aydın mesajlar verilir.
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
// İstifadəçinin rolunu yoxlayır — authMiddleware.js ilə eynidir.
// SuperAdmin panelinin route-larında da istifadə üçün buraya kopyalanıb.
//
// ...roles — rest parameters: istənilən sayda rol qəbul edir.
//   authorizeRoles("superadmin")               → yalnız superadmin
//   authorizeRoles("admin", "superadmin")       → hər ikisi
// =====================================================================
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {

        // ── NULL YOXLAMASI ───────────────────────────────────────────
        // isAuthenticatedUser-dən sonra gəlsə də, əlavə təhlükəsizlik üçün
        // req.user-in mövcudluğunu burada da yoxlayırıq.
        // Middleware zəncirində gözlənilməz sıra dəyişikliyi olsa belə
        // "Cannot read properties of null" xətasından qorunur.
        if (!req.user) {
            return next(new ErrorHandler("Giriş tələb olunur", 401));
        }

        // req.user.role — isAuthenticatedUser tərəfindən doldurulub.
        // includes() — rolun icazə verilənlər siyahısında olub olmadığını yoxlayır.
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(
                    `Senin rolun ${req.user.role} ve senin bu resurslara girish icazen yoxdur!`,
                    403
                )
            );
        }
        next();
    };
};


// =====================================================================
// YALNIZ SUPERADMIN ÜÇÜN — isSuperAdmin
// ---------------------------------------------------------------------
// authorizeRoles("superadmin") ilə eyni nəticəni verir,
// lakin daha oxunaqlı (semantic) middleware adıdır.
//
// İstifadəsi:
//   router.delete("/admin/:id", isAuthenticatedUser, isSuperAdmin, deleteAdmin)
//
// Niyə authorizeRoles("superadmin") əvəzinə ayrıca middleware?
//   Kod oxunaqlığı: isSuperAdmin daha aydın niyyəti ifadə edir.
//   Gələcəkdə əlavə yoxlamalar (məsələn: 2FA) buraya əlavə edilə bilər.
// =====================================================================
export const isSuperAdmin = catchAsyncErrors(async (req, res, next) => {

    // ── NULL YOXLAMASI ───────────────────────────────────────────────
    if (!req.user) {
        return next(new ErrorHandler("Giriş tələb olunur", 401));
    }

    if (req.user.role !== "superadmin") {
        return next(
            new ErrorHandler("Bu əməliyyat yalnız superadmin üçündür", 403)
        );
    }
    next();
});


// =====================================================================
// TƏSDİQLƏNMİŞ SATICI YOXLAMASI — isApprovedSeller
// ---------------------------------------------------------------------
// authMiddleware.js ilə eynidir — SuperAdmin route fayllarında da
// satıcı endpointlərini qorumaq üçün buraya kopyalanıb.
//
// Həm role="admin", həm sellerStatus="approved" şərtini yoxlayır.
// Biri belə ödənməsə — 403 qaytarılır.
// =====================================================================
export const isApprovedSeller = catchAsyncErrors(async (req, res, next) => {

    // ── NULL YOXLAMASI ───────────────────────────────────────────────
    if (!req.user) {
        return next(new ErrorHandler("Giriş tələb olunur", 401));
    }

    if (req.user.role !== "admin" || req.user.sellerStatus !== "approved") {
        return next(
            new ErrorHandler("Bu səhifəyə yalnız satıcılar daxil ola bilər.", 403)
        );
    }
    next();
});


// =====================================================================
// TOKEN YARAT VƏ CAVAB GÖNDƏR — sendToken (default export)
// ---------------------------------------------------------------------
// Giriş (login) və qeydiyyat (register) uğurlu olduqda çağırılır.
// JWT token yaradır, cookie-yə yazır və JSON cavab göndərir.
//
// Parametrlər:
//   user       → istifadəçi obyekti (SuperAdmin, Admin və ya User)
//   statusCode → HTTP status kodu (201: yaradıldı, 200: uğurlu)
//   res        → Express cavab obyekti
//
// DƏYİŞİKLİK: sameSite və secure əlavə edildi.
//   Əvvəl bu sahələr yox idi → cross-origin sorğularda cookie
//   göndərilmirdi → login sonrası 401 xətası verirdi.
//
//   sameSite: PRODUCTION-da "none" → frontend/backend ayrı domendədirsə
//             DEVELOPMENT-da "lax" → localhost-da işləyir
//   secure:   PRODUCTION-da true   → yalnız HTTPS
//             DEVELOPMENT-da false → HTTP-də də işləyir
// =====================================================================
export default (user, statusCode, res) => {

    // jwtTokeniEldeEt() — User/Admin/SuperAdmin modelindəki metoddur.
    // İçəridə:
    //   jwt.sign({ id: user._id, model: "Admin" }, JWT_SECRET_KEY, { expiresIn: "7d" })
    //   "model" sahəsi — bu token-dən istifadəçini hansı kolleksiyada
    //   axtaracağımızı bilmək üçün token-ə yazılır.
    const token = user.jwtTokeniEldeEt();

    // ── COOKIE SEÇIMLƏRI ─────────────────────────────────────────────
    // expires — cookie-nin bitmə tarixi:
    //   COOKIE_EXPIRES_TIME = 7 (gün) →
    //   Date.now() + 7 * 24 * 60 * 60 * 1000 → 7 gün sonrakı millisaniyə
    //   Brauzer bu tarixdən sonra cookie-ni avtomatik silir.
    //
    // httpOnly: true — XSS (Cross-Site Scripting) qoruması:
    //   JavaScript-dən document.cookie ilə token oxuna bilmir.
    //   Yalnız HTTP sorğularında avtomatik göndərilir.
    //   Zərərli skriptlər token-i oğurlaya bilmir.
    const isProduction = process.env.NODE_ENV === "PRODUCTION";

    const options = {
        expires:  new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure:   isProduction,
    };

    // ── CAVAB GÖNDƏR ─────────────────────────────────────────────────
    // .cookie("token", token, options) — token-i cookie-yə yazır.
    // .json({...}) — JSON cavabı göndərir.
    //
    // Niyə token həm cookie-də, həm də response-da göndərilir?
    //   cookie  → veb tətbiq üçün (brauzer avtomatik saxlayır)
    //   token   → Postman / mobil tətbiq üçün (manual saxlanılır)
    //
    // Cavabda niyə yalnız bu 4 sahə göndərilir?
    //   Şifrə, resetToken, sellerInfo kimi həssas məlumatlar
    //   response-a daxil edilmir — minimum məlumat açıqlama prinsipi.
    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        token,   // Postman üçün response body-də də mövcuddur
        user: {
            id:    user._id,
            name:  user.name,
            email: user.email,
            role:  user.role,
        },
    });
};