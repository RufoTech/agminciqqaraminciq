// catchAsyncErrors — async funksiyalardakı xətaları avtomatik tutur,
// hər controller-ə try/catch yazmaqdan xilas edir.
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";

// SuperAdmin — sistemin ən yüksək səlahiyyətli istifadəçi modeli.
// Admin yaratmaq, silmək, statusunu dəyişmək kimi əməliyyatlar yalnız
// superadminə aiddir.
import SuperAdmin from "../model/SuperAdmin.js";

// Admin — satıcı/mağaza sahibi modeli.
// SuperAdmin bu modeli tam idarə edir.
import Admin from "../model/Admin.js";

// ErrorHandler — özəl xəta sinifi.
// new ErrorHandler("mesaj", statusKod) şəklində istifadə olunur.
import ErrorHandler from "../utils/errorHandler.js";

// sendToken — JWT token yaradır və cookie-yə yazır.
// Giriş uğurlu olduqda superadminə token verilir.
import sendToken from "../utils/sendToken.js";

// getResetPasswordTemplate — şifrə sıfırlama emailinin HTML şablonunu qaytarır.
import { getResetPasswordTemplate } from "../utils/emailTemplates.js";

// sendEmail — SMTP vasitəsilə email göndərmək üçün yardımçı funksiya.
import { sendEmail } from "../utils/sendEmail.js";

// crypto — Node.js-in daxili kriptoqrafiya modulu.
// Şifrə sıfırlama token-ini SHA-256 ilə hash etmək üçün istifadə olunur.
import crypto from "crypto";


// =====================================================================
// SUPERADMIN QEYDİYYATI — registerSuperAdmin
// ---------------------------------------------------------------------
// POST /api/v1/superadmin/register
//
// Ad istənilən ola bilər — hər superadmin özünə ad seçir.
// Email və şifrə isə .env-dəki xüsusi dəyərlərlə uyğun gəlməlidir.
// Uyğun gəlmirsə — superadmin yaradılmır.
// Limit yoxdur — eyni email/şifrə ilə istənilən qədər superadmin yaradıla bilər.
//
// Request body:
//   name     → istənilən ad
//   email    → .env-dəki SUPERADMIN_EMAIL ilə eyni olmalıdır
//   password → .env-dəki SUPERADMIN_PASSWORD ilə eyni olmalıdır
// =====================================================================
export const registerSuperAdmin = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Bütün sahələr məcburidir
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
        return next(new ErrorHandler("Ad, email və şifrə məcburidir", 400));
    }

    // ── GİZLİ EMAİL VƏ ŞİFRƏ YOXLAMASI ─────────────────────────────
    // İstifadəçinin daxil etdiyi email və şifrə .env-dəki
    // xüsusi dəyərlərlə uyğun gəlməlidir.
    // Uyğun gəlmirsə — superadmin yaradılmır.
    const secretEmail    = process.env.SUPERADMIN_EMAIL;
    const secretPassword = process.env.SUPERADMIN_PASSWORD;

    if (email !== secretEmail) {
        return next(new ErrorHandler("Email yanlışdır", 401));
    }

    if (password !== secretPassword) {
        return next(new ErrorHandler("Şifrə yanlışdır", 401));
    }

    // ── BAZAYA YAZ ───────────────────────────────────────────────────
    // Email və şifrə doğrudur — superadmin yaradılır.
    // pre("save") hook şifrəni bcrypt ilə hash edəcək.
    const superAdmin = await SuperAdmin.create({
        name:     name.trim(),
        email:    secretEmail,
        password: secretPassword,
    });

    sendToken(superAdmin, 201, res);
});


// =====================================================================
// SUPERADMIN GİRİŞ — superAdminLogin
// ---------------------------------------------------------------------
// POST /api/v1/superadmin/login
//
// Superadmin öz panellinə daxil olmaq üçün bu endpoint-i istifadə edir.
// =====================================================================
export const superAdminLogin = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // Hər iki sahə məcburidir
    if (!email || !password) {
        return next(new ErrorHandler("Zəhmət olmasa emaili və şifrəni daxil edin", 400));
    }

    // .select("+password") — SuperAdmin Schema-da şifrə sahəsi "select: false" ilə
    // gizlədilmişdir. Giriş zamanı müqayisə üçün açıq istəmək lazımdır.
    const superAdmin = await SuperAdmin.findOne({ email }).select("+password");

    if (!superAdmin) {
        return next(new ErrorHandler("Superadmin tapılmadı", 401));
    }

    // shifreleriMuqayiseEt() — SuperAdmin modelindəki metoddur.
    // Daxil edilən şifrəni bcrypt ilə hash-lənmiş şifrə ilə müqayisə edir.
    const isPasswordMatched = await superAdmin.shifreleriMuqayiseEt(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Şifrə yanlışdır", 401));
    }

    // Şifrə düzgündür — JWT token yaradılır və cookie-yə yazılır
    sendToken(superAdmin, 200, res);
});


