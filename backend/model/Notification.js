// mongoose — MongoDB ilə işləmək üçün kitabxana.
import mongoose from "mongoose";


// =====================================================================
// BİLDİRİŞ SCHEMA-SI — notificationSchema
// ---------------------------------------------------------------------
// Sistemdəki bütün bildirişlər bu kolleksiyada saxlanılır.
// Həm istifadəçilərə (User), həm adminlərə (Admin) bildiriş göndərilə bilər.
//
// Bildiriş növləri:
//   İstifadəçiyə: sifariş statusu, favori qiymət dəyişikliyi, səbət
//   Adminə:       yeni sifariş, az stok, yeni istifadəçi, komisya
// =====================================================================
const notificationSchema = new mongoose.Schema(
    {
        // ── BİLDİRİŞ ALANI ───────────────────────────────────────────
        // recipient — bu bildirişi kim alacaq?
        //
        // refPath — dinamik referans: "User" və ya "Admin" ola bilər.
        // Niyə dinamik ref?
        //   Normal ref: { type: ObjectId, ref: "User" } — yalnız User-ə işləyir.
        //   refPath ilə: ref nədir — recipientModel sahəsinə baxılır.
        //   Bu sayəsində eyni schema həm User, həm Admin bildirişlərini saxlayır.
        //
        // populate() necə işləyir:
        //   recipientModel = "User"  → User kolleksiyasından çəkir
        //   recipientModel = "Admin" → Admin kolleksiyasından çəkir
        recipient: {
            type:     mongoose.Schema.Types.ObjectId,
            required: true,
            refPath:  "recipientModel", // dinamik ref — aşağıdakı sahəyə baxır
        },

        // recipientModel — recipient-in hansı modeldə olduğunu bildirir.
        // enum: yalnız "User" və ya "Admin" qəbul edilir.
        // Bu sahə refPath üçün məcburidir — olmasa populate() işləməz.
        recipientModel: {
            type:     String,
            enum:     ["User", "Admin"],
            required: true,
        },

        // ── BİLDİRİŞ NÖVÜ ────────────────────────────────────────────
        // type — bildirişin nə haqqında olduğunu bildirir.
        // Frontend bu dəyərə görə fərqli ikon/rəng göstərə bilər.
        //
        // enum — yalnız bu dəyərlər qəbul edilir:
        //   "order_status"      → sifariş statusu dəyişdi (istifadəçiyə)
        //   "new_order"         → yeni sifariş gəldi (adminə)
        //   "low_stock"         → stok 5-dən az qaldı (adminə)
        //   "out_of_stock"      → stok tamam bitdi (adminə)
        //   "cart_added"        → məhsul səbətə əlavə edildi (istifadəçiyə)
        //   "favorite_price"    → favoridəki məhsulun qiyməti dəyişdi (istifadəçiyə)
        //   "commission_earned" → yeni komisya qazanıldı (adminə)
        //   "new_user"          → yeni istifadəçi qeydiyyat keçdi (adminə)
        type: {
            type:     String,
            enum:     [
                "order_status",
                "new_order",
                "low_stock",
                "out_of_stock",
                "cart_added",
                "favorite_price",
                "commission_earned",
                "new_user",
            ],
            required: true,
        },

        // ── MƏZMUN ───────────────────────────────────────────────────
        // title — bildirişin qısa başlığı.
        // Məsələn: "Sifarişiniz yola düşdü", "Stok azalır!"
        title: {
            type:     String,
            required: true,
        },

        // message — bildirişin tam mətni.
        // Məsələn: "507f1f... nömrəli sifarişiniz 'shipped' statusuna keçdi."
        message: {
            type:     String,
            required: true,
        },

        // ── OXUNMA STATUSU ────────────────────────────────────────────
        // isRead — bildiriş oxunubmu?
        // default: false — yeni bildiriş həmişə oxunmamış gəlir.
        //
        // Nəyə lazımdır?
        //   Navbar-dakı bildiriş nişanı (🔔 3) — oxunmamışların sayı.
        //   markAsRead() / markAllAsRead() — bu sahəni true edir.
        isRead: {
            type:    Boolean,
            default: false,
        },

        // ── ƏLAQƏLİ MƏLUMATLAR ───────────────────────────────────────
        // data — bildirişlə bağlı əlavə kontekst məlumatı.
        // Frontend bu məlumatlara görə "Sifarişə bax" linki göstərə bilər.
        //
        // Niyə hər biri default: null?
        //   Bildiriş növündən asılı olaraq bəzi sahələr dolu, bəziləri boş olur.
        //   "new_order"  → orderId dolu, productId null
        //   "low_stock"  → productId dolu, orderId null
        //   "new_user"   → hər ikisi null
        //   null — sahənin mövcud amma boş olduğunu aydın göstərir.
        data: {
            // orderId — bildiriş hansı sifarişlə bağlıdır
            orderId: {
                type:    mongoose.Schema.Types.ObjectId,
                ref:     "Order",
                default: null,
            },
            // productId — bildiriş hansı məhsulla bağlıdır
            productId: {
                type:    mongoose.Schema.Types.ObjectId,
                ref:     "Product",
                default: null,
            },
            // amount — məbləğ (sifariş cəmi, komisya məbləği və s.)
            amount: {
                type:    Number,
                default: null,
            },
            // status — sifariş statusu ("shipped", "delivered" və s.)
            status: {
                type:    String,
                default: null,
            },
            // stock — qalan stok sayı (az stok bildirişlərində)
            stock: {
                type:    Number,
                default: null,
            },
        },
    },
    {
        // timestamps: true — createdAt və updatedAt avtomatik əlavə olunur.
        // createdAt bildirişin nə vaxt göndərildiyini göstərir —
        // bildiriş siyahısında "5 dəqiqə əvvəl" kimi göstərmək üçün lazımdır.
        timestamps: true,
    }
);


// =====================================================================
// COMPOUND INDEX (Mürəkkəb İndeks)
// ---------------------------------------------------------------------
// notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 })
//
// Bu 3 sahə birlikdə indekslənir — niyə?
//   Ən çox istifadə olunan sorğu (notificationController-da):
//   Notification.find({ recipient: userId, isRead: false })
//               .sort({ createdAt: -1 })
//
//   recipient: 1  → bu istifadəçinin bildirişlərini tap (artan)
//   isRead: 1     → oxunmamışları süzgəcdən keçir (artan)
//   createdAt: -1 → ən yeni bildiriş ən üstdə (azalan)
//
// İndeks olmadan: bütün bildirişlər yoxlanılır (full scan) → yavaş.
// İndeks ilə: birbaşa uyğun bildirişlərə gedir → sürətli.
//
// Bildiriş sayı çox olanda (yüzlərlə, minlərlə) bu indeks kritik əhəmiyyət daşıyır.
// =====================================================================
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });


// =====================================================================
// MODEL EXPORT
// ---------------------------------------------------------------------
// mongoose.model("Notification", notificationSchema):
//   "Notification" → kolleksiya adı "notifications" olur.
// =====================================================================
export default mongoose.model("Notification", notificationSchema);