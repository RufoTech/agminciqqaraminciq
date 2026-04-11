// ============================================================
// catchAsyncErrors — async funksiyalardakı xətaları avtomatik
// tutur və next(err) ilə xəta middleware-inə ötürür.
// Hər controller-i try/catch ilə əhatə etməmək üçün istifadə olunur.
// ============================================================
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";

// User — adi alıcı istifadəçilər üçün MongoDB modeli ("users" kolleksiyası)
import User from "../model/User.js";

// Admin — satıcı/admin istifadəçilər üçün ayrı MongoDB modeli ("admins" kolleksiyası)
import Admin from "../model/Admin.js";

// SuperAdmin — sistem idarəçisi modeli
import SuperAdmin from "../model/SuperAdmin.js";

// Blogger — bloger/referral sistemi istifadəçisi modeli
import Blogger from "../model/Blogger.js";

// ErrorHandler — özəl xəta sinifi. new ErrorHandler("mesaj", statusKod)
// şəklində istifadə olunur və xəta middleware-inə ötürülür.
import ErrorHandler from "../utils/errorHandler.js";

// sendToken — JWT token yaradır və cookie-yə yazır.
// Qeydiyyat və giriş uğurlu olduqda istifadəçiyə token verilir.
// İndi admin register üçün də sendToken istifadə olunur —
// cookie yazılır, sellerInfo cavaba daxil edilir.
import sendToken from "../utils/sendToken.js";

// getResetPasswordTemplate — şifrə sıfırlama emailinin HTML şablonunu qaytarır.
// İstifadəçinin adı və sıfırlama linki daxil edilir.
import {
    getResetPasswordTemplate,
    getResetPasswordText,
} from "../utils/emailTemplates.js";

// sendEmail — SMTP vasitəsilə email göndərmək üçün yardımçı funksiya.
import { sendEmail } from "../utils/sendEmail.js";

// crypto — Node.js-in daxili kriptoqrafiya modulu.
// Şifrə sıfırlama token-ini SHA-256 ilə hash etmək üçün istifadə olunur.
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── OAuth köməkçi funksiyaları ──────────────────────────────────────
const BACKEND_BASE  = () => process.env.BACKEND_URL  || `http://localhost:${process.env.PORT || 3011}`;
const FRONTEND_BASE = () => (process.env.FRONTEND_URL || "http://localhost:5173").split(",")[0].trim();

const getDisplayName = (account) =>
    account?.name ||
    [account?.firstName, account?.lastName].filter(Boolean).join(" ").trim() ||
    "İstifadəçi";

const findAccountByEmail = async (email) => {
    let account = await SuperAdmin.findOne({ email });
    if (!account) account = await Admin.findOne({ email });
    if (!account) account = await Blogger.findOne({ email });
    if (!account) account = await User.findOne({ email });
    return account;
};

const findAccountByResetToken = async (resetPasswordToken) => {
    let account = await SuperAdmin.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });
    if (!account) {
        account = await Admin.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
    }
    if (!account) {
        account = await Blogger.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
    }
    if (!account) {
        account = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
    }
    return account;
};

// Cookie + redirect helper — OAuth callback-larında istifadə olunur
const setOAuthCookieAndRedirect = (res, user) => {
    const isProduction = process.env.NODE_ENV === "PRODUCTION";
    const expiresDays  = Number(process.env.COOKIE_EXPIRES_TIME) || 7;
    const cookieOpts   = {
        expires:  new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure:   isProduction,
    };
    const userObj = {
        _id:          user._id,
        name:         user.name,
        email:        user.email,
        role:         user.role,
        sellerStatus: user.sellerStatus || null,
        sellerInfo:   user.sellerInfo   || null,
    };
    const data = Buffer.from(JSON.stringify(userObj)).toString("base64");
    res.cookie("token", user.jwtTokeniEldeEt(), cookieOpts)
       .redirect(`${FRONTEND_BASE()}/auth/callback?data=${data}`);
};