// =====================================================================
// SUPERADMIN ÇIXIŞ — superAdminLogout
// ---------------------------------------------------------------------
// GET /api/v1/superadmin/logout
//
// Cookie-dəki token-i silir — superadmin çıxış etmiş sayılır.
// =====================================================================
export const superAdminLogout = catchAsyncErrors(async (req, res, next) => {

    // Cookie-ni silmək üçün:
    //   — dəyəri null təyin edilir
    //   — expires keçmiş vaxt verilir (Date.now()) → brauzer dərhal silir
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
// BÜTÜN ADMİNLƏRİ GƏTİR — getAllAdmins
// ---------------------------------------------------------------------
// GET /api/v1/superadmin/admins
//
// SuperAdmin panelindəki "Adminlər" cədvəli üçün.
// =====================================================================
export const getAllAdmins = catchAsyncErrors(async (req, res, next) => {

    // .select("-password") — şifrə sahəsi cavaba daxil edilmir.
    // Həssas məlumatları heç vaxt göndərməmək — əsas təhlükəsizlik prinsipi.
    const admins = await Admin.find().select("-password");

    res.status(200).json({
        success:     true,
        totalAdmins: admins.length, // ümumi admin sayı — dashboard statistikası üçün
        admins,
    });
});


// =====================================================================
// TƏK ADMİN GƏTİR — getAdminById
// ---------------------------------------------------------------------
// GET /api/v1/superadmin/admin/:id
//
// SuperAdmin müəyyən bir adminin detallarını baxanda işləyir.
// =====================================================================
export const getAdminById = catchAsyncErrors(async (req, res, next) => {

    const admin = await Admin.findById(req.params.id).select("-password");

    if (!admin) {
        return next(new ErrorHandler("Admin tapılmadı", 404));
    }

    res.status(200).json({
        success: true,
        admin,
    });
});


// =====================================================================
// ADMİN YARAT — createAdminBySuperAdmin
// ---------------------------------------------------------------------
// POST /api/v1/superadmin/admin/new
//
// SuperAdmin yeni satıcı/mağaza sahibi yaradır.
// authController-dəki registerUser-dən fərqi:
//   — Burada yalnız superadmin admin yarada bilər
//   — Əvvəlcədən bütün sahələr yoxlanılır
//   — Avtomatik "approved" statusu verilir (superadmin özü yaradır)
// =====================================================================
export const createAdminBySuperAdmin = catchAsyncErrors(async (req, res, next) => {
    const {
        name, email, password,
        storeName, storeAddress, phone, taxNumber, vonNumber,
    } = req.body;

    // ── BÜTÜN SAHƏLƏRİN DOLU OLDUĞUNU YOXLA ────────────────────────
    // Hansı sahənin boş olduğunu dəqiq göstərmək üçün missingFields massivi toplanır.
    const missingFields = [];
    if (!name?.trim())         missingFields.push("Ad (name)");
    if (!email?.trim())        missingFields.push("Email");
    if (!password?.trim())     missingFields.push("Şifrə (password)");
    if (!storeName?.trim())    missingFields.push("Mağaza adı (storeName)");
    if (!storeAddress?.trim()) missingFields.push("Mağaza ünvanı (storeAddress)");
    if (!phone?.trim())        missingFields.push("Telefon nömrəsi (phone)");
    if (!taxNumber?.trim())    missingFields.push("Vergi nömrəsi (taxNumber)");
    if (!vonNumber?.trim())    missingFields.push("VÖN nömrəsi (vonNumber)");

    if (missingFields.length > 0) {
        return next(new ErrorHandler(
            `Admin yaratmaq üçün aşağıdakı məlumatlar əksikdir: ${missingFields.join(", ")}`,
            400
        ));
    }

    // ── SLUG YARATMA ─────────────────────────────────────────────────
    // Mağaza adından URL-uyğun unikal link yaradılır.
    // "Gülün Mağazası" → "gulun-magazasi-4823"
    // +Math.random() — eyni adlı mağazalar fərqlənsin deyə.
    const generateSlug = (text) => {
        return text
            .toString()
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")       // boşluqlar → tire
            .replace(/[^\w\-]+/g, "")   // xüsusi simvollar silinir
            .replace(/\-\-+/g, "-")     // ardıcıl tirelər tək tirəyə endirilir
            + "-" + Math.floor(Math.random() * 10000); // unikal son rəqəm
    };
    const storeSlug = generateSlug(storeName);

    // Admin "admins" kolleksiyasına yazılır.
    // sellerStatus: "approved" — superadmin yaratdığı üçün dərhal aktiv olur.
    const admin = await Admin.create({
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

    // Mağazanın ictimai linki — adminin müştərilərə paylaşacağı URL
    const storeLink = `${process.env.FRONTEND_URL}/store/${storeSlug}`;

    // Cavabda həssas məlumatlar (phone, taxNumber, vonNumber) göndərilmir.
    res.status(201).json({
        success: true,
        message: "Admin uğurla yaradıldı",
        storeLink,
        admin: {
            id:    admin._id,
            name:  admin.name,
            email: admin.email,
            role:  admin.role,
            sellerInfo: {
                storeName:    admin.sellerInfo.storeName,
                storeSlug:    admin.sellerInfo.storeSlug,
                storeAddress: admin.sellerInfo.storeAddress,
            },
        },
    });
});


// =====================================================================
// ADMİN YENİLƏ — updateAdminBySuperAdmin
// ---------------------------------------------------------------------
// PUT /api/v1/superadmin/admin/:id
//
// SuperAdmin mövcud adminin məlumatlarını yeniləyir.
// Yalnız göndərilən sahələr yenilənir — göndərilməyənlər dəyişmir.
// =====================================================================
export const updateAdminBySuperAdmin = catchAsyncErrors(async (req, res, next) => {

    const admin = await Admin.findById(req.params.id);

    if (!admin) {
        return next(new ErrorHandler("Admin tapılmadı", 404));
    }

    const {
        name, email,
        storeName, storeAddress, phone, taxNumber, vonNumber,
        sellerStatus,
    } = req.body;

    // ── SEÇİCİ YENİLƏMƏ ─────────────────────────────────────────────
    // Hər sahə yalnız göndərilibsə yenilənir.
    // Bu, "PATCH" davranışıdır: yalnız dəyişən məlumatlar güncəllənir,
    // digərləri köhnə halda qalır.
    //
    // .trim() — başdakı/sondakı boşluqları silir.
    if (name)         admin.name         = name.trim();
    if (email)        admin.email        = email.trim();
    if (sellerStatus) admin.sellerStatus = sellerStatus;

    // sellerInfo — iç-içə (nested) obyekt, hər sahə ayrıca yenilənir.
    if (storeName)    admin.sellerInfo.storeName    = storeName.trim();
    if (storeAddress) admin.sellerInfo.storeAddress = storeAddress.trim();
    if (phone)        admin.sellerInfo.phone        = phone.trim();
    if (taxNumber)    admin.sellerInfo.taxNumber    = taxNumber.trim();
    if (vonNumber)    admin.sellerInfo.vonNumber    = vonNumber.trim();

    // validateBeforeSave: false — yalnız dəyişən sahələr güncəlləndi,
    // bütün məcburi sahələri yenidən yoxlamağa ehtiyac yoxdur.
    await admin.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: "Admin məlumatları uğurla yeniləndi",
        admin,
    });
});


// =====================================================================
// ADMİN SİL — deleteAdminBySuperAdmin
// ---------------------------------------------------------------------
// DELETE /api/v1/superadmin/admin/:id
//
// SuperAdmin bir admini sistemdən tamamilə silir.
// =====================================================================
export const deleteAdminBySuperAdmin = catchAsyncErrors(async (req, res, next) => {

    const admin = await Admin.findById(req.params.id);

    if (!admin) {
        return next(new ErrorHandler("Admin tapılmadı", 404));
    }

    // admin.deleteOne() — bu konkret sənədi silir.
    // Admin.deleteOne({_id: req.params.id}) ilə eyni nəticə verir,
    // amma mövcudluğu artıq yoxlandığı üçün daha qısa yazılır.
    await admin.deleteOne();

    // Cavabda silinən adminin adı göstərilir — superadmin nəyin silindiyini bilsin.
    res.status(200).json({
        success: true,
        message: `${admin.name} adlı admin uğurla silindi`,
    });
});


// =====================================================================
// ADMİN STATUS DƏYİŞ — updateAdminStatus
// ---------------------------------------------------------------------
// PUT /api/v1/superadmin/admin/:id/status
// Body: { sellerStatus: "approved" | "pending" }
//
// SuperAdmin admini aktivləşdirir (approved) və ya asqıya alır (pending).
// Məsələn: ödəniş edilməmiş, şikayət olan mağazalar "pending" edilir.
// =====================================================================
export const updateAdminStatus = catchAsyncErrors(async (req, res, next) => {

    const admin = await Admin.findById(req.params.id);

    if (!admin) {
        return next(new ErrorHandler("Admin tapılmadı", 404));
    }

    const { sellerStatus } = req.body;

    // Yalnız bu iki status qəbul edilir — ixtiyari string yazılmasın.
    if (!["pending", "approved"].includes(sellerStatus)) {
        return next(new ErrorHandler("Status yalnız 'pending' və ya 'approved' ola bilər", 400));
    }

    admin.sellerStatus = sellerStatus;
    await admin.save({ validateBeforeSave: false });

    // Cavabda yalnız status üçün lazımlı sahələr göndərilir.
    res.status(200).json({
        success: true,
        message: `Admin statusu '${sellerStatus}' olaraq yeniləndi`,
        admin: {
            id:           admin._id,
            name:         admin.name,
            email:        admin.email,
            sellerStatus: admin.sellerStatus,
        },
    });
});


// =====================================================================
// SUPERADMIN ŞİFRƏNİ UNUTDUM — superAdminForgotPassword
// ---------------------------------------------------------------------
// POST /api/v1/superadmin/password/forgot
//
// authController-dakı forgotPassword ilə eyni məntiq,
// amma yalnız SuperAdmin modeli üçün işləyir.
// =====================================================================
export const superAdminForgotPassword = catchAsyncErrors(async (req, res, next) => {

    const superAdmin = await SuperAdmin.findOne({ email: req.body.email });

    if (!superAdmin) {
        return next(new ErrorHandler("Bu email ilə superadmin tapılmadı", 404));
    }

    // getResetPasswordToken() — SuperAdmin modelindəki metoddur.
    //   1. Təsadüfi 20 baytlıq token yaradılır
    //   2. Token SHA-256 ilə hash edilib bazaya saxlanılır
    //   3. Token-in müddəti 30 dəqiqə təyin edilir
    //   4. Xam token qaytarılır — linkə bu yazılır
    const resetToken = superAdmin.getResetPasswordToken();
    await superAdmin.save({ validateBeforeSave: false });

    // Superadmin üçün ayrıca URL yolu: /superadmin/password/reset/...
    // Admin şifrə sıfırlama linki ilə qarışmasın deyə ayrı path istifadə olunur.
    const resetUrl = `${process.env.FRONTEND_URL}/superadmin/password/reset/${resetToken}`;
    const message  = getResetPasswordTemplate(superAdmin.name, resetUrl);

    try {
        await sendEmail({
            email:   superAdmin.email,
            subject: "SuperAdmin — Şifrənin sıfırlanması",
            message,
        });

        res.status(200).json({
            success: true,
            message: "Emailinizi yoxlayın",
        });
    } catch (err) {
        // Email göndərilə bilmədisə — bazadakı token sahələri təmizlənir.
        // İstifadəsiz token qalmasın — növbəti sorğunu bloklaya bilər.
        superAdmin.resetPasswordToken  = undefined;
        superAdmin.resetPasswordExpire = undefined;
        await superAdmin.save({ validateBeforeSave: false });

        return next(new ErrorHandler("Email göndərilərkən xəta baş verdi", 500));
    }
});


// =====================================================================
// SUPERADMIN ŞİFRƏNİ SIFIRLA — superAdminResetPassword
// ---------------------------------------------------------------------
// PUT /api/v1/superadmin/password/reset/:token
//
// Superadmin emaildəki linkə tıklayır, yeni şifrəni təyin edir.
// authController-dakı resetPassword ilə eyni məntiq.
// =====================================================================
export const superAdminResetPassword = catchAsyncErrors(async (req, res, next) => {

    // URL-dəki xam token SHA-256 ilə hash edilir —
    // bazada saxlanılan hash ilə müqayisə etmək üçün.
    // Niyə yenidən hash edirik?
    //   Bazada xam token yoxdur, yalnız hash var — təhlükəsizlik üçün.
    //   Baza sızdısa belə xam token bilinmir.
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    // Həm token uyğunluğu, həm müddət yoxlanılır.
    // $gt: Date.now() — token-in müddəti keçməyib (30 dəqiqə limiti)
    const superAdmin = await SuperAdmin.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    // Token yanlışdır və ya 30 dəqiqə keçibsə — 400 Bad Request
    if (!superAdmin) {
        return next(new ErrorHandler("Reset token yanlışdır və ya müddəti keçib", 400));
    }

    // İki dəfə daxil edilən şifrələr uyğunlaşmalıdır
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Şifrələr uyğunlaşmır", 400));
    }

    // Yeni şifrə təyin edilir — model middleware (pre save hook)
    // onu avtomatik bcrypt ilə hash edəcək.
    superAdmin.password            = req.body.password;
    // Token sahələri silinir — eyni link ikinci dəfə işləməməlidir.
    superAdmin.resetPasswordToken  = undefined;
    superAdmin.resetPasswordExpire = undefined;

    await superAdmin.save();

    // Şifrə yeniləndi — dərhal giriş etmiş sayılsın deyə token verilir.
    sendToken(superAdmin, 200, res);
});