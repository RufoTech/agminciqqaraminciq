// =====================================================================
// BLOGER CONTROLLER — controllers/bloggerController.js
// ---------------------------------------------------------------------
// Sistem məntiqi:
//   • Hər bloger öz promo kodu ilə alıcı gətirir.
//   • Alıcının etdiyi hər sifarişdən bloger öz commissionRate-i qədər
//     komissiya qazanır (məs. 40% → sifariş 100 AZN → 40 AZN komissiya).
//   • Komissiya 6 ay (commissionDuration) müddətində ödənilir.
//   • commissionStartDate — blogerin ilk satışı qeydə alındıqda set edilir.
//   • Hər bloger üçün hesablamalar tam ayrıdır.
// =====================================================================

import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler     from "../utils/errorHandler.js";
import Blogger, { generatePromoCode } from "../model/Blogger.js";
import BloggerSale      from "../model/BloggerSale.js";
import sendToken        from "../utils/sendToken.js";


// ─────────────────────────────────────────────────────────────────────
//  ADMIN — BLOGER YARAT
//  POST /commerce/mehsullar/superadmin/bloggers/create
// ─────────────────────────────────────────────────────────────────────
// Body: { firstName, lastName, fatherName, email, phone, password, commissionRate }
export const createBlogger = catchAsyncErrors(async (req, res, next) => {
    const { firstName, lastName, fatherName, email, phone, password, commissionRate } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return next(new ErrorHandler("Ad, soyad, e-poçt və şifrə mütləqdir.", 400));
    }

    const existing = await Blogger.findOne({ email });
    if (existing) {
        return next(new ErrorHandler("Bu e-poçt artıq qeydiyyatdadır.", 400));
    }

    const blogger = await Blogger.create({
        firstName,
        lastName,
        fatherName: fatherName || "",
        email,
        phone,
        password,
        commissionRate: commissionRate || 40,
        // commissionStartDate — ilk satış baş verdikdə set ediləcək
    });

    res.status(201).json({
        success: true,
        message: "Bloger uğurla yaradıldı.",
        blogger: {
            _id:            blogger._id,
            fullName:       `${blogger.firstName} ${blogger.lastName}`,
            email:          blogger.email,
            phone:          blogger.phone,
            promoCode:      blogger.promoCode,
            promoLink:      blogger.promoLink,
            commissionRate: blogger.commissionRate,
            isActive:       blogger.isActive,
            createdAt:      blogger.createdAt,
        },
    });
});


// ─────────────────────────────────────────────────────────────────────
//  ADMIN — BLOGER SİYAHISI
//  GET /commerce/mehsullar/superadmin/bloggers
// ─────────────────────────────────────────────────────────────────────
// Query: page, limit, search, rate, isActive
export const getAllBloggers = catchAsyncErrors(async (req, res, next) => {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = {};

    if (req.query.search) {
        const rx = new RegExp(req.query.search, "i");
        filter.$or = [
            { firstName: rx },
            { lastName:  rx },
            { email:     rx },
            { promoCode: rx },
        ];
    }

    if (req.query.rate) {
        filter.commissionRate = parseInt(req.query.rate);
    }

    if (req.query.isActive !== undefined) {
        filter.isActive = req.query.isActive === "true";
    }

    const [total, bloggers] = await Promise.all([
        Blogger.countDocuments(filter),
        Blogger.find(filter)
            .select("-password -resetPasswordToken -resetPasswordExpire")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
    ]);

    // Hər bloger üçün gözlənilən komissiyayi əlavə et
    const bloggersWithPending = bloggers.map((b) => ({
        ...b.toObject(),
        pendingCommission: Math.max(0, b.totalCommissionEarned - b.totalCommissionPaid),
        commissionActive:  b.isCommissionActive(),
    }));

    res.status(200).json({
        success: true,
        total,
        page,
        pages: Math.ceil(total / limit),
        bloggers: bloggersWithPending,
    });
});


