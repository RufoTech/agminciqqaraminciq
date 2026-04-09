// catchAsyncErrors — async funksiyalardakı xətaları avtomatik tutur,
// hər controller-ə try/catch yazmaqdan xilas edir.
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";

// Bonus inteqrasiyası
import { awardCartBonus, awardReferralBonus, consumeBonusFifo } from "./bonusController.js";
import BonusConfig from "../model/BonusConfig.js";
import User from "../model/User.js";

// ErrorHandler — özəl xəta sinifi.
// new ErrorHandler("mesaj", statusKod) şəklində istifadə olunur.
import ErrorHandler from "../utils/errorHandler.js";

// Order — sifariş modeli. Hər sifariş: istifadəçi, məhsullar,
// ödəniş məlumatı, ümumi məbləğ, status saxlayır.
import Order from "../model/Order.js";

// Cart — alış-veriş səbəti modeli.
// Sifariş yaradıldıqdan sonra səbət silinir.
import Cart from "../model/Cart.js";

// Product — məhsul modeli. Sifariş sonrası stoku azaltmaq üçün lazımdır.
import { Product } from "../model/Product.js";

// createCommission — hər sifariş yarandıqda komisya qeydi yaradan funksiya.
// commissionController-dən import edilir
import { createCommission } from "./commissionController.js";
import paymentConfig from "../config/paymentConfig.js";
import Admin from "../model/Admin.js";

// Bildiriş yardımçı funksiyaları:
//   notifyNewOrder         — satıcıya yeni sifariş bildirişi göndərir
//   notifyOrderStatusChange— istifadəçiyə status dəyişikliyi bildirişi göndərir
//   notifyLowStock         — stok azalanda adminə xəbər verir
import {
    notifyNewOrder,
    notifyOrderStatusChange,
    notifyLowStock,
} from "../utils/notificationHelper.js";

// Blogger satışı qeyd etmək üçün
import { recordBloggerSale } from "./bloggerController.js";


// Stripe obyekti bir dəfə yaradılır — bütün funksiyalar bunu istifadə edir.
// Stripe asılılığı artıq qaldırıldı


