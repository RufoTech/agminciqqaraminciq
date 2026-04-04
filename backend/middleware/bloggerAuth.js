// =====================================================================
// BLOGER AUTH MİDDLEWARE — middleware/bloggerAuth.js
// ---------------------------------------------------------------------
// Mövcud isAuthenticatedUser ilə eyni məntiqdə işləyir,
// lakin Blogger modelini yoxlayır.
// =====================================================================

import jwt      from "jsonwebtoken";
import catchAsyncErrors from "./catchAsyncErrors.js";
import ErrorHandler     from "../utils/errorHandler.js";
import Blogger  from "../model/Blogger.js";


// ── isBloggerAuthenticated ───────────────────────────────────────────
// Cookie-dən token oxuyur, Blogger tapır, req.blogger-ə yazır.
export const isBloggerAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return next(new ErrorHandler("Giriş edin. Token tapılmadı.", 401));
    }

    let decoded;
    try {
        // JWT_SECRET_KEY — Blogger.jwtTokeniEldeEt() ilə eyni açar
        decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch {
        return next(new ErrorHandler("Token etibarsızdır və ya müddəti bitib.", 401));
    }

    if (decoded.role !== "blogger") {
        return next(new ErrorHandler("Bu əməliyyat yalnız blogerlərə açıqdır.", 403));
    }

    const blogger = await Blogger.findById(decoded.id);
    if (!blogger) {
        return next(new ErrorHandler("Bloger tapılmadı.", 404));
    }
    if (!blogger.isActive) {
        return next(new ErrorHandler("Hesabınız deaktiv edilib.", 403));
    }

    req.blogger = blogger;
    next();
});


// ── isAdminOrBlogger ─────────────────────────────────────────────────
// Admin HƏMÇININ bloger məlumatlarını görə bilsin deyə.
// req.user (admin) VƏ ya req.blogger varsa keçir.
export const isAdminOrBlogger = catchAsyncErrors(async (req, res, next) => {
    if (req.user || req.blogger) return next();
    return next(new ErrorHandler("İcazə yoxdur.", 403));
});