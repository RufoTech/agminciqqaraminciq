// =====================================================================
// BLOGER MODELİ — models/Blogger.js
// ---------------------------------------------------------------------
// Bloger — sistemdə promo kod/link ilə satış edən şəxsdir.
// Hər blogerin öz unikal promo kodu və linki var.
// Komissiya faizi (20 / 30 / 40 / 41%) satış nəticəsinə görə
// adminin tərəfindən təyin edilir.
// =====================================================================

import mongoose from "mongoose";
import bcrypt   from "bcryptjs";
import jwt      from "jsonwebtoken";
import crypto   from "crypto";

// ── PROMO KOD GENERATORU ─────────────────────────────────────────────
// Ad + Soyad + Ata adından avtomatik promo kod yaradır.
// Nümunə: Aydan Rzayeva Tural → AYDAN-RZAYEVA-T
// Yalnız hərflər + defis. Azərbaycan simvolları → latın.
const azToLat = (str) =>
    str
        .replace(/ə/gi, "e").replace(/ı/gi, "i").replace(/ö/gi, "o")
        .replace(/ü/gi, "u").replace(/ç/gi, "c").replace(/ş/gi, "s")
        .replace(/ğ/gi, "g").replace(/ı/gi, "i").replace(/İ/gi, "I")
        .toUpperCase();

export const generatePromoCode = (firstName, lastName, fatherName = "") => {
    const f  = azToLat(firstName.trim());
    const l  = azToLat(lastName.trim());
    const fa = fatherName ? azToLat(fatherName.trim()).charAt(0) : "";
    const base = fa ? `${f}-${l}-${fa}` : `${f}-${l}`;
    // Unikallıq üçün 4 rəqəmli random suffix
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `${base}-${suffix}`;
};

// ── SCHEMA ───────────────────────────────────────────────────────────
const bloggerSchema = new mongoose.Schema(
    {
        // ── Şəxsi məlumatlar ─────────────────────────────────────────
        firstName: {
            type:     String,
            required: [true, "Ad mütləqdir"],
            trim:     true,
        },
        lastName: {
            type:     String,
            required: [true, "Soyad mütləqdir"],
            trim:     true,
        },
        fatherName: {
            type:    String,
            trim:    true,
            default: "",
        },

        // ── Hesab məlumatları ─────────────────────────────────────────
        email: {
            type:      String,
            required:  [true, "E-poçt mütləqdir"],
            unique:    true,
            trim:      true,
            lowercase: true,
            match:     [/\S+@\S+\.\S+/, "Düzgün e-poçt daxil edin"],
        },
        phone: {
            type: String,
            trim: true,
        },
        password: {
            type:      String,
            required:  [true, "Şifrə mütləqdir"],
            minlength: [6, "Şifrə ən az 6 simvol olmalıdır"],
            select:    false,       // sorğularda avtomatik gəlməsin
        },

        // ── Promo kod və link ─────────────────────────────────────────
        // promoCode — unikal, avtomatik yaradılır.
        // Nümunə: AYDAN-RZAYEVA-T-4821
        promoCode: {
            type:      String,
            unique:    true,
            uppercase: true,
            trim:      true,
        },

        // promoLink — tam URL. Yaradılma zamanı avtomatik set edilir.
        // Nümunə: https://siteniz.az/ref/AYDAN-RZAYEVA-T-4821
        promoLink: {
            type: String,
            trim: true,
        },

        // ── Komissiya sistemi ─────────────────────────────────────────
        // commissionRate — adminin təyin etdiyi faiz (20 / 30 / 40 / 41)
        commissionRate: {
            type: Number,
            enum: {
                values:  [20, 30, 40, 41],
                message: "Komissiya faizi 20, 30, 40 və ya 41 ola bilər",
            },
            default: 40,
        },

        // commissionDuration — ödəniş neçə ay davam edir (default: 6)
        commissionDuration: {
            type:    Number,
            default: 6,
        },

        // commissionStartDate — komissiya başlama tarixi
        commissionStartDate: {
            type:    Date,
            default: null,
        },

        // ── Statistika ───────────────────────────────────────────────
        // totalReferrals — gətirdiyi alıcı sayı
        totalReferrals: {
            type:    Number,
            default: 0,
        },
        // totalSalesAmount — promo kodu ilə edilən ümumi satış miqdarı (AZN)
        // (köhnə sahə adı "totalSales" idi — "totalSalesAmount" ilə uyğunlaşdırıldı)
        totalSalesAmount: {
            type:    Number,
            default: 0,
        },
        // totalCommissionEarned — bugünə qədər qazanılan komissiya (AZN)
        totalCommissionEarned: {
            type:    Number,
            default: 0,
        },
        // totalCommissionPaid — ödənilmiş komissiya (AZN)
        totalCommissionPaid: {
            type:    Number,
            default: 0,
        },

        // ── Status ───────────────────────────────────────────────────
        isActive: {
            type:    Boolean,
            default: true,
        },

        // ── Şifrə sıfırlama ───────────────────────────────────────────
        resetPasswordToken:  String,
        resetPasswordExpire: Date,

        // ── Rol ──────────────────────────────────────────────────────
        role: {
            type:    String,
            default: "blogger",
            enum:    ["blogger"],
        },
    },
    {
        timestamps: true,   // createdAt, updatedAt avtomatik
    }
);


// =====================================================================
// HOOKS (PRE-SAVE)
// =====================================================================

// ── Şifrəni hash-lə ──────────────────────────────────────────────────
// Şifrə dəyişdikdə və ya ilk dəfə yaradıldıqda bcrypt ilə hash-lənir.
bloggerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// ── Promo kod / link avtomatik yarat ─────────────────────────────────
// promoCode yoxdursa → yarad. promoLink yoxdursa → yarad.
bloggerSchema.pre("save", function (next) {
    if (!this.promoCode) {
        this.promoCode = generatePromoCode(
            this.firstName,
            this.lastName,
            this.fatherName
        );
    }
    if (!this.promoLink) {
        const base = process.env.FRONTEND_URL || "https://siteniz.az";
        this.promoLink = `${base}/ref/${this.promoCode}`;
    }
    next();
});


// =====================================================================
// METODLAR
// =====================================================================

// ── Şifrəni müqayisə et ──────────────────────────────────────────────
bloggerSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// ── JWT token yarat ───────────────────────────────────────────────────
bloggerSchema.methods.getJwtToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_TIME || "7d" }
    );
};

// ── Şifrə sıfırlama tokeni yarat ─────────────────────────────────────
bloggerSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 dəq
    return resetToken;
};

// ── Komissiya dövrü aktiv mi? ─────────────────────────────────────────
// commissionStartDate-dən commissionDuration ay keçibsə false qaytarır.
bloggerSchema.methods.isCommissionActive = function () {
    if (!this.commissionStartDate) return false;
    const monthsPassed =
        (Date.now() - new Date(this.commissionStartDate).getTime()) /
        (1000 * 60 * 60 * 24 * 30);
    return monthsPassed < this.commissionDuration;
};


// =====================================================================
export default mongoose.model("Blogger", bloggerSchema);