// =====================================================================
// BİLDİRİŞ YARDIMÇI FUNKSİYALARI — notificationHelper.js
// ---------------------------------------------------------------------
// Bu fayl birbaşa istifadəçiyə açılmır — controller-lərdən çağırılır.
// Hər hadisə üçün (yeni sifariş, stok azalması...) ayrıca funksiya var.
//
// Niyə ayrı fayl?
//   Bildiriş məntiqi controller-lərin içinə yazılsaydı —
//   controller-lər şişərdi, eyni bildiriş kodu hər yerdə təkrarlanardı.
//   Bu fayl bildiriş məntiqini bir yerdə toplayır (DRY prinsipi).
//
// Bütün funksiyalar try/catch ilə əhatə edilib — niyə?
//   Bildiriş göndərilə bilmədikdə əsas əməliyyat (sifariş, ödəniş)
//   dayandırılmamalıdır. Xəta loglara yazılır, amma proses davam edir.
// =====================================================================

// Notification — bildiriş modeli ("notifications" kolleksiyası).
import Notification from "../model/Notification.js";

// Admin — satıcı modeli. Bildiriş göndəriləcək admini tapmaq üçün.
import Admin from "../model/Admin.js";


// =====================================================================
// YARDIMÇI — BÜTÜN ADMİNLƏRƏ BİLDİRİŞ GÖNDƏR — notifyAllAdmins
// ---------------------------------------------------------------------
// Bu funksiya export edilmir — yalnız bu fayl daxilindən çağırılır.
// notifyNewUser() tərəfindən istifadə olunur.
//
// Niyə insertMany(), create() deyil?
//   Adminlər çox ola bilər (10, 20, 50...).
//   insertMany() — bütün bildirişləri bir sorğuda bazaya yazır.
//   create() loop içindirsə — hər admin üçün ayrıca sorğu → yavaş.
// =====================================================================
const notifyAllAdmins = async ({ type, title, message, data = {} }) => {

    // Yalnız "approved" adminlər bildiriş alır — "pending" olanlar deyil.
    // .select("_id") — yalnız ID lazımdır, digər sahələr lazımsız yükdür.
    const admins = await Admin.find({ sellerStatus: "approved" }).select("_id");

    // Hər admin üçün bildiriş obyekti yarat
    const notifications = admins.map((admin) => ({
        recipient:      admin._id,
        recipientModel: "Admin",
        type,
        title,
        message,
        data,
    }));

    // Bildiriş varsa bazaya yaz — boş insertMany() xəta verməsin deyə yoxlama
    if (notifications.length > 0) {
        await Notification.insertMany(notifications);
    }
};


// =====================================================================
// 1. YENİ SİFARİŞ — notifyNewOrder
// ---------------------------------------------------------------------
// Çağırıldığı yer: orderController.js → createOrder()
// Kimin üçün: Yalnız həmin sifarişin satıcısı (məhsulun mağazası)
//
// Niyə bütün adminlərə deyil, yalnız satıcıya?
//   Sifariş yalnız bu mağazanın məhsulunu ehtiva edir.
//   Başqa mağazaların admini ilgisiz bildiriş almamalıdır.
// =====================================================================
export const notifyNewOrder = async ({ orderId, totalAmount, sellerStoreName }) => {
    try {
        // sellerInfo.storeName ilə mağazanı tap
        const admin = await Admin.findOne({ "sellerInfo.storeName": sellerStoreName }).select("_id");

        // Belə adlı mağaza tapılmadısa — bildiriş göndərmə, prosesi dayandırma
        if (!admin) return;

        await Notification.create({
            recipient:      admin._id,
            recipientModel: "Admin",
            type:           "new_order",
            title:          "🛒 Yeni Sifariş!",
            // toFixed(2) → "1000.00 AZN" kimi formatlı məbləğ
            message:        `${totalAmount.toFixed(2)} AZN dəyərində yeni sifariş daxil oldu.`,
            data:           { orderId, amount: totalAmount },
        });
    } catch (err) {
        // Bildiriş xətası əsas sifariş axınını dayandırmır
        console.error("notifyNewOrder xəta:", err.message);
    }
};


