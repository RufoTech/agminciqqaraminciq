// ── commissionController.js — PashaPay Split-Payment Komisya Sistemi ────────
//
// Bu sistem köhnə Stripe əsaslı modeldən KÖKLÜ FƏRQLIDIR.
//
// ❌ KÖHNƏ (Stripe modeli):
//   → Alıcı pulu platformaya ödəyirdi
//   → Biz ay sonu komisyanı çıxarıb satıcıya köçürürdük
//   → Stripe PaymentIntent, transferCommission() lazım idi
//   → Lisenziya riski: pul "keçidi" hesab olunurdu
//
// ✅ YENİ (PashaPay Split modeli):
//   → Alıcı ödəyir → PashaPay AVTOMATIK bölür:
//       87% → satıcı hesabına (Brendex-in idarəsindəki sub-merchant)
//       10% → Brendex hesabına (komisya — birbaşa gəlir)
//        3% → PashaPay haqqı (provider özü götürür)
//   → Pul fiziki olaraq bizə GƏLMİR → lisenziya problemi YOX
//   → Biz yalnız İZLƏYİRİK + webhook ilə statusu yeniləyirik
//
// Əsas axın:
//   1. Sifariş yaranır        → createCommission()         → status: "pending"
//   2. PashaPay ödənişi alır  → createPashaPayOrder()      → pashaPayOrderId alırıq
//   3. PashaPay settle edir   → handlePashaPayWebhook()    → status: "settled"
//   4. Satıcı balansı artır   → (webhook içində avtomatik)
//   5. Satıcı pul çəkir       → withdrawBalance()
// ─────────────────────────────────────────────────────────────────────────────

import Commission    from "../model/Commission.js";
import SellerBalance from "../model/SellerBalance.js";
import crypto        from "crypto";   // Webhook imza yoxlaması üçün
import axios         from "axios";    // PashaPay API-yə sorğu üçün


// ── SABITLƏR ─────────────────────────────────────────────────────────────────

// Bölgü faizləri — bir yerdə saxlanılır, hər yerdə istifadə olunur (DRY)
const BRENDEX_COMMISSION_PERCENT = 10;   // Brendex-in komisyası
const PROVIDER_FEE_PERCENT       =  3;   // PashaPay haqqı
const SELLER_EARNING_PERCENT     = 87;   // Satıcıya düşən hissə
// Cəm: 10 + 3 + 87 = 100 ✓

// PashaPay API konfiqurasiyası — .env faylından gəlir
const PASHAPAY_BASE_URL   = process.env.PASHAPAY_BASE_URL;    // "https://api.pashapay.az"
const PASHAPAY_MERCHANT   = process.env.PASHAPAY_MERCHANT_ID; // Sizin merchant ID
const PASHAPAY_SECRET_KEY = process.env.PASHAPAY_SECRET_KEY;  // Webhook imza açarı
const PASHAPAY_API_KEY    = process.env.PASHAPAY_API_KEY;     // API sorğu açarı

// Brendex-in PashaPay-dakı sub-merchant ID-ləri
// Hər satıcının PashaPay-da öz alt hesabı olur — split oraya gedir
// Bu məlumat ya verilənlər bazasında (Seller modeli) ya da env-də saxlanılır
// Burada env nümunəsi göstərilir — real istifadədə Seller modelindən çəkin
// const BRENDEX_SUBMERCHANT_ID = process.env.BRENDEX_SUBMERCHANT_ID;


// ── YARDIMÇI FUNKSIYALAR ─────────────────────────────────────────────────────

// getOrCreateBalance — satıcı balansını tap, yoxdursa yarat
// DRY: eyni məntiq bir neçə yerdə lazımdır
const getOrCreateBalance = async (sellerId) => {
    let balance = await SellerBalance.findOne({ sellerId });
    if (!balance) balance = await SellerBalance.create({ sellerId });
    return balance;
};

// calcSplit — məbləği faizlərə görə böl
// orderAmount = 100 AZN → { brendex: 10, provider: 3, seller: 87 }
// Math.round(...* 100) / 100 → kuruş səhvlərini düzəldir (floating point)
const calcSplit = (orderAmount) => {
    const brendexCommission = Math.round(orderAmount * BRENDEX_COMMISSION_PERCENT) / 100;
    const providerFee       = Math.round(orderAmount * PROVIDER_FEE_PERCENT)       / 100;
    const sellerEarning     = Math.round(orderAmount * SELLER_EARNING_PERCENT)     / 100;
    return { brendexCommission, providerFee, sellerEarning };
};

