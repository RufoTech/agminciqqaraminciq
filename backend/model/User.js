// mongoose — MongoDB ilə işləmək üçün kitabxana.
import mongoose from "mongoose";

// bcryptjs — şifrələri hash etmək və müqayisə etmək üçün kitabxana.
import bcrypt from "bcryptjs";

// jsonwebtoken — JWT token yaratmaq üçün kitabxana.
import jwt from "jsonwebtoken";

// crypto — Node.js-in daxili kriptoqrafiya modulu.
// Şifrə sıfırlama tokeni yaratmaq üçün istifadə olunur.
import crypto from "crypto";


// =====================================================================
// İSTİFADƏÇİ SCHEMA-SI — userSchema
// ---------------------------------------------------------------------
// Bu model iki tip istifadəçini eyni kolleksiyada saxlayır:
//   role: "user"  → adi alıcı (sellerInfo boşdur)
//   role: "admin" → satıcı (sellerInfo dolu, sellerStatus = "approved")
//
// Admin.js ilə fərqi:
//   Admin.js  → ayrı "admins" kolleksiyası, mağaza sahələri məcburidir.
//   User.js   → "users" kolleksiyası, mağaza sahələri default: null.
//   Bu fərqli yanaşmalar bir layihədə bir arada mövcuddur —
//   authController-da qeydiyyat zamanı role-a görə ayrılır:
//     role="admin" → Admin.create() (admins kolleksiyasına)
//     role="user"  → User.create()  (users kolleksiyasına)
// =====================================================================
const userSchema = new mongoose.Schema(
    {
        // ── ƏSAS MƏLUMATLAR ──────────────────────────────────────────
        name: {
            type:      String,
            required:  [true, "Adınızı daxil edin"],
            maxLength: [50, "Adınız maksimum 50 simvoldan ibarət olmalıdır"],
        },
        email: {
            type:     String,
            required: [true, "Emailinizi daxil edin"],
            unique:   true, // eyni email ilə iki istifadəçi ola bilməz
        },
        password: {
            type:      String,
            required:  [true, "Şifrənizi daxil edin"],
            // select: false — şifrə sorğularda avtomatik GƏLMİR.
            // Giriş zamanı: User.findOne({email}).select("+password") lazımdır.
            select:    false,
            minLength: [8, "Şifrənin minimum uzunluğu 8 simvol olmalıdır"],
        },
        avatar: {
            public_id: String, // Cloudinary-dəki unikal ID (silmək üçün)
            url:       String, // Şəkil linki (frontend-ə göndərilir)
        },

        // ── ROL ──────────────────────────────────────────────────────
        // enum — yalnız "user" və ya "admin" qəbul edilir.
        // default: "user" — qeydiyyat zamanı rol göndərilməsə alıcı olur.
        //
        // Admin.js-dəki role ilə fərqi:
        //   Admin.js: immutable: true — heç vaxt dəyişdirilə bilməz.
        //   User.js:  immutable yoxdur — "user" → "admin"-ə keçiş mümkündür.
        //   Bu, satıcı olmaq üçün qeydiyyat axınında istifadə olunur.
        role: {
            type:    String,
            enum:    ["user", "admin"],
            default: "user",
        },

        // ── MAĞAZA (SATICI) MƏLUMATLAR ───────────────────────────────
        // sellerInfo — yalnız role="admin" olan istifadəçilər üçün doldurulur.
        // Adi istifadəçilər üçün bütün sahələr default: null qalır.
        //
        // Admin.js-dəki sellerInfo ilə fərqi:
        //   Admin.js: sahələr required: true — məcburidir.
        //   User.js:  sahələr default: null — isteğe bağlıdır.
        sellerInfo: {
            storeName: {
                type:    String,
                default: null,
            },
            storeSlug: {
                type:   String,
                unique: true,
                // sparse: true — null/undefined dəyərlər unique indexdən istisna edilir.
                // Bütün adi istifadəçilərin storeSlug-u null-dır.
                // sparse olmasaydı — ikinci null dəyər unique xətası verərdi.
                sparse: true,
            },
            storeAddress: {
                type:    String,
                default: null,
            },
            phone: {
                type:    String,
                default: null,
            },
            taxNumber: {
                type:    String,
                default: null,
            },
            vonNumber: {
                type:    String,
                default: null,
            },
        },

        // ── SATICI STATUSU ───────────────────────────────────────────
        // enum — üç vəziyyət:
        //   "none"     → adi alıcı, satıcı olmaq istəmir
        //   "pending"  → satıcı olmaq üçün müraciət edilib, superadmin gözlənilir
        //   "approved" → satıcı kimi təsdiqlənib, aktiv mağaza var
        //
        // Admin.js-dəki sellerStatus ilə fərqi:
        //   Admin.js: enum: ["pending", "approved"] — "none" yoxdur (hər admin satıcıdır)
        //   User.js:  enum: ["none", "pending", "approved"] — "none" default
        sellerStatus: {
            type:    String,
            enum:    ["none", "pending", "approved"],
            default: "none",
        },

        // ── TELEFON VƏ DOĞRULAMA ─────────────────────────────────────
        // Adi istifadəçilər register zamanı telefon vermir.
        // Bonus istifadəsindən əvvəl telefon doğrulanması tələb olunur.
        phone: {
            type:    String,
            default: null,
        },
        isPhoneVerified: {
            type:    Boolean,
            default: false,
        },
        // OTP sahələri — select: false ilə gizlədilir.
        // requestPhoneOtp zamanı doldurulur, verifyPhoneOtp sonrası silinir.
        phoneOtp: {
            type:   String,
            select: false,
        },
        phoneOtpExpire: {
            type: Date,
        },

        // ── REFERRAL ─────────────────────────────────────────────────
        // referralCode — register zamanı auto-generasiya edilən 8 simvollu unikal kod.
        // Məsələn: "A3F9B2D1"
        // sparse: true — null/undefined dəyərlər unique indexdən istisna edilir.
        referralCode: {
            type:   String,
            unique: true,
            sparse: true,
        },
        // referredBy — bu istifadəçini dəvət edən istifadəçinin ID-si.
        // Yalnız qeydiyyat zamanı ?ref=KOD parametri ötürüldükdə doldurulur.
        referredBy: {
            type:    mongoose.Schema.Types.ObjectId,
            ref:     "User",
            default: null,
        },

        // ── BONUS BALANSI ─────────────────────────────────────────────
        // Denormalizasiya: sürətli oxuma üçün cari bonus balansı.
        // Həqiqi mənbə: BonusTransaction ledger.
        // syncBonusBalance() hər earn/use/expire əməliyyatından sonra yeniləyir.
        bonusBalance: {
            type:    Number,
            default: 0,
            min:     0,
        },

        // ── BLOK ─────────────────────────────────────────────────────
        // SuperAdmin tərəfindən bloklanmış istifadəçilər sisteme daxil ola bilməz.
        isBlocked:   { type: Boolean, default: false },
        blockReason: { type: String,  default: ""    },

        // ── ŞİFRƏ SIFIRLAМА SAHƏLƏRİ ─────────────────────────────────
        // Normal hallarda undefined qalır.
        // "Şifrəmi unutdum" axınında getResetPasswordToken() tərəfindən doldurulur.
        resetPasswordToken:  String, // SHA-256 hash edilmiş token
        resetPasswordExpire: Date,   // Bitmə tarixi (30 dəqiqə)
    },
    {
        timestamps: true, // createdAt və updatedAt avtomatik əlavə olunur
    }
);


