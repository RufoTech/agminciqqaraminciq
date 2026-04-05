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
import { getResetPasswordTemplate } from "../utils/emailTemplates.js";

// sendEmail — SMTP vasitəsilə email göndərmək üçün yardımçı funksiya.
import { sendEmail } from "../utils/sendEmail.js";

// crypto — Node.js-in daxili kriptoqrafiya modulu.
// Şifrə sıfırlama token-ini SHA-256 ilə hash etmək üçün istifadə olunur.
import crypto from "crypto";

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
            storeName:    user.sellerInfo.storeName,
            storeSlug:    user.sellerInfo.storeSlug,
            storeAddress: user.sellerInfo.storeAddress,
            phone:        user.sellerInfo.phone,   // telefon artıq göstərilir
            storeRating,
            totalReviews,
            isBlocked:    user.isBlocked || false,
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

    // Dörd mərhələli axtarış: SuperAdmin -> Admin -> Blogger -> User
    let user = await SuperAdmin.findOne({ email: req.body.email });
    if (!user) {
        user = await Admin.findOne({ email: req.body.email });
    }
    if (!user) {
        user = await Blogger.findOne({ email: req.body.email });
    }
    if (!user) {
        user = await User.findOne({ email: req.body.email });
    }

    if (!user) {
        return next(new ErrorHandler("İstifadəçi tapılmadı", 404));
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
    const message = getResetPasswordTemplate(user.name, resetUrl);

    try {
        await sendEmail({
            email:   user.email,
            subject: "Şifrənin sıfırlanması mərhələsi",
            message,
        });

        res.status(200).json({
            success: true,
            message: "Emailinizi yoxlayın",
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

    // Dörd mərhələli axtarış: SuperAdmin -> Admin -> Blogger -> User
    let user = await SuperAdmin.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
        user = await Admin.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
    }
    if (!user) {
        user = await Blogger.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
    }
    if (!user) {
        user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
    }

    // Token yanlışdırsa və ya 30 dəqiqə keçibsə — 400 Bad Request
    if (!user) {
        return next(new ErrorHandler("Reset token yanlışdır və ya müddəti keçib", 400));
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

    sendToken(user, 200, res);
});
