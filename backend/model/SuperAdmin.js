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
// SUPERADMIN SCHEMA-SI — superAdminSchema
// ---------------------------------------------------------------------
// SuperAdmin sistemin ən yüksək səlahiyyətli istifadəçisidir.
//
// Admin.js ilə müqayisə:
//   Admin    → sellerInfo (mağaza məlumatları), sellerStatus var
//   SuperAdmin → bunlar yoxdur — mağaza sahibi deyil, sistem idarəçisidir
//
// Üç model arasındakı fərq:
//   User       → "users" kolleksiyası       — alıcılar
//   Admin      → "admins" kolleksiyası      — satıcılar
//   SuperAdmin → "superadmins" kolleksiyası — sistem idarəçisi
//
// Niyə ayrı kolleksiya?
//   SuperAdmin çox nadir hallarda giriş edir (yalnız sistem idarəsi üçün).
//   Ayrı kolleksiyada saxlamaq icazə yoxlamasını sadələşdirir:
//   isAuthenticatedUser-da decoded.model === "SuperAdmin" yoxlaması.
// =====================================================================
const superAdminSchema = new mongoose.Schema(
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
            // unique: true silindi — eyni email ilə birdən çox superadmin
            // yaradıla bilər. Hər superadminin emaili eynidir, yalnız adı fərqlidir.
        },
        password: {
            type:      String,
            required:  [true, "Şifrənizi daxil edin"],
            // select: false — şifrə sorğularda avtomatik GƏLMİR.
            // Yalnız .select("+password") ilə açıq istənildikdə gəlir.
            // superAdminLogin-da: SuperAdmin.findOne({email}).select("+password")
            select:    false,
            minLength: [8, "Şifrənin minimum uzunluğu 8 simvol olmalıdır"],
        },
        avatar: {
            public_id: String, // Cloudinary-dəki unikal ID
            url:       String, // Şəkil linki
        },
        role: {
            type:      String,
            default:   "superadmin",
            // immutable: true — bu sahə bir dəfə "superadmin" təyin edildikdən
            // sonra heç cür dəyişdirilə bilməz.
            // Niyə vacibdir?
            //   Kimsə role-u "admin"-ə endirsə — isSuperAdmin middleware-i
            //   artıq işləməz. immutable bu cür hücumun qarşısını alır.
            immutable: true,
        },

        // ── ŞİFRƏ SIFIRLAМА SAHƏLƏRİ ─────────────────────────────────
        // Normal hallarda undefined qalır — yalnız "şifrəmi unutdum" axınında doldurulur.
        resetPasswordToken:  String, // SHA-256 hash edilmiş token (bazada)
        resetPasswordExpire: Date,   // Token-in bitmə tarixi (30 dəqiqə)
    },
    {
        // timestamps: true — createdAt və updatedAt avtomatik əlavə olunur.
        timestamps: true,
    }
);


// =====================================================================
// KÖHNƏ UNIQUE INDEX SİL — mongoose connection hook
// ---------------------------------------------------------------------
// Əvvəllər email sahəsində unique: true var idi — MongoDB-də index yarandı.
// Model dəyişsə də MongoDB-dəki köhnə index qalır.
// Server hər işə düşəndə bu hook həmin indexi avtomatik silir.
// Index artıq yoxdursa — xəta verməsin deyə try/catch istifadə olunur.
// =====================================================================
mongoose.connection.on("connected", async () => {
    try {
        await mongoose.connection.collection("superadmins").dropIndex("email_1");
        console.log("✅ SuperAdmin email_1 unique index silindi");
    } catch (err) {
        // Index artıq yoxdur — xəta gözləniləndir, ignore edilir
    }
});


// =====================================================================
// ŞİFRƏ HASH-LƏMƏ — pre("save") hook
// ---------------------------------------------------------------------
// SuperAdmin bazaya YAZILMAZDAN ƏVVƏL şifrə hash edilir.
// Admin.js-dəki hook ilə tam eynidir.
//
// isModified("password") — niyə vacibdir?
//   .save() hər çağırılanda hook işləyir.
//   Şifrə dəyişməyibsə — yenidən hash etmək yanlışdır (köhnə hash pozulur).
//   isModified("password") yalnız şifrə dəyişdikdə true qaytarır.
// =====================================================================
superAdminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    // saltRounds = 10 → sürət/təhlükəsizlik balansı üçün standart dəyər
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


// =====================================================================
// JWT TOKEN YARAT — jwtTokeniEldeEt()
// ---------------------------------------------------------------------
// sendToken() bu metodu çağırır — giriş uğurlu olduqda.
//
// Admin.js-dən fərqi:
//   Admin:      { id, model: "Admin" }
//   SuperAdmin: { id, model: "SuperAdmin" }
//
// model: "SuperAdmin" — isAuthenticatedUser middleware-inda
// SuperAdmin kolleksiyasında axtarış ediləcəyini bildirir:
//   if (decoded.model === "SuperAdmin") → SuperAdmin.findById(decoded.id)
// =====================================================================
superAdminSchema.methods.jwtTokeniEldeEt = function () {
    return jwt.sign(
        { id: this._id, model: "SuperAdmin" },
        process.env.JWT_SECRET_KEY,
        { expiresIn: String(process.env.JWT_EXPIRES_TIME) }
    );
};


// =====================================================================
// ŞİFRƏ MÜQAYİSƏSİ — shifreleriMuqayiseEt()
// ---------------------------------------------------------------------
// Giriş zamanı daxil edilən şifrəni bazadakı hash ilə müqayisə edir.
//
// bcrypt.compare(açıqŞifrə, hashliŞifrə):
//   "salam123" vs "$2b$10$abc..." → true (uyğundur)
//   "yanlış"   vs "$2b$10$abc..." → false (uyğun deyil)
// =====================================================================
superAdminSchema.methods.shifreleriMuqayiseEt = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


// =====================================================================
// ŞİFRƏ SIFIRLAМА TOKENI — getResetPasswordToken()
// ---------------------------------------------------------------------
// "Şifrəmi unutdum" axınında çağırılır.
// Admin.js ilə tam eyni məntiq — yalnız SuperAdmin modelinə tətbiq edilir.
//
// Xam token → email linkinə yazılır (istifadəçi görür).
// Hash token → bazaya yazılır (hücumçu bazanı görsə belə token bilmir).
// =====================================================================
superAdminSchema.methods.getResetPasswordToken = function () {

    // 20 baytlıq kriptoqrafik təsadüfi token → 40 simvollu hex string
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Xam token SHA-256 ilə hash edilib bazaya yazılır
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // 30 dəqiqə etibarlıdır: Date.now() + 30 * 60 * 1000 ms
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    // Xam token qaytarılır — email linkdə bu istifadə olunur
    return resetToken;
};


// =====================================================================
// MODEL EXPORT
// ---------------------------------------------------------------------
// mongoose.model("SuperAdmin", superAdminSchema):
//   "SuperAdmin" → kolleksiya adı "superadmins" olur.
//
// email sahəsində unique: true yoxdur — eyni email ilə
// istənilən qədər superadmin yaradıla bilər.
// Yalnız ad fərqlidir, email və şifrə hamısında eynidir.
// =====================================================================
export default mongoose.model("SuperAdmin", superAdminSchema);