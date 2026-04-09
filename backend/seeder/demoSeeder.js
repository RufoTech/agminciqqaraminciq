// =====================================================================
// DEMO SEEDER — Payment Provider Demo üçün Test Datası
// ---------------------------------------------------------------------
// Run:   node seeder/demoSeeder.js
// Reset: node seeder/demoSeeder.js --reset   (yalnız demo datanı silir)
//
// Nə yaradır:
//   • 2 test Admin/satıcı (TechMart AZ, FashionHub AZ)
//   • 5 test məhsul — real AZN qiymətləri ki, split rəqəmsal görünsün
//
// NOT: subMerchantId-lər fake-dir ("PP_SUB_*").
//      PashaPay real ID-ləri verdikdən sonra bu dəyərlər dəyişdirilir.
// =====================================================================

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../config/config.env") });

import Admin from "../model/Admin.js";
import { Smartphones, HeadphonesNew, Gadgets, WomensTops, SportsShoes } from "../model/Product.js";

// ── Demo satıcılar ────────────────────────────────────────────────────

const demoSellers = [
    {
        name:  "TechMart Satıcısı",
        email: "techmart@brendex-demo.az",
        password: "Demo@123456",
        sellerInfo: {
            storeName:     "TechMart AZ",
            storeSlug:     "techmart-az",
            storeAddress:  "Bakı, Neftçilər pr. 85",
            phone:         "+994501234567",
            taxNumber:     "1234567890",
            vonNumber:     "1234567",
            subMerchantId: "PP_SUB_TECHMART_001",
        },
        sellerStatus: "approved",
    },
    {
        name:  "FashionHub Satıcısı",
        email: "fashionhub@brendex-demo.az",
        password: "Demo@123456",
        sellerInfo: {
            storeName:     "FashionHub AZ",
            storeSlug:     "fashionhub-az",
            storeAddress:  "Bakı, İstiqlaliyyət küç. 14",
            phone:         "+994507654321",
            taxNumber:     "0987654321",
            vonNumber:     "7654321",
            subMerchantId: "PP_SUB_FASHION_001",
        },
        sellerStatus: "approved",
    },
];

// ── Demo məhsullar ────────────────────────────────────────────────────
// Split demo üçün real AZN qiymətləri:
//   649 AZN: provider 19.47, brendex 64.90, satıcı 564.63
//   449 AZN: provider 13.47, brendex 44.90, satıcı 390.63
//   549 AZN: provider 16.47, brendex 54.90, satıcı 477.63
//    89 AZN: provider  2.67, brendex  8.90, satıcı  77.43
//   249 AZN: provider  7.47, brendex 24.90, satıcı 216.63

const demoProducts = [
    // TechMart AZ məhsulları
    {
        Model: Smartphones,
        data: {
            name:        "Samsung Galaxy A54 128GB",
            description: "6.4 düym Super AMOLED ekran, 50MP əsas kamera, 5000mAh batareya. Demo məhsul.",
            price:       649,
            stock:       20,
            seller:      "TechMart AZ",
            category:    "Smartphones",
            color:       "Ağ",
            storage:     "128GB",
            ram:         "6GB",
            backCamera:  "50MP + 12MP + 5MP",
            frontCamera: "32MP",
            battery:     "5000mAh",
            processor:   "Exynos 1380",
            images: [{ public_id: "demo_samsung_a54", url: "https://placehold.co/400x400?text=Samsung+A54" }],
        },
    },
    {
        Model: HeadphonesNew,
        data: {
            name:             "Sony WH-1000XM5 Qulaqcıq",
            description:      "Sənaye lideri səs ləğv etmə, 30 saatlıq batareya. Demo məhsul.",
            price:            449,
            stock:            15,
            seller:           "TechMart AZ",
            category:         "HeadphonesNew",
            connectivity:     "Bluetooth 5.2",
            noiseCancellation:"Aktiv Səs Ləğvetmə (ANC)",
            images: [{ public_id: "demo_sony_xm5", url: "https://placehold.co/400x400?text=Sony+XM5" }],
        },
    },
    {
        Model: Gadgets,
        data: {
            name:        "Apple Watch SE 44mm",
            description: "GPS, qəza aşkarlanması, qan oksigeni sensoru. Demo məhsul.",
            price:       549,
            stock:       10,
            seller:      "TechMart AZ",
            category:    "Gadgets",
            color:       "Gecə Yarısı",
            images: [{ public_id: "demo_apple_watch_se", url: "https://placehold.co/400x400?text=Apple+Watch+SE" }],
        },
    },
    // FashionHub AZ məhsulları
    {
        Model: WomensTops,
        data: {
            name:        "Zara Yaz Paltarı (L)",
            description: "Yüngül floral naxışlı yaz paltarı, ölçü L. Demo məhsul.",
            price:       89,
            stock:       50,
            seller:      "FashionHub AZ",
            category:    "WomensTops",
            color:       "Çiçəkli",
            images: [{ public_id: "demo_zara_dress", url: "https://placehold.co/400x400?text=Zara+Dress" }],
        },
    },
    {
        Model: SportsShoes,
        data: {
            name:        "Nike Air Max 270",
            description: "Maksimum rahatlıq və stilin birləşməsi. Demo məhsul.",
            price:       249,
            stock:       30,
            seller:      "FashionHub AZ",
            category:    "SportsShoes",
            color:       "Qara/Ağ",
            images: [{ public_id: "demo_nike_am270", url: "https://placehold.co/400x400?text=Nike+AM270" }],
        },
    },
];

