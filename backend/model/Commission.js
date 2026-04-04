// ── Commission.js — PashaPay Split-Payment Modeli ────────────────────────────
//
// Bu model köhnə Stripe modelindən KÖKLÜ FƏRQLIDIR:
//
//   KÖHNƏ (Stripe):
//     → Alıcı pulu bizə ödəyirdi
//     → Biz ay sonu Stripe ilə komisyanı satıcıya köçürürdük
//     → Lisenziya riski, pul keçidi riski var idi
//
//   YENİ (PashaPay Split):
//     → Alıcı ödəyir → PashaPay avtomatik bölür:
//         87% → satıcı (bizim hesabımıza, satıcı üçün)
//         10% → Brendex (bizim komissiya)
//          3% → PashaPay (provider haqqı)
//     → Pul bizə gəlmir → lisenziya problemi yoxdur
//     → Biz yalnız İZLƏYİRİK — faktiki köçürmə PashaPay edir
//
// Status axını:
//   "pending"   → Sifariş yaradıldı, PashaPay-dan webhook gözlənilir
//   "settled"   → PashaPay "SETTLED" webhook-u göndərdi, pul satıcıya çatdı
//   "failed"    → PashaPay "FAILED" webhook-u göndərdi, ödəniş uğursuz
//   "refunded"  → Alıcıya geri qaytarılma edildi
// ─────────────────────────────────────────────────────────────────────────────

import mongoose from "mongoose";

// İnkişaf mərhələsində hot-reload zamanı "model override" xətasının qarşısını alır
delete mongoose.models["Commission"];
delete mongoose.modelSchemas?.["Commission"];

const commissionSchema = new mongoose.Schema(
    {
        // ── SİFARİŞ VƏ SATICI ─────────────────────────────────────────────────

        // orderId → hansı sifarişdən bu komisya yarandı
        orderId: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "Order",
            required: true,
            index:    true,
        },

        // sellerId → satıcının mağaza identifikatoru (storeName)
        sellerId: {
            type:     String,
            required: true,
        },

        // ── ÖDƏNIŞ İDENTİFİKATORLARI ─────────────────────────────────────────

        // pashaPayOrderId → PashaPay-ın bizə verdiyi sifariş ID-si
        // Ödəniş yaradılarkən PashaPay-dan gəlir, webhook-la uyğunlaşdırılır
        pashaPayOrderId: {
            type:    String,
            default: null,
        },

        // pashaPayTransactionId → uğurlu ödənişin PashaPay tranzaksiya ID-si
        // Yalnız "settled" statusunda doldurulur
        pashaPayTransactionId: {
            type:    String,
            default: null,
        },

        // ── MALİYYƏ BÖLGÜSÜ ──────────────────────────────────────────────────
        //
        // Məsələn: orderAmount = 100 AZN
        //   brendexCommission = 10 AZN  (10%) ← bizim gəlirimiz
        //   providerFee       =  3 AZN  ( 3%) ← PashaPay haqqı
        //   sellerEarning     = 87 AZN  (87%) ← satıcıya çatan pul
        //
        // Bu rəqəmlər PashaPay split parametrlərinə əsaslanır.
        // Faktiki köçürmə biz etmirik — PashaPay edir.
        // Biz yalnız qeyd edirik.

        // orderAmount → alıcının ödədiyi tam məbləğ
        orderAmount: {
            type:     Number,
            required: true,
            min:      0,
        },

        // brendexCommission → Brendex-ə düşən hissə (10%)
        brendexCommission: {
            type:     Number,
            required: true,
            min:      0,
        },

        // brendexCommissionPercent → komisya faizi (sabit: 10)
        // Bazada saxlanılır — gələcəkdə faiz dəyişsə köhnə qeydlər orijinal qalır
        brendexCommissionPercent: {
            type:    Number,
            default: 10,
        },

        // providerFee → PashaPay-ın öz haqqı (3%)
        // Biz ödəmirik — alıcının ödənişindən çıxılır
        // Qeyd edirik: tam şəffaflıq + hesabat üçün
        providerFee: {
            type:     Number,
            required: true,
            min:      0,
        },

        // providerFeePercent → provider haqqı faizi (sabit: 3)
        providerFeePercent: {
            type:    Number,
            default: 3,
        },

        // sellerEarning → satıcıya çatan xalis məbləğ (87%)
        // PashaPay bu pulu birbaşa satıcı hesabına köçürür
        sellerEarning: {
            type:     Number,
            required: true,
            min:      0,
        },

        // sellerEarningPercent → satıcı payı faizi (sabit: 87)
        sellerEarningPercent: {
            type:    Number,
            default: 87,
        },

        // ── STATUS ────────────────────────────────────────────────────────────
        status: {
            type:    String,
            enum:    ["pending", "settled", "failed", "refunded"],
            default: "pending",
        },

        // ── TARIXLƏR ─────────────────────────────────────────────────────────

        // settledAt → PashaPay "settled" webhook-u gəldiyi an
        settledAt: {
            type:    Date,
            default: null,
        },

        // failedAt → PashaPay "failed" webhook-u gəldiyi an
        failedAt: {
            type:    Date,
            default: null,
        },

        // refundedAt → geri qaytarma baş verdiyi an
        refundedAt: {
            type:    Date,
            default: null,
        },

        // ── WEBHOOK RAW DATA ──────────────────────────────────────────────────
        // PashaPay-dan gələn webhook-un tam JSON-u saxlanılır.
        // Anlaşılmazlıq yarandıqda mənbə məlumatına baxmaq üçün.
        // type: mongoose.Schema.Types.Mixed → istənilən JSON strukturu qəbul edir
        webhookPayload: {
            type:    mongoose.Schema.Types.Mixed,
            default: null,
        },

        // ── AYLIK QRUPLAŞDIRMA ────────────────────────────────────────────────
        // Aylıq hesabat sorğularını sürətləndirmək üçün ayrıca saxlanılır.
        // {month: 3, year: 2026} → "mart 2026-nın bütün komisyaları"
        month: {
            type:     Number,
            required: true,   // 1–12 (getMonth() + 1)
        },
        year: {
            type:     Number,
            required: true,
        },
    },
    {
        timestamps: true,   // createdAt, updatedAt avtomatik
    }
);

// ── İNDEKSLƏR ──────────────────────────────────────────────────────────────
//
// En çox istifadə olunan sorğu:
//   Commission.find({ sellerId, month, year, status })
//
// Bu mürəkkəb indeks həmin sorğunu tam örtür (covered query).
commissionSchema.index({ sellerId: 1, month: 1, year: 1, status: 1 });

// pashaPayOrderId tez tapılsın — webhook gəldikdə bu ID ilə axtarırıq
commissionSchema.index({ pashaPayOrderId: 1 });

export default mongoose.model("Commission", commissionSchema);