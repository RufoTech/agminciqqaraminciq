import Commission from "../model/Commission.js";
import SellerBalance from "../model/SellerBalance.js";
import Blogger from "../model/Blogger.js";
import paymentConfig from "../config/paymentConfig.js";
import crypto from "crypto";
import axios from "axios";

// ── YARDIMÇI FUNKSIYALAR ─────────────────────────────────────────────────────

const getOrCreateBalance = async (sellerId) => {
    let balance = await SellerBalance.findOne({ sellerId });
    if (!balance) balance = await SellerBalance.create({ sellerId });
    return balance;
};

// Bölgünü hesablama (Influencer payı da nəzərə alınır)
const calcSplit = (orderAmount, hasInfluencer = false) => {
    const pFeePercent = paymentConfig.SPLIT.PROVIDER_FEE_PERCENT;
    const bCommPercent = paymentConfig.SPLIT.BRENDEX_COMMISSION_PERCENT;
    
    let infPercent = 0;
    let sEarnPercent = paymentConfig.SPLIT.SELLER_EARNING_PERCENT; // 87

    if (hasInfluencer) {
        infPercent = paymentConfig.INFLUENCER_SPLIT.INFLUENCER_PERCENT; // 5
        sEarnPercent = sEarnPercent - infPercent; // 87 - 5 = 82
    }

    const providerFee = Math.round(orderAmount * pFeePercent) / 100;
    const brendexCommission = Math.round(orderAmount * bCommPercent) / 100;
    const influencerEarning = Math.round(orderAmount * infPercent) / 100;
    const sellerEarning = Math.round(orderAmount * sEarnPercent) / 100;

    return { 
        providerFeePercent: pFeePercent, providerFee,
        brendexCommissionPercent: bCommPercent, brendexCommission,
        influencerEarningPercent: infPercent, influencerEarning,
        sellerEarningPercent: sEarnPercent, sellerEarning
    };
};

// ════════════════════════════════════════════════════════════════════════════
//  1. SİFARİŞ YARANANDA QEYD ET — createCommission
// ════════════════════════════════════════════════════════════════════════════
export const createCommission = async (orderId, sellerId, orderAmount, sellerSubMerchantId = null, influencerId = null) => {

    const hasInfluencer = !!influencerId;
    const splitData = calcSplit(orderAmount, hasInfluencer);
    const now = new Date();

    const commission = await Commission.create({
        orderId,
        sellerId,
        influencerId: influencerId || null,
        paymentProvider: paymentConfig.MODE === "sandbox" ? "pashapay" : "simulation",
        orderAmount,
        ...splitData,
        month:  now.getMonth() + 1,
        year:   now.getFullYear(),
        status: "pending",
    });

    // Satıcının gözləyən qazancını artırırıq
    const balance = await getOrCreateBalance(sellerId);
    balance.pendingEarning   += splitData.sellerEarning;
    balance.totalOrderAmount += orderAmount;
    await balance.save();

    // Əgər Influencer varsa, onun da "gözləyən" (pending) balansını artıra bilərik.
    // Moda uyğun olaraq Provider Request'i
    if (paymentConfig.MODE === "sandbox") {
        try {
            const splitsBody = [
                {
                    sub_merchant_id: process.env.BRENDEX_SUBMERCHANT_ID,
                    amount: Math.round(splitData.brendexCommission * 100),
                    description: "Brendex komissiyasi",
                },
                {
                    sub_merchant_id: sellerSubMerchantId || "DEFAULT_SELLER", // FIXME: Həqiqi SubMerchant gəlməlidir
                    amount: Math.round(splitData.sellerEarning * 100),
                    description: "Satici qazanci",
                }
            ];
            
            // PashaPay Sandbox sorğusu...
            const ppResponse = await axios.post(
                `${paymentConfig.API.PASHAPAY_BASE_URL}/v1/orders`,
                {
                    merchant_id:  paymentConfig.API.PASHAPAY_MERCHANT,
                    amount:       Math.round(orderAmount * 100),   // qəpik
                    currency:     "AZN",
                    reference_id: commission._id.toString(),
                    splits: splitsBody,
                },
                {
                    headers: { "Authorization": `Bearer ${paymentConfig.API.PASHAPAY_API_KEY}`, "Content-Type": "application/json" }
                }
            );

            commission.providerOrderId = ppResponse.data?.order_id || ppResponse.data?.id;
            await commission.save();
        } catch (ppError) {
            console.error(`[CommissionSandbox] PashaPay order yaratma xətası: ${ppError.message}`);
        }
    } else {
        // Simulation Mode - süni providerOrderId təyin edilir
        commission.providerOrderId = `sim_order_${Date.now()}`;
        await commission.save();
    }

    return commission;
};