// Apple client_secret — ES256 JWT (6 ay etibarlı)
const generateAppleClientSecret = () => {
    const privateKey = (process.env.APPLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
    return jwt.sign(
        {
            iss: process.env.APPLE_TEAM_ID,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 86400 * 180,
            aud: "https://appleid.apple.com",
            sub: process.env.APPLE_CLIENT_ID,
        },
        privateKey,
        { algorithm: "ES256", keyid: process.env.APPLE_KEY_ID }
    );
};

// Product — məhsul modeli. Mağaza səhifəsində həmin mağazanın
// məhsullarını çəkmək üçün lazımdır.
import { Product } from "../model/Product.js";

// notifyNewUser — yeni istifadəçi qeydiyyat etdikdə adminlərə
// bildiriş göndərən yardımçı funksiya.
import { notifyNewUser, notifyWelcome } from "../utils/notificationHelper.js";

const resolveFrontendUrl = () => {
    const rawValue =
        process.env.FRONTEND_URL ||
        process.env.CLIENT_URL ||
        "http://localhost:5173";

    return rawValue
        .split(",")
        .map((item) => item.trim())
        .find(Boolean)
        ?.replace(/\/$/, "") || "http://localhost:5173";
};


// =====================================================================
// QEYDİYYAT (REGISTER)
// ---------------------------------------------------------------------
// POST /api/v1/register
// İstifadəçi və ya admin qeydiyyatını həyata keçirir.
// role = "admin" → admins kolleksiyasına yazır, sendToken ilə cookie+token verir
// role = "user"  → users kolleksiyasına yazır, JWT token verir
//
// Dəyişiklik:
//   Əvvəl admin register → res.status(201).json({...}) ilə manual cavab
//   İndi admin register → sendToken(user, 201, res, { storeLink, storeSlug })
//   Niyə? sendToken cookie yazır + sellerInfo-nu cavaba əlavə edir.
//   Bu sayəsə register sonrası da login kimi işləyir:
//     — Cookie yazılır → sonrakı sorğular autentifikasiyalı gedir
//     — sellerInfo cavabda olur → AdminProducts, AddProduct düzgün işləyir
// =====================================================================
export const registerUser = catchAsyncErrors(async (req, res, next) => {

    // req.body-dən gələn bütün sahələri çıxarırıq.
    // Admin üçün əlavə sahələr: storeName, storeAddress, phone, taxNumber, vonNumber
    const {
        name,
        email,
        password,
        role,
        storeName,
        storeAddress,
        phone,
        taxNumber,
        vonNumber,
    } = req.body;

    // ── ADMIN QEYDİYYATI ──────────────────────────────────────────────
    if (role === "admin") {

        // Admin qeydiyyatında bütün sahələrin dolu olması məcburidir.
        // Hansı sahənin boş olduğunu dəqiq göstərmək üçün missingFields
        // massivi toplanır — istifadəçiyə aydın xəta mesajı verilir.
        const missingFields = [];
        if (!storeName?.trim())    missingFields.push("Mağaza adı (storeName)");
        if (!storeAddress?.trim()) missingFields.push("Mağaza ünvanı (storeAddress)");
        if (!phone?.trim())        missingFields.push("Telefon nömrəsi (phone)");
        if (!taxNumber?.trim())    missingFields.push("Vergi nömrəsi (taxNumber)");
        if (!vonNumber?.trim())    missingFields.push("VÖN nömrəsi (vonNumber)");

        // Hər hansı sahə çatışmırsa — 400 (Bad Request) xətası qaytarılır
        // və funksiya dayandırılır (return next ilə).
        if (missingFields.length > 0) {
            return next(new ErrorHandler(
                `Admin qeydiyyatı üçün aşağıdakı məlumatlar əksikdir: ${missingFields.join(", ")}`,
                400
            ));
        }

        // ── SLUG YARATMA ──────────────────────────────────────────────
        // Mağaza adından URL-uyğun unikal link yaradılır.
        // Məsələn: "Gülün Mağazası" → "gulun-magazasi-4823"
        //
        // Addımlar:
        //   .toLowerCase()          → böyük hərfləri kiçildilir
        //   .replace(/\s+/g, "-")   → boşluqlar tire ilə əvəzlənir
        //   .replace(/[^\w\-]+/g,"")→ xüsusi simvollar (?, !, @ və s.) silinir
        //   .replace(/\-\-+/g, "-") → ardıcıl tirelər tək tirəyə endirilir
        //   + Math.random()         → eyni adlı mağazalar fərqlənsin deyə
        //                            sona 4 rəqəmli təsadüfi ədəd əlavə olunur
        const generateSlug = (text) => {
            return text
                .toString()
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w\-]+/g, "")
                .replace(/\-\-+/g, "-")
                + "-" + Math.floor(Math.random() * 10000);
        };
        const storeSlug = generateSlug(storeName);

        // Admin.create() — "admins" kolleksiyasına yeni sənəd əlavə edir.
        // User.create() istifadə edilmir — çünki admin ayrı modeldədir.
        // sellerStatus: "approved" — admin dərhal aktiv olur, təsdiq gözləmir.
        // sellerInfo — mağazaya aid bütün məlumatlar bu alt-obyektdə saxlanılır.
        const user = await Admin.create({
            name,
            email,
            password,
            sellerStatus: "approved",
            sellerInfo: {
                storeName:    storeName.trim(),
                storeSlug,
                storeAddress: storeAddress.trim(),
                phone:        phone.trim(),
                taxNumber:    taxNumber.trim(),
                vonNumber:    vonNumber.trim(),
            },
        });

        // Mağazanın ictimai linki — bu link müştərilərə paylaşıla bilər.
        // Məsələn: http://localhost:3010/store/gulun-magazasi-4823
        const storeLink = `${resolveFrontendUrl()}/store/${storeSlug}`;

        // ── ƏSAS DƏYİŞİKLİK ──────────────────────────────────────────
        // Əvvəl: res.status(201).json({...}) — manual cavab, cookie YOX idi.
        // İndi: sendToken(user, 201, res, { storeLink, storeSlug })
        //
        // sendToken nə edir?
        //   1. JWT token yaradır (jwtTokeniEldeEt())
        //   2. Cookie-yə yazır → sonrakı admin sorğuları autentifikasiyalı olur
        //   3. Cavabda user obyekti göndərir — sellerInfo daxil olmaqla
        //   4. extraData = { storeLink, storeSlug } → cavaba əlavə edilir
        //      Register.jsx storeLink-i göstərmək üçün bu sahəni oxuyur
        //
        // Bu dəyişiklik sayəsində:
        //   — Register sonrası admin dərhal autentifikasiyalı sayılır
        //   — authApi onQueryStarted-da dispatch(setUser({ user: data.user })) işləyir
        //   — data.user artıq sellerInfo-nu da ehtiva edir
        //   — AdminProducts, AddProduct login/register fərqi olmadan işləyir
        return sendToken(user, 201, res, {
            message:   "Admin qeydiyyatı uğurla tamamlandı",
            storeLink,
            storeSlug,
        });
    }

    // ── BLOGER QEYDİYYATI ─────────────────────────────────────────────
    if (role === "blogger") {
        // İsim və Soyad ayırma (Blogger modelifirstName və lastName tələb edir)
        const nameParts = name.trim().split(" ");
        const firstName = nameParts[0] || "Bloger";
        const lastName  = nameParts.slice(1).join(" ") || "İstifadəçisi";

        const user = await Blogger.create({
            firstName,
            lastName,
            email,
            password,
            commissionRate:     40, // Default komissiya
            commissionDuration: 6,  // 6 ay müddət
            isActive:           true,
        });

        return sendToken(user, 201, res, {
            message: "Bloger hesabı uğurla yaradıldı",
        });
    }

    // ── ADİ İSTİFADƏÇİ QEYDİYYATI ────────────────────────────────────
    // role = "admin" deyilsə bu hissə işləyir.
    // Yalnız əsas məlumatlar saxlanılır, role məcburən "user" təyin edilir —
    // istifadəçi özü özünə "admin" rolu verə bilməsin deyə.
    const user = await User.create({
        name,
        email,
        password,
        role: "user",
    });

    // Yeni istifadəçi qeydiyyat etdikdə adminlərə bildiriş göndərilir.
    // Bu, adminlərin sistemi izləməsi üçün faydalıdır.
    await notifyNewUser({ userName: user.name, userEmail: user.email });

    // İstifadəçinin özünə xoş gəldiniz bildirişi göndər
    notifyWelcome(user).catch(() => {});

    // JWT token yaradılır və cookie-yə yazılır — istifadəçi dərhal daxil olmuş sayılır.
    sendToken(user, 201, res);
});


