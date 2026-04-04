import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import BonusTransaction from "../model/BonusTransaction.js";
import BonusConfig from "../model/BonusConfig.js";
import User from "../model/User.js";
import Order from "../model/Order.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";


// =====================================================================
// YARDIMÇI: aktiv kampaniya çarpanını al
// =====================================================================
const getMultiplier = async () => {
    const config = await BonusConfig.getConfig();
    if (!config.campaignActive) return 1;
    const now = new Date();
    if (config.campaignEndsAt && now > config.campaignEndsAt) {
        // Kampaniya vaxtı keçib — avtomatik deaktiv et
        config.campaignActive = false;
        config.campaignMultiplier = 1;
        await config.save();
        return 1;
    }
    return config.campaignMultiplier || 1;
};


// =====================================================================
// YARDIMÇI: bonusBalance-i yenidən hesabla (ledger-dən)
// Denormalizasiya dəyərini sync saxlamaq üçün.
// =====================================================================
const syncBonusBalance = async (userId) => {
    const earn = await BonusTransaction.aggregate([
        { $match: { user: userId, type: "earn", isUsed: false, isExpired: false } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const balance = earn[0]?.total || 0;
    await User.findByIdAndUpdate(userId, { bonusBalance: balance });
    return balance;
};


// =====================================================================
// YARDIMÇI: vaxtı keçmiş bonusları expire et
// =====================================================================
const expireOldBonuses = async (userId) => {
    const now = new Date();
    const expired = await BonusTransaction.find({
        user:      userId,
        type:      "earn",
        isUsed:    false,
        isExpired: false,
        expiresAt: { $lt: now },
    });

    for (const tx of expired) {
        tx.isExpired = true;
        await tx.save();

        // expire qeydi
        await BonusTransaction.create({
            user:   userId,
            type:   "expire",
            source: "expire",
            amount: tx.amount,
            note:   `Bonus vaxtı keçdi (earn ID: ${tx._id})`,
        });
    }

    if (expired.length > 0) {
        await syncBonusBalance(userId);
    }
};


// =====================================================================
// YARDIMÇI: FIFO bonus düş (xərclə)
// bonusCount qədər bonus ən köhnəsindən başlayaraq isUsed=true et
// =====================================================================
const consumeBonusFifo = async (userId, bonusCount, orderId) => {
    const earns = await BonusTransaction.find({
        user:      userId,
        type:      "earn",
        isUsed:    false,
        isExpired: false,
        expiresAt: { $gt: new Date() },
    }).sort({ expiresAt: 1 });

    let remaining = bonusCount;
    for (const tx of earns) {
        if (remaining <= 0) break;
        const consume = Math.min(tx.amount, remaining);
        if (consume === tx.amount) {
            tx.isUsed = true;
        } else {
            // Qismən istifadə: köhnə transaksiyanı böl
            tx.amount -= consume;
            await tx.save();

            // Ayrı "use" sənəd yarat
            await BonusTransaction.create({
                user:      userId,
                type:      "earn",
                source:    tx.source,
                amount:    consume,
                expiresAt: tx.expiresAt,
                isUsed:    true,
                orderId,
                note:      `Partial use from earn ${tx._id}`,
            });
            remaining -= consume;
            continue;
        }
        tx.orderId = orderId;
        await tx.save();
        remaining -= consume;
    }

    await BonusTransaction.create({
        user:   userId,
        type:   "use",
        source: "use",
        amount: bonusCount,
        orderId,
        note:   `Sifariş üçün ${bonusCount} bonus istifadə edildi`,
    });

    return await syncBonusBalance(userId);
};


// =====================================================================
// YARDIMÇI: anomaly yoxlama
// =====================================================================
const checkAnomaly = async (userId, config) => {
    // 7 gündə çox bonus qazanma yoxlaması
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyEarns = await BonusTransaction.aggregate([
        {
            $match: {
                user:      userId,
                type:      "earn",
                createdAt: { $gte: sevenDaysAgo },
            },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const weeklyTotal = weeklyEarns[0]?.total || 0;
    if (weeklyTotal >= config.weeklyEarnLimit) {
        // Flag et
        await BonusTransaction.updateMany(
            { user: userId, type: "earn", flagged: false },
            { flagged: true }
        );
        return true; // anomaly detected
    }
    return false;
};


// =====================================================================
// PUBLIC: KONFIQ ƏLDƏ ET
// GET /bonus/config
// =====================================================================
export const getBonusConfig = catchAsyncErrors(async (req, res) => {
    const config = await BonusConfig.getConfig();
    const now = new Date();
    const campaignActive = config.campaignActive && (!config.campaignEndsAt || now <= config.campaignEndsAt);

    res.status(200).json({
        success: true,
        config: {
            cartMinOrder:         config.cartMinOrder,
            cartBaseBonus:        config.cartBaseBonus,
            cartStepAzn:          config.cartStepAzn,
            reviewBonusEnabled:   config.reviewBonusEnabled,
            reviewBonusAmount:    config.reviewBonusAmount,
            reviewMaxLifetime:    config.reviewMaxLifetime,
            referralBonusAmount:  config.referralBonusAmount,
            maxRedemptionPercent: config.maxRedemptionPercent,
            bonusValueAzn:        config.bonusValueAzn,
            bonusExpiryDays:      config.bonusExpiryDays,
            campaignActive,
            campaignMultiplier:   campaignActive ? config.campaignMultiplier : 1,
            campaignName:         campaignActive ? config.campaignName : "",
            campaignEndsAt:       campaignActive ? config.campaignEndsAt : null,
        },
    });
});


// =====================================================================
// İSTİFADƏÇİ: ÖZ BONUSLARINI ƏLDƏ ET
// GET /bonus/my
// =====================================================================
export const getMyBonus = catchAsyncErrors(async (req, res) => {
    const userId = req.user._id;

    // Vaxtı keçmiş bonusları əvvəlcə expire et
    await expireOldBonuses(userId);

    const balance = await syncBonusBalance(userId);

    // Son 50 əməliyyat
    const transactions = await BonusTransaction.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

    res.status(200).json({
        success: true,
        balance,
        transactions,
        referralCode:    req.user.referralCode || null,
        isPhoneVerified: req.user.isPhoneVerified || false,
        phone:           req.user.phone || null,
    });
});


// =====================================================================
// TELEFON: OTP GÖNDƏR
// POST /bonus/phone/request
// Body: { phone }
// =====================================================================
export const requestPhoneOtp = catchAsyncErrors(async (req, res, next) => {
    const { phone } = req.body;

    if (!phone || phone.trim().length < 7) {
        return next(new ErrorHandler("Düzgün telefon nömrəsi daxil edin", 400));
    }

    // Eyni nömrə başqa doğrulanmış hesabda var?
    const existing = await User.findOne({
        phone:           phone.trim(),
        isPhoneVerified: true,
        _id:             { $ne: req.user._id },
    });
    if (existing) {
        return next(new ErrorHandler("Bu telefon nömrəsi artıq başqa hesabda qeydiyyatdadır", 400));
    }

    // 6 rəqəmli OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 10 dəqiqə ömür
    const expire = new Date(Date.now() + 10 * 60 * 1000);

    // Hash edib saxla (plain text saxlamırıq)
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    req.user.phone = phone.trim();
    req.user.phoneOtp = hashedOtp;
    req.user.phoneOtpExpire = expire;
    await req.user.save({ validateBeforeSave: false });

    // OTP-ni email ilə göndər (SMS üçün Twilio inteqrasiyası sonra əlavə edilə bilər)
    await sendEmail({
        email:   req.user.email,
        subject: "Brendex — Telefon Doğrulama Kodu",
        message: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
                <h2 style="color:#E8192C">Brendex</h2>
                <p>Telefon nömrənizi doğrulamaq üçün aşağıdakı kodu istifadə edin:</p>
                <div style="background:#f4f5f7;padding:20px;border-radius:12px;text-align:center">
                    <span style="font-size:32px;font-weight:900;letter-spacing:8px;color:#1a1a1a">${otp}</span>
                </div>
                <p style="color:#999;font-size:12px;margin-top:16px">
                    Bu kod 10 dəqiqə ərzində keçərlidir. Kodu heç kimlə paylaşmayın.
                </p>
            </div>
        `,
    });

    res.status(200).json({
        success: true,
        message: "OTP kodu emailinizə göndərildi",
    });
});


// =====================================================================
// TELEFON: OTP DOĞRULA
// POST /bonus/phone/verify
// Body: { phone, otp }
// =====================================================================
export const verifyPhoneOtp = catchAsyncErrors(async (req, res, next) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return next(new ErrorHandler("Telefon nömrəsi və OTP tələb olunur", 400));
    }

    const user = req.user; // auth middleware already selected everything except passwords usually

    if (!user.phoneOtp || !user.phoneOtpExpire) {
        return next(new ErrorHandler("OTP tapılmadı. Yenidən sorğu göndərin", 400));
    }

    if (new Date() > user.phoneOtpExpire) {
        return next(new ErrorHandler("OTP-nin vaxtı keçib. Yenidən sorğu göndərin", 400));
    }

    const hashedInput = crypto.createHash("sha256").update(otp).digest("hex");
    if (hashedInput !== user.phoneOtp) {
        return next(new ErrorHandler("OTP yanlışdır", 400));
    }

    user.phone           = phone.trim();
    user.isPhoneVerified = true;
    user.phoneOtp        = undefined;
    user.phoneOtpExpire  = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: "Telefon nömrəsi uğurla doğrulandı",
    });
});


// =====================================================================
// BONUS İSTİFADƏ ET (REDEEM)
// POST /bonus/redeem
// Body: { bonusCount, orderTotal }
// Qeyd: orderId-siz çağırılır — sifariş yaradılmazdan əvvəl yoxlanılır.
// Sifariş yaradılanda orderController consumeBonusFifo çağırır.
// =====================================================================
export const redeemBonuses = catchAsyncErrors(async (req, res, next) => {
    const { bonusCount, orderTotal } = req.body;
    const userId = req.user._id;

    if (!bonusCount || bonusCount < 1) {
        return next(new ErrorHandler("Bonus sayı ən az 1 olmalıdır", 400));
    }

    // Telefon doğrulaması mütləqdir
    if (!req.user.isPhoneVerified) {
        return next(new ErrorHandler("Bonus istifadəsi üçün telefon nömrənizi doğrulamalısınız", 403, "PHONE_REQUIRED"));
    }

    const config = await BonusConfig.getConfig();

    // Məbləğ limiti yoxlaması: max 30% sifarişdə
    const maxBonus = Math.floor((orderTotal * config.maxRedemptionPercent) / 100 / config.bonusValueAzn);
    if (bonusCount > maxBonus) {
        return next(new ErrorHandler(
            `Maksimum ${maxBonus} bonus istifadə edilə bilər (sifarişin ${config.maxRedemptionPercent}%-i)`,
            400
        ));
    }

    // Vaxtı keçmiş bonusları expire et
    await expireOldBonuses(userId);

    // Balans yoxla
    const balance = await syncBonusBalance(userId);
    if (bonusCount > balance) {
        return next(new ErrorHandler(`Kifayət qədər bonus yoxdur. Cari balans: ${balance}`, 400));
    }

    // Flagged hesab yoxlaması
    const flagged = await BonusTransaction.findOne({ user: userId, flagged: true });
    if (flagged) {
        return next(new ErrorHandler("Hesabınız təhlükəsizlik yoxlamasına göndərilib. Dəstək ilə əlaqə saxlayın", 403));
    }

    const discountAzn = bonusCount * config.bonusValueAzn;

    res.status(200).json({
        success:     true,
        bonusCount,
        discountAzn,
        newTotal:    Math.max(0, orderTotal - discountAzn),
        message:     `${bonusCount} bonus aktivləşdirildi (−${discountAzn} AZN)`,
    });
});


// =====================================================================
// BONUS GERİ VER (ödəniş uğursuz olduqda)
// POST /bonus/cancel-redeem
// Body: { orderId }
// =====================================================================
export const cancelBonusRedeem = catchAsyncErrors(async (req, res, next) => {
    const { orderId } = req.body;
    const userId = req.user._id;

    if (!orderId) return next(new ErrorHandler("Sifariş ID tələb olunur", 400));

    // Sifariş üçün istifadə edilmiş bonusları tap
    const useTx = await BonusTransaction.findOne({
        user:    userId,
        type:    "use",
        orderId,
    });

    if (!useTx) {
        return res.status(200).json({ success: true, message: "Geri qaytarılacaq bonus tapılmadı" });
    }

    // İstifadə edilmiş earn txs-ləri geri aç
    await BonusTransaction.updateMany(
        { user: userId, type: "earn", orderId },
        { isUsed: false, orderId: null }
    );

    // Use txs sil
    await BonusTransaction.deleteMany({ user: userId, type: "use", orderId });

    const balance = await syncBonusBalance(userId);

    res.status(200).json({
        success: true,
        balance,
        message: `${useTx.amount} bonus geri qaytarıldı`,
    });
});


// =====================================================================
// RƏY BONUSU VER
// POST /bonus/review/:productId
// =====================================================================
export const awardReviewBonus = catchAsyncErrors(async (req, res, next) => {
    const userId     = req.user._id;
    const { productId } = req.params;
    const config = await BonusConfig.getConfig();

    if (!config.reviewBonusEnabled) {
        return res.status(200).json({ success: false, message: "Rəy bonusu aktiv deyil" });
    }

    // Lifetime limit yoxla
    const reviewCount = await BonusTransaction.countDocuments({
        user:   userId,
        type:   "earn",
        source: "review",
    });

    if (reviewCount >= config.reviewMaxLifetime) {
        return res.status(200).json({
            success: false,
            message: `Maksimum rəy bonusu limitinə çatıldı (${config.reviewMaxLifetime})`,
        });
    }

    // Saatda 5-dən çox cəhd (rate limit)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAttempts = await BonusTransaction.countDocuments({
        user:      userId,
        source:    "review",
        createdAt: { $gte: oneHourAgo },
    });
    if (recentAttempts >= 5) {
        return next(new ErrorHandler("Çox tez-tez rəy bonusu tələb etdiniz. Bir az gözləyin", 429));
    }

    const multiplier = await getMultiplier();
    const amount = config.reviewBonusAmount * multiplier;
    const expiresAt = new Date(Date.now() + config.bonusExpiryDays * 24 * 60 * 60 * 1000);

    await BonusTransaction.create({
        user:       userId,
        type:       "earn",
        source:     "review",
        amount,
        multiplier,
        expiresAt,
        note:       `Məhsul rəyi üçün bonus (productId: ${productId})`,
    });

    const balance = await syncBonusBalance(userId);

    // Anomaly yoxla
    await checkAnomaly(userId, config);

    res.status(200).json({
        success:    true,
        earned:     amount,
        balance,
        multiplier,
        message:    `+${amount} bonus qazandınız!`,
    });
});


// =====================================================================
// REFERRAL LİNK MƏLUMATI
// GET /bonus/referral
// =====================================================================
export const getReferralInfo = catchAsyncErrors(async (req, res) => {
    const referralCode = req.user.referralCode;

    // Referral statistikası
    const totalReferred = await User.countDocuments({ referredBy: userId });
    const earnedFromReferral = await BonusTransaction.aggregate([
        { $match: { user: userId, type: "earn", source: "referral" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const frontendUrl = process.env.FRONTEND_URL || "";

    res.status(200).json({
        success:          true,
        referralCode:     req.user.referralCode || null,
        referralLink:     req.user.referralCode ? `${frontendUrl}/register?ref=${req.user.referralCode}` : null,
        totalReferred,
        earnedFromReferral: earnedFromReferral[0]?.total || 0,
    });
});


// =====================================================================
// INTERNAL: SƏBƏT BONUSU VER (updateOrderStatus çağırır)
// =====================================================================
export const awardCartBonus = async (userId, order) => {
    const config = await BonusConfig.getConfig();
    const total = order.totalAmount - (order.bonusUsed || 0) * config.bonusValueAzn;

    if (total < config.cartMinOrder) return 0;

    const base = config.cartBaseBonus;
    const extra = Math.floor((total - config.cartMinOrder) / config.cartStepAzn);
    const baseAmount = base + extra;

    const multiplier = await getMultiplier();
    const amount = baseAmount * multiplier;
    const expiresAt = new Date(Date.now() + config.bonusExpiryDays * 24 * 60 * 60 * 1000);

    await BonusTransaction.create({
        user:       userId,
        type:       "earn",
        source:     "cart",
        amount,
        orderId:    order._id,
        multiplier,
        expiresAt,
        note:       `Sifariş ${order._id} üçün səbət bonusu (${total} AZN)`,
    });

    const balance = await syncBonusBalance(userId);

    // Anomaly yoxla
    await checkAnomaly(userId, config);

    // Order-ə qazanılan bonus sayını yaz
    await Order.findByIdAndUpdate(order._id, { bonusEarned: amount });

    return balance;
};


// =====================================================================
// INTERNAL: REFERRAL BONUSU VER
// Yalnız referredUser-in İLK sifarişi delivered olduqda çağırılır.
// =====================================================================
export const awardReferralBonus = async (referredUserId) => {
    const referredUser = await User.findById(referredUserId).select("referredBy");
    if (!referredUser || !referredUser.referredBy) return;

    const referrerId = referredUser.referredBy;
    const config = await BonusConfig.getConfig();
    const multiplier = await getMultiplier();
    const amount = config.referralBonusAmount * multiplier;
    const expiresAt = new Date(Date.now() + config.bonusExpiryDays * 24 * 60 * 60 * 1000);

    // Artıq bu referral üçün bonus verilmişmi?
    const alreadyAwarded = await BonusTransaction.findOne({
        user:           referrerId,
        source:         "referral",
        referredUserId: referredUserId,
    });
    if (alreadyAwarded) return;

    await BonusTransaction.create({
        user:           referrerId,
        type:           "earn",
        source:         "referral",
        amount,
        multiplier,
        expiresAt,
        referredUserId,
        note:           `${referredUserId} istifadəçisinin ilk sifarişi üçün referral bonusu`,
    });

    await syncBonusBalance(referrerId);
};


// =====================================================================
// INTERNAL: FIFO İSTİFADƏ (orderController çağırır)
// =====================================================================
export { consumeBonusFifo };


// ─────────────────────────────────────────────────────────────────────
// ADMİN FUNKSIYALAR
// ─────────────────────────────────────────────────────────────────────

export const getAdminConfig = catchAsyncErrors(async (req, res) => {
    const config = await BonusConfig.getConfig();
    res.status(200).json({ success: true, config });
});


export const updateAdminConfig = catchAsyncErrors(async (req, res, next) => {
    const allowed = [
        "cartMinOrder", "cartBaseBonus", "cartStepAzn",
        "reviewBonusEnabled", "reviewMaxLifetime", "reviewBonusAmount",
        "referralBonusAmount", "maxRedemptionPercent", "bonusValueAzn",
        "bonusExpiryDays", "maxDeviceAccounts", "weeklyEarnLimit",
    ];

    const updates = {};
    for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const config = await BonusConfig.findOneAndUpdate({}, updates, { new: true, upsert: true });
    res.status(200).json({ success: true, config });
});


export const startCampaign = catchAsyncErrors(async (req, res, next) => {
    const { campaignName, campaignMultiplier, campaignEndsAt } = req.body;

    if (!campaignName || !campaignMultiplier) {
        return next(new ErrorHandler("Kampaniya adı və çarpanı tələb olunur", 400));
    }
    if (![2, 3, 5].includes(Number(campaignMultiplier))) {
        return next(new ErrorHandler("Çarpan 2, 3 və ya 5 olmalıdır", 400));
    }

    const config = await BonusConfig.findOneAndUpdate(
        {},
        {
            campaignActive:     true,
            campaignName:       campaignName.trim(),
            campaignMultiplier: Number(campaignMultiplier),
            campaignStartsAt:   new Date(),
            campaignEndsAt:     campaignEndsAt ? new Date(campaignEndsAt) : null,
        },
        { new: true, upsert: true }
    );

    res.status(200).json({ success: true, config, message: `${campaignName} kampaniyası başladı!` });
});


export const endCampaign = catchAsyncErrors(async (req, res) => {
    const config = await BonusConfig.findOneAndUpdate(
        {},
        { campaignActive: false, campaignMultiplier: 1, campaignName: "" },
        { new: true, upsert: true }
    );
    res.status(200).json({ success: true, config, message: "Kampaniya bitirildi" });
});


export const getAdminTransactions = catchAsyncErrors(async (req, res) => {
    const { page = 1, limit = 50, userId, type, source, flagged } = req.query;
    const filter = {};
    if (userId)  filter.user    = userId;
    if (type)    filter.type    = type;
    if (source)  filter.source  = source;
    if (flagged !== undefined) filter.flagged = flagged === "true";

    const skip = (Number(page) - 1) * Number(limit);
    const [transactions, total] = await Promise.all([
        BonusTransaction.find(filter)
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        BonusTransaction.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, transactions, total, page: Number(page) });
});


export const getAnomalies = catchAsyncErrors(async (req, res) => {
    const flaggedUsers = await BonusTransaction.distinct("user", { flagged: true });
    const users = await User.find({ _id: { $in: flaggedUsers } })
        .select("name email phone isPhoneVerified bonusBalance createdAt")
        .lean();

    res.status(200).json({ success: true, flaggedUsers: users, count: users.length });
});