// ─────────────────────────────────────────────────────────────────────
//  ADMIN — TEK BLOGER
//  GET /commerce/mehsullar/superadmin/bloggers/:id
// ─────────────────────────────────────────────────────────────────────
export const getBloggerById = catchAsyncErrors(async (req, res, next) => {
    const blogger = await Blogger.findById(req.params.id)
        .select("-password -resetPasswordToken -resetPasswordExpire");

    if (!blogger) {
        return next(new ErrorHandler("Bloger tapılmadı.", 404));
    }

    // Son 10 satış
    const recentSales = await BloggerSale.find({ blogger: blogger._id })
        .sort({ saleDate: -1 })
        .limit(10)
        .populate("customer", "name email")
        .populate("order",    "orderStatus totalPrice createdAt");

    // Statistika xülasəsi
    const [pendingResult, paidResult] = await Promise.all([
        BloggerSale.aggregate([
            { $match: { blogger: blogger._id, paymentStatus: "pending" } },
            { $group: { _id: null, total: { $sum: "$commissionAmount" }, count: { $sum: 1 } } },
        ]),
        BloggerSale.aggregate([
            { $match: { blogger: blogger._id, paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$commissionAmount" }, count: { $sum: 1 } } },
        ]),
    ]);

    res.status(200).json({
        success: true,
        blogger: {
            ...blogger.toObject(),
            commissionActive:  blogger.isCommissionActive(),
            pendingCommission: pendingResult[0]?.total  || 0,
            pendingSalesCount: pendingResult[0]?.count  || 0,
            paidCommission:    paidResult[0]?.total     || 0,
            paidSalesCount:    paidResult[0]?.count     || 0,
        },
        recentSales,
    });
});


// ─────────────────────────────────────────────────────────────────────
//  ADMIN — BLOGER YENİLƏ
//  PUT /commerce/mehsullar/superadmin/bloggers/:id
// ─────────────────────────────────────────────────────────────────────
// Şifrə buradan dəyişdirilmir.
export const updateBlogger = catchAsyncErrors(async (req, res, next) => {
    const { firstName, lastName, fatherName, email, phone, isActive } = req.body;

    const blogger = await Blogger.findById(req.params.id);
    if (!blogger) {
        return next(new ErrorHandler("Bloger tapılmadı.", 404));
    }

    if (firstName)                blogger.firstName  = firstName;
    if (lastName)                 blogger.lastName   = lastName;
    if (fatherName !== undefined) blogger.fatherName = fatherName;
    if (email)                    blogger.email      = email;
    if (phone)                    blogger.phone      = phone;
    if (isActive !== undefined)   blogger.isActive   = isActive;

    await blogger.save();

    res.status(200).json({
        success: true,
        message: "Bloger məlumatları yeniləndi.",
        blogger,
    });
});


// ─────────────────────────────────────────────────────────────────────
//  ADMIN — KOMİSSİYA FAİZİ DƏYİŞ
//  PUT /commerce/mehsullar/superadmin/bloggers/:id/commission
// ─────────────────────────────────────────────────────────────────────
// Body: { commissionRate: 30 }
// Qeyd: faiz dəyişikliyi yalnız NÖVBƏTI satışlara təsir edir,
//       artıq qeydə alınmış satışlar öz faizini saxlayır.
export const updateCommissionRate = catchAsyncErrors(async (req, res, next) => {
    const rate = Number(req.body.commissionRate);

    if (![20, 30, 40, 41].includes(rate)) {
        return next(new ErrorHandler("Komissiya faizi 20, 30, 40 və ya 41 ola bilər.", 400));
    }

    const blogger = await Blogger.findByIdAndUpdate(
        req.params.id,
        { commissionRate: rate },
        { new: true, runValidators: true }
    ).select("-password");

    if (!blogger) {
        return next(new ErrorHandler("Bloger tapılmadı.", 404));
    }

    res.status(200).json({
        success: true,
        message: `Komissiya faizi ${rate}% olaraq yeniləndi.`,
        blogger,
    });
});


// ─────────────────────────────────────────────────────────────────────
//  ADMIN — KOMİSSİYA MÜDDƏTİNİ YENILƏ
//  PUT /commerce/mehsullar/superadmin/bloggers/:id/commission-duration
// ─────────────────────────────────────────────────────────────────────
// Body: { commissionDuration: 12, commissionStartDate: "2024-01-01" (optional) }
export const updateCommissionDuration = catchAsyncErrors(async (req, res, next) => {
    const { commissionDuration, commissionStartDate } = req.body;

    if (!commissionDuration || commissionDuration < 1) {
        return next(new ErrorHandler("Komissiya müddəti ən az 1 ay olmalıdır.", 400));
    }

    const update = { commissionDuration: Number(commissionDuration) };
    if (commissionStartDate) {
        update.commissionStartDate = new Date(commissionStartDate);
    }

    const blogger = await Blogger.findByIdAndUpdate(
        req.params.id,
        update,
        { new: true, runValidators: true }
    ).select("-password");

    if (!blogger) {
        return next(new ErrorHandler("Bloger tapılmadı.", 404));
    }

    res.status(200).json({
        success: true,
        message: `Komissiya müddəti ${commissionDuration} ay olaraq yeniləndi.`,
        blogger,
    });
});


// ─────────────────────────────────────────────────────────────────────
//  ADMIN — PROMO KOD REGENERATE
//  PUT /commerce/mehsullar/superadmin/bloggers/:id/regen-promo
// ─────────────────────────────────────────────────────────────────────
export const regenPromoCode = catchAsyncErrors(async (req, res, next) => {
    const blogger = await Blogger.findById(req.params.id);
    if (!blogger) {
        return next(new ErrorHandler("Bloger tapılmadı.", 404));
    }

    blogger.promoCode = generatePromoCode(blogger.firstName, blogger.lastName, blogger.fatherName);
    const base = process.env.FRONTEND_URL || "https://siteniz.az";
    blogger.promoLink = `${base}/ref/${blogger.promoCode}`;

    await blogger.save({ validateBeforeSave: false });

    res.status(200).json({
        success:   true,
        message:   "Promo kod yeniləndi.",
        promoCode: blogger.promoCode,
        promoLink: blogger.promoLink,
    });
});


// ─────────────────────────────────────────────────────────────────────
//  ADMIN — KOMİSSİYA ÖDƏ
//  POST /commerce/mehsullar/superadmin/bloggers/:id/pay-commission
// ─────────────────────────────────────────────────────────────────────
// Pending satışları "paid" edir.
// Body (optional): { saleIds: ["id1","id2"] } → yalnız seçilmiş satışları ödə
export const payCommission = catchAsyncErrors(async (req, res, next) => {
    const blogger = await Blogger.findById(req.params.id);
    if (!blogger) {
        return next(new ErrorHandler("Bloger tapılmadı.", 404));
    }

    const filter = { blogger: blogger._id, paymentStatus: "pending" };

    if (req.body.saleIds && Array.isArray(req.body.saleIds) && req.body.saleIds.length > 0) {
        filter._id = { $in: req.body.saleIds };
    }

    const sales = await BloggerSale.find(filter);
    if (sales.length === 0) {
        return next(new ErrorHandler("Ödəniləcək satış tapılmadı.", 404));
    }

    const totalPaid = parseFloat(
        sales.reduce((sum, s) => sum + s.commissionAmount, 0).toFixed(2)
    );
    const now = new Date();

    await BloggerSale.updateMany(
        { _id: { $in: sales.map((s) => s._id) } },
        { paymentStatus: "paid", paidAt: now }
    );

    // Blogger-in ödəniş statistikasını yenilə
    await Blogger.findByIdAndUpdate(blogger._id, {
        $inc: { totalCommissionPaid: totalPaid },
    });

    res.status(200).json({
        success:   true,
        message:   `${sales.length} satış üçün ${totalPaid.toFixed(2)} AZN ödənildi.`,
        paidSales: sales.length,
        totalPaid,
    });
});


// ─────────────────────────────────────────────────────────────────────
//  ADMIN — BLOGER SİL
//  DELETE /commerce/mehsullar/superadmin/bloggers/:id
// ─────────────────────────────────────────────────────────────────────
// Satış tarixçəsi saxlanılır (BloggerSale silinmir).
export const deleteBlogger = catchAsyncErrors(async (req, res, next) => {
    const blogger = await Blogger.findById(req.params.id);
    if (!blogger) {
        return next(new ErrorHandler("Bloger tapılmadı.", 404));
    }

    await blogger.deleteOne();

    res.status(200).json({
        success: true,
        message: "Bloger silindi. Satış tarixçəsi qorunur.",
    });
});


// ─────────────────────────────────────────────────────────────────────
//  ADMIN — ÜMUMI STATİSTİKA
//  GET /commerce/mehsullar/superadmin/bloggers/stats/overview
// ─────────────────────────────────────────────────────────────────────
export const getBloggersOverview = catchAsyncErrors(async (req, res, next) => {
    const [bloggerStats, saleStats] = await Promise.all([
        Blogger.aggregate([
            {
                $group: {
                    _id:                   null,
                    totalBloggers:         { $sum: 1 },
                    activeBloggers:        { $sum: { $cond: ["$isActive", 1, 0] } },
                    totalCommissionEarned: { $sum: "$totalCommissionEarned" },
                    totalCommissionPaid:   { $sum: "$totalCommissionPaid" },
                    totalSalesAmount:      { $sum: "$totalSalesAmount" },
                    totalReferrals:        { $sum: "$totalReferrals" },
                },
            },
        ]),
        BloggerSale.aggregate([
            {
                $group: {
                    _id:             "$paymentStatus",
                    count:           { $sum: 1 },
                    totalCommission: { $sum: "$commissionAmount" },
                },
            },
        ]),
    ]);

    const overview = bloggerStats[0] || {};
    const byStatus = {};
    saleStats.forEach((s) => {
        byStatus[s._id] = { count: s.count, totalCommission: s.totalCommission };
    });

    res.status(200).json({
        success: true,
        overview: {
            totalBloggers:         overview.totalBloggers         || 0,
            activeBloggers:        overview.activeBloggers        || 0,
            totalReferrals:        overview.totalReferrals        || 0,
            totalSalesAmount:      overview.totalSalesAmount      || 0,
            totalCommissionEarned: overview.totalCommissionEarned || 0,
            totalCommissionPaid:   overview.totalCommissionPaid   || 0,
            pendingCommission:     Math.max(
                0,
                (overview.totalCommissionEarned || 0) - (overview.totalCommissionPaid || 0)
            ),
        },
        salesByStatus: byStatus,
    });
});


// ─────────────────────────────────────────────────────────────────────
//  BLOGER — QEYDİYYAT (ÖZ-ÖZÜ)
//  POST /commerce/mehsullar/blogger/register
// ─────────────────────────────────────────────────────────────────────
// Body: { firstName, lastName, fatherName, email, phone, password }
// Qeydiyyatdan keçən bloger default 40% faiz ilə aktiv yaradılır.
// Admin sonradan faizi dəyişə bilər.
export const registerBlogger = catchAsyncErrors(async (req, res, next) => {
    const { firstName, lastName, fatherName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return next(new ErrorHandler("Ad, soyad, e-poçt və şifrə mütləqdir.", 400));
    }

    const existing = await Blogger.findOne({ email });
    if (existing) {
        return next(new ErrorHandler("Bu e-poçt artıq qeydiyyatdadır.", 400));
    }

    const blogger = await Blogger.create({
        firstName,
        lastName,
        fatherName:         fatherName || "",
        email,
        phone:              phone     || "",
        password,
        commissionRate:     40,        // Default — admin dəyişə bilər
        commissionDuration: 6,
        isActive:           true,
    });

    sendToken(blogger, 201, res);
});


// ─────────────────────────────────────────────────────────────────────
//  BLOGER — GİRİŞ
//  POST /commerce/mehsullar/blogger/login
// ─────────────────────────────────────────────────────────────────────
export const bloggerLogin = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("E-poçt və şifrə daxil edin.", 400));
    }

    const blogger = await Blogger.findOne({ email }).select("+password");

    if (!blogger) {
        return next(new ErrorHandler("E-poçt və ya şifrə yanlışdır.", 401));
    }

    if (!blogger.isActive) {
        return next(new ErrorHandler("Hesabınız deaktiv edilib. Admin ilə əlaqə saxlayın.", 403));
    }

    const isMatch = await blogger.shifreleriMuqayiseEt(password);
    if (!isMatch) {
        return next(new ErrorHandler("E-poçt və ya şifrə yanlışdır.", 401));
    }

    sendToken(blogger, 200, res);
});


