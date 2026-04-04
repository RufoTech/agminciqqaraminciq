import mongoose from "mongoose";

// =====================================================================
// BONUS KONFİQURASİYA SCHEMA-SI — bonusConfigSchema
// ---------------------------------------------------------------------
// Singleton model: bazada yalnız 1 sənəd saxlanılır.
// Admin panel vasitəsilə dinamik olaraq dəyişdirilə bilər.
//
// İstifadə: BonusConfig.findOne() və ya BonusConfig.getConfig()
// =====================================================================
const bonusConfigSchema = new mongoose.Schema(
    {
        // ── SƏBƏT BONUSU QAYDASI ─────────────────────────────────────
        // Minimum sifariş məbləği — bu qədərdən az sifarişə bonus verilmir.
        cartMinOrder: {
            type:    Number,
            default: 25,
            min:     0,
        },

        // Minimum sifarişə verilən baza bonus sayı.
        cartBaseBonus: {
            type:    Number,
            default: 1,
            min:     0,
        },

        // Baza üzərindən hər neçə AZN-ə +1 bonus verilir.
        // Məsələn: cartStepAzn=5 → 30 AZN = 2 bonus, 35 AZN = 3 bonus
        cartStepAzn: {
            type:    Number,
            default: 5,
            min:     1,
        },

        // ── RƏY BONUSU QAYDASI ───────────────────────────────────────
        // Rəy bonusunun aktiv/deaktiv olması.
        reviewBonusEnabled: {
            type:    Boolean,
            default: true,
        },

        // Bir istifadəçi ömrü boyu maksimum neçə rəy bonusu qazana bilər.
        // Bu limit suistimalın qarşısını alır (saxta rəylər).
        reviewMaxLifetime: {
            type:    Number,
            default: 3,
            min:     0,
        },

        // Hər rəy üçün verilən bonus miqdarı.
        reviewBonusAmount: {
            type:    Number,
            default: 1,
            min:     0,
        },

        // ── REFERRAL BONUSU QAYDASI ──────────────────────────────────
        // Dost gətirib ilk sifarişini tamamlatdıqda verilən bonus.
        referralBonusAmount: {
            type:    Number,
            default: 1,
            min:     0,
        },

        // ── İSTİFADƏ LİMİTİ ─────────────────────────────────────────
        // Sifarişin maksimum neçə faizini bonus ilə ödəmək olar.
        // Məsələn: 30 → 100 AZN sifarişdə max 30 AZN bonus istifadə edilə bilər.
        // Şirkətin maliyyə balansını qorumaq üçün.
        maxRedemptionPercent: {
            type:    Number,
            default: 30,
            min:     0,
            max:     100,
        },

        // 1 bonusun AZN-də dəyəri.
        bonusValueAzn: {
            type:    Number,
            default: 1,
            min:     0,
        },

        // ── VAXTININ KEÇMƏ QAYDASI ───────────────────────────────────
        // Bonusların neçə gün sonra vaxtı keçir (FIFO).
        // Default: 180 gün = 6 ay.
        bonusExpiryDays: {
            type:    Number,
            default: 180,
            min:     1,
        },

        // ── AKTİV KAMPANIYA ──────────────────────────────────────────
        // Kampaniya aktivdirsə bütün yeni bonus qazanma əməliyyatlarına
        // campaignMultiplier tətbiq edilir.
        campaignActive: {
            type:    Boolean,
            default: false,
        },

        // Aktiv kampaniyanın çarpanı: 1 (normal), 2 (2x), 3 (3x), 5 (5x).
        campaignMultiplier: {
            type:    Number,
            default: 1,
            enum:    [1, 2, 3, 5],
        },

        // Kampaniyanın görüntüləmə adı (UI-da göstərilir).
        campaignName: {
            type:    String,
            default: "",
        },

        // Kampaniyanın başlama tarixi (admin tərəfindən təyin edilir).
        campaignStartsAt: {
            type:    Date,
            default: null,
        },

        // Kampaniyanın bitmə tarixi.
        // Bu tarix keçdikdə kampaniya avtomatik bitmir —
        // admin manualca bitmə və ya cron job lazımdır.
        campaignEndsAt: {
            type:    Date,
            default: null,
        },

        // ── ANTİ-ABUSE LİMİTLƏR ──────────────────────────────────────
        // Bir cihazdan (deviceId) neçə fərqli hesab bonus qazana bilər.
        // Bu limiti keçən hesablar flagged edilir.
        maxDeviceAccounts: {
            type:    Number,
            default: 10,
            min:     1,
        },

        // 7 gün ərzində qazanıla bilən maksimum bonus sayı (anomaly limit).
        weeklyEarnLimit: {
            type:    Number,
            default: 50,
            min:     1,
        },
    },
    {
        timestamps: true,
    }
);


// =====================================================================
// STATİK METOD: getConfig()
// ---------------------------------------------------------------------
// Singleton pattern: həmişə yalnız 1 konfiq sənədi mövcud olmalıdır.
// Mövcud deyilsə — default dəyərlərlə yaradılır.
//
// İstifadə:
//   const config = await BonusConfig.getConfig();
// =====================================================================
bonusConfigSchema.statics.getConfig = async function () {
    let config = await this.findOne();
    if (!config) {
        config = await this.create({});
    }
    return config;
};


export default mongoose.model("BonusConfig", bonusConfigSchema);
