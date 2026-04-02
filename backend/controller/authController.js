// ============================================================
// catchAsyncErrors — async funksiyalardakı xətaları avtomatik
// tutur və next(err) ilə xəta middleware-inə ötürür.
// Hər controller-i try/catch ilə əhatə etməmək üçün istifadə olunur.
// ============================================================
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";

// User — adi alıcı istifadəçilər üçün MongoDB modeli ("users" kolleksiyası)
import User from "../model/User.js";

// Admin — satıcı/admin istifadəçilər üçün ayrı MongoDB modeli ("admins" kolleksiyası)
// Niyə ayrı model? Çünki adminin əlavə məlumatları var: mağaza adı, vergi nömrəsi və s.
import Admin from "../model/Admin.js";

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
import { notifyNewUser } from "../utils/notificationHelper.js";


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
        const storeLink = `${process.env.FRONTEND_URL}/store/${storeSlug}`;

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

    // JWT token yaradılır və cookie-yə yazılır — istifadəçi dərhal daxil olmuş sayılır.
    sendToken(user, 201, res);
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

    // Cavabda phone göstərilmir — ictimai endpoint-də həssas məlumat paylaşılmır
    res.status(200).json({
        success: true,
        store: {
            storeName:    user.sellerInfo.storeName,
            storeSlug:    user.sellerInfo.storeSlug,
            storeAddress: user.sellerInfo.storeAddress,
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
    const { email, password } = req.body;

    // Hər iki sahə məcburidir — biri boş olarsa 400 qaytarılır
    if (!email || !password) {
        return next(new ErrorHandler("Zəhmət olmasa emaili və ya şifrəni daxil edin", 400));
    }

    // ── İKİ MƏRHƏLƏLİ AXTARIŞ ───────────────────────────────────────
    // Niyə əvvəlcə Admin, sonra User?
    //   — Adminlər ayrı kolleksiyada saxlanılır
    //   — Hər ikisini yoxlamaq lazımdır, çünki giriş forması eynidir
    //
    // .select("+password") — niyə lazımdır?
    //   Mongoose modelində password sahəsi adətən
    //   "select: false" ilə gizlədilir — sorğularda avtomatik gəlmir.
    //   Giriş zamanı şifrəni müqayisə etmək üçün onu açıq istəmək lazımdır.
    let user = await Admin.findOne({ email }).select("+password");
    if (!user) {
        user = await User.findOne({ email }).select("+password");
    }

    // Heç bir kolleksiyada tapılmadısa — 401 Unauthorized
    // Niyə 401, 404 deyil? Təhlükəsizlik: "istifadəçi yoxdur" demək
    // hücumçuya hansı emailin mövcud olduğunu açıqlayır.
    if (!user) {
        return next(new ErrorHandler("Belə bir emailə sahib istifadəçi tapılmadı", 401));
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

    // Eyni iki mərhələli axtarış: əvvəlcə Admin, sonra User
    let user = await Admin.findOne({ email: req.body.email });
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
    const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

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

    // $gt: Date.now() — token-in müddəti keçməyib şərti
    // Eyni iki mərhələli axtarış: əvvəlcə Admin, sonra User
    let user = await Admin.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });
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

    // Yeni şifrə təyin edilir — model middleware-i (pre save hook)
    // onu avtomatik bcrypt ilə hash edəcək.
    user.password = req.body.password;

    // Token sahələri silinir — artıq istifadəyə yararsızdır.
    // Eyni link ikinci dəfə işləməməlidir.
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // Şifrə yeniləndi — istifadəçi avtomatik daxil olsun deyə token verilir
    // sendToken artıq sellerInfo-nu da cavaba əlavə edir
    sendToken(user, 200, res);
});