// ── config/paymentConfig.js ──────────────────────────────────────────────────
// Payment provider və sistem hesablamaları üçün konfiqurasiya mərkəzi
// "simulation" / "sandbox" / "production" modlarını idarə edir.
// ─────────────────────────────────────────────────────────────────────────────

import dotenv from "dotenv";
dotenv.config({ path: "config/config.env" });

const paymentConfig = {
    // Hansı modda işləyirik: 
    // "simulation" -> Lokal test, API filan qoşulmur, webhooklar simulyasiya olunur
    // "sandbox"    -> PashaPay test API-nə real request atır
    // "production" -> Real dövriyyə
    MODE: process.env.PAYMENT_MODE || "simulation",

    // Split Payment Qaydaları (üst-üstə 100% olmalıdır)
    SPLIT: {
        PROVIDER_FEE_PERCENT: 3,        // PashaPay-in komissiyası
        BRENDEX_COMMISSION_PERCENT: 10, // Platformanın (Brendex) default komissiyası
        SELLER_EARNING_PERCENT: 87      // Satıcının default qazancı (Blogger daxil olmadan)
    },
    
    // Əgər Blogger-referral vasitəsilə satış olubsa:
    INFLUENCER_SPLIT: {
        INFLUENCER_PERCENT: 5,          // Bloggerə veriləcək faiz (Məsələn, satıcının payından kəsilir)
        // O zaman satıcıya 87% - 5% = 82% qalacaq (və ya Brendex-dəm çıxmaq olar)
        // Biz satıcı payından çıxacağıq: Satıcı = 82%, Blogger = 5%, Brendex = 10%, Provider = 3%
    },

    API: {
        PASHAPAY_BASE_URL:   process.env.PASHAPAY_BASE_URL   || "https://test.api.pashapay.az",
        PASHAPAY_MERCHANT:   process.env.PASHAPAY_MERCHANT_ID|| "MERCHANT_TEST_123",
        PASHAPAY_SECRET_KEY: process.env.PASHAPAY_SECRET_KEY || "SECRET_TEST_123",
        PASHAPAY_API_KEY:    process.env.PASHAPAY_API_KEY    || "API_KEY_TEST_123",
    }
};

export default paymentConfig;
