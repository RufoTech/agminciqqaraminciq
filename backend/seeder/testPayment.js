// ── seeder/testPayment.js ────────────────────────────────────────────────────
// Provayder olmadan sadə bir webhook/simulyasiya ssenarısı test etmək üçün 
// ─────────────────────────────────────────────────────────────────────────────

import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDatabase } from "../config/dbConnect.js";

// Modeller
import Order from "../model/Order.js";
import Commission from "../model/Commission.js";
import SellerBalance from "../model/SellerBalance.js";
import Blogger from "../model/Blogger.js";

// Controllerlər
import { createCommission, handlePashaPayWebhook } from "../controller/commissionController.js";

dotenv.config({ path: "config/config.env" });

const runTest = async () => {
    await connectDatabase();
    console.log("-----------------------------------------");
    console.log(" TEST ÖDƏNİŞ SİMULYASIYASI BAŞLAYIR...");
    console.log("-----------------------------------------");

    try {
        // 1. Təmizlik
        await Commission.deleteMany({ providerOrderId: /^sim_order_/ });
        
        // 2. Blogger hazırlayırıq
        let blogger = await Blogger.findOne({ email: "testblogger@brendex.az" });
        if (!blogger) {
            blogger = await Blogger.create({
                name: "Test Blogger",
                email: "testblogger@brendex.az",
                password: "password123",
                promoCodes: ["TEST5"],
                balance: 0,
                status: "approved"
            });
            console.log("✅ Yeni Test Blogger yaradıldı: TEST5 komissiyası ilə");
        }

        // 3. Seller Balance Hazırlayırıq
        const sellerId = "TestStore123";
        let sellerBalance = await SellerBalance.findOne({ sellerId });
        if (!sellerBalance) {
            sellerBalance = await SellerBalance.create({ sellerId, availableBalance: 0, pendingEarning: 0, totalEarned: 0 });
            console.log(`✅ Yeni Test Satıcı balansı yaradıldı (Mağaza: ${sellerId})`);
        }

        // 4. Sifariş Parametrləri (Gözlənilən 100 AZN sifariş)
        const orderId = new mongoose.Types.ObjectId();
        const orderAmount = 100; 

        // 5. Komisyon Yaratma
        // 100 AZN-dən Blogger 5AZN(5%), Brendex 10AZN(10%), Provider 3AZN(3%), Satıcıya qalan: 82AZN
        console.log("\n📦 Komissiya hesablanması və Qeydiyyatı ('pending')...");
        const commission = await createCommission(orderId, sellerId, orderAmount, "SUB_MERCHANT_TEST", blogger._id);
        
        console.log(`📊 İlkin bölgü:
            - Satıcı payı: ${commission.sellerEarning} AZN
            - Blogger payı: ${commission.influencerEarning} AZN
            - Provider payı: ${commission.providerFee} AZN
            - Brendex payı: ${commission.brendexCommission} AZN
        `);

        // Balansı yoxlayaq => Satıcının pending məbləği artmalıdır
        sellerBalance = await SellerBalance.findOne({ sellerId });
        console.log(`⏳ Satıcı PENDING Balansı: ${sellerBalance.pendingEarning} AZN`);

        // 6. Webhook Simulyasiyası
        console.log("\n🔔 PashaPay Settled Webhook Gəlir...");
        
        // Express-in req, res obyektlərini "Mock" edirik
        const mockReq = {
            body: {
                event: "PAYMENT_SETTLED",
                order_id: commission.providerOrderId,
                transaction_id: "txn_sim_9999",
                status: "SETTLED"
            }
        };

        const mockRes = {
            status: (code) => ({
                json: (data) => console.log(`   [Response to Webhook] Status: ${code}`, data)
            })
        };

        await handlePashaPayWebhook(mockReq, mockRes);

        // 7. Yekun Yoxlama
        const updatedCommission = await Commission.findById(commission._id);
        console.log(`\n✅ Komissiya Son Status: ${updatedCommission.status}`);
        
        sellerBalance = await SellerBalance.findOne({ sellerId });
        console.log(`💰 Satıcı AVAILABLE Balansı: ${sellerBalance.availableBalance} AZN`);

        const updatedBlogger = await Blogger.findById(blogger._id);
        console.log(`💸 Blogger Balansı: ${updatedBlogger.balance} AZN`);

        console.log("\n🚀 TEST UĞURLA BAŞA ÇATDI!");

    } catch (err) {
        console.error("Test xətası:", err);
    } finally {
        process.exit();
    }
};

runTest();
