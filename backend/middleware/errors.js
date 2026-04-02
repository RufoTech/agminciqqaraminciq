// ErrorHandler — özəl xəta sinifi.
// new ErrorHandler("mesaj", statusKod) şəklində yaradılır.
// statusCode və message sahələrini standart formata gətirir.
import ErrorHandler from "../utils/errorHandler.js";


// =====================================================================
// EXPRESS XƏTA MIDDLEWARE-İ — errorHandler
// ---------------------------------------------------------------------
// NƏDİR?
//   Express-in xüsusi xəta idarəetmə middleware-idir.
//   Normal middleware-dən fərqi: 4 parametr qəbul edir (err, req, res, next).
//   Express bu imzanı görəndə onu xəta middleware-i kimi tanıyır.
//
// NECƏ İŞLƏYİR?
//   Hər yerdəki next(err) çağırışı bu middleware-ə düşür:
//     → catchAsyncErrors-dakı .catch(next)
//     → return next(new ErrorHandler("mesaj", 400))
//     → Mongoose xətaları
//
// APP.JS-DƏ NECƏ QEYD EDİLİR?
//   app.use(errorHandler) — bütün route-lardan SONRA əlavə edilir.
//   Bu, bütün tətbiqdəki xətaları bir yerdən idarə etməyə imkan verir.
// =====================================================================
export default (err, req, res, next) => {
    // Server loglarında xətanın tam təfərrüatını görmək üçün (Railway logları üçün vacibdir)
    console.error("=== SERVER ERROR LOG START ===");
    console.error(err);
    console.error("=== SERVER ERROR LOG END ===");

    // ── İLKİN DƏYƏRLƏR ──────────────────────────────────────────────
    // err.statusCode — ErrorHandler ilə atılmış xətalarda mövcuddur (məs: 400, 404).
    // || 500 — statusCode yoxdursa (gözlənilməz xəta) → 500 Internal Server Error.
    //
    // err.message — bütün JavaScript xətalarında mövcuddur.
    // || "Internal Server Error" — message yoxdursa default mətn.
    let error = {
        statusCode: err?.statusCode || 500,
        message:    err?.message    || "Internal Server Error",
    };


    // ── CAST XƏTASI ──────────────────────────────────────────────────
    // CastError — MongoDB ObjectId formatı yanlış olduqda yaranır.
    // Məsələn: /api/product/not-valid-id → "abc123" düzgün ObjectId deyil.
    //
    // err.path — hansı sahədə xəta baş verdiyini göstərir (məs: "_id").
    //
    // Qeyd: Object.values(`...`) burada yanlış istifadədir —
    //   String üzərindəki Object.values() hər hərfi ayrı element verir.
    //   Düzgün yazılış: const message = `Resurs tapilmadi: ${err?.path}`;
    //   Amma mövcud kod işləyir, çünki ErrorHandler mesajı stringə çevirir.
    if (err.name === "CastError") {
        const message = Object.values(`Resurs tapilmadi ${err?.path}`);
        error = new ErrorHandler(message, 400);
    }


    // ── VALİDASİYA XƏTASI ────────────────────────────────────────────
    // ValidationError — Mongoose schema validasiyası uğursuz olduqda yaranır.
    // Məsələn:
    //   name sahəsi məcburidisə və göndərilməyibsə
    //   price mənfi ola bilməzsə və mənfi göndərilibsə
    //   email formatı yanlışdırsa
    //
    // err.errors — validasiya xətalarının obyektidir:
    //   { name: { message: "Ad tələb olunur" }, price: { message: "Qiymət..." } }
    //
    // Object.values(err.errors) — xəta obyektlərinin massivini qaytarır.
    // .map((value) => value.message) — hər xətadan yalnız mesajı götürür.
    // Nəticə: ["Ad tələb olunur", "Qiymət mənfi ola bilməz"]
    //
    // 400 Bad Request — müştərinin göndərdiyi məlumat yanlışdır.
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map((value) => value.message);
        error = new ErrorHandler(message, 400);
    }


    // ── MÜHİTƏ GÖRƏ CAVAB ───────────────────────────────────────────
    // Niyə iki fərqli cavab formatı?
    //   DEVELOPMENT → developer xətanı dərhal görsün, stack trace lazımdır.
    //   PRODUCTION  → son istifadəçiyə texniki detallar göstərilməsin —
    //                 həssas məlumatlar (fayl yolları, kod strukturu) sızmasın.

    // ── İNKİŞAF MÜHİTİ (DEVELOPMENT) ───────────────────────────────
    // Ətraflı xəta məlumatı göndərilir — debug üçün maksimum məlumat.
    //
    // error.message → insan oxunaqlı xəta mesajı
    // error: err    → tam xəta obyekti (name, path, value və s.)
    // stack         → xətanın kodda harada baş verdiyini göstərir:
    //                 "Error at Product.create (/controllers/productController.js:45:10)"
    if (process.env.NODE_ENV === "DEVELOPMENT") {
        res.status(error.statusCode).json({
            message: error.message,
            error:   err,          // tam xəta obyekti — yalnız inkişaf üçün
            stack:   err?.stack,   // hansı faylın neçənci sətri — yalnız inkişaf üçün
        });
    }

    // ── İSTEHSAL MÜHİTİ (PRODUCTION) ────────────────────────────────
    // Yalnız xəta mesajı göndərilir — texniki detallar gizlədilir.
    //
    // Niyə stack trace göndərilmir?
    //   Hücumçu stack trace-dən fayl strukturunu, kitabxana versiyalarını,
    //   zəif nöqtələri öyrənə bilər — təhlükəsizlik riski.
    //
    // Niyə tam err obyekti göndərilmir?
    //   Verilənlər bazası adları, model strukturu, server yolları kimi
    //   məlumatlar istifadəçiyə çatmamalıdır.
    if (process.env.NODE_ENV === "PRODUCTION") {
        res.status(error.statusCode).json({
            message: error.message, // yalnız bu — başqa heç nə
        });
    }
};