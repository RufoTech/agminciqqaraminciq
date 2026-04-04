// =====================================================================
// ANA SERVER FAYLI — app.js
// ---------------------------------------------------------------------
// Bu fayl bütün tətbiqi birləşdirir:
//   - Express serveri qurur
//   - Middleware-ləri qeyd edir
//   - Route-ları mount edir
//   - Serveri işə salır
// =====================================================================

// express — Node.js üçün veb framework.
// HTTP server, routing, middleware sistemi — hamısı buradan gəlir.
import express from "express";

// dotenv — .env / config.env faylındakı gizli məlumatları
// process.env-ə yükləyən kitabxana.
import dotenv from "dotenv";

// helmet — HTTP cavab başlıqlarını təhlükəsizlik üçün avtomatik tənzimləyir.
// XSS, clickjacking, MIME sniffing kimi hücumlara qarşı qoruyur.
import helmet from "helmet";

// express-rate-limit — IP əsaslı sorğu limiti.
// Brute force hücumları üçün auth endpoint-ləri qoruyur.
import rateLimit from "express-rate-limit";

// connectDatabase — MongoDB-yə qoşulma funksiyası (dbConnect.js-dən).
import { connectDatabase } from "./config/dbConnect.js";

// cors — Cross-Origin Resource Sharing.
// Frontend (localhost:5173) backend-ə (localhost:3010) sorğu göndərə bilsin deyə.
// Olmasa brauzer sorğuları bloklayar: "CORS policy" xətası.
import cors from "cors";

// cookie-parser — req.cookies-i oxunaqlı edir.
// Token cookie-dədir — bu middleware olmasa req.cookies.token undefined olar.
import cookieParser from "cookie-parser";

// compression — HTTP cavablarını gzip/brotli ilə sıxır → bandwidth azalır.
import compression from "compression";

// morgan — HTTP sorğu loqlaması. Development-da debug üçün vacibdir.
import morgan from "morgan";

// path, fileURLToPath — ES Module-da __dirname əl ilə yaratmaq üçün.
import path from "path";
import { fileURLToPath } from "url";

// ── ROUTE-LAR ────────────────────────────────────────────────────────
import superAdminRoutes  from "./routes/superAdminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import productsRouter    from "./routes/product.js";
import userRouter        from "./routes/auth.js";
import paymentRoutes     from "./routes/paymentRoutes.js";
import orderRoutes       from "./routes/orderRoutes.js";
import commissionRoutes  from "./routes/commissionRoutes.js";
import bloggerRoutes     from "./routes/bloggerRoutes.js";
import bonusRoutes       from "./routes/bonusRoutes.js";

// errorsMiddleware — bütün xətaları mərkəzi idarə edir.
// Bu middleware route-lardan SONRA qeyd edilməlidir.
import errorsMiddleware from "./middleware/errors.js";


// =====================================================================
// .ENV FAYLINI YÜKLƏ
// ---------------------------------------------------------------------
// dotenv.config() — config/config.env faylını oxuyur,
// içindəki dəyərləri process.env-ə yazır.
// Bu sətir bütün digər koddan ƏVVƏL olmalıdır —
// çünki aşağıdakı hər şey process.env dəyərlərinə ehtiyac duyur.
// =====================================================================
dotenv.config({ path: "config/config.env" });


// =====================================================================
// EXPRESS TƏTBİQİNİ YARAT
// =====================================================================
const app = express();


// =====================================================================
// ES MODULE-DA __DIRNAME
// ---------------------------------------------------------------------
// Static fayl xidməti (express.static) üçün tam yol lazımdır.
// =====================================================================
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);


// =====================================================================
// VERİLƏNLƏR BAZASINA QOŞUL
// ---------------------------------------------------------------------
// connectDatabase() — MongoDB-yə qoşulur (dbConnect.js-də izah edilib).
// app.listen()-dən ƏVVƏL çağırılır — server işə düşməzdən öncə
// baza bağlantısı olmalıdır.
// =====================================================================
connectDatabase();


// =====================================================================
// MİDDLEWARE-LƏR
// ---------------------------------------------------------------------
// Middleware-lər sorğu gəldikdə, route handler-dən ƏVVƏL işləyir.
// Sıra vacibdir — yuxarıdan aşağıya işlənir.
// =====================================================================

// ── MORGAN — HTTP LOQLAMA ─────────────────────────────────────────────
// development: rəngli, insan oxunaqlı format
// production:  combined format (Apache-uyğun, log kolleksiyası üçün)
if (process.env.NODE_ENV !== "PRODUCTION") {
    app.use(morgan("dev"));
} else {
    app.use(morgan("combined"));
}

// ── COMPRESSION — CAVABLARI SIXIN ────────────────────────────────────
// gzip/brotli ilə sıxma → JSON cavablar ~70% kiçilir → sürət artır
app.use(compression());

// ── HELMET — TƏHLÜKƏSİZLİK BAŞLIQLAR ────────────────────────────────
// helmet() — bir sıra HTTP başlıqları əlavə edir:
//   X-Frame-Options: DENY         → clickjacking
//   X-Content-Type-Options: nosniff → MIME sniffing
//   Strict-Transport-Security     → HTTPS məcburi
//   X-XSS-Protection              → köhnə brauzerlər üçün XSS
//
// contentSecurityPolicy: false — Cloudinary, Google Fonts kimi
//   xarici resurslara keçid olduğundan CSP deaktiv edilir.
//   Production-da öz CSP siyasətini yaz.
app.use(helmet({ contentSecurityPolicy: false }));

