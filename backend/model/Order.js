// mongoose — MongoDB ilə işləmək üçün kitabxana.
import mongoose from "mongoose";


// =====================================================================
// SİFARİŞ SCHEMA-SI — orderSchema
// ---------------------------------------------------------------------
// Hər sifariş: istifadəçi, məhsullar, ödəniş məlumatı,
// ümumi məbləğ və statusdan ibarətdir.
//
// Niyə orderItems məhsulları kopyalayır (ad, qiymət)?
//   Məhsul sonradan silinə və ya qiyməti dəyişə bilər.
//   Sifarişdə o andakı ad və qiymət saxlanılır — tarixçə doğruluğu.
//   populate() ilə məhsul məlumatı çəkilsəydi — məhsul silindikdə
//   sifariş məlumatları da itərdi.
// =====================================================================
const orderSchema = new mongoose.Schema(
    {
        // ── İSTİFADƏÇİ REFERANSİ ─────────────────────────────────────
        // user — sifarişi verən istifadəçi.
        // ref: "User" — populate() ilə tam istifadəçi məlumatı çəkilə bilər.
        //
        // Niyə User-ə ref, Admin-ə deyil?
        //   Sifarişlər yalnız adi istifadəçilər (alıcılar) tərəfindən verilir.
        //   Adminlər satıcıdır — onlar sifariş vermir.
        user: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "User",
            required: true,
        },

        // ── SİFARİŞ ELEMENTLƏRİ ─────────────────────────────────────
        // orderItems — sifarişdəki bütün məhsulların siyahısı.
        // Hər element həm ref (ID), həm də o andakı məlumatları saxlayır.
        orderItems: [
            {
                // product — məhsulun ID-si (ref üçün saxlanılır).
                // populate() ilə cari məhsul məlumatı çəkilə bilər
                // (əgər məhsul hələ bazadadırsa).
                product: {
                    type:     mongoose.Schema.Types.ObjectId,
                    ref:      "Product",
                    required: true,
                },

                // name — məhsulun o andakı adı.
                // Niyə saxlanılır?
                //   Məhsul bazadan silinərsə — sifariş tarixçəsində
                //   hələ də ad görünər. populate() uğursuz olsa belə
                //   bu sahə mövcuddur.
                name: {
                    type:     String,
                    required: true,
                },

                // price — məhsulun o andakı qiyməti.
                // Niyə saxlanılır?
                //   Qiymət sonradan artsa/azalsa — sifariş tarixi
                //   düzgün məbləği göstərir. totalAmount hesablaması
                //   bu qiymətə əsaslanır.
                price: {
                    type:     Number,
                    required: true,
                },

                // quantity — neçə ədəd sifariş verilib.
                quantity: {
                    type:     Number,
                    required: true,
                },

                // image — məhsulun o andakı şəkil URL-i.
                // Sifariş tarixçəsində şəkil göstərmək üçün.
                // default: null — şəkli olmayan məhsullar üçün.
                image: {
                    type:    String,
                    default: null,
                },

                // seller — məhsulun satıcısının mağaza adı (String).
                // Niyə ObjectId deyil, String?
                //   Admin.sellerInfo.storeName istifadə olunur.
                //   getAdminOrders-da: Order.find({"orderItems.seller": storeName})
                //   String ilə filter qurmaq daha sadədir.
                //   default: null — satıcısız məhsullar üçün (admin məhsulları).
                seller: {
                    type:    String,
                    default: null,
                },
            },
        ],

        // ── ÖDƏNIŞ MƏLUMATLARI ────────────────────────────────────────
        // paymentInfo — Stripe ödənişinin detalları.
        // Bu məlumatlar ödənişi izləmək, sübut etmək üçün saxlanılır.
        paymentInfo: {
            // stripePaymentId — Stripe-dakı PaymentIntent ID-si.
            // Formatı: "pi_3Qv..." — Stripe dashboard-da bu ID ilə axtarış.
            // orderController-da duplikat yoxlaması üçün istifadə olunur:
            //   Order.findOne({"paymentInfo.stripePaymentId": id})
            stripePaymentId: {
                type:     String,
                required: true,
            },

            // status — ödənişin vəziyyəti.
            //   "paid"  → Stripe ödənişi tamamlandı (real mühit)
            //   "test"  → test modu (ödəniş tamamlanmayıb amma sifariş yaradıldı)
            status: {
                type:    String,
                default: "paid",
            },

            // currency — ödənişin valyutası.
            // default: "azn" — Azərbaycan manatı.
            currency: {
                type:    String,
                default: "azn",
            },
        },

        // ── ÜMUMİ MƏBLƏğ ─────────────────────────────────────────────
        // totalAmount — bütün məhsulların (qiymət × miqdar) cəmi.
        // orderController-da:
        //   orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        // Bazada saxlanılır — hər dəfə yenidən hesablamaq lazım olmur.
        totalAmount: {
            type:     Number,
            required: true,
        },

        // ── SİFARİŞ STATUSU ──────────────────────────────────────────
        // orderStatus — sifarişin cari mərhələsi.
        // enum — yalnız bu 4 dəyər qəbul edilir:
        //   "pending"    → sifariş qəbul edildi, hələ emal edilmir
        //   "processing" → satıcı sifarişi hazırlayır
        //   "shipped"    → kuryer tərəfindən yola salındı
        //   "delivered"  → müştəriyə çatdırıldı
        //
        // Status dəyişikliyi yalnız updateOrderStatus() ilə mümkündür —
        // satıcı öz mağazasının sifarişlərini idarə edir.
        // Status dəyişdikdə istifadəçiyə bildiriş göndərilir.
        orderStatus: {
            type:    String,
            enum:    ["pending", "processing", "shipped", "delivered"],
            default: "pending",
        },

        // ── SİFARİŞİN TAMAMLANMA VƏZİYYƏTİ ──────────────────────────
        // isCompleted — sifariş "delivered" statusuna çatdıqda true olur.
        // Tamamlanmış sifarişlər statistika, filtr və hesabat üçün istifadə edilir.
        // updateOrderStatus() funksiyasında status === "delivered" yoxlananda
        // bu sahə avtomatik true edilir.
        isCompleted: {
            type:    Boolean,
            default: false,
        },

        // ── BONUS SAHƏLƏRİ ────────────────────────────────────────────
        // bonusUsed — bu sifarişdə istifadəçinin xərclədiy bonus sayı.
        // Faktiki ödəniş = totalAmount - bonusUsed × bonusValueAzn
        // Mühasibat izlənilməsi üçün saxlanılır.
        bonusUsed: {
            type:    Number,
            default: 0,
            min:     0,
        },

        // bonusEarned — bu sifariş "delivered" olduqda qazanılan bonus sayı.
        // updateOrderStatus-da awardCartBonus() tərəfindən doldurulur.
        bonusEarned: {
            type:    Number,
            default: 0,
            min:     0,
        },
        // ── BLOGGER PROMO ────────────────────────────────────────────
        // promoCode — bu sifarişdə istifadə edilən blogger promo kodu.
        // promoMethod — kodun daxil edilmə üsulu: "code" (əl ilə) və ya "link" (referal).
        promoCode: {
            type:    String,
            default: null,
        },
        promoMethod: {
          type:    String,
          enum:    ["code", "link", null],
          default: null,
        },
    },
    {
        // timestamps: true — Mongoose avtomatik əlavə edir:
        //   createdAt → sifarişin verilmə tarixi
        //   updatedAt → son status dəyişikliyi tarixi
        timestamps: true,
    }
);


// =====================================================================
// MODEL EXPORT
// ---------------------------------------------------------------------
// mongoose.model("Order", orderSchema):
//   "Order" → kolleksiya adı "orders" olur.
//
// Bu model vasitəsilə əməliyyatlar:
//   Order.create({...})                          → yeni sifariş yarat
//   Order.find({ user: userId })                 → istifadəçinin sifarişləri
//   Order.find({"orderItems.seller": storeName}) → mağazanın sifarişləri
//   Order.findById(id)                           → tək sifariş
//   order.save()                                 → status yenilə
// =====================================================================
export default mongoose.model("Order", orderSchema);