// ════════════════════════════════════════════════════════════════════════════
//  2. WEBHOOK EMALI - handleWebhook (Sandbox + Simulyasiya üçün)
// ════════════════════════════════════════════════════════════════════════════
export const handlePashaPayWebhook = async (req, res) => {
    // Burada həm simulyasiya həm də pashapay webhookları işlənir
    const reqBody = req.body;
    let payload;

    try {
        if (Buffer.isBuffer(reqBody)) payload = JSON.parse(reqBody.toString());
        else payload = typeof reqBody === "string" ? JSON.parse(reqBody) : reqBody;
    } catch {
        return res.status(400).json({ success: false, message: "Invalid JSON" });
    }

    const { event, order_id, transaction_id, status } = payload;
    
    // Test və simulyasiya modunda imza yoxlamasını keçirik (ya da yoxlayırıq)
    // Əgər PASHAPAY_SECRET_KEY varsa və simulation deyilsə yoxlayaq

    // ── HMAC SHA256 İMZA YOXLAMASI ───────────────────────────────────────────
    // Simulation modunda yoxlama keçilir (daxili simulate-webhook endpoint-i üçün).
    // Sandbox/production modunda PashaPay-dən gələn hər webhook imzalanmış olmalıdır.
    if (paymentConfig.MODE !== "simulation") {
        const secret = paymentConfig.API.PASHAPAY_SECRET_KEY;
        const signatureHeader = req.headers["x-pashapay-signature"] || "";
        const rawBody = Buffer.isBuffer(reqBody) ? reqBody : Buffer.from(JSON.stringify(payload));

        const expectedSig = crypto
            .createHmac("sha256", secret)
            .update(rawBody)
            .digest("hex");

        const providedSig = signatureHeader.replace(/^sha256=/, "");

        // Uzunluq fərqlidirsə timingSafeEqual throw atar — əvvəlcə yoxlayırıq
        const valid =
            providedSig.length === expectedSig.length &&
            crypto.timingSafeEqual(
                Buffer.from(providedSig, "hex"),
                Buffer.from(expectedSig,  "hex")
            );

        if (!valid) {
            console.warn("[Webhook] İmza uyğunsuzluğu — sorğu rədd edildi");
            return res.status(401).json({ success: false, message: "Invalid signature" });
        }
    }

    const commission = await Commission.findOne({ providerOrderId: order_id });
    if (!commission) {
        return res.status(200).json({ received: true });
    }

    if (commission.status === "settled" || commission.status === "failed") {
        return res.status(200).json({ received: true });
    }

    const normalizedStatus = (status || event || "").toUpperCase();
    const now = new Date();

    if (normalizedStatus.includes("SETTLED") || normalizedStatus.includes("SUCCESS")) {
        commission.status = "settled";
        commission.providerTransactionId = transaction_id || null;
        commission.settledAt = now;
        commission.webhookPayload = payload;
        await commission.save();

        // Seller balance
        await SellerBalance.findOneAndUpdate(
            { sellerId: commission.sellerId },
            {
                $inc: {
                    pendingEarning: -commission.sellerEarning,
                    availableBalance: commission.sellerEarning,
                    totalEarned: commission.sellerEarning,
                    totalBrendexCommission: commission.brendexCommission,
                },
            }
        );

        // Influencer balance (Blogger) əgər varsa
        if (commission.influencerId && commission.influencerEarning > 0) {
            await Blogger.findByIdAndUpdate(commission.influencerId, {
                $inc: { balance: commission.influencerEarning }
            });
        }

    } else if (normalizedStatus.includes("FAILED") || normalizedStatus.includes("CANCELLED")) {
        commission.status = "failed";
        commission.failedAt = now;
        commission.webhookPayload = payload;
        await commission.save();

        await SellerBalance.findOneAndUpdate(
            { sellerId: commission.sellerId },
            { $inc: { pendingEarning: -commission.sellerEarning, totalOrderAmount: -commission.orderAmount } }
        );
    }

    res.status(200).json({ received: true });
};

