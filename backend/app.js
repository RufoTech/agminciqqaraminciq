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

// connectDatabase — MongoDB-yə qoşulma funksiyası (dbConnect.js-dən).
import { connectDatabase } from "./config/dbConnect.js";

// cors — Cross-Origin Resource Sharing.
// Frontend (localhost:5173) backend-ə (localhost:3010) sorğu göndərə bilsin deyə.
// Olmasa brauzer sorğuları bloklayar: "CORS policy" xətası.
import cors from "cors";

// cookie-parser — req.cookies-i oxunaqlı edir.
// Token cookie-dədir — bu middleware olmasa req.cookies.token undefined olar.
import cookieParser from "cookie-parser";

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

// ── CORS ─────────────────────────────────────────────────────────────
// origin: "http://localhost:5173" — yalnız bu frontend-dən gələn
//   sorğulara icazə verilir. Başqa domain-lərdən gələn sorğular bloklanır.
//
// methods — icazə verilən HTTP metodları.
//
// credentials: true — cookie-lərin cross-origin sorğularda göndərilməsinə
//   icazə verir. Bu olmasa token cookie-si frontend-ə çatmaz.
//   Frontend-də də: axios.defaults.withCredentials = true olmalıdır.
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL
].filter(Boolean); // filter out undefined/null if any

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods:     ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

// ── JSON PARSER ──────────────────────────────────────────────────────
// req.body-ni oxunaqlı edir.
// Olmasa: POST/PUT sorğularında req.body = undefined.
// Məsələn: { "email": "user@test.com" } → req.body.email = "user@test.com"
app.use(express.json());

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