// =====================================================================
// SİFARİŞ YARAT — createOrder
// ---------------------------------------------------------------------
// POST /api/v1/order/new
// Body: { stripePaymentIntentId, currency }
//
// Ödəniş frontend-də tamamlandıqdan sonra bu endpoint çağırılır.
// Stripe PaymentIntent yoxlanılır → səbətdən sifariş yaradılır →
// komisya hesablanır → stok azaldılır → səbət silinir.
// =====================================================================
export const createOrder = catchAsyncErrors(async (req, res, next) => {

    // Artıq stripePaymentIntentId əvəzinə paymentId qəbul edirik
    const { paymentId, currency, bonusUsed = 0, promoCode, promoMethod } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    if (!paymentId) {
        return next(new ErrorHandler("Ödəniş ID-si tələb olunur", 400));
    }

    // Simulyasiya modunda ödəniş uğurlu qəbul edilir. 
    // Sandbox modunda PashaPay API-yə verifikasiya sorğusu göndərilməlidir (bunu gələcəkdə webhook da edə bilər, amma indilik test edirik)
    let paymentStatus = "paid";
    let providerName = paymentConfig.MODE === "sandbox" ? "pashapay" : "simulation";

    const existingOrder = await Order.findOne({
        "paymentInfo.paymentId": paymentId,
    });
    if (existingOrder) {
        return res.status(200).json({ success: true, order: existingOrder });
    }

    const cart = await Cart.findOne({ user: userId }).populate({
        path: "products.product",
        select: "name price images seller stock",
    });

    if (!cart || cart.products.length === 0) {
        return next(new ErrorHandler("Səbət boşdur", 400));
    }

    const orderItems = cart.products.map((item) => ({
        product:  item.product._id,
        name:     item.product.name,
        price:    item.product.price,
        quantity: item.quantity,
        image:    item.product.images?.[0]?.url || null,
        seller:   item.product.seller || null,
    }));

    const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    let validatedBonusUsed = 0;
    if (bonusUsed > 0) {
        const bConfig = await BonusConfig.getConfig();
        const maxBonus = Math.floor((totalAmount * bConfig.maxRedemptionPercent) / 100 / bConfig.bonusValueAzn);
        validatedBonusUsed = Math.min(bonusUsed, maxBonus);
        const currentBalance = req.user.bonusBalance || 0;
        if (currentBalance < validatedBonusUsed) {
            validatedBonusUsed = currentBalance;
        }
    }

    const order = await Order.create({
        user: userId,
        orderItems,
        paymentInfo: {
            paymentId:       paymentId,
            status:          paymentStatus,
            currency:        currency || "azn",
            provider:        providerName
        },
        totalAmount,
        bonusUsed: validatedBonusUsed,
        promoCode,
        promoMethod,
        orderStatus: "pending",
    });

    // ── BLOGGER SATIŞI QEYD ET VƏ İNFLUENCER ID AL ────────────────
    let influencerId = null;
    if (promoCode) {
        try {
            const bloggerSale = await recordBloggerSale({
                promoCode,
                orderId:      order._id,
                customerId:    userId,
                customerEmail: userEmail,
                orderAmount:   totalAmount,
                products:      orderItems,
                method:        promoMethod || "code",
            });
            // recordBloggerSale daxilində bloggerId-ni də qaytarmalıyıq, əgər mümkünsə.
            // Alternativ olaraq, Blogger kolleksiyasından birbaşa promo koda görə tapaq:
            const Blogger = (await import("../model/Blogger.js")).default;
            const bloggerDoc = await Blogger.findOne({ promoCodes: { $in: [promoCode] } });
            if (bloggerDoc) {
                influencerId = bloggerDoc._id;
            }
        } catch (bloggerErr) {
            console.error("Blogger satışı qeyd olunan zaman xəta:", bloggerErr);
        }
    }

    // ── BONUS FIFO İSTİFADƏ ──────────────────────────────────────────
    if (validatedBonusUsed > 0) {
        try {
            await consumeBonusFifo(userId, validatedBonusUsed, order._id);
        } catch (bonusErr) {
            console.error("Bonus FIFO xətası:", bonusErr);
        }
    }

    // ── KOMİSYA HESABLAMA ────────────────────────────────────────────
    const sellerTotals = {};
    for (const item of orderItems) {
        if (!item.seller) continue;
        const itemTotal = item.price * item.quantity;
        sellerTotals[item.seller] = (sellerTotals[item.seller] || 0) + itemTotal;
    }

    // Satıcıların PashaPay subMerchantId-lərini 1 sorğuda yüklə (N+1 yoxdur)
    const uniqueSellers = Object.keys(sellerTotals);
    const sellerAdmins = await Admin.find(
        { "sellerInfo.storeName": { $in: uniqueSellers } },
        { "sellerInfo.storeName": 1, "sellerInfo.subMerchantId": 1 }
    );
    const subMerchantMap = {};
    for (const a of sellerAdmins) {
        subMerchantMap[a.sellerInfo.storeName] = a.sellerInfo.subMerchantId || null;
    }

    for (const [sellerName, amount] of Object.entries(sellerTotals)) {
        await createCommission(order._id, sellerName, amount, subMerchantMap[sellerName] || null, influencerId);
    }

    // ── BİLDİRİŞLƏR ─────────────────────────────────────────────────
    // Hər satıcıya öz mağazasına aid yeni sifariş bildirişi göndərilir.
    // Məsələn: Apple Store → "Yeni sifariş: 500 AZN"
    for (const [sellerStoreName, amount] of Object.entries(sellerTotals)) {
        await notifyNewOrder({
            orderId: order._id,
            totalAmount: amount,
            sellerStoreName,
        });
    }

    // ── STOK YENİLƏMƏ VƏ STOK XƏBƏRDARLIĞİ ─────────────────────────
    // Sifariş verilən məhsulların stokundan sifarişdəki miqdar çıxarılır.
    // Stok 5 və ya daha az qaldısa — satıcıya/adminə xəbərdarlıq göndərilir.
    //
    // Niyə 5-dən az qaldıqda bildiriş göndərilir?
    //   Satıcı yeni mal sifariş etmək üçün vaxt qazansın deyə.
    //   Stok tamam bitməzdən əvvəl xəbər vermək daha yaxşı UX-dir.
    for (const item of cart.products) {
        const product = item.product;
        const newStock = product.stock - item.quantity;

        // findByIdAndUpdate — tapır və yeniləyir, daha az sorğu ilə işləyir.
        await Product.findByIdAndUpdate(product._id, { stock: newStock });

        if (newStock <= 5) {
            await notifyLowStock({
                productId:       product._id,
                productName:     product.name,
                stock:           newStock,
                sellerStoreName: product.seller,
            });
        }
    }

    // ── SƏBƏTİ SİL ──────────────────────────────────────────────────
    // Sifariş uğurla yaradıldı — səbəti silmək lazımdır.
    // İstifadəçi növbəti dəfə səbətə baxanda boş görəcək.
    await Cart.findOneAndDelete({ user: userId });

    // Cavabda bütün order obyekti deyil, yalnız lazımlı sahələr göndərilir.
    // Həssas məlumatlar (paymentInfo, user ID) gizlədilir.
    res.status(201).json({
        success: true,
        message: "Sifariş uğurla yaradıldı",
        order: {
            id:          order._id,
            orderItems:  order.orderItems,
            totalAmount: order.totalAmount,
            orderStatus: order.orderStatus,
            createdAt:   order.createdAt,
        },
    });
});