// =====================================================================
// 2. SİFARİŞ STATUS DƏYİŞİKLİYİ — notifyOrderStatusChange
// ---------------------------------------------------------------------
// Çağırıldığı yer: orderController.js → updateOrderStatus()
// Kimin üçün: Sifarişi verən istifadəçi (alıcı)
//
// statusLabels — texniki statusu (shipped) istifadəçi dilindəki
//   qarşılığına çevirir: "Göndərildi"
// statusEmojis — hər statusa vizual ikon əlavə edir
// =====================================================================
export const notifyOrderStatusChange = async ({ userId, orderId, newStatus }) => {
    try {
        // Texniki status adları → istifadəçi dilindəki qarşılıqlar
        const statusLabels = {
            pending:    "Gözlənilir",
            processing: "Hazırlanır",
            shipped:    "Göndərildi",
            delivered:  "Çatdırıldı",
        };

        // Hər statusa vizual ikon
        const statusEmojis = {
            pending:    "⏳",
            processing: "🔧",
            shipped:    "🚚",
            delivered:  "✅",
        };

        // Naməlum status olarsa texniki adı göstər, "📦" ikonunu istifadə et
        const label = statusLabels[newStatus] || newStatus;
        const emoji = statusEmojis[newStatus] || "📦";

        await Notification.create({
            recipient:      userId,
            recipientModel: "User",
            type:           "order_status",
            title:          `${emoji} Sifariş Statusu Yeniləndi`,
            message:        `Sifarişinizin statusu "${label}" olaraq yeniləndi.`,
            data:           { orderId, status: newStatus },
        });
    } catch (err) {
        console.error("notifyOrderStatusChange xəta:", err.message);
    }
};


// =====================================================================
// 3. STOK AZ QALDI / BİTDİ — notifyLowStock
// ---------------------------------------------------------------------
// Çağırıldığı yer: orderController.js → createOrder() (stok azaldıqda)
// Kimin üçün: Həmin məhsulun satıcısı
//
// İki fərqli vəziyyət:
//   stock === 0 → "out_of_stock" — stok tamam bitdi → ❌
//   stock <= 5  → "low_stock"   — stok az qaldı   → ⚠️
// =====================================================================
export const notifyLowStock = async ({ productId, productName, stock, sellerStoreName }) => {
    try {
        // Stok sıfıra düşdüsə "out_of_stock", deyilsə "low_stock"
        const isOutOfStock = stock === 0;

        const admin = await Admin.findOne({ "sellerInfo.storeName": sellerStoreName }).select("_id");
        if (!admin) return;

        await Notification.create({
            recipient:      admin._id,
            recipientModel: "Admin",
            // isOutOfStock-a görə type, title, message fərqlənir
            type:    isOutOfStock ? "out_of_stock" : "low_stock",
            title:   isOutOfStock ? "❌ Stok Bitdi!" : "⚠️ Stok Az Qaldı!",
            message: isOutOfStock
                ? `"${productName}" məhsulunun stoku tamamilə bitti.`
                : `"${productName}" məhsulunun stoku ${stock} ədədə düşdü.`,
            data:    { productId, stock },
        });
    } catch (err) {
        console.error("notifyLowStock xəta:", err.message);
    }
};


// =====================================================================
// 4. SƏBƏTƏ ƏLAVƏ EDİLDİ — notifyCartAdded
// ---------------------------------------------------------------------
// Çağırıldığı yer: cartController.js → addToCart()
// Kimin üçün: Məhsulu səbətə əlavə edən istifadəçi
//
// Niyə istifadəçinin özünə bildiriş?
//   İstifadəçi aktivliyini izləmək, bildiriş tarixçəsi saxlamaq üçün.
//   Həm də çox cihaz istifadəsi: telefonda səbətə əlavə etdi,
//   kompüterdə bildirişdən görür.
// =====================================================================
export const notifyCartAdded = async ({ userId, productId, productName }) => {
    try {
        await Notification.create({
            recipient:      userId,
            recipientModel: "User",
            type:           "cart_added",
            title:          "🛒 Səbətə Əlavə Edildi",
            message:        `"${productName}" məhsulu səbətinizə əlavə edildi.`,
            data:           { productId },
        });
    } catch (err) {
        console.error("notifyCartAdded xəta:", err.message);
    }
};