// =====================================================================
// KÖHNƏ İNDEKSLƏRİ SİL — pre("save") hook
// ---------------------------------------------------------------------
// Bu hook niyə lazımdır?
//   Əvvəlki versiyada User modelinə "phone" sahəsi əlavə edilmişdi
//   və bu sahə üzərində unique index ("phone_1") yaradılmışdı.
//   Sonradan "phone" sahəsi silindi — amma index bazada qaldı.
//   Bu köhnə index hər .save() əməliyyatında xəta verirdi.
//
// Həll:
//   İlk .save() çağırışında index mövcuddursa sil, sonra keç.
//   Niyə hər save-də yoxlanılır?
//   Bir dəfə silindikdən sonra index yoxdur — sonrakı yoxlamalar
//   catch blokuna düşür (xəta yox) və səssiz keçir.
//
// Qeyd: İstehsal mühitinə keçdikdə bu hook silinə bilər —
//   artıq köhnə index qalmayacaq.
// =====================================================================
userSchema.pre("save", async function (next) {
    try {
        const collection  = mongoose.connection.collection("users");
        const indexes     = await collection.indexes();
        const phoneIndex  = indexes.find((i) => i.name === "phone_1");
        if (phoneIndex) {
            await collection.dropIndex("phone_1");
            console.log("✅ Köhnə phone_1 indeksi uğurla silindi");
        }
    } catch (err) {
        // İndeks artıq yoxdursa — xəta atılmır, səssiz keçilir.
        // Bu catch bloku məqsədli olaraq boşdur.
    }
    next();
});


// =====================================================================
// ŞİFRƏ HASH-LƏMƏ — pre("save") hook
// ---------------------------------------------------------------------
// İstifadəçi bazaya yazılmazdan əvvəl şifrə bcrypt ilə hash edilir.
// Admin.js və SuperAdmin.js ilə eyni məntiq.
//
// isModified("password") — yalnız şifrə dəyişdikdə hash edilir.
// Ad, email kimi sahələr dəyişdikdə şifrəyə toxunulmur.
// =====================================================================
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


// =====================================================================
// JWT TOKEN YARAT — jwtTokeniEldeEt()
// ---------------------------------------------------------------------
// Admin.js və SuperAdmin.js ilə eyni məntiq.
// Fərq: model: "User" — isAuthenticatedUser middleware-i
//   User kolleksiyasında axtarış edəcəyini bilir.
// =====================================================================
userSchema.methods.jwtTokeniEldeEt = function () {
    return jwt.sign(
        { id: this._id, model: "User" },
        process.env.JWT_SECRET_KEY,
        { expiresIn: String(process.env.JWT_EXPIRES_TIME) }
    );
};


// =====================================================================
// ŞİFRƏ MÜQAYİSƏSİ — shifreleriMuqayiseEt()
// ---------------------------------------------------------------------
// Giriş zamanı daxil edilən şifrəni hash ilə müqayisə edir.
// Admin.js və SuperAdmin.js ilə eynidir.
// =====================================================================
userSchema.methods.shifreleriMuqayiseEt = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


// =====================================================================
// ŞİFRƏ SIFIRLAМА TOKENI — getResetPasswordToken()
// ---------------------------------------------------------------------
// "Şifrəmi unutdum" axınında çağırılır.
// Admin.js və SuperAdmin.js ilə tam eyni məntiq.
//
// Xam token → email linkinə (istifadəçi görür)
// Hash token → bazaya (hücumçu bazanı görsə belə bilmir)
// =====================================================================
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // 30 dəqiqə etibarlıdır
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    return resetToken;
};


// =====================================================================
// MODEL EXPORT
// ---------------------------------------------------------------------
// mongoose.model("User", userSchema):
//   "User" → kolleksiya adı "users" olur.
// =====================================================================
export default mongoose.model("User", userSchema);