// =====================================================================
// MAĞAZA SLUG-U — SATICI ADINDAN
// ---------------------------------------------------------------------
// GET /store/seller/:name
// Məhsul kartında "Mağazaya bax" düyməsi üçün.
// Məhsulun "seller" sahəsi storeName-dir. Bu endpoint storeName → storeSlug
// çevirir ki, frontend /store/:slug səhifəsinə yönlənə bilsin.
// =====================================================================
export const getStoreSlugBySeller = catchAsyncErrors(async (req, res, next) => {
    const raw = decodeURIComponent(req.params.name).trim();
    // Case-insensitive axtarış — böyük/kiçik hərfə görə fərq olmasın
    const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const admin = await Admin.findOne({
        "sellerInfo.storeName": { $regex: new RegExp(`^${escaped}$`, "i") },
    }).select("sellerInfo.storeSlug sellerInfo.storeName");
    if (!admin || !admin.sellerInfo?.storeSlug) {
        return next(new ErrorHandler("Mağaza tapılmadı", 404));
    }
    res.status(200).json({
        success:   true,
        storeSlug: admin.sellerInfo.storeSlug,
        storeName: admin.sellerInfo.storeName,
    });
});


// =====================================================================
// MAĞAZA PROFİLİ — SLUG İLƏ
// ---------------------------------------------------------------------
// GET /api/v1/store/:slug
// Mağaza səhifəsini açmaq üçün — slug (unikal URL hissəsi) ilə
// Admin modelindən mağaza tapılır, həmin mağazanın məhsulları çəkilir.
// =====================================================================
export const getStoreBySlug = catchAsyncErrors(async (req, res, next) => {

    // req.params.slug — URL-dən gələn mağaza identifikatoru
    // Məsələn: /store/gulun-magazasi-4823 → slug = "gulun-magazasi-4823"
    // Admin.findOne() — admins kolleksiyasında axtarış aparır
    // "sellerInfo.storeSlug" — iç-içə (nested) sahədə axtarış üçün nöqtəli yol
    const user = await Admin.findOne({ "sellerInfo.storeSlug": req.params.slug });

    // Belə slug-a malik mağaza tapılmadısa — 404 Not Found qaytarılır
    if (!user) {
        return next(new ErrorHandler("Belə bir mağaza tapılmadı", 404));
    }

    // Həmin mağazaya aid məhsullar — seller sahəsi mağaza adına bərabər olanlar
    const products = await Product.find({ seller: user.sellerInfo.storeName });

    // ── MAĞAZA REYTİNQİ HESABLAMA ────────────────────────────────────
    // Bütün məhsulların reytinqlərini çəki ilə ortalaması alınır.
    // (ratings * numOfReviews) / totalReviews = ağırlıqlı orta reytinq
    let totalWeightedRating = 0, totalReviews = 0;
    products.forEach(p => {
        totalWeightedRating += (p.ratings || 0) * (p.numOfReviews || 0);
        totalReviews        += (p.numOfReviews || 0);
    });
    const storeRating = totalReviews > 0
        ? parseFloat((totalWeightedRating / totalReviews).toFixed(1))
        : 0;

    res.status(200).json({
        success: true,
        store: {
            _id:          user._id,
            storeName:    user.sellerInfo.storeName,
            storeSlug:    user.sellerInfo.storeSlug,
            storeAddress: user.sellerInfo.storeAddress,
            phone:        user.sellerInfo.phone,
            storeRating,
            totalReviews,
            avgRating:    user.avgRating  || 0,
            numReviews:   user.numReviews || 0,
            isBlocked:    user.isBlocked  || false,
        },
        products,
        totalProducts: products.length,
    });
});