// verifyPashaPayWebhook — PashaPay-dan gələn webhook-un həqiqi olduğunu yoxla
// PashaPay X-Signature header-i göndərir → HMAC-SHA256 ilə yoxlanılır
// Bu olmadan hər kəs webhook endpoint-inə POST edə bilər → TƏHLÜKƏSİZLİK
const verifyPashaPayWebhook = (rawBody, signature) => {
    const expectedSig = crypto
        .createHmac("sha256", PASHAPAY_SECRET_KEY)
        .update(rawBody)
        .digest("hex");
    // timingSafeEqual → brute-force hücumunun qarşısını alır
    return crypto.timingSafeEqual(
        Buffer.from(expectedSig),
        Buffer.from(signature || "")
    );
};


// ════════════════════════════════════════════════════════════════════════════
//  1. SİFARİŞ YARANANDA ÇAĞIRILIR — createCommission
// ────────────────────────────────────────────────────────────────────────────
// Bu funksiya birbaşa HTTP endpoint DEYİL — order controller-dən çağırılır:
//   await createCommission(order._id, order.sellerId, order.totalPrice)
//
// Nə edir:
//   ① Bölgünü hesablayır (87/10/3)
//   ② Commission qeydi yaradır (status: "pending")
//   ③ Satıcının pendingEarning-ini artırır
//   ④ PashaPay-da ödəniş sifarişi yaradır (split parametrləri ilə)
//   ⑤ pashaPayOrderId-i Commission-a yazır
//
// Niyə "pending"?
//   PashaPay webhook-u gəlməmiş pul "settled" deyil.
//   Webhook gəldikdə markCommissionSettled() çağırılır.
// ════════════════════════════════════════════════════════════════════════════
export const createCommission = async (orderId, sellerId, orderAmount, sellerSubMerchantId) => {

    // ① Bölgünü hesabla
    const { brendexCommission, providerFee, sellerEarning } = calcSplit(orderAmount);
    const now = new Date();

    // ② Commission qeydini yarat
    const commission = await Commission.create({
        orderId,
        sellerId,
        orderAmount,
        brendexCommission,
        brendexCommissionPercent: BRENDEX_COMMISSION_PERCENT,
        providerFee,
        providerFeePercent:       PROVIDER_FEE_PERCENT,
        sellerEarning,
        sellerEarningPercent:     SELLER_EARNING_PERCENT,
        month:  now.getMonth() + 1,
        year:   now.getFullYear(),
        status: "pending",
    });

    // ③ Satıcının gözləyən qazancını artır
    const balance = await getOrCreateBalance(sellerId);
    balance.pendingEarning   += sellerEarning;
    balance.totalOrderAmount += orderAmount;
    await balance.save();

    // ④ PashaPay-da split ödəniş sifarişi yarat
    //
    // PashaPay split API-si:
    //   "splits" massivindəki hər element bir alıcı deməkdir.
    //   Brendex öz sub-merchant ID-sinə 10% alır.
    //   Satıcı öz sub-merchant ID-sinə 87% alır.
    //   3% PashaPay özü götürür (splits-ə daxil edilmir).
    //
    // amount: tam qəpik cinsindən (AZN * 100)
    // Nümunə: 100 AZN → amount: 10000
    //
    // NOT: Əgər PashaPay-ın real split API-si fərqlidirsə,
    //      bu strukturu PashaPay sənədlərinə uyğun dəyişdirin.
    //      Ümumi məntiqi dəyişmək lazım deyil — yalnız "body" hissəsi.
    let pashaPayOrderId = null;
    try {
        const ppResponse = await axios.post(
            `${PASHAPAY_BASE_URL}/v1/orders`,
            {
                merchant_id:  PASHAPAY_MERCHANT,
                amount:       Math.round(orderAmount * 100),   // qəpik
                currency:     "AZN",
                description:  `Brendex sifariş: ${orderId}`,
                reference_id: commission._id.toString(),       // bizim Commission ID
                splits: [
                    {
                        // Brendex-in payı (10%)
                        sub_merchant_id: process.env.BRENDEX_SUBMERCHANT_ID,
                        amount:          Math.round(brendexCommission * 100),
                        description:     "Brendex komisyası",
                    },
                    {
                        // Satıcının payı (87%)
                        sub_merchant_id: sellerSubMerchantId,
                        amount:          Math.round(sellerEarning * 100),
                        description:     "Satıcı qazancı",
                    },
                    // 3% PashaPay özü götürür — splits-ə yazmırıq
                ],
            },
            {
                headers: {
                    "Authorization": `Bearer ${PASHAPAY_API_KEY}`,
                    "Content-Type":  "application/json",
                },
                timeout: 10_000,   // 10 saniyə timeout
            }
        );

        // PashaPay-dan gələn sifariş ID-sini saxla
        pashaPayOrderId = ppResponse.data?.order_id || ppResponse.data?.id || null;

        // Commission-a yazırıq — webhook gəldikdə bu ID ilə tapacağıq
        if (pashaPayOrderId) {
            commission.pashaPayOrderId = pashaPayOrderId;
            await commission.save();
        }
    } catch (ppError) {
        // PashaPay xətası commission yaratmağı dayandırmamalıdır —
        // order yarandı, amma PashaPay çağırışı uğursuz oldu.
        // Bu halı logla, sonra retry mexanizmi ilə yenidən cəhd et.
        console.error(
            `[Commission] PashaPay order yaratma uğursuz | orderId: ${orderId} | Xəta: ${ppError.message}`
        );
        // commission.status "pending" qalır — manual müdaxilə üçün
    }

    return commission;
};