// =====================================================================
// İSTİFADƏÇİNİN ÖZ SİFARİŞLƏRİ — getMyOrders
// ---------------------------------------------------------------------
// GET /api/v1/orders/me
//
// "Sifarişlərim" səhifəsi üçün — istifadəçi öz bütün sifarişlərini görür.
// =====================================================================
export const getMyOrders = catchAsyncErrors(async (req, res, next) => {

    // sort({ createdAt: -1 }) — ən yeni sifariş ən üstdə göstərilir.
    // Yalnız bu istifadəçiyə aid sifarişlər gəlir (user: req.user.id).
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
});


// =====================================================================
// TƏK SİFARİŞ DETALI — getOrderById
// ---------------------------------------------------------------------
// GET /api/v1/order/:id
//
// İstifadəçi sifariş tarixçəsindən tək sifarişin üzərinə tıklayanda işləyir.
// =====================================================================
export const getOrderById = catchAsyncErrors(async (req, res, next) => {

    const order = await Order.findById(req.params.id);

    if (!order) return next(new ErrorHandler("Sifariş tapılmadı", 404));

    // ── İCAZƏ YOXLAMASI ─────────────────────────────────────────────
    // Sifariş başqa istifadəçiyədirsə — 403 Forbidden qaytarılır.
    // .toString() — order.user ObjectId-dir, req.user.id string — müqayisə üçün lazımdır.
    //
    // Niyə 404 deyil 403?
    //   404 "tapılmadı" deməkdir. Amma sifariş var — sadəcə başqasınındır.
    //   403 "icazən yoxdur" — daha düzgün HTTP status kodudur.
    if (order.user.toString() !== req.user.id) {
        return next(new ErrorHandler("Bu sifarişə giriş icazəniz yoxdur", 403));
    }

    res.status(200).json({ success: true, order });
});


// =====================================================================
// ADMİN — ÖZ MAĞAZASININ SİFARİŞLƏRİ — getAdminOrders
// ---------------------------------------------------------------------
// GET /api/v1/admin/orders
//
// Satıcı panelindəki "Sifarişlər" cədvəli üçün.
// Yalnız bu mağazanın məhsullarını ehtiva edən sifarişlər göstərilir.
// =====================================================================
export const getAdminOrders = catchAsyncErrors(async (req, res, next) => {

    // req.user.sellerInfo?.storeName — adminin mağaza adı (User/Admin modelindən).
    // Optional chaining (?.) — sellerInfo null olarsa xəta verməsin.
    const storeName = req.user.sellerInfo?.storeName;

    if (!storeName) return next(new ErrorHandler("Mağaza məlumatı tapılmadı", 400));

    // "orderItems.seller": storeName — massiv içindəki sahəyə görə axtarış.
    // Bu sifariş içindəki ən azı bir məhsulun bu mağazaya aid olduğunu yoxlayır.
    const orders = await Order.find({ "orderItems.seller": storeName }).sort({ createdAt: -1 });

    // ── SİFARİŞLƏRİ SÜZGƏCDƏN KEÇİR ─────────────────────────────────
    // Bir sifarişdə birdən çox mağazanın məhsulu ola bilər.
    // map() ilə hər sifarişdən yalnız bu mağazaya aid məhsullar (orderItems.filter)
    // seçilir — satıcı başqasının məhsullarını görməsin.
    const filteredOrders = orders.map((order) => ({
        id:          order._id,
        orderStatus: order.orderStatus,
        isCompleted: order.isCompleted,
        createdAt:   order.createdAt,
        totalAmount: order.totalAmount,
        // Yalnız bu mağazanın məhsulları göstərilir
        orderItems:  order.orderItems.filter((item) => item.seller === storeName),
    }));

    res.status(200).json({
        success:     true,
        orders:      filteredOrders,
        totalOrders: filteredOrders.length,
    });
});