// ── RATE LIMITING — BRUTE FORCE QORUNMASI ────────────────────────────
// Yalnız PRODUCTION-da aktiv — development-da limit yoxdur.
// windowMs: 15 dəqiqə ərzində max 30 cəhd.
if (process.env.NODE_ENV === "PRODUCTION") {
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max:      30,
        message:  { success: false, message: "Çox sayda giriş cəhdi. 15 dəqiqə sonra yenidən cəhd edin." },
        standardHeaders: true,
        legacyHeaders:   false,
    });
    app.use("/commerce/mehsullar/superadmin/login",    authLimiter);
    app.use("/commerce/mehsullar/superadmin/register", authLimiter);
    app.use("/commerce/mehsullar/blogger/login",       authLimiter);
    app.use("/commerce/mehsullar/blogger/register",    authLimiter);
    app.use("/commerce/mehsullar/login",               authLimiter);
    app.use("/commerce/mehsullar/register",            authLimiter);
}

// ── CORS ─────────────────────────────────────────────────────────────
// FRONTEND_URL və CLIENT_URL hər ikisi qəbul edilir.
// Development-da localhost:5173 həmişə icazəlidir.
const rawOrigins = [
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000",
].filter(Boolean);

const allowedOrigins = [...new Set(
    rawOrigins.flatMap(o => o.split(",").map(s => s.trim()))
)];

app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`CORS: ${origin} icazəli deyil`));
    },
    methods:     ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));

// ── JSON PARSER ──────────────────────────────────────────────────────
// req.body-ni oxunaqlı edir. limit: 10mb — böyük JSON yüklərindən qorunma.
// Olmasa: POST/PUT sorğularında req.body = undefined.
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── COOKIE PARSER ────────────────────────────────────────────────────
// req.cookies-i oxunaqlı edir.
// Olmasa: isAuthenticatedUser-da req.cookies.token = undefined.
app.use(cookieParser());

// ── STATİK FAYL XİDMƏTİ ─────────────────────────────────────────────
// PDF çeklər (generateReceipt.js-dən yaradılan) bu qovluqda saxlanılır.
// express.static() həmin faylları HTTP vasitəsilə əlçatan edir.
//
// URL: GET /uploads/receipts/receipt_Apple_3_2026_123.pdf
// Fayl: /project/uploads/receipts/receipt_Apple_3_2026_123.pdf
//
// path.join(__dirname, "uploads") — tam mütləq yol:
//   __dirname = "/project"
//   Nəticə:   "/project/uploads"
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// =====================================================================
// ROUTE-LAR — API ENDPOINT-LƏRİ
// ---------------------------------------------------------------------
// app.use(prefix, router) — prefikslə router-i mount edir.
// Bütün route-lar "/commerce/mehsullar" prefiksi ilə başlayır.
//
// Tam URL nümunələri:
//   POST   /commerce/mehsullar/register          → qeydiyyat
//   POST   /commerce/mehsullar/login             → giriş
//   GET    /commerce/mehsullar/products          → bütün məhsullar
//   POST   /commerce/mehsullar/products/cart     → səbətə əlavə
//   POST   /commerce/mehsullar/orders/create     → sifariş yarat
//   GET    /commerce/mehsullar/notifications     → bildirişlər
//   GET    /commerce/mehsullar/commission/balance/:id → balans
//   GET    /commerce/mehsullar/superadmin/admins → bütün adminlər
// =====================================================================

// Məhsul, səbət, favori, rəy route-ları
app.use("/commerce/mehsullar", productsRouter);

// Auth route-ları: qeydiyyat, giriş, çıxış, şifrə sıfırlama, mağaza
app.use("/commerce/mehsullar", userRouter);

// Ödəniş route-ları: Stripe PaymentIntent yarat
app.use("/commerce/mehsullar", paymentRoutes);

// SuperAdmin route-ları — sistem idarəçisi əməliyyatları
app.use("/commerce/mehsullar/superadmin", superAdminRoutes);

// Sifariş route-ları: yarat, gör, status yenilə
app.use("/commerce/mehsullar", orderRoutes);

// Komisya route-ları: balans, aylıq hesabat, köçürmə, çəkim
app.use("/commerce/mehsullar/commission", commissionRoutes);

// Bildiriş route-ları: gör, oxunmuş et, sil
app.use("/commerce/mehsullar/notifications", notificationRoutes);

// Blogger route-ları: qeydiyyat, giriş, profil, satışlar, admin idarəetməsi
app.use("/commerce/mehsullar", bloggerRoutes);

// Bonus route-ları: balans, əməliyyatlar, admin konfiqurasiya
app.use("/commerce/mehsullar/bonus", bonusRoutes);


// =====================================================================
// XƏTA MİDDLEWARE-İ
// ---------------------------------------------------------------------
// Bu middleware MÜTLƏQ bütün route-lardan SONRA qeyd edilməlidir.
// Niyə?
//   Route-lardakı next(err) çağırışları bu middleware-ə düşür.
//   Express 4 parametrli middleware-i (err, req, res, next)
//   xəta middleware-i kimi tanıyır.
//   Əvvəl qeyd edilsə — route xətaları buraya çatmaz.
// =====================================================================
app.use(errorsMiddleware);


// =====================================================================
// SERVERİ İŞƏ SAL
// ---------------------------------------------------------------------
// PORT — .env-dən oxunur (PORT = 3010).
// || 3010 — .env yüklənməsə default dəyər.
//
// app.listen() — serveri göstərilən portda işə salır.
// Callback funksiyası server hazır olduqda çağırılır.
// =====================================================================
const PORT = process.env.PORT || 3010;

app.listen(PORT, () => {
    console.log(`Server ${PORT}-ci portda çalışır...`);
});