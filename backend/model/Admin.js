// mongoose — MongoDB ilə işləmək üçün kitabxana.
// Schema, model, validasiya hamısı buradan gəlir.
import mongoose from "mongoose";

// bcryptjs — şifrələri hash etmək və müqayisə etmək üçün kitabxana.
// Şifrə heç vaxt açıq mətn halında bazada saxlanılmır.
import bcrypt from "bcryptjs";

// jsonwebtoken — JWT token yaratmaq üçün kitabxana.
// Giriş uğurlu olduqda istifadəçiyə token verilir.
import jwt from "jsonwebtoken";

// crypto — Node.js-in daxili kriptoqrafiya modulu.
// Şifrə sıfırlama üçün təsadüfi token yaratmaqda istifadə olunur.
import crypto from "crypto";


// =====================================================================
// ADMİN SCHEMA-SI
// ---------------------------------------------------------------------
// Niyə Admin üçün ayrı model?
//   Admin (satıcı) adi User-dən fərqlidir — mağaza adı, vergi nömrəsi,
//   storeSlug kimi əlavə sahələri var.
//   Ayrı model bu sahələri Schema səviyyəsində idarə edir,
//   User modelini şişirtmir.
//   Hər ikisi fərqli kolleksiyalarda saxlanılır:
//   Admin → "admins", User → "users"
// =====================================================================
const adminSchema = new mongoose.Schema(
    {
        // ── ƏSAS MƏLUMATLAR ──────────────────────────────────────────
        name: {
            type: String,
            required: [true, "Adınızı daxil edin"],       // boş buraxıla bilməz
            maxLength: [50, "Adınız maksimum 50 simvoldan ibarət olmalıdır"],
        },
        email: {
            type: String,
            required: [true, "Emailinizi daxil edin"],
            unique: true,  // eyni email ilə iki admin ola bilməz — MongoDB index yaradır
        },
        password: {
            type: String,
            required: [true, "Şifrənizi daxil edin"],
            // select: false — sorğularda şifrə avtomatik GƏLMİR.
            // Admin.findOne({email}) çağıranda şifrə daxil olmur.
            // Şifrəni görmək üçün: Admin.findOne({email}).select("+password")
            // Bu, təhlükəsizlik üçün vacibdir — şifrə lazımsız yerlərə getmir.
            select: false,
            minLength: [8, "Şifrənin minimum uzunluğu 8 simvol olmalıdır"],
        },
        avatar: {
            public_id: String, // Cloudinary-dəki unikal ID (silmək üçün lazımdır)
            url:       String, // Şəkil linki (frontend-ə göndərilir)
        },
        role: {
            type:      String,
            default:   "admin",
            // immutable: true — bu sahə bir dəfə təyin edildikdən sonra dəyişdirilə bilməz.
            // Heç kim admin-i "superadmin" etmək üçün role sahəsini dəyişdirə bilmir.
            // Təhlükəsizlik üçün vacibdir.
            immutable: true,
        },

        // ── MAĞAZA (SATICI) MƏLUMATLAR ───────────────────────────────
        // sellerInfo — admin-in mağazasına aid bütün məlumatlar bu alt-obyektdə.
        // Niyə alt-obyekt? Strukturu aydın saxlayır — mağaza məlumatı ayrıca qrupdadır.
        sellerInfo: {
            storeName: {
                type:     String,
                required: [true, "Mağaza adı daxil edin"],
            },
            storeSlug: {
                type:   String,
                unique: true,  // eyni slug-la iki mağaza ola bilməz (URL unikallığı)
                // sparse: true — null/undefined dəyərlər unique indexdən istisna edilir.
                // Niyə lazımdır? Əgər sparse olmasaydı, slug olmayan sənədlər
                // "null" kimi sayılır və bir neçə null olduqda unique xətası verərdi.
                sparse: true,
            },
            storeAddress: {
                type:     String,
                required: [true, "Mağaza ünvanı daxil edin"],
            },
            phone: {
                type:     String,
                required: [true, "Telefon nömrəsi daxil edin"],
            },
            taxNumber: {
                type:     String,
                required: [true, "Vergi nömrəsi daxil edin"],
            },
            vonNumber: {
                type:     String,
                required: [true, "VÖN nömrəsi daxil edin"],
            },
        },

        // ── SATICI STATUSU ───────────────────────────────────────────
        // enum — yalnız bu iki dəyər qəbul edilir, başqası ValidationError atar.
        //   "pending"  → qeydiyyat edilib, superadmin hələ təsdiq etməyib
        //   "approved" → aktiv, mağaza açıqdır
        //
        // default: "approved" — niyə birbaşa approved?
        //   authController-dakı registerUser-dən yaradılırsa → "approved" olur.
        //   superAdminController-dən yaradılırsa da → "approved" olur.
        //   Lazım gəlsə superadmin sonradan "pending" edə bilər.
        sellerStatus: {
            type:    String,
            enum:    ["pending", "approved"],
            default: "approved",
        },

        // ── ŞİFRƏ SIFIRLAМА SAHƏLƏRİ ────────────────────────────────
        // Bu sahələr yalnız "şifrəmi unutdum" axınında doldurulur.
        // Normal hallarda undefined qalır — bazada yer tutmur.
        resetPasswordToken:  String, // SHA-256 hash edilmiş token (bazada saxlanılır)
        resetPasswordExpire: Date,   // Token-in bitmə tarixi (30 dəqiqə sonra)
    },
    {
        // timestamps: true — Mongoose avtomatik iki sahə əlavə edir:
        //   createdAt → sənəd yaradılan tarix
        //   updatedAt → sənəd son dəfə yenilənən tarix
        // Bu sahələri əl ilə yazmaq lazım deyil — Mongoose idarə edir.
        timestamps: true,
    }
);