// ─────────────────────────────────────────────────────────────────────
//  BLOGER — ÇIXIŞ
//  GET /commerce/mehsullar/blogger/logout
// ─────────────────────────────────────────────────────────────────────
export const bloggerLogout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires:  new Date(Date.now()),
        httpOnly: true,
    });

    res.status(200).json({ success: true, message: "Çıxış edildi." });
});


// ─────────────────────────────────────────────────────────────────────
//  BLOGER — ÖZ PROFİLİ + STATİSTİKA
//  GET /commerce/mehsullar/blogger/profile
// ─────────────────────────────────────────────────────────────────────
export const getBloggerProfile = catchAsyncErrors(async (req, res, next) => {
    const blogger = req.user;

    // Son 6 aylıq aylıq satış xülasəsi
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [monthlySales, pendingResult, cancelledResult] = await Promise.all([
        BloggerSale.aggregate([
            {
                $match: {
                    blogger:       blogger._id,
                    saleDate:      { $gte: sixMonthsAgo },
                    paymentStatus: { $ne: "cancelled" },
                },
            },
            {
                $group: {
                    _id: {
                        year:  { $year:  "$saleDate" },
                        month: { $month: "$saleDate" },
                    },
                    totalSalesAmount: { $sum: "$orderAmount" },
                    totalCommission:  { $sum: "$commissionAmount" },
                    salesCount:       { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),

        BloggerSale.aggregate([
            { $match: { blogger: blogger._id, paymentStatus: "pending" } },
            { $group: { _id: null, total: { $sum: "$commissionAmount" }, count: { $sum: 1 } } },
        ]),

        BloggerSale.aggregate([
            { $match: { blogger: blogger._id, paymentStatus: "cancelled" } },
            { $group: { _id: null, total: { $sum: "$commissionAmount" }, count: { $sum: 1 } } },
        ]),
    ]);

    const pendingCommission   = pendingResult[0]?.total   || 0;
    const pendingSalesCount   = pendingResult[0]?.count   || 0;
    const cancelledCommission = cancelledResult[0]?.total || 0;

    // Komissiya dövrü nə qədər qalır
    let daysRemaining = null;
    if (blogger.commissionStartDate) {
        const endDate = new Date(blogger.commissionStartDate);
        endDate.setMonth(endDate.getMonth() + blogger.commissionDuration);
        daysRemaining = Math.max(0, Math.ceil((endDate - Date.now()) / (1000 * 60 * 60 * 24)));
    }

    res.status(200).json({
        success: true,
        blogger,
        stats: {
            commissionActive:      blogger.isCommissionActive(),
            daysRemaining,
            pendingCommission,
            pendingSalesCount,
            cancelledCommission,
            totalReferrals:        blogger.totalReferrals,
            totalSalesAmount:      blogger.totalSalesAmount,
            totalCommissionEarned: blogger.totalCommissionEarned,
            totalCommissionPaid:   blogger.totalCommissionPaid,
            monthlySales,
        },
    });
});


// ─────────────────────────────────────────────────────────────────────
//  BLOGER — SATIŞ TARİXÇƏSİ
//  GET /commerce/mehsullar/blogger/sales
// ─────────────────────────────────────────────────────────────────────
// Query: page, limit, status (pending|paid|cancelled), startDate, endDate
export const getBloggerSales = catchAsyncErrors(async (req, res, next) => {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = { blogger: req.user._id };

    if (req.query.status) {
        filter.paymentStatus = req.query.status;
    }

    if (req.query.startDate || req.query.endDate) {
        filter.saleDate = {};
        if (req.query.startDate) filter.saleDate.$gte = new Date(req.query.startDate);
        if (req.query.endDate)   filter.saleDate.$lte = new Date(req.query.endDate);
    }

    const [total, sales] = await Promise.all([
        BloggerSale.countDocuments(filter),
        BloggerSale.find(filter)
            .sort({ saleDate: -1 })
            .skip(skip)
            .limit(limit)
            .populate("order", "orderStatus totalPrice createdAt"),
    ]);

    res.status(200).json({
        success: true,
        total,
        page,
        pages: Math.ceil(total / limit),
        sales,
    });
});


// ─────────────────────────────────────────────────────────────────────
//  PROMO KOD YOXLA (PUBLIC)
//  GET /commerce/mehsullar/promo/validate/:code
// ─────────────────────────────────────────────────────────────────────
export const validatePromoCode = catchAsyncErrors(async (req, res, next) => {
    const code = req.params.code?.toUpperCase().trim();

    if (!code) {
        return next(new ErrorHandler("Promo kod daxil edin.", 400));
    }

    const blogger = await Blogger.findOne({ promoCode: code, isActive: true })
        .select("firstName lastName commissionRate promoCode promoLink commissionStartDate commissionDuration");

    if (!blogger) {
        return next(new ErrorHandler("Promo kod tapılmadı və ya deaktivdir.", 404));
    }

    const commissionActive = blogger.isCommissionActive();

    res.status(200).json({
        success:          true,
        valid:            true,
        commissionActive,
        blogger: {
            fullName:       `${blogger.firstName} ${blogger.lastName}`,
            promoCode:      blogger.promoCode,
            commissionRate: blogger.commissionRate,
        },
    });
});


// ─────────────────────────────────────────────────────────────────────
//  PROMO LİNK İZLƏMƏ (PUBLIC)
//  GET /commerce/mehsullar/promo/track/:code
// ─────────────────────────────────────────────────────────────────────
export const trackPromoLink = catchAsyncErrors(async (req, res, next) => {
    const code = req.params.code?.toUpperCase().trim();

    const blogger = await Blogger.findOne({ promoCode: code, isActive: true })
        .select("firstName lastName promoCode commissionRate");

    if (!blogger) {
        return res.status(200).json({ success: false, valid: false });
    }

    res.status(200).json({
        success:     true,
        valid:       true,
        promoCode:   blogger.promoCode,
        bloggerName: `${blogger.firstName} ${blogger.lastName}`,
    });
});


// ─────────────────────────────────────────────────────────────────────
//  SİFARİŞDƏN KOMİSSİYA YARAT (İNTERNAL)
// ─────────────────────────────────────────────────────────────────────
// orderController.js-dən belə çağırılır:
//   import { recordBloggerSale } from "./bloggerController.js";
//   await recordBloggerSale({ promoCode, orderId, customerId, customerEmail, orderAmount });
//
// Sistem məntiqi:
//   1. Promo koda görə aktiv blogeri tap
//   2. Komissiya dövrü bitibsə → null qaytar (komissiya hesablanmır)
//   3. commissionAmount = orderAmount × commissionRate / 100
//   4. İlk satışdırsa commissionStartDate-i set et
//   5. Blogger statistikasını yenilə
export const recordBloggerSale = async ({
    promoCode,
    orderId,
    customerId,
    customerEmail = "",
    orderAmount,
}) => {
    if (!promoCode || !orderAmount) return null;

    const blogger = await Blogger.findOne({
        promoCode: promoCode.toUpperCase().trim(),
        isActive:  true,
    });

    if (!blogger) return null;

    // İlk satış → commissionStartDate-i set et
    const isFirstSale = !blogger.commissionStartDate;
    if (isFirstSale) {
        blogger.commissionStartDate = new Date();
        await blogger.save({ validateBeforeSave: false });
    }

    // Komissiya dövrü bitibsə hesablama
    if (!blogger.isCommissionActive()) return null;

    const commissionAmount = parseFloat(
        ((orderAmount * blogger.commissionRate) / 100).toFixed(2)
    );

    // Satış qeydi yarat
    const sale = await BloggerSale.create({
        blogger:         blogger._id,
        order:           orderId,
        customer:        customerId,
        customerEmail,
        promoCode:       blogger.promoCode,
        orderAmount,
        commissionRate:  blogger.commissionRate,
        commissionAmount,
    });

    // Blogger statistikasını artır
    await Blogger.findByIdAndUpdate(blogger._id, {
        $inc: {
            totalReferrals:        1,
            totalSalesAmount:      orderAmount,
            totalCommissionEarned: commissionAmount,
        },
    });

    return sale;
};


// ─────────────────────────────────────────────────────────────────────
//  SİFARİŞ İPTAL — KOMİSSİYANI LƏĞV ET (İNTERNAL)
// ─────────────────────────────────────────────────────────────────────
// Sifariş ləğv edildikdə orderController-dən çağırılır:
//   import { cancelBloggerSale } from "./bloggerController.js";
//   await cancelBloggerSale(orderId);
export const cancelBloggerSale = async (orderId) => {
    if (!orderId) return null;

    const sale = await BloggerSale.findOne({ order: orderId, paymentStatus: "pending" });
    if (!sale) return null;

    sale.paymentStatus = "cancelled";
    await sale.save();

    // Blogger statistikasını düzəlt (yalnız pending idi, paid deyildi)
    await Blogger.findByIdAndUpdate(sale.blogger, {
        $inc: {
            totalReferrals:        -1,
            totalSalesAmount:      -sale.orderAmount,
            totalCommissionEarned: -sale.commissionAmount,
        },
    });

    return sale;
};