// =====================================================================
// ADMİN — SİFARİŞ STATUSUNU YENİLƏ — updateOrderStatus
// ---------------------------------------------------------------------
// PUT /api/v1/admin/order/:id
// Body: { status }
//
// Satıcı sifarişin statusunu dəyişdirəndə işləyir.
// Status dəyişdikdə istifadəçiyə bildiriş göndərilir.
// "delivered" statusu seçildikdə sifariş tamamlanmış sayılır:
//   order.isCompleted = true edilir.
// =====================================================================
export const updateOrderStatus = catchAsyncErrors(async (req, res, next) => {

    const { status } = req.body;
    const storeName = req.user.sellerInfo?.storeName;

    // ── STATUS VALİDASİYASI ──────────────────────────────────────────
    // Yalnız müəyyən statuslar qəbul edilir — ixtiyari string yazılmasın.
    // "cancelled" buraya daxil deyil — ayrıca endpoint tələb edə bilər.
    const allowedStatuses = ["pending", "processing", "shipped", "delivered"];
    if (!allowedStatuses.includes(status)) {
        return next(new ErrorHandler("Keçərsiz status", 400));
    }

    const order = await Order.findById(req.params.id);
    if (!order) return next(new ErrorHandler("Sifariş tapılmadı", 404));

    // ── İCAZƏ YOXLAMASI ─────────────────────────────────────────────
    // Satıcı yalnız özünün məhsulunun olduğu sifarişin statusunu dəyişdirə bilər.
    // .some() — massivdə ən azı bir element şərti ödəyirsə true qaytarır.
    // Bu olmasa — hər satıcı hər sifarişin statusunu dəyişdirə bilərdi.
    const hasProduct = order.orderItems.some((item) => item.seller === storeName);
    if (!hasProduct) {
        return next(new ErrorHandler("Bu sifarişə giriş icazəniz yoxdur", 403));
    }

    order.orderStatus = status;

    // ── SİFARİŞİ TAMAMLA ─────────────────────────────────────────────
    // Status "delivered" olduqda sifariş tam tamamlanmış sayılır.
    // isCompleted = true — məhsul müştəriyə çatdı, sifariş bağlandı.
    // Bu sahə statistika, hesabat və filtr üçün istifadə edilir.
    if (status === "delivered") {
        order.isCompleted = true;
    }

    await order.save();

    // ── BONUS VER (delivered olduqda) ────────────────────────────────
    // Sifariş tamamlandı → istifadəçiyə səbət bonusu + referral bonusu verilir.
    if (status === "delivered") {
        try {
            await awardCartBonus(order.user, order);
        } catch (err) {
            console.error("Səbət bonusu xətası:", err);
        }
        try {
            // Referral: yalnız istifadəçinin İLK tamamlanmış sifarişidirsə
            const completedCount = await Order.countDocuments({
                user:        order.user,
                isCompleted: true,
            });
            if (completedCount === 1) {
                await awardReferralBonus(order.user);
            }
        } catch (err) {
            console.error("Referral bonus xətası:", err);
        }
    }

    // İstifadəçiyə bildiriş göndərilir: "Sifarişiniz yola düşdü" kimi mesajlar.
    // order.user — sifarişi verən istifadəçinin ID-si.
    await notifyOrderStatusChange({
        userId:    order.user,
        orderId:   order._id,
        newStatus: status,
    });

    res.status(200).json({
        success:      true,
        message:      "Sifariş statusu yeniləndi",
        orderStatus:  order.orderStatus,
        isCompleted:  order.isCompleted,
    });
});