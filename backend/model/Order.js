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
        user: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "User",
            required: true,
        },

        // ── SİFARİŞ ELEMENTLƏRİ ─────────────────────────────────────
        // orderItems — sifarişdəki bütün məhsulların siyahısı.
        orderItems: [
            {
                // product — məhsulun ID-si (ref üçün saxlanılır).
                product: {
                    type:     mongoose.Schema.Types.ObjectId,
                    ref:      "Product",
                    required: true,
                },

                // name — məhsulun o andakı adı.
                name: {
                    type:     String,
                    required: true,
                },

                // price — məhsulun o andakı qiyməti.
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
                image: {
                    type:    String,
                    default: null,
                },

                // seller — məhsulun satıcısının mağaza adı (String).
                seller: {
                    type:    String,
                    default: null,
                },
            },
        ],

        // ── ÖDƏNIŞ MƏLUMATLARI ────────────────────────────────────────
        // paymentInfo — Stripe ödənişinin detalları.
        paymentInfo: {
            // stripePaymentId — Stripe-dakı PaymentIntent ID-si.
            stripePaymentId: {
                type:     String,
                required: true,
            },

            // status — ödənişin vəziyyəti.
            status: {
                type:    String,
                default: "paid",
            },

            // currency — ödənişin valyutası.
            currency: {
                type:    String,
                default: "azn",
            },
        },

        // ── ÜMUMİ MƏBLƏğ ─────────────────────────────────────────────
        // totalAmount — bütün məhsulların (qiymət × miqdar) cəmi.
        totalAmount: {
            type:     Number,
            required: true,
        },

        // ── SİFARİŞ STATUSU ──────────────────────────────────────────
        // orderStatus — sifarişin cari mərhələsi.
        //   "pending"    → sifariş qəbul edildi
        //   "processing" → satıcı sifarişi hazırlayır
        //   "shipped"    → kuryer tərəfindən yola salındı
        //   "delivered"  → müştəriyə çatdırıldı
        //   "cancelled"  → ləğv edildi
        orderStatus: {
            type:    String,
            required: true,
            enum:    ["pending", "processing", "shipped", "delivered", "cancelled"],
            default: "pending",
        },

        // ── SİFARİŞİN TAMAMLANMA VƏZİYYƏTİ ──────────────────────────
        // isCompleted — sifariş "delivered" statusuna çatdıqda true olur.
        isCompleted: {
            type:    Boolean,
            default: false,
        },

        // deliveredAt — sifarişin çatdırılma tarixi (yalnız delivered üçün).
        deliveredAt: Date,
    },
    {
        // timestamps: true — createdAt, updatedAt avtomatik.
        timestamps: true,
    }
);


// =====================================================================
// MODEL EXPORT
// =====================================================================
export default mongoose.model("Order", orderSchema);
export default mongoose.model("Order", orderSchema);