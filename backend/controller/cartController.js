// ============================================================
// mongoose — MongoDB ilə işləmək üçün kitabxana.
// Burada yalnız ObjectId formatını yoxlamaq üçün istifadə olunur:
//   mongoose.Types.ObjectId.isValid(id)
// ============================================================
import mongoose from "mongoose";

// Cart — alış-veriş səbəti modeli.
// Hər istifadəçinin bir səbəti olur, içində məhsullar və miqdarlar saxlanılır.
import Cart from "../model/Cart.js";

// Product — məhsul modeli.
// Stok yoxlaması və məhsul adını almaq üçün lazımdır.
import { Product } from "../model/Product.js";

// ErrorHandler — özəl xəta sinifi. new ErrorHandler("mesaj", statusKod)
// şəklində istifadə olunur.
import ErrorHandler from "../utils/errorHandler.js";

// catchAsyncErrors — async funksiyalardakı xətaları avtomatik tutur,
// hər controller-ə try/catch yazmaqdan xilas edir.
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";

// notifyCartAdded — istifadəçi səbətə yeni məhsul əlavə etdikdə
// bildiriş göndərən yardımçı funksiya.
import { notifyCartAdded } from "../utils/notificationHelper.js";


// =====================================================================
// SƏBƏTƏ MƏHSUL ƏLAVƏ ET
// ---------------------------------------------------------------------
// POST /api/v1/cart
// İstifadəçi məhsul səhifəsindən "Səbətə əlavə et" düyməsinə basanda işləyir.
// Məhsul artıq səbətdədirsə — miqdarı artırır.
// Yeni məhsuldursa — səbətə əlavə edir.
// =====================================================================
export const addToCart = catchAsyncErrors(async (req, res, next) => {

    // productId — hansı məhsulun əlavə ediləcəyi
    // quantity — neçə ədəd (göndərilməsə default 1 götürülür)
    const { productId, quantity = 1 } = req.body;

    // req.user — isAuthenticated middleware-i tərəfindən doldurulur.
    // JWT token yoxlanılır və istifadəçi obyekti req.user-ə yazılır.
    const userId = req.user.id;

    // ── FORMAT YOXLAMASI ─────────────────────────────────────────────
    // MongoDB ObjectId 24 simvollu hex formatındadır: "507f1f77bcf86cd799439011"
    // Yanlış formatlı ID ilə sorğu etsək mongoose xəta atacaq —
    // bunu əvvəlcədən yoxlamaq daha aydın xəta mesajı verir.
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new ErrorHandler("Keçərsiz məhsul ID-si.", 400));
    }

    // Məhsulun bazada mövcudluğunu yoxla
    const product = await Product.findById(productId);

    if (!product) {
        return next(new ErrorHandler("Məhsul tapılmadı.", 404));
    }

    // ── STOK YOXLAMASI ───────────────────────────────────────────────
    // İstifadəçi stokdan çox məhsul səbətə əlavə edə bilməməlidir.
    // Məsələn: stokda 3 var, istifadəçi 5 istəyir → xəta.
    if (product.stock < quantity) {
        return next(new ErrorHandler("Kifayət qədər stok yoxdur.", 400));
    }

    // ── SƏBƏT TAPMA VƏ YA YARATMA ───────────────────────────────────
    // findOne({user: userId}) — bu istifadəçiyə aid səbəti tapır.
    // Hər istifadəçinin yalnız bir səbəti olur.
    let cart = await Cart.findOne({ user: userId });

    // Əgər istifadəçinin heç səbəti yoxdursa — yeni boş səbət obyekti yarat.
    // Hələ bazaya yazılmır — save() çağırılanda yazılacaq.
    if (!cart) {
        cart = new Cart({ user: userId, products: [] });
    }

    // ── MƏHSULUN ARTIQ SƏBƏTDƏ OLMASI YOXLAMASI ─────────────────────
    // findIndex — şərtə uyan elementin indeksini qaytarır, tapılmasa -1.
    // .toString() — MongoDB ObjectId-ni string-ə çevirir, çünki
    // productId string gəlir, p.product isə ObjectId tipindədir — birbaşa
    // müqayisə yanlış nəticə verər.
    const productIndex = cart.products.findIndex(
        (p) => p.product.toString() === productId
    );

    if (productIndex !== -1) {
        // Məhsul artıq səbətdədir — mövcud miqdarın üstünə əlavə et.
        // Məsələn: səbətdə 2 var, 3 əlavə edildi → 5 olur.
        cart.products[productIndex].quantity += quantity;
    } else {
        // Məhsul səbətdə yoxdur — yeni sətir kimi əlavə et.
        // { product: productId, quantity } — Cart modelinin products
        // massivindəki hər elementin strukturuna uyğundur.
        cart.products.push({ product: productId, quantity });
    }

    // Bütün dəyişikliklər bazaya yazılır.
    await cart.save();

    // ── BİLDİRİŞ ────────────────────────────────────────────────────
    // Bildiriş yalnız məhsul ilk dəfə əlavə edildikdə göndərilir.
    // Miqdar artırıldıqda (productIndex !== -1) bildiriş göndərilmir —
    // bu, lazımsız bildiriş spamının qarşısını alır.
    if (productIndex === -1) {
        await notifyCartAdded({
            userId,
            productId,
            productName: product.name,
        });
    }

    res.status(200).json({
        success: true,
        message: "Məhsul səbətə əlavə edildi.",
        cart,
    });
});


