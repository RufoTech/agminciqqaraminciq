import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler      from "../utils/errorHandler.js";
import SellerReview      from "../model/SellerReview.js";
import Admin             from "../model/Admin.js";
import Order             from "../model/Order.js";

// =====================================================================
// SATICI REYTİNQİ YARAT / YENİLƏ — createOrUpdateSellerReview
// ---------------------------------------------------------------------
// PUT /seller/:sellerId/review
// Yalnız həmin mağazadan tamamlanmış sifarişi olan alıcı rəy buraxa bilər.
// =====================================================================
export const createOrUpdateSellerReview = catchAsyncErrors(async (req, res, next) => {
    const { sellerId } = req.params;
    const { rating, comment = "" } = req.body;
    const userId   = req.user._id;
    const userName = req.user.name;

    if (!rating || rating < 1 || rating > 5) {
        return next(new ErrorHandler("Reytinq 1 ilə 5 arasında olmalıdır", 400));
    }

    const seller = await Admin.findById(sellerId);
    if (!seller) return next(new ErrorHandler("Mağaza tapılmadı", 404));

    // Alıcının bu mağazadan çatdırılmış sifarişi varmı?
    const hasDeliveredOrder = await Order.findOne({
        user:               userId,
        "orderItems.seller": seller.sellerInfo.storeName,
        orderStatus:        "delivered",
    });
    if (!hasDeliveredOrder) {
        return next(new ErrorHandler("Yalnız bu mağazadan çatdırılmış sifarişi olan alıcılar rəy buraxa bilər", 403));
    }

    // Upsert — artıq rəy varsa yenilə, yoxdursa yarat
    await SellerReview.findOneAndUpdate(
        { seller: sellerId, user: userId },
        { rating, comment, userName },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // avgRating və numReviews-u yenidən hesabla
    const agg = await SellerReview.aggregate([
        { $match: { seller: seller._id } },
        { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    const avg   = agg.length > 0 ? parseFloat(agg[0].avg.toFixed(2)) : 0;
    const count = agg.length > 0 ? agg[0].count : 0;

    await Admin.findByIdAndUpdate(sellerId, { avgRating: avg, numReviews: count });

    res.status(200).json({ success: true, message: "Rəyiniz qeydə alındı" });
});


// =====================================================================
// SATICI RƏYLƏRİNİ GƏTİR — getSellerReviews
// ---------------------------------------------------------------------
// GET /seller/:sellerId/reviews  (açıq, auth tələb olunmur)
// =====================================================================
export const getSellerReviews = catchAsyncErrors(async (req, res, next) => {
    const { sellerId } = req.params;

    const seller = await Admin.findById(sellerId).select("avgRating numReviews sellerInfo.storeName");
    if (!seller) return next(new ErrorHandler("Mağaza tapılmadı", 404));

    const reviews = await SellerReview.find({ seller: sellerId })
        .sort({ createdAt: -1 })
        .select("userName rating comment createdAt");

    res.status(200).json({
        success:    true,
        reviews,
        avgRating:  seller.avgRating,
        numReviews: seller.numReviews,
    });
});


// =====================================================================
// İSTİFADƏÇİNİN SATICI İLƏ SİFARİŞİ VARMIQ — checkCanReview
// ---------------------------------------------------------------------
// GET /seller/:sellerId/can-review  (auth tələb olunur)
// =====================================================================
export const checkCanReview = catchAsyncErrors(async (req, res, next) => {
    const { sellerId } = req.params;
    const userId = req.user._id;

    const seller = await Admin.findById(sellerId).select("sellerInfo.storeName");
    if (!seller) return next(new ErrorHandler("Mağaza tapılmadı", 404));

    const hasDeliveredOrder = await Order.findOne({
        user:               userId,
        "orderItems.seller": seller.sellerInfo.storeName,
        orderStatus:        "delivered",
    });

    const existingReview = await SellerReview.findOne({ seller: sellerId, user: userId });

    res.status(200).json({
        success:        true,
        canReview:      !!hasDeliveredOrder,
        existingReview: existingReview
            ? { rating: existingReview.rating, comment: existingReview.comment }
            : null,
    });
});