// ════════════════════════════════════════════════════════════════════════════
//  2. PASHAPAY WEBHOOK — handlePashaPayWebhook
// ────────────────────────────────────────────────────────────────────────────
// POST /commission/webhook/pashapay
//
// PashaPay ödəniş tamamlandıqda (settled) və ya uğursuz olduqda (failed)
// bu endpoint-ə POST edir.
//
// ⚠️  TƏHLÜKƏSİZLİK: Bu endpoint-ə autentifikasiya middleware-i QOYMA.
//     Yalnız PashaPay çağırır. İmza yoxlaması içəridə edilir.
//
// Webhook body nümunəsi (PashaPay):
//   {
//     "event":          "PAYMENT_SETTLED",
//     "order_id":       "pp_ord_abc123",
//     "transaction_id": "pp_txn_xyz789",
//     "amount":         10000,
//     "currency":       "AZN",
//     "status":         "SETTLED"
//   }
//
// Express-də raw body lazımdır — imza yoxlaması üçün:
//   app.use("/commission/webhook", express.raw({ type: "application/json" }))
// ════════════════════════════════════════════════════════════════════════════
export const handlePashaPayWebhook = async (req, res) => {
    // ① İmza yoxla — saxta webhook-ların qarşısını al
    const signature = req.headers["x-pashapay-signature"] || req.headers["x-signature"];
    const rawBody   = req.body;   // raw buffer (express.raw middleware lazımdır)

    if (PASHAPAY_SECRET_KEY) {
        try {
            const isValid = verifyPashaPayWebhook(rawBody, signature);
            if (!isValid) {
                console.warn("[Webhook] Saxta imza — rədd edildi.");
                return res.status(401).json({ success: false, message: "Etibarsız imza." });
            }
        } catch {
            return res.status(401).json({ success: false, message: "İmza yoxlama xətası." });
        }
    }

    // ② JSON parse et
    let payload;
    try {
        payload = JSON.parse(rawBody.toString());
    } catch {
        return res.status(400).json({ success: false, message: "Etibarsız JSON." });
    }

    const { event, order_id, transaction_id, status } = payload;

    // ③ Commission-u tap — pashaPayOrderId ilə
    const commission = await Commission.findOne({ pashaPayOrderId: order_id });
    if (!commission) {
        // PashaPay-ın test eventləri və ya artıq emal edilmiş webhook-lar üçün
        // 200 qaytarırıq — PashaPay yenidən göndərməsin
        console.warn(`[Webhook] Bilinməyən order_id: ${order_id}`);
        return res.status(200).json({ received: true });
    }

    // ④ Artıq emal edilibsə — idempotency (eyni webhook iki dəfə gəlsə)
    if (commission.status === "settled" || commission.status === "failed") {
        console.info(`[Webhook] Artıq emal edilib: ${order_id} → ${commission.status}`);
        return res.status(200).json({ received: true });
    }

    const now = new Date();

    // ⑤ Webhook növünə görə iş et
    const normalizedStatus = (status || event || "").toUpperCase();

    if (normalizedStatus.includes("SETTLED") || normalizedStatus.includes("SUCCESS")) {
        // ✅ ÖDƏNIŞ UĞURLU — satıcının balansını yenilə
        await markCommissionSettled(commission, transaction_id, payload, now);

    } else if (
        normalizedStatus.includes("FAILED") ||
        normalizedStatus.includes("DECLINED") ||
        normalizedStatus.includes("CANCELLED")
    ) {
        // ❌ ÖDƏNIŞ UĞURSUZ — pendingEarning-i geri al
        await markCommissionFailed(commission, payload, now);

    } else if (normalizedStatus.includes("REFUND")) {
        // 🔄 GERİ QAYTARMA
        await markCommissionRefunded(commission, payload, now);

    } else {
        // Naməlum status — logla, amma 200 qaytar (PashaPay yenidən göndərməsin)
        console.warn(`[Webhook] Naməlum status: ${normalizedStatus} | order_id: ${order_id}`);
    }

    // PashaPay 200 gözləyir — almasa webhook-u təkrar göndərir
    res.status(200).json({ received: true });
};