// Digər köməkçi endpointlər...
export const getOrderCommission = async (req, res) => {
    try {
        const commission = await Commission.findOne({ orderId: req.params.orderId });
        if (!commission) return res.status(404).json({ success: false });
        res.json({ success: true, data: commission });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getSellerBalance = async (req, res) => {
    try {
        const balance = await getOrCreateBalance(req.params.sellerId);
        res.json({ success: true, balance });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getMonthlyCommission = async (req, res) => {
    try {
        const { sellerId } = req.params;
        const now = new Date();
        const month = parseInt(req.query.month) || now.getMonth() + 1;
        const year = parseInt(req.query.year) || now.getFullYear();

        const commissions = await Commission.find({ sellerId, month, year }).populate("orderId", "createdAt totalPrice");
        // ... (Məbləğləri toplayıb qaytarmaq, sətirlər uzun olmasın deyə qısaltmaq olar)
        res.json({ success: true, commissions });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const withdrawBalance = async (req, res) => {
    try {
        const { sellerId, amount } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ success: false });
        const balance = await SellerBalance.findOne({ sellerId });
        if (!balance || balance.availableBalance < amount) return res.status(400).json({ success: false });

        balance.availableBalance -= amount;
        balance.totalWithdrawn += amount;
        await balance.save();
        res.json({ success: true, remainingBalance: balance.availableBalance });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getAllCommissions = async (req, res) => {
    try {
        // filter logic
        const commissions = await Commission.find().populate("sellerId").sort({ createdAt: -1 });
        res.json({ success: true, count: commissions.length, commissions });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const getAllSellerBalances = async (req, res) => {
    try {
        const balances = await SellerBalance.find().sort({ availableBalance: -1 });
        res.json({ success: true, balances });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

export const checkCommissionStatus = async (req, res) => {
    try {
        const commission = await Commission.findOne({ orderId: req.params.orderId });
        if (!commission) return res.status(404).json({ success: false });
        res.json({ success: true, status: commission.status });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ════════════════════════════════════════════════════════════════════════════
//  SİMULYASİYA WEBHOOK TETİKLƏYİCİ — simulateWebhook
// ────────────────────────────────────────────────────────────────────────────
//  Demo-da "pending → settled" axınını göstərmək üçün istifadə olunur.
//  Yalnız simulation modunda işləyir.
//
//  Body: { providerOrderId: "sim_order_...", eventType: "SETTLED" | "FAILED" }
// ════════════════════════════════════════════════════════════════════════════
export const simulateWebhook = async (req, res) => {
    if (paymentConfig.MODE !== "simulation") {
        return res.status(403).json({
            success: false,
            message: "simulateWebhook yalnız simulation modunda işləyir",
        });
    }

    const { providerOrderId, eventType = "SETTLED" } = req.body;

    if (!providerOrderId) {
        return res.status(400).json({ success: false, message: "providerOrderId tələb olunur" });
    }

    // Real webhook handler-i fake payload ilə çağırırıq — məntiqi təkrar etmirik
    req.body = {
        event:          eventType.toUpperCase(),
        order_id:       providerOrderId,
        transaction_id: `sim_txn_${Date.now()}`,
        status:         eventType.toUpperCase(),
    };

    return handlePashaPayWebhook(req, res);
};