// =====================================================================
// GİRİŞ (LOGIN)
// ---------------------------------------------------------------------
// POST /api/v1/login
// İstifadəçi email və şifrə ilə daxil olur.
// Əvvəlcə Admin cədvəlində, tapılmasa User cədvəlində axtarış aparılır.
// =====================================================================
export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password, role } = req.body;

    // Hər iki sahə məcburidir — biri boş olarsa 400 qaytarılır
    if (!email || !password) {
        return next(new ErrorHandler("Zəhmət olmasa emaili və ya şifrəni daxil edin", 400));
    }

    // ── ROL ƏSASLI AXTARIŞ ───────────────────────────────────────────
    // role = "admin" → yalnız Admin kolleksiyasında axtarış aparılır.
    // role = "user"  → yalnız User kolleksiyasında axtarış aparılır.
    // Bu sayəsində bir rolun istifadəçisi digər rolun formasından girə bilməz.
    //
    // .select("+password") — Mongoose modelində password sahəsi "select: false"
    // ilə gizlədilir. Giriş zamanı şifrəni müqayisə etmək üçün açıq istəmək lazımdır.
    let user = null;

    if (role === "superadmin") {
        user = await SuperAdmin.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler("Superadmin hesabı tapılmadı.", 401));
        }
    } else if (role === "admin") {
        user = await Admin.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler(
                "Bu email ilə satıcı hesabı tapılmadı. Əgər alıcı hesabınız varsa, 'Alıcı' sekmesini seçin.",
                401
            ));
        }
    } else if (role === "blogger") {
        user = await Blogger.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler("Bloger hesabı tapılmadı.", 401));
        }
        if (!user.isActive) {
            return next(new ErrorHandler("Hesabınız deaktiv edilib. Adminlə əlaqə saxlayın.", 403));
        }
    } else {
        user = await User.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler(
                "Bu email ilə alıcı hesabı tapılmadı. Əgər satıcı hesabınız varsa, 'Satıcı' sekmesini seçin.",
                401
            ));
        }
    }

    // ── BLOK YOXLAMASI ───────────────────────────────────────────────
    // SuperAdmin tərəfindən bloklanmış admin VƏ ya user girişi bloklayırıq.
    // isBlocked sahəsi həm Admin həm də User modelindədir.
    if (user.isBlocked) {
        return next(new ErrorHandler(
            "Hesabınız bloklanıb. Səbəb: " + (user.blockReason || "Superadminlə əlaqə saxlayın."),
            403
        ));
    }

    // shifreleriMuqayiseEt() — User/Admin modelindəki metoddur.
    // Daxil edilən şifrəni bcrypt ilə hash-lənmiş şifrə ilə müqayisə edir.
    // true → uyğundur, false → yanlışdır
    const isPasswordMatched = await user.shifreleriMuqayiseEt(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Şifrə yanlışdır", 401));
    }

    // Şifrə düzgündür — JWT token yaradılır və cookie-yə yazılır
    // sendToken artıq sellerInfo-nu da cavaba əlavə edir (sendToken.js-də dəyişib)
    sendToken(user, 200, res);
});