// =====================================================================
// 5. FAVORİ MƏHSULUN QİYMƏTİ DƏYİŞDİ — notifyFavoritePriceChange
// ---------------------------------------------------------------------
// Çağırıldığı yer: productController.js → updateProduct()
// Kimin üçün: Həmin məhsulu favorilərinə əlavə etmiş bütün istifadəçilər
//
// Niyə dynamic import (import() funksiyası)?
//   Circular dependency (dairəvi asılılıq) probleminin qarşısını alır.
//   Əgər Favorite fayl yükləndikdə bu fayl da yüklənərdisə —
//   ikisi bir-birini gözləyərdi → sonsuz loop.
//   import() ilə yalnız bu funksiya çağırıldıqda Favorite yüklənir.
//
// insertMany() — eyni anda çox istifadəçiyə bildiriş:
//   100 istifadəçi bu məhsulu favorilərinə əlavəsə —
//   100 ayrı create() əvəzinə 1 insertMany() çağırılır.
// =====================================================================
export const notifyFavoritePriceChange = async ({ productId, productName, oldPrice, newPrice }) => {
    try {
        // Dynamic import — circular dependency-nin qarşısını alır
        const Favorite = (await import("../model/Favorite.js")).default;

        // Bu məhsulu favorisinə əlavə etmiş istifadəçiləri tap.
        // Favorite.products massivindəki productId-yə görə axtarış.
        // .select("user") — yalnız istifadəçi ID-si lazımdır.
        const favorites = await Favorite.find({ products: productId }).select("user");

        // Heç kim bu məhsulu favorisindən keçirməyibsə — bildiriş göndərmə
        if (favorites.length === 0) return;

        // Endirimmi, qiymət artımımı?
        const isDiscount = newPrice < oldPrice;
        // Fərqi 2 ondalıq rəqəmlə göstər: Math.abs(100-85) = "15.00"
        const diff = Math.abs(oldPrice - newPrice).toFixed(2);

        // Hər favori istifadəçisi üçün bildiriş obyekti yarat
        const notifications = favorites.map((fav) => ({
            recipient:      fav.user,
            recipientModel: "User",
            type:           "favorite_price",
            // Endirim varsa sevinc, qiymət artdısa məlumat mesajı
            title:          isDiscount ? "🎉 Favoridə Endirim!" : "💰 Qiymət Dəyişdi",
            message:        isDiscount
                ? `"${productName}" məhsuluna ${diff} AZN endirim edildi! İndi: ${newPrice} AZN`
                : `"${productName}" məhsulunun qiyməti dəyişdi. İndi: ${newPrice} AZN`,
            data:           { productId, amount: newPrice },
        }));

        // Bütün bildirişlər bir sorğuda bazaya yazılır
        await Notification.insertMany(notifications);
    } catch (err) {
        console.error("notifyFavoritePriceChange xəta:", err.message);
    }
};


// =====================================================================
// 6. YENİ KOMİSYA — notifyCommissionEarned
// ---------------------------------------------------------------------
// Çağırıldığı yer: commissionController.js → createCommission()
// Kimin üçün: Sifarişin satıcısı
//
// Satıcı hər yeni sifarişdən nə qədər qazandığını dərhal görür:
//   "1000 AZN sifarişdən 920 AZN qazandınız (komisya: 80 AZN)"
// =====================================================================
export const notifyCommissionEarned = async ({ sellerId, sellerStoreName, commissionAmount, sellerEarning, orderId }) => {
    try {
        const admin = await Admin.findOne({ "sellerInfo.storeName": sellerStoreName }).select("_id");
        if (!admin) return;

        await Notification.create({
            recipient:      admin._id,
            recipientModel: "Admin",
            type:           "commission_earned",
            title:          "💵 Yeni Komissiya Qazanıldı",
            message:        `Yeni sifarişdən ${sellerEarning.toFixed(2)} AZN qazandınız (komisya: ${commissionAmount.toFixed(2)} AZN).`,
            data:           { orderId, amount: sellerEarning },
        });
    } catch (err) {
        console.error("notifyCommissionEarned xəta:", err.message);
    }
};


// =====================================================================
// 7. YENİ İSTİFADƏÇİ QEYDİYYATI — notifyNewUser
// ---------------------------------------------------------------------
// Çağırıldığı yer: authController.js → registerUser()
// Kimin üçün: Bütün təsdiqlənmiş adminlər
//
// notifyAllAdmins() yardımçı funksiyası istifadə olunur —
// bütün adminlərə eyni bildirişi göndərmək üçün.
// =====================================================================
export const notifyNewUser = async ({ userName, userEmail }) => {
    try {
        await notifyAllAdmins({
            type:    "new_user",
            title:   "👤 Yeni İstifadəçi",
            message: `${userName} (${userEmail}) qeydiyyatdan keçdi.`,
            data:    {},
        });
    } catch (err) {
        console.error("notifyNewUser xəta:", err.message);
    }
};