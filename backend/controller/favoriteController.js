// ============================================================
// mongoose — MongoDB ilə işləmək üçün kitabxana.
// Burada yalnız ObjectId formatını yoxlamaq üçün lazımdır:
//   mongoose.Types.ObjectId.isValid(id)
// ============================================================
import mongoose from "mongoose";

// catchAsyncErrors — async funksiyalardakı xətaları avtomatik tutur,
// hər controller-ə try/catch yazmaqdan xilas edir.
// Lakin bu faylda həm catchAsyncErrors, həm də daxili try/catch var —
// bu ikiqat qoruma təmin edir.
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";

// Favorite — favori siyahısı modeli.
// Hər istifadəçinin bir favori siyahısı olur,
// içində məhsul ID-lərinin massivi saxlanılır.
import Favorite from "../model/Favorite.js";

// Product — məhsul modeli.
// Məhsulun bazada mövcud olub olmadığını yoxlamaq üçün lazımdır.
import { Product } from "../model/Product.js";

// ErrorHandler — özəl xəta sinifi.
// new ErrorHandler("mesaj", statusKod) şəklində istifadə olunur.
import ErrorHandler from "../utils/errorHandler.js";


// =====================================================================
// FAVORİLƏRƏ MƏHSUL ƏLAVƏ ET — addToFavorites
// ---------------------------------------------------------------------
// POST /api/v1/favorites
// Body: { productId }
//
// İstifadəçi məhsul səhifəsindəki "♡" düyməsinə basanda işləyir.
// Məhsul artıq favoridədirsə — xəta qaytarır (duplikat olmur).
// =====================================================================
export const addToFavorites = catchAsyncErrors(async (req, res, next) => {

    // req.body-dən əlavə ediləcək məhsulun ID-si
    const { productId } = req.body;

    // req.user — isAuthenticated middleware tərəfindən doldurulur.
    // JWT token yoxlanılır və istifadəçi obyekti req.user-ə yazılır.
    const userId = req.user.id;

    try {
        // ── FORMAT YOXLAMASI ─────────────────────────────────────────
        // MongoDB ObjectId 24 simvollu hex formatındadır.
        // Yanlış formatlı ID ilə sorğu etsək mongoose xəta atacaq —
        // bunu əvvəlcədən yoxlamaq daha aydın xəta mesajı verir.
        // Niyə burada "throw", digər yerlərdə "return next()"?
        //   throw — daxili try/catch-ə düşür → catch(error) → next(error)
        //   return next() — birbaşa xəta middleware-inə gedir
        //   İkisi eyni nəticəni verir, amma ardıcıllıq fərqlidir.
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            throw new ErrorHandler("Yanlış məhsul ID-si.", 400);
        }

        // ── MƏHSULUN MÖVCUDLUĞUNU YOXLA ──────────────────────────────
        // Bazada olmayan məhsulu favorilərə əlavə etmək mənasızdır.
        const product = await Product.findById(productId);
        if (!product) {
            return next(new ErrorHandler("Hal-hazırda məhsul mövcud deyil.", 404));
        }

        // ── FAVORİ SİYAHISINI TAP VƏ YA YARAT ───────────────────────
        // findOne({user: userId}) — bu istifadəçiyə aid favori siyahısını tapır.
        // Hər istifadəçinin yalnız bir favori siyahısı olur.
        let favorite = await Favorite.findOne({ user: userId });

        // İlk dəfə favori əlavə edirsə — boş siyahı yarat.
        // Hələ bazaya yazılmır — save() çağırılanda yazılacaq.
        if (!favorite) {
            favorite = new Favorite({ user: userId, products: [] });
        }

        // ── DUPLİKAT YOXLAMASI ───────────────────────────────────────
        // findIndex — şərtə uyan elementin indeksini qaytarır, tapılmasa -1.
        // .toString() — MongoDB ObjectId-ni string-ə çevirir, çünki
        // productId string gəlir, p isə ObjectId tipindədir — birbaşa
        // müqayisə yanlış nəticə verər.
        //
        // Niyə duplikat yoxlaması var?
        //   Eyni məhsul iki dəfə favori siyahısına düşməsin deyə.
        //   Upsert istifadə etmək olardı, amma açıq xəta mesajı
        //   istifadəçiyə daha yaxşı məlumat verir.
        const productIndex = favorite.products.findIndex(
            (p) => p.toString() === productId
        );

        if (productIndex !== -1) {
            return next(new ErrorHandler("Məhsul artıq favorilərinizdədir.", 400));
        }

        // ── MƏHSULU ƏLAVƏ ET VƏ SAXLA ────────────────────────────────
        // Yalnız məhsul ID-si push edilir — tam məhsul obyekti deyil.
        // Bu, siyahını yüngül saxlayır; tam məlumat lazım olanda
        // populate() ilə çəkilir (getFavoriteProducts-da görünür).
        favorite.products.push(productId);
        await favorite.save();

        // 200 OK — məhsul uğurla əlavə edildi
        res.status(200).json({
            success: true,
            message: "Məhsul favorilərə əlavə edildi.",
            favorite,
        });

    } catch (error) {
        // try blokunda baş verən istənilən xəta buraya düşür
        // və növbəti xəta middleware-inə ötürülür.
        next(error);
    }
});