// =====================================================================
// ÇIXIŞ (LOGOUT)
// ---------------------------------------------------------------------
// GET /api/v1/logout
// Cookie-dəki token-i silir — istifadəçi çıxış etmiş sayılır.
// =====================================================================
export const logout = catchAsyncErrors(async (req, res, next) => {

    // Cookie-ni silmək üçün:
    //   — dəyəri null təyin edilir
    //   — expires keçmiş vaxt (Date.now()) verilir → brauzer dərhal silir
    //   — httpOnly: true → JavaScript cookie-yə daxil ola bilmir (XSS qoruması)
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: "Uğurla çıxış edildi",
    });
});


// =====================================================================
// ŞİFRƏNİ UNUTDUM
// ---------------------------------------------------------------------
// POST /api/v1/password/forgot
// İstifadəçinin emailinə şifrə sıfırlama linki göndərir.
// =====================================================================
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email) {
        return next(new ErrorHandler("Email daxil edin", 400));
    }

    // Dörd mərhələli axtarış: SuperAdmin -> Admin -> Blogger -> User
    const user = await findAccountByEmail(email);

    if (!user) {
        return res.status(200).json({
            success: true,
            message: "Əgər bu email sistemdə varsa, şifrə sıfırlama linki göndərildi",
        });
    }

    // getResetPasswordToken() — User/Admin modelindəki metoddur.
    // İçəridə nə baş verir:
    //   1. Təsadüfi 20 baytlıq token yaradılır (crypto.randomBytes)
    //   2. Token SHA-256 ilə hash edilib bazaya saxlanılır (resetPasswordToken)
    //   3. Token-in müddəti 30 dəqiqə təyin edilir (resetPasswordExpire)
    //   4. Hash edilməmiş (xam) token qaytarılır — linkə bu yazılır
    //
    // Niyə hash edilmiş token bazaya yazılır?
    //   Əgər baza sızsa, xam token bilinmir — təhlükəsizlik üçün.
    const resetToken = user.getResetPasswordToken();

    // validateBeforeSave: false — yalnız token sahələri dəyişib,
    // digər məcburi sahələri yenidən yoxlamağa ehtiyac yoxdur.
    await user.save({ validateBeforeSave: false });

    // İstifadəçiyə göndəriləcək link — xam token URL-də olur
    const frontendUrl = resolveFrontendUrl();
    const resetUrl = `${frontendUrl}/password/reset/${resetToken}`;

    // HTML email şablonu hazırlanır — istifadəçinin adı və link daxil edilir
    const displayName = getDisplayName(user);
    const message = getResetPasswordTemplate(displayName, resetUrl);
    const textMessage = getResetPasswordText(displayName, resetUrl);

    try {
        await sendEmail({
            email:   user.email,
            subject: "Brendex Group | Real şifrə sıfırlama istəyi",
            message,
            text:    textMessage,
        });

        return res.status(200).json({
            success: true,
            message: "Əgər bu email sistemdə varsa, şifrə sıfırlama linki göndərildi",
        });

    } catch (err) {

        // Email göndərilə bilmədisə — bazadakı token sahələri təmizlənir.
        // Niyə? Çünki istifadəçi linki almadı, amma bazada token qaldı —
        // bu, növbəti "şifrəmi unutdum" sorğusunu bloklaya bilər.
        user.resetPasswordExpire = undefined;
        user.resetPasswordToken  = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler("Email göndərilərkən xəta baş verdi", 500));
    }
});


