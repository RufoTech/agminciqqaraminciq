// ── Commission.js — Split-Payment (Platform, Seller, Influencer) Modeli ──────
import mongoose from "mongoose";

delete mongoose.models["Commission"];
delete mongoose.modelSchemas?.["Commission"];

const commissionSchema = new mongoose.Schema(
    {
        // ── SİFARİŞ VƏ İŞTİRAKÇILAR ─────────────────────────
        orderId: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "Order",
            required: true,
            index:    true,
        },
        sellerId: {
            type:     String,
            required: true,
            index:    true,
        },
        // Blogger/Influencer ID (əgər promo kod istifadə edilibsə)
        influencerId: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "Blogger",
            default:  null,
        },

        // ── ÖDƏNIŞ İDENTİFİKATORLARI ────────────────────────
        paymentProvider: {
            type:    String,
            enum:    ["simulation", "pashapay", "stripe"],
            default: "simulation",
        },
        providerOrderId: {
            type:    String,     // Providerin bizə verdiyi ID (məs: pp_123)
            default: null,
            index:   true,
        },
        providerTransactionId: {
            type:    String,     // Uğurlu ödəniş ID
            default: null,
        },

        // ── MALİYYƏ BÖLGÜSÜ (Split) ─────────────────────────
        orderAmount: {
            type:     Number,
            required: true,
            min:      0,
        },
        
        // 1. Platforma payı
        brendexCommission: {
            type:     Number,
            required: true,
            min:      0,
        },
        brendexCommissionPercent: {
            type:     Number,
            required: true,
        },

        // 2. Provider haqqı (3%)
        providerFee: {
            type:     Number,
            required: true,
            min:      0,
        },
        providerFeePercent: {
            type:     Number,
            required: true,
        },

        // 3. Satıcı payı
        sellerEarning: {
            type:     Number,
            required: true,
            min:      0,
        },
        sellerEarningPercent: {
            type:     Number,
            required: true,
        },

        // 4. Influencer payı (əgər promo kodu varsa)
        influencerEarning: {
            type:    Number,
            default: 0,
            min:     0,
        },
        influencerEarningPercent: {
            type:    Number,
            default: 0,
        },

        // ── STATUS VƏ TARİXLƏR ──────────────────────────────
        status: {
            type:    String,
            enum:    ["pending", "settled", "failed", "refunded"],
            default: "pending",
        },
        settledAt: {
            type:    Date,
            default: null,
        },
        failedAt: {
            type:    Date,
            default: null,
        },
        refundedAt: {
            type:    Date,
            default: null,
        },

        // ── RAW DATA ────────────────────────────────────────
        webhookPayload: {
            type:    mongoose.Schema.Types.Mixed,
            default: null,
        },

        // ── AYLIK QRUPLAŞDIRMA ──────────────────────────────
        month: {
            type:     Number,
            required: true,
        },
        year: {
            type:     Number,
            required: true,
        },
    },
    { timestamps: true }
);

commissionSchema.index({ sellerId: 1, month: 1, year: 1, status: 1 });

export default mongoose.model("Commission", commissionSchema);