// =====================================================================
// SƏBƏTDƏN MƏHSUL SİL
// ---------------------------------------------------------------------
// DELETE /api/v1/cart/:productId
// İstifadəçi səbətdəki məhsulun yanındakı "Sil" düyməsinə basanda işləyir.
// Əgər son məhsul silindisə — səbətin özü də bazadan silinir.
// =====================================================================
export const removeFromCart = catchAsyncErrors(async (req, res, next) => {

    // URL parametrindən silinəcək məhsulun ID-si
    // Məsələn: DELETE /api/v1/cart/507f1f77bcf86cd799439011
    const { productId } = req.params;

    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        return next(new ErrorHandler("Səbət tapılmadı.", 404));
    }

    // ── MƏHSULU ÇIXAR ────────────────────────────────────────────────
    // filter() — şərti ödəməyən elementləri saxlayır, ödəyəni çıxarır.
    // Yəni: productId-yə bərabər OLMAYAN məhsullar qalır.
    // .toString() — ObjectId vs string müqayisəsi üçün lazımdır (yuxarıda izah edildi).
    cart.products = cart.products.filter(
        (p) => p.product.toString() !== productId
    );

    // ── BOŞALMIŞ SƏBƏTI SİL ─────────────────────────────────────────
    // Əgər son məhsul silindisə — boş səbəti bazada saxlamaq mənasızdır.
    // findOneAndDelete() — tapır və bir əməliyyatla silir.
    // Ayrıca save() çağırmağa ehtiyac yoxdur.
    if (cart.products.length === 0) {
        await Cart.findOneAndDelete({ user: userId });
        return res.status(200).json({
            success: true,
            message: "Səbət boşaldıldı və silindi.",
        });
    }

    // Hələ məhsullar qalıbsa — yenilənmiş səbəti bazaya yaz
    await cart.save();

    res.status(200).json({
        success: true,
        message: "Məhsul səbətdən silindi.",
        cart,
    });
});


// =====================================================================
// SƏBƏT MƏHSULLARINı GÖSTƏR
// ---------------------------------------------------------------------
// GET /api/v1/cart
// İstifadəçinin səbətini tam məhsul məlumatları ilə qaytarır.
// Səbət yoxdursa — boş array qaytarır (xəta deyil).
// =====================================================================
export const getCartProducts = catchAsyncErrors(async (req, res, next) => {

    const userId = req.user.id;

    // ── POPULATE ────────────────────────────────────────────────────
    // Səbətdə yalnız məhsul ID-ləri saxlanılır (məsələn: "507f1f77...").
    // populate() — bu ID-ləri götürüb Product kolleksiyasından tam
    // məlumatı çəkir və əvəzinə yazır.
    //
    // select: "name price images stock" — yalnız lazımlı sahələr gəlir.
    // Bütün məhsul məlumatlarını çəkmək lazımsız yükdür (description,
    // reviews, seller və s. burada lazım deyil).
    const cart = await Cart.findOne({ user: userId }).populate({
        path: "products.product",
        select: "name price images stock",
    });

    // Səbət tapılmadısa — null qaytarır, amma bu xəta deyil.
    // Boş array göndərmək frontend-in həyatını asanlaşdırır:
    // cart.map() çağıranda null-da xəta vermir, [] ilə işləyir.
    if (!cart) {
        return res.status(200).json({ success: true, cart: [] });
    }

    res.status(200).json({
        success: true,
        cart: cart.products,
    });
});


// =====================================================================
// SƏBƏTDƏ MİQDARI YENİLƏ
// ---------------------------------------------------------------------
// PUT /api/v1/cart/:productId
// İstifadəçi səbətdə "+" / "-" düymələri ilə miqdarı dəyişdirəndə işləyir.
// =====================================================================
export const updateCartQuantity = catchAsyncErrors(async (req, res, next) => {

    // URL-dən məhsul ID-si, body-dən yeni miqdar
    const { productId } = req.params;
    const { quantity }  = req.body;

    const userId = req.user.id;

    // Məhsulun bazada mövcudluğunu yoxla — stok məlumatı lazımdır
    const product = await Product.findById(productId);
    if (!product) return next(new ErrorHandler("Məhsul tapılmadı", 404));

    // ── VALİDASİYA ───────────────────────────────────────────────────
    // Stok yoxlaması: istifadəçi stokdan çox sifariş verə bilməz
    if (quantity > product.stock)
        return next(new ErrorHandler("Stok yetərsizdir", 400));

    // Minimum miqdar yoxlaması: 0 və ya mənfi ola bilməz.
    // 0 göndərildikdə "sil" əməliyyatı deyil, xəta verilir —
    // silmək üçün ayrıca removeFromCart endpoint-i var.
    if (quantity < 1)
        return next(new ErrorHandler("Miqdar 1-dən az ola bilməz", 400));

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return next(new ErrorHandler("Səbət tapılmadı", 404));

    // Məhsulun səbətdəki mövqeyini tap
    const productIndex = cart.products.findIndex(
        (p) => p.product.toString() === productId
    );

    // Məhsul səbətdə yoxdursa — yeniləmək mümkün deyil
    if (productIndex === -1)
        return next(new ErrorHandler("Məhsul səbətdə deyil", 404));

    // Köhnə miqdarı yeni dəyərlə tamamilə əvəz et (artırma yox, dəyişdirmə)
    cart.products[productIndex].quantity = quantity;

    await cart.save();

    // ── YENİLƏNMİŞ SƏBƏTİ POPULATE İLƏ QAYTAR ──────────────────────
    // save() sonrası cart obyektinin products massivindəki məhsullar
    // hələ də yalnız ID-dir. Frontend-ə tam məhsul məlumatı lazımdır,
    // ona görə yenidən findOne().populate() çağırılır.
    const updatedCart = await Cart.findOne({ user: userId }).populate("products.product");

    res.status(200).json({
        success: true,
        cart: updatedCart.products,
    });
});