// =====================================================================
// ŞİFRƏ HASH-LƏMƏ — pre("save") hook
// ---------------------------------------------------------------------
// Admin bazaya YAZILMAZDAN ƏVVƏL bu funksiya çağırılır.
//
// Niyə hook istifadə olunur?
//   Şifrəni controller-də hash etmək olardı, amma hər yerdə əl ilə
//   yazmaq unutmaq riski yaradır. Hook avtomatik işləyir — unutmaq mümkün deyil.
//
// isModified("password") — niyə vacibdir?
//   .save() hər çağırılanda hook işləyir (şifrə dəyişməsə belə).
//   Məsələn: admin.name = "Yeni Ad"; admin.save();
//   Bu zaman şifrə dəyişməyib — yenidən hash etmək yanlışdır.
//   isModified("password") → false → hash edilmir → next() ilə keçilir.
//   Şifrə dəyişibsə → true → hash edilir.
// =====================================================================
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    // bcrypt.hash(şifrə, saltRounds):
    //   saltRounds = 10 → 2^10 = 1024 dəfə şifrələnir.
    //   Daha çox round → daha güvənli, amma daha yavaş.
    //   10 — sürət/təhlükəsizlik balansı üçün standart dəyərdir.
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


// =====================================================================
// JWT TOKEN YARAT — jwtTokeniEldeEt()
// ---------------------------------------------------------------------
// Giriş uğurlu olduqda sendToken() bu metodu çağırır.
//
// jwt.sign(payload, secret, options):
//   payload → token-ə yazılan məlumatlar:
//     id    → admin-in MongoDB _id-si (kim olduğunu bilmək üçün)
//     model → "Admin" — isAuthenticatedUser-da hansı kolleksiyada
//             axtarış ediləcəyini bilmək üçün lazımdır.
//             Bu olmasa Admin-i User-dən ayırd etmək mümkün olmazdı.
//   secret    → imzalama açarı (JWT_SECRET_KEY)
//   expiresIn → token-in etibarlılıq müddəti (JWT_EXPIRES_TIME = "7d")
// =====================================================================
adminSchema.methods.jwtTokeniEldeEt = function () {
    return jwt.sign(
        { id: this._id, model: "Admin" },
        process.env.JWT_SECRET_KEY,
        { expiresIn: String(process.env.JWT_EXPIRES_TIME) }
    );
};


// =====================================================================
// ŞİFRƏ MÜQAYİSƏSİ — shifreleriMuqayiseEt()
// ---------------------------------------------------------------------
// Giriş zamanı istifadəçinin daxil etdiyi şifrəni bazadakı hash ilə müqayisə edir.
//
// bcrypt.compare(açıqŞifrə, hashliŞifrə):
//   Daxil edilən şifrəni eyni alqoritmlə hash edib bazadakı hash ilə müqayisə edir.
//   true  → şifrələr uyğundur
//   false → şifrələr uyğun deyil
//
// Niyə birbaşa müqayisə etmirik? (enteredPassword === this.password)
//   Bazada açıq şifrə saxlanılmır — yalnız hash var.
//   "salam123" → "$2b$10$abc..." kimi hash-ə çevrilib.
//   Birbaşa müqayisə heç vaxt uyğun gəlməz.
// =====================================================================
adminSchema.methods.shifreleriMuqayiseEt = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


// =====================================================================
// ŞİFRƏ SIFIRLAМА TOKENI — getResetPasswordToken()
// ---------------------------------------------------------------------
// "Şifrəmi unutdum" funksiyasında çağırılır.
// İstifadəçiyə email-də göndəriləcək token yaradır.
//
// Niyə xam token email-ə, hash bazaya yazılır?
//   Baza sızdısa belə hücumçu xam token-i bilmir.
//   Yalnız istifadəçinin emailinə gələn xam token-i bilən şifrəni dəyişə bilər.
// =====================================================================
adminSchema.methods.getResetPasswordToken = function () {

    // crypto.randomBytes(20) — 20 baytlıq kriptoqrafik təsadüfi məlumat.
    // .toString("hex") — hexadecimal stringə çevirir (40 simvollu).
    // Məsələn: "a3f8b2c9d1e4..." — email linkdə bu göndərilir.
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Xam token SHA-256 ilə hash edilib bazaya yazılır.
    // createHash("sha256") → hash alqoritmini seç
    // .update(resetToken)  → hash ediləcək məlumat
    // .digest("hex")       → hex formatında nəticə
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // Token-in müddəti: Date.now() + 30 dəqiqə (millisaniyə ilə)
    // 30 * 60 * 1000 = 1,800,000 millisaniyə = 30 dəqiqə
    // Bu müddət keçdikdən sonra token işləmir — resetPassword-da yoxlanılır.
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    // Xam (hash edilməmiş) token qaytarılır — email linkdə bu istifadə olunur.
    // Hash bazada qalır, xam token yalnız email-dədir.
    return resetToken;
};


// =====================================================================
// MODEL EXPORT
// ---------------------------------------------------------------------
// mongoose.model("Admin", adminSchema):
//   "Admin" → kolleksiya adı "admins" olur (mongoose avtomatik çoxluq edir).
//   User.js-dəki mongoose.model("User", ...) → "users" kolleksiyası.
//   Bu sayəsində hər model ayrı kolleksiyada saxlanılır.
// =====================================================================
export default mongoose.model("Admin", adminSchema);