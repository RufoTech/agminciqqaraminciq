import mongoose from "mongoose";

// =====================================================================
// BONUS TRANSAKSİYA SCHEMA-SI — bonusTransactionSchema
// ---------------------------------------------------------------------
// Hər bonus hərəkəti ayrı sənəd kimi saxlanılır (ledger modeli).
// Bu yanaşma:
//   — FIFO expiry-ni mümkün edir (ən köhnə bonuslar əvvəl xərclənir)
//   — Tam audit trail təmin edir (hər bonus nə vaxt, niyə verildi)
//   — Bonus hesablamasını sadələşdirir (balance = sum of earn - sum of use)
// =====================================================================
const bonusTransactionSchema = new mongoose.Schema(
    {
        // ── İSTİFADƏÇİ ──────────────────────────────────────────────
        user: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "User",
            required: true,
        },

        // ── TRANSAKSİYA NÖV ────────────────────────────────────────
        // "earn"   → bonus qazanıldı (cart, referral, review, admin)
        // "use"    → bonus istifadə edildi (sifarişdə endirim)
        // "expire" → bonusun vaxtı keçdi (FIFO son tarix)
        type: {
            type:     String,
            enum:     ["earn", "use", "expire"],
            required: true,
        },

        // ── QAYNAQ ──────────────────────────────────────────────────
        // Bonusun haradan qazanıldığını/istifadə edildiyini göstərir.
        // "cart"     → sifariş delivered olduqda
        // "referral" → referral istifadəçinin ilk sifarişi çatanda
        // "review"   → məhsula rəy yazıldıqda
        // "admin"    → manual admin əlavəsi
        source: {
            type:     String,
            enum:     ["cart", "referral", "review", "admin", "use", "expire"],
            required: true,
        },

        // ── MİQDAR ──────────────────────────────────────────────────
        // Həmişə müsbət ədəd.
        // "type" sahəsi istiqaməti müəyyən edir:
        //   earn   → +amount (qazanıldı)
        //   use    → -amount (xərcləndi, amma burada müsbət saxlanılır)
        //   expire → -amount (vaxtı keçdi)
        amount: {
            type:     Number,
            required: true,
            min:      0,
        },

        // ── SİFARİŞ REFERANSİ ───────────────────────────────────────
        // cart earn → sifarişin ID-si
        // use       → bonus istifadə edilən sifarişin ID-si
        // Digər növlər üçün null.
        orderId: {
            type:    mongoose.Schema.Types.ObjectId,
            ref:     "Order",
            default: null,
        },

        // ── REFERRAL REFERANSİ ──────────────────────────────────────
        // "referral" source üçün: kimin sayəsində bonus qazanıldı.
        // User A → User B gətirdi → User B-nin ID-si buradadır.
        referredUserId: {
            type:    mongoose.Schema.Types.ObjectId,
            ref:     "User",
            default: null,
        },

        // ── KAMPANIYA ÇARPANI ────────────────────────────────────────
        // Bonus qazanıldığı anda aktiv kampaniya çarpanı.
        // Normal gün: 1, Kampaniya günü: 2, 3 və ya 5.
        // Qeyd: final amount = base × multiplier (artıq hesablanmış verilir)
        // Bu sahə yalnız qeyd məqsədlidir — niyə çox bonus verildi audit üçün.
        multiplier: {
            type:    Number,
            default: 1,
            min:     1,
        },

        // ── VAXTININ KEÇMƏ TARİXİ ────────────────────────────────────
        // "earn" tipli əməliyyatlar üçün: createdAt + config.bonusExpiryDays
        // "use" və "expire" tipləri üçün null.
        // FIFO redeemində: expiresAt ASC sıralama ilə ən köhnə əvvəl xərclənir.
        expiresAt: {
            type:    Date,
            default: null,
        },

        // ── İSTİFADƏ VƏZİYYƏTİ ──────────────────────────────────────
        // false → bonus hələ istifadə edilməyib (redeemable)
        // true  → bonus artıq xərclənib (non-redeemable)
        // Yalnız "earn" tipli sənədlər üçün mənalıdır.
        isUsed: {
            type:    Boolean,
            default: false,
        },

        // ── VAXTININ KEÇMƏ VƏZİYYƏTİ ───────────────────────────────
        // false → bonus hələ keçərlidir
        // true  → bonusun vaxtı keçib, artıq istifadə edilə bilməz
        // Yalnız "earn" tipli sənədlər üçün mənalıdır.
        isExpired: {
            type:    Boolean,
            default: false,
        },

        // ── CİHAZ PARMAQİZİ ─────────────────────────────────────────
        // Fraud aşkarlama üçün: frontend-dən gələn cihaz fingerprint.
        // İstəyə bağlıdır (X-Device-ID header-dən).
        // Bir cihazdan çox hesab bonus qazanırsa → flag.
        deviceId: {
            type:    String,
            default: null,
        },

        // ── SUİSTİMAL BAYRAĞI ────────────────────────────────────────
        // Anomaly detection tərəfindən şüphəli hesablamalar üçün true edilir.
        // Flagged hesablara bonus verilmir.
        flagged: {
            type:    Boolean,
            default: false,
        },

        // ── QEYD ─────────────────────────────────────────────────────
        // İnsan tərəfindən oxunan izahat (admin əlavəsi, anomaly qeydi).
        note: {
            type:    String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);


// =====================================================================
// İNDEKSLƏR
// ---------------------------------------------------------------------
// FIFO redeemind üçün: istifadəçinin aktiv bonus-larını ən köhnəsi əvvəl
// çəkmək üçün kompozit indeks.
// Sorğu: { user, isUsed: false, isExpired: false } + sort(expiresAt: 1)
// =====================================================================
bonusTransactionSchema.index(
    { user: 1, isUsed: 1, isExpired: 1, expiresAt: 1 },
    { name: "fifo_redemption_idx" }
);

// Admin panel üçün: istifadəçinin bütün tarixçəsi
bonusTransactionSchema.index({ user: 1, createdAt: -1 });

// Anomaly detection üçün: deviceId-dən çox hesab
bonusTransactionSchema.index({ deviceId: 1, type: 1 });


export default mongoose.model("BonusTransaction", bonusTransactionSchema);