// ── Webhook köməkçi funksiyaları ─────────────────────────────────────────────

// markCommissionSettled — PashaPay "settled" webhook-u gəldi
//   Commission → "settled"
//   SellerBalance: pendingEarning azal, availableBalance artır, totalEarned artır
async function markCommissionSettled(commission, transactionId, payload, now) {
    // Commission-u yenilə
    commission.status                = "settled";
    commission.pashaPayTransactionId = transactionId || null;
    commission.settledAt             = now;
    commission.webhookPayload        = payload;
    await commission.save();

    // Satıcı balansını yenilə
    //   pendingEarning   → azal (artıq "yolda" deyil)
    //   availableBalance → artır (artıq çəkilə bilər)
    //   totalEarned      → ümumi statistika
    //   totalBrendexCommission → Brendex statistikası
    await SellerBalance.findOneAndUpdate(
        { sellerId: commission.sellerId },
        {
            $inc: {
                pendingEarning:         -commission.sellerEarning,
                availableBalance:        commission.sellerEarning,
                totalEarned:             commission.sellerEarning,
                totalBrendexCommission:  commission.brendexCommission,
            },
        }
    );

    console.info(
        `[Webhook] ✅ Settled | sellerId: ${commission.sellerId} | sellerEarning: ${commission.sellerEarning} AZN`
    );
}

// markCommissionFailed — PashaPay "failed" webhook-u gəldi
//   Commission → "failed"
//   SellerBalance: pendingEarning azal (pul gəlmədi — gözləmə ləğv)
async function markCommissionFailed(commission, payload, now) {
    commission.status         = "failed";
    commission.failedAt       = now;
    commission.webhookPayload = payload;
    await commission.save();

    await SellerBalance.findOneAndUpdate(
        { sellerId: commission.sellerId },
        {
            $inc: {
                pendingEarning:   -commission.sellerEarning,
                totalOrderAmount: -commission.orderAmount,
            },
        }
    );

    console.warn(
        `[Webhook] ❌ Failed | sellerId: ${commission.sellerId} | orderAmount: ${commission.orderAmount} AZN`
    );
}

// markCommissionRefunded — geri qaytarma
//   Commission → "refunded"
//   Əgər settled idisə: availableBalance-dən çıx
async function markCommissionRefunded(commission, payload, now) {
    const wasSettled = commission.status === "settled";

    commission.status         = "refunded";
    commission.refundedAt     = now;
    commission.webhookPayload = payload;
    await commission.save();

    if (wasSettled) {
        // Settled idi → availableBalance-dən çıx
        await SellerBalance.findOneAndUpdate(
            { sellerId: commission.sellerId },
            {
                $inc: {
                    availableBalance:        -commission.sellerEarning,
                    totalEarned:             -commission.sellerEarning,
                    totalBrendexCommission:  -commission.brendexCommission,
                    totalOrderAmount:        -commission.orderAmount,
                },
            }
        );
    } else {
        // Pending idi → sadəcə pendingEarning-i azalt
        await SellerBalance.findOneAndUpdate(
            { sellerId: commission.sellerId },
            {
                $inc: {
                    pendingEarning:   -commission.sellerEarning,
                    totalOrderAmount: -commission.orderAmount,
                },
            }
        );
    }

    console.info(
        `[Webhook] 🔄 Refunded | sellerId: ${commission.sellerId} | wasSettled: ${wasSettled}`
    );
}