// =====================================================================
// FAVORİLƏRDƏN MƏHSUL SİL — removeFromFavorites
// ---------------------------------------------------------------------
// DELETE /api/v1/favorites/:productId
//
// İstifadəçi "♥" düyməsinə yenidən basanda işləyir.
// Son məhsul silindikdə — favori siyahısının özü də bazadan silinir.
// =====================================================================
export const removeFromFavorites = catchAsyncErrors(async (req, res, next) => {

    // URL parametrindən silinəcək məhsulun ID-si
    // Məsələn: DELETE /api/v1/favorites/507f1f77bcf86cd799439011
    const { productId } = req.params;

    const userId = req.user.id;

    try {
        // ── FAVORİ SİYAHISINI TAP ────────────────────────────────────
        let favorite = await Favorite.findOne({ user: userId });

        // Favori siyahısı yoxdursa — silmək mümkün deyil
        if (!favorite) {
            return next(new ErrorHandler("Hal-hazırda məhsul mövcud deyil.", 404));
        }

        // ── MƏHSULUN SİYAHIDA OLDUĞUNU YOXLA ────────────────────────
        // Siyahıda olmayan bir məhsulu silməyə cəhd edilərsə — xəta ver
        const productIndex = favorite.products.findIndex(
            (p) => p.toString() === productId
        );

        if (productIndex === -1) {
            return next(new ErrorHandler("Hal-hazırda məhsul mövcud deyil.", 404));
        }

        // ── MƏHSULU SİYAHIDAN ÇIXAR ──────────────────────────────────
        // splice(productIndex, 1) — dəqiq indeksdən 1 element çıxarır.
        //
        // Niyə splice, filter deyil?
        //   filter() bütün massivi yenidən yaradır (yeni array qaytarır).
        //   splice() isə mövcud arrayi dəyişdirir (daha sürətli).
        //   Hər ikisi işləyir; splice daha performanslıdır.
        favorite.products.splice(productIndex, 1);

        // ── BOŞ SİYAHINI SİL ─────────────────────────────────────────
        // Son məhsul silindisə — boş favori siyahısını bazada saxlamaq mənasızdır.
        // findOneAndDelete() — tapır və bir əməliyyatla silir.
        if (favorite.products.length === 0) {
            await Favorite.findOneAndDelete({ user: userId });
            return res.status(200).json({
                success: true,
                message: "Məhsul favorilərdən silindi və favori siyahısı tam silindi.",
            });
        }

        // Hələ məhsullar qalıbsa — yenilənmiş siyahını bazaya yaz
        await favorite.save();

        res.status(200).json({
            success:  true,
            message:  "Məhsul favorilərdən silindi.",
            favorite, // frontend siyahını yeniləsin deyə qaytarılır
        });

    } catch (error) {
        next(error);
    }
});


// =====================================================================
// FAVORİ MƏHSULLARI GÖSTƏRə — getFavoriteProducts
// ---------------------------------------------------------------------
// GET /api/v1/favorites
//
// İstifadəçinin favori siyahısı səhifəsini yükləyəndə işləyir.
// populate() ilə ID-lər tam məhsul məlumatına çevrilir.
// =====================================================================
export const getFavoriteProducts = catchAsyncErrors(async (req, res, next) => {

    const userId = req.user.id;

    try {
        // ── POPULATE İLƏ FAVORİLƏRİ ÇƏK ────────────────────────────
        // Favori siyahısında yalnız məhsul ID-ləri saxlanılır.
        // populate() — bu ID-ləri götürüb Product kolleksiyasından tam
        // məlumatı çəkir və əvəzinə yazır.
        //
        // select: "name price images" — yalnız lazımlı 3 sahə gəlir.
        // Bütün məhsul məlumatlarını (description, reviews, stock, seller...) 
        // çəkmək lazımsız yükdür — favori siyahısında bunlar göstərilmir.
        const favorite = await Favorite.findOne({ user: userId }).populate({
            path: "products",
            select: "name price images",
        });

        // Favori siyahısı yoxdursa — 404 qaytarılır.
        // Alternativ: boş array [] qaytarmaq daha yaxşı UX verər
        // (siyahı yoxdur = xəta deyil, sadəcə boşdur).
        // Hazırki hal — 404 statusu.
        if (!favorite) {
            return next(new ErrorHandler("Hal-hazırda məhsul mövcud deyil.", 404));
        }

        // Yalnız məhsullar massivi göndərilir — tam favorite obyekti deyil.
        // Frontend-ə yalnız lazımlı məlumat göndərmək daha yaxşı praktikadır.
        res.status(200).json({
            success:   true,
            favorites: favorite.products,
        });

    } catch (error) {
        next(error);
    }
});