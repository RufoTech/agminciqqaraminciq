// =====================================================================
// ÖZƏL XƏTA SİNİFİ — ErrorHandler
// ---------------------------------------------------------------------
// Niyə bu sinifə ehtiyac var?
//
// JavaScript-in standart Error sinifi yalnız "message" saxlayır:
//   throw new Error("Məhsul tapılmadı")
//   → err.message = "Məhsul tapılmadı"
//   → err.statusCode = undefined ← HTTP kodu yoxdur!
//
// ErrorHandler ilə:
//   throw new ErrorHandler("Məhsul tapılmadı", 404)
//   → err.message    = "Məhsul tapılmadı"
//   → err.statusCode = 404  ← HTTP kodu var!
//
// errorMiddleware-də:
//   res.status(error.statusCode).json({ message: error.message })
//   ← statusCode-u birbaşa istifadə edir
//
// İstifadə nümunələri (controller-lərdə):
//   return next(new ErrorHandler("Məhsul tapılmadı", 404))
//   return next(new ErrorHandler("Şifrə yanlışdır", 401))
//   return next(new ErrorHandler("Giriş icazəniz yoxdur", 403))
//   throw new ErrorHandler("Yanlış məhsul ID-si", 400)
// =====================================================================
class ErrorHandler extends Error {

    // =====================================================================
    // KONSTRUKTOR — new ErrorHandler("mesaj", statusKod)
    // ---------------------------------------------------------------------
    // Parametrlər:
    //   message    → istifadəçiyə göstəriləcək xəta mesajı (string)
    //   statusCode → HTTP status kodu (number):
    //                  400 → Bad Request (yanlış sorğu)
    //                  401 → Unauthorized (giriş lazımdır)
    //                  403 → Forbidden (icazə yoxdur)
    //                  404 → Not Found (tapılmadı)
    //                  500 → Internal Server Error (server xətası)
    // =====================================================================
    constructor(message, statusCode) {

        // ── super(message) ───────────────────────────────────────────────
        // extends Error — valideyn sinifdir.
        // super() — valideyn sinifin konstruktorunu çağırır.
        // super(message) → Error-in message sahəsini doldurur:
        //   this.message = message
        //
        // Niyə super() məcburidir?
        //   extends istifadə edildikdə, konstruktorda super() çağırılmazsa
        //   JavaScript xəta atar: "Must call super constructor in derived class"
        super(message);

        // ── statusCode ───────────────────────────────────────────────────
        // Error sinifinin öz statusCode sahəsi yoxdur.
        // Bu sətir yeni sahə əlavə edir:
        //   const err = new ErrorHandler("Tapılmadı", 404)
        //   err.statusCode → 404
        //   err.message    → "Tapılmadı" (super() ilə doldurulub)
        this.statusCode = statusCode;

        // ── Error.captureStackTrace() ────────────────────────────────────
        // Stack trace — xətanın kodda harada baş verdiyini göstərir.
        // Məsələn:
        //   Error: Məhsul tapılmadı
        //     at getProductDetails (productController.js:12:20)
        //     at Layer.handle (express/lib/router/layer.js:95:5)
        //
        // captureStackTrace(this, this.constructor) — iki parametr:
        //   this             → stack trace bu obyektə yazılır
        //   this.constructor → ErrorHandler sinifinin özü stack trace-dən
        //                      xaric edilir (lazımsız texniki detal)
        //
        // Niyə ErrorHandler-i xaric edirik?
        //   Olmasa stack trace belə görünər:
        //     at new ErrorHandler (errorHandler.js:1)   ← lazımsız
        //     at getProductDetails (productController.js:12)
        //   Olarsa:
        //     at getProductDetails (productController.js:12) ← daha faydalı
        //
        // Qeyd: Bu V8 (Node.js/Chrome) mühərrikinə məxsus metoddur.
        //   Digər JavaScript mühərriklərində mövcud olmaya bilər,
        //   amma Node.js üçün həmişə işləyir.
        Error.captureStackTrace(this, this.constructor);
    }
}


// =====================================================================
// EXPORT
// ---------------------------------------------------------------------
// Default export — import edən faylda istənilən adla istifadə oluna bilər:
//   import ErrorHandler from "../utils/errorHandler.js";
//   import MyError from "../utils/errorHandler.js"; // bu da işləyir
// =====================================================================
export default ErrorHandler;