// =====================================================================
// ŞİFRƏNİ SIFIRLA
// ---------------------------------------------------------------------
// PUT /api/v1/password/reset/:token
// İstifadəçi emaildəki linkə tıklayır, yeni şifrəni təyin edir.
// =====================================================================
export const resetPassword = catchAsyncErrors(async (req, res, next) => {

    // URL-dəki xam token SHA-256 ilə hash edilir —
    // bazada saxlanılan hash ilə müqayisə etmək üçün.
    // Niyə yenidən hash edirik?
    //   Bazada xam token yoxdur, yalnız hash var.
    //   Ona görə URL-dən gələn xam token-i eyni alqoritmlə hash edib
    //   bazadakı dəyərlə müqayisə edirik.
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await findAccountByResetToken(resetPasswordToken);

    // Token yanlışdırsa və ya 30 dəqiqə keçibsə — 400 Bad Request
    if (!user) {
        return next(new ErrorHandler("Reset token yanlışdır və ya müddəti keçib", 400));
    }

    if (!req.body.password || req.body.password.length < 8) {
        return next(new ErrorHandler("Şifrə ən azı 8 simvol olmalıdır", 400));
    }

    // İki dəfə daxil edilən şifrələr uyğunlaşmalıdır
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Şifrələr uyğunlaşmır", 400));
    }

    // Şifrəni sıfırla və token-ləri təmizlə
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Validation-dan keçməsi üçün bəzi sahələrin (əgər varsa) doldurulmasını yoxla
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
        success: true,
        message: "Şifrəniz uğurla yeniləndi",
    });
});