// ════════════════════════════════════════════════════════════════════════════
//  3. SİFARİŞ ÜZRƏ KOMİSYA — getOrderCommission
// ────────────────────────────────────────────────────────────────────────────
// GET /commission/order/:orderId
//
// Sifariş detalları səhifəsində:
//   "Bu sifarişdən 10 AZN Brendex komisyası tutuldu, sizə 87 AZN çatdı."
// ════════════════════════════════════════════════════════════════════════════
export const getOrderCommission = async (req, res) => {
    try {
        const commission = await Commission.findOne({ orderId: req.params.orderId });

        if (!commission) {
            return res.status(404).json({ success: false, message: "Komisya tapılmadı." });
        }

        res.json({
            success: true,
            data: {
                orderAmount:              commission.orderAmount,
                brendexCommission:        commission.brendexCommission,
                brendexCommissionPercent: commission.brendexCommissionPercent,
                providerFee:              commission.providerFee,
                providerFeePercent:       commission.providerFeePercent,
                sellerEarning:            commission.sellerEarning,
                sellerEarningPercent:     commission.sellerEarningPercent,
                status:                   commission.status,
                settledAt:                commission.settledAt,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// ════════════════════════════════════════════════════════════════════════════
//  4. SATICININ BALANSI — getSellerBalance
// ────────────────────────────────────────────────────────────────────────────
// GET /commission/balance/:sellerId
//
// Satıcı paneli "Balans" widget-i:
//   "Çəkilə bilər: 870 AZN | Gözləyən: 87 AZN"
// ════════════════════════════════════════════════════════════════════════════
export const getSellerBalance = async (req, res) => {
    try {
        const balance = await getOrCreateBalance(req.params.sellerId);
        res.json({ success: true, balance });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// ════════════════════════════════════════════════════════════════════════════
//  5. AYLIK XÜLASƏ — getMonthlyCommission
// ────────────────────────────────────────────────────────────────────────────
// GET /commission/monthly/:sellerId?month=3&year=2026
//
// Satıcı paneli aylıq hesabat:
//   "Mart 2026: 15 sifariş | 1500 AZN dövriyyə | 150 AZN Brendex komisyası | 1305 AZN sizə"
// ════════════════════════════════════════════════════════════════════════════
export const getMonthlyCommission = async (req, res) => {
    try {
        const { sellerId } = req.params;
        const now   = new Date();
        const month = parseInt(req.query.month) || now.getMonth() + 1;
        const year  = parseInt(req.query.year)  || now.getFullYear();

        const commissions = await Commission.find({ sellerId, month, year }).populate(
            "orderId", "createdAt totalPrice"
        );

        const totalOrderAmount      = commissions.reduce((s, c) => s + c.orderAmount,      0);
        const totalBrendexCommission= commissions.reduce((s, c) => s + c.brendexCommission, 0);
        const totalProviderFee      = commissions.reduce((s, c) => s + c.providerFee,       0);
        const totalSellerEarning    = commissions.reduce((s, c) => s + c.sellerEarning,     0);

        // Status üzrə saylar
        const byStatus = commissions.reduce((acc, c) => {
            acc[c.status] = (acc[c.status] || 0) + 1;
            return acc;
        }, {});

        const pendingAmount  = commissions
            .filter((c) => c.status === "pending")
            .reduce((s, c) => s + c.sellerEarning, 0);

        const settledAmount  = commissions
            .filter((c) => c.status === "settled")
            .reduce((s, c) => s + c.sellerEarning, 0);

        res.json({
            success: true,
            month,
            year,
            summary: {
                totalOrders:          commissions.length,
                totalOrderAmount,
                totalBrendexCommission,
                totalProviderFee,
                totalSellerEarning,
                pendingSellerEarning: pendingAmount,   // hələ gözlənilir
                settledSellerEarning: settledAmount,   // artıq çəkilə bilər
                byStatus,
            },
            commissions,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// ════════════════════════════════════════════════════════════════════════════
//  6. SATICININ QAZANCINI ÇƏKMƏSİ — withdrawBalance
// ────────────────────────────────────────────────────────────────────────────
// POST /commission/withdraw
// Body: { sellerId, amount }
//
// Satıcı öz availableBalance-ini hesabına çıxarır.
//
// Niyə pendingEarning-ə toxunmuruz?
//   pendingEarning hələ PashaPay-dan "settled" olmayıb.
//   Ola bilsin ödəniş uğursuz olsun → pul gəlməsin.
//   Yalnız availableBalance (artıq settled) çəkilə bilər.
// ════════════════════════════════════════════════════════════════════════════
export const withdrawBalance = async (req, res) => {
    try {
        const { sellerId, amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Məbləğ 0-dan böyük olmalıdır.",
            });
        }

        const balance = await SellerBalance.findOne({ sellerId });

        if (!balance || balance.availableBalance < amount) {
            return res.status(400).json({
                success:          false,
                message:          "Kifayət qədər balans yoxdur.",
                availableBalance: balance?.availableBalance || 0,
            });
        }

        balance.availableBalance -= amount;
        balance.totalWithdrawn   += amount;
        await balance.save();

        res.json({
            success:          true,
            message:          `${amount.toFixed(2)} AZN uğurla çəkildi!`,
            remainingBalance: balance.availableBalance,
            pendingEarning:   balance.pendingEarning,   // məlumat üçün
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// ════════════════════════════════════════════════════════════════════════════
//  7. ADMİN — BÜTÜN KOMİSYALAR — getAllCommissions
// ────────────────────────────────────════════════════════════════════════════
// GET /commission/admin/all?month=3&year=2026&status=pending&sellerId=X
//
// Admin paneli "Komisyalar" cədvəli.
// Dinamik filter: göndərilən parametrlər nəzərə alınır, qalanları yox.
// ════════════════════════════════════════════════════════════════════════════
export const getAllCommissions = async (req, res) => {
    try {
        const filter = {};
        if (req.query.month)    filter.month    = parseInt(req.query.month);
        if (req.query.year)     filter.year     = parseInt(req.query.year);
        if (req.query.status)   filter.status   = req.query.status;
        if (req.query.sellerId) filter.sellerId = req.query.sellerId;

        const commissions = await Commission.find(filter)
            .populate("sellerId", "name email")
            .populate("orderId",  "totalPrice createdAt")
            .sort({ createdAt: -1 });

        // Ümumi məbləğlər — admin dashboard statistikası
        const totals = commissions.reduce(
            (acc, c) => {
                acc.orderAmount       += c.orderAmount;
                acc.brendexCommission += c.brendexCommission;
                acc.providerFee       += c.providerFee;
                acc.sellerEarning     += c.sellerEarning;
                return acc;
            },
            { orderAmount: 0, brendexCommission: 0, providerFee: 0, sellerEarning: 0 }
        );

        res.json({
            success: true,
            count:   commissions.length,
            totals,
            commissions,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// ════════════════════════════════════════════════════════════════════════════
//  8. ADMİN — BÜTÜN SATICI BALANSLARI — getAllSellerBalances
// ────────────────────────────────────────────────────────────────────────────
// GET /commission/admin/balances
//
// Admin "Satıcı Balansları" səhifəsi.
// availableBalance-ə görə azalan sıra — ən çox pulu olan üstdə.
// ════════════════════════════════════════════════════════════════════════════
export const getAllSellerBalances = async (req, res) => {
    try {
        const balances = await SellerBalance.find()
            .populate("sellerId", "name email")
            .sort({ availableBalance: -1 });

        const totalPendingEarning = balances.reduce((s, b) => s + b.pendingEarning,   0);
        const totalAvailable      = balances.reduce((s, b) => s + b.availableBalance, 0);
        const totalBrendexEarned  = balances.reduce((s, b) => s + b.totalBrendexCommission, 0);

        res.json({
            success: true,
            summary: {
                totalPendingEarning,   // platformada hələ gözləyən ümumi pul
                totalAvailable,        // satıcıların çəkə biləcəyi ümumi pul
                totalBrendexEarned,    // Brendex-in platformada topladığı ümumi komisya
            },
            count:    balances.length,
            balances,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// ════════════════════════════════════════════════════════════════════════════
//  9. WEBHOOK STATUS YOXLAMA — checkCommissionStatus
// ────────────────────────────────────────────────────────────────────────────
// GET /commission/status/:orderId
//
// Əgər webhook gecikirsa — frontend polling edə bilər.
// Satıcı: "Ödənişim gəldimi?" → bu endpoint yoxlayır.
// ════════════════════════════════════════════════════════════════════════════
export const checkCommissionStatus = async (req, res) => {
    try {
        const commission = await Commission.findOne({ orderId: req.params.orderId });

        if (!commission) {
            return res.status(404).json({ success: false, message: "Komisya tapılmadı." });
        }

        res.json({
            success: true,
            status:  commission.status,        // "pending" | "settled" | "failed" | "refunded"
            settledAt:  commission.settledAt,
            sellerEarning: commission.sellerEarning,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};