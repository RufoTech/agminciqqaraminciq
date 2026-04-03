// =====================================================================
// BLOGER SATIŞ MODELİ — models/BloggerSale.js
// ---------------------------------------------------------------------
// Hər promo kod ilə edilən sifarişin komissiya qeydi.
// paymentStatus: pending → paid (admin ödəyəndə) | cancelled (sifariş ləğv)
// =====================================================================

import mongoose from "mongoose";

const bloggerSaleSchema = new mongoose.Schema(
    {
        // Hansı blogerə aid olduğu
        blogger: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "Blogger",
            required: true,
            index:    true,
        },

        // Hansı sifariş üzərindən komissiya hesablanıb
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref:  "Order",
            index: true,
        },

        // Alıcı (əgər qeydiyyatlıdırsa)
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref:  "User",
        },

        // Alıcının e-poçtu (qeydiyyatsız alıcılar üçün də saxlanılır)
        customerEmail: {
            type:    String,
            default: "",
        },

        // Hansı promo kod istifadə edilib (snapshot)
        promoCode: {
            type:     String,
            required: true,
            uppercase: true,
        },

        // Sifarişin ümumi məbləği (AZN)
        orderAmount: {
            type:     Number,
            required: true,
            min:      0,
        },

        // Satış anındakı komissiya faizi (snapshot)
        commissionRate: {
            type:     Number,
            required: true,
        },

        // Hesablanan komissiya məbləği (AZN)
        commissionAmount: {
            type:     Number,
            required: true,
            min:      0,
        },

        // Satış tarixi
        saleDate: {
            type:    Date,
            default: Date.now,
            index:   true,
        },

        // Ödəniş statusu
        paymentStatus: {
            type:    String,
            enum:    ["pending", "paid", "cancelled"],
            default: "pending",
            index:   true,
        },

        // Admin tərəfindən ödəniş tarixi
        paidAt: {
            type:    Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Sürətli sorğular üçün kompozit indekslər
bloggerSaleSchema.index({ blogger: 1, paymentStatus: 1 });
bloggerSaleSchema.index({ blogger: 1, saleDate: -1 });

export default mongoose.model("BloggerSale", bloggerSaleSchema);