// =====================================================================
// GOOGLE İLƏ GİRİŞ — googleLogin
// ---------------------------------------------------------------------
// POST /commerce/mehsullar/auth/google
// Body: { credential } — Google-ın frontend-ə verdiyi ID token
//
// Axın:
//   1. Google ID tokenini doğrula (google-auth-library ilə)
//   2. Emaili bazada axtar
//   3. Tapıldısa → googleId yenilə (əgər yoxdursa) → giriş et
//   4. Tapılmadısa → yeni User yarat → giriş et
// =====================================================================
// =====================================================================
// GOOGLE — REDIRECT (yeni axın)
// GET /auth/google → Google login səhifəsinə yönləndir
// =====================================================================
export const googleAuthRedirect = (req, res) => {
    const params = new URLSearchParams({
        client_id:     process.env.GOOGLE_CLIENT_ID,
        redirect_uri:  `${BACKEND_BASE()}/commerce/mehsullar/auth/google/callback`,
        response_type: "code",
        scope:         "openid email profile",
        access_type:   "offline",
        prompt:        "select_account",
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};

// =====================================================================
// GOOGLE — CALLBACK (yeni axın)
// GET /auth/google/callback → Google code-u token-ə dəyiş, user yarat/tap
// =====================================================================
export const googleAuthCallback = catchAsyncErrors(async (req, res, next) => {
    const { code, error } = req.query;
    const FRONTEND = FRONTEND_BASE();

    if (error || !code) return res.redirect(`${FRONTEND}/login?error=google_cancelled`);

    // Code → tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method:  "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:    new URLSearchParams({
            code,
            client_id:     process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri:  `${BACKEND_BASE()}/commerce/mehsullar/auth/google/callback`,
            grant_type:    "authorization_code",
        }),
    });
    const tokens = await tokenRes.json();
    if (!tokens.id_token) return res.redirect(`${FRONTEND}/login?error=google_failed`);

    // id_token doğrula
    const ticket = await googleClient.verifyIdToken({
        idToken:  tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, name, picture } = ticket.getPayload();
    if (!email) return res.redirect(`${FRONTEND}/login?error=no_email`);

    let user = await User.findOne({ email });
    if (user) {
        if (user.isBlocked) return res.redirect(`${FRONTEND}/login?error=blocked`);
        if (!user.googleId) { user.googleId = googleId; await user.save({ validateBeforeSave: false }); }
    } else {
        user = await User.create({ name, email, googleId, avatar: { url: picture || "" } });
        notifyWelcome(user).catch(() => {});
    }

    setOAuthCookieAndRedirect(res, user);
});

// =====================================================================
// APPLE — REDIRECT
// GET /auth/apple → Apple login səhifəsinə yönləndir
// =====================================================================
export const appleAuthRedirect = (req, res) => {
    if (!process.env.APPLE_CLIENT_ID) {
        return res.redirect(`${FRONTEND_BASE()}/login?error=apple_not_configured`);
    }
    const params = new URLSearchParams({
        client_id:     process.env.APPLE_CLIENT_ID,
        redirect_uri:  `${BACKEND_BASE()}/commerce/mehsullar/auth/apple/callback`,
        response_type: "code id_token",
        scope:         "name email",
        response_mode: "form_post",
    });
    res.redirect(`https://appleid.apple.com/auth/authorize?${params}`);
};