// ── Əsas funksiya ─────────────────────────────────────────────────────

const run = async () => {
    const dbUri = process.env.LOCAL_URI || "mongodb://localhost:27017/e-commerce";

    try {
        await mongoose.connect(dbUri);
        console.log(`✅ DB-yə qoşuldu: ${dbUri}`);
    } catch (err) {
        console.error("❌ DB bağlantısı uğursuz:", err.message);
        process.exit(1);
    }

    const demoDomain = "@brendex-demo.az";
    const demoStores = ["TechMart AZ", "FashionHub AZ"];

    // --reset: yalnız demo datanı sil
    if (process.argv[2] === "--reset") {
        await Admin.deleteMany({ email: { $regex: demoDomain } });
        for (const { Model } of demoProducts) {
            await Model.deleteMany({ seller: { $in: demoStores } });
        }
        console.log("🗑️  Demo data silindi.");
        await mongoose.disconnect();
        process.exit(0);
    }

    // Mövcud demo datanı təmizlə (idempotent)
    await Admin.deleteMany({ email: { $regex: demoDomain } });
    for (const { Model } of demoProducts) {
        await Model.deleteMany({ seller: { $in: demoStores } });
    }
    console.log("🗑️  Köhnə demo data silindi.");

    // Satıcıları yarat (pre-save hook şifrəni avtomatik hash edir)
    for (const sellerData of demoSellers) {
        const admin = new Admin(sellerData);
        await admin.save();
        console.log(`✅ Satıcı yaradıldı: ${sellerData.sellerInfo.storeName} (subMerchantId: ${sellerData.sellerInfo.subMerchantId})`);
    }

    // Məhsulları yarat
    for (const { Model, data } of demoProducts) {
        await Model.create(data);
        console.log(`✅ Məhsul yaradıldı: ${data.name} — ${data.price} AZN (${data.seller})`);
    }

    console.log("\n🎉 Demo data hazırdır!");
    console.log("──────────────────────────────────────────");
    console.log("Satıcılar:");
    console.log("  techmart@brendex-demo.az  /  Demo@123456");
    console.log("  fashionhub@brendex-demo.az  /  Demo@123456");
    console.log("\nDemo axını:");
    console.log("  1. POST /commerce/mehsullar/products/create-payment-intent");
    console.log("  2. POST /commerce/mehsullar/orders/create");
    console.log("  3. GET  /commerce/mehsullar/commission/status/:orderId");
    console.log("  4. POST /commerce/mehsullar/commission/simulate-webhook");
    console.log("  5. GET  /commerce/mehsullar/commission/balance/:sellerId");
    console.log("──────────────────────────────────────────\n");

    await mongoose.disconnect();
    process.exit(0);
};

run();
