// ── SellerBalance.js — PashaPay Split-Payment Balans Modeli ─────────────────
//
// Köhnə modeldən FƏRQ:
//   Köhnə: pendingCommission (şirkətin payı) + availableBalance
//          → Şirkət ay sonu Stripe ilə komisyanı çəkirdi
//
//   Yeni:  pendingEarning (webhook gözlənilir) + availableBalance (çəkilə bilər)
//          → Komisya PashaPay tərəfindən avtomatik ayrılır
//          → Biz yalnız satıcının 87%-ini izləyirik
//          → "Komisya borcu" anlayışı yoxdur — PashaPay özü ayırır
//
// Pul axını:
//   createCommission()      → pendingEarning   += sellerEarning (87%)
//   markCommissionSettled() → pendingEarning   -= sellerEarning
//                           → availableBalance  += sellerEarning
//                           → totalEarned       += sellerEarning
//   markCommissionFailed()  → pendingEarning   -= sellerEarning (ləğv)
//   withdrawBalance()       → availableBalance  -= amount
//                           → totalWithdrawn    += amount
// ─────────────────────────────────────────────────────────────────────────────

import mongoose from "mongoose";

delete mongoose.models["SellerBalance"];
delete mongoose.modelSchemas?.["SellerBalance"];

const sellerBalanceSchema = new mongoose.Schema(
    {
        // sellerId → satıcının unikal identifikatoru (storeName)
        sellerId: {
            type:     String,
            required: true,
            unique:   true,
        },

        // ── MALİYYƏ SAHƏLƏRİ ─────────────────────────────────────────────────

        // availableBalance → satıcının çəkə biləcəyi hazır pul.
        // YALNIZ PashaPay "settled" webhook-u gəldikdən sonra artır.
        // Azalır: withdrawBalance() çağırılanda.
        availableBalance: {
            type:    Number,
            default: 0,
            min:     0,
        },

        // pendingEarning → PashaPay-ın hələ "settle" etmədiyi satıcı payı.
        // Sifariş yarananda artır (createCommission).
        // Azalır: settled → availableBalance-ə keçir
        //         failed  → ləğv edilir (geri götürülür)
        // Dashboard-da: "Gözləyən: 87 AZN"
        pendingEarning: {
            type:    Number,
            default: 0,
            min:     0,
        },

        // totalEarned → bütün zamanlarda settled olan ümumi qazanc.
        // Heç vaxt azalmır — yalnız settled olanda artır.
        // Statistika üçün: "Satıcı platformda 50,000 AZN qazandı"
        totalEarned: {
            type:    Number,
            default: 0,
        },

        // totalWithdrawn → satıcının indiyə qədər çıxardığı ümumi məbləğ.
        // Heç vaxt azalmır.
        totalWithdrawn: {
            type:    Number,
            default: 0,
        },

        // totalOrderAmount → satıcının bütün sifarişlərinin (settled) ümumi məbləği.
        // Brendex dashboard-da dövriyyə statistikası üçün.
        totalOrderAmount: {
            type:    Number,
            default: 0,
        },

        // totalBrendexCommission → Brendex-ə çatan ümumi komisya (məlumat üçün).
        // PashaPay özü ayırır — biz izləyirik.
        totalBrendexCommission: {
            type:    Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// sellerId üzrə tez axtarış üçün indeks
sellerBalanceSchema.index({ sellerId: 1 });

export default mongoose.model("SellerBalance", sellerBalanceSchema);