// =====================================================================
// APPLE — CALLBACK (POST — Apple form_post göndərir)
// POST /auth/apple/callback
// =====================================================================
export const appleAuthCallback = catchAsyncErrors(async (req, res, next) => {
    const FRONTEND = FRONTEND_BASE();
    if (!process.env.APPLE_CLIENT_ID) return res.redirect(`${FRONTEND}/login?error=apple_not_configured`);

    const { code, id_token, user: userStr, error } = req.body;
    if (error || !code) return res.redirect(`${FRONTEND}/login?error=apple_cancelled`);

    // Code → tokens (Apple token endpoint)
    let applePayload;
    try {
        const clientSecret = generateAppleClientSecret();
        const tokenRes = await fetch("https://appleid.apple.com/auth/token", {
            method:  "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body:    new URLSearchParams({
                client_id:     process.env.APPLE_CLIENT_ID,
                client_secret: clientSecret,
                code,
                grant_type:    "authorization_code",
                redirect_uri:  `${BACKEND_BASE()}/commerce/mehsullar/auth/apple/callback`,
            }),
        });
        const tokens = await tokenRes.json();
        if (!tokens.id_token) return res.redirect(`${FRONTEND}/login?error=apple_failed`);
        // id_token-i decode et (Apple-dan gəldiyinə etibar edirik)
        const parts = tokens.id_token.split(".");
        applePayload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
    } catch {
        return res.redirect(`${FRONTEND}/login?error=apple_failed`);
    }

    const { sub: appleId, email } = applePayload;
    if (!appleId) return res.redirect(`${FRONTEND}/login?error=apple_no_id`);

    // İlk girişdə Apple adı göndərir
    let name = "Apple İstifadəçi";
    if (userStr) {
        try {
            const ud = JSON.parse(userStr);
            const fn = ud.name?.firstName || "";
            const ln = ud.name?.lastName  || "";
            name = `${fn} ${ln}`.trim() || name;
        } catch {}
    }

    const query = [{ appleId }];
    if (email) query.push({ email });
    let user = await User.findOne({ $or: query });
    if (user) {
        if (user.isBlocked) return res.redirect(`${FRONTEND}/login?error=blocked`);
        if (!user.appleId) { user.appleId = appleId; await user.save({ validateBeforeSave: false }); }
    } else {
        user = await User.create({
            name,
            email: email || `apple_${appleId}@brendex.local`,
            appleId,
        });
        notifyWelcome(user).catch(() => {});
    }

    setOAuthCookieAndRedirect(res, user);
});



// =====================================================================
// BÜTÜN MAĞAZALAR — getAllStores (açıq endpoint)
// GET /stores?sort=rating|name&page=1&limit=20
// Alıcılar üçün mağazaları sıralamaq ilə göstərir.
// sort=rating (default) → avgRating-ə görə azalan sıra (yaxşı üstdə)
// sort=name             → əlifba sırasıyla
// =====================================================================
export const getAllStores = catchAsyncErrors(async (req, res, next) => {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 24;
    const skip  = (page - 1) * limit;
    const sort  = req.query.sort === "name"
        ? { "sellerInfo.storeName": 1 }
        : { avgRating: -1, numReviews: -1 };  // reytinqə görə (yaxşı üstdə)

    const [stores, total] = await Promise.all([
        Admin.find({ sellerStatus: "approved", isBlocked: false })
            .select("sellerInfo.storeName sellerInfo.storeSlug sellerInfo.storeAddress avgRating numReviews createdAt")
            .sort(sort)
            .skip(skip)
            .limit(limit),
        Admin.countDocuments({ sellerStatus: "approved", isBlocked: false }),
    ]);

    res.status(200).json({
        success: true,
        stores:  stores.map(s => ({
            _id:          s._id,
            storeName:    s.sellerInfo.storeName,
            storeSlug:    s.sellerInfo.storeSlug,
            storeAddress: s.sellerInfo.storeAddress || "",
            avgRating:    s.avgRating   || 0,
            numReviews:   s.numReviews  || 0,
        })),
        total,
        page,
        pages: Math.ceil(total / limit),
    });
});
