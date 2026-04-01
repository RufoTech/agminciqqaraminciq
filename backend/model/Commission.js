// mongoose — MongoDB ilə işləmək üçün kitabxana.
import mongoose from "mongoose";


// =====================================================================
// CACHE TƏMİZLƏMƏ
// ---------------------------------------------------------------------
// Niyə lazımdır?
//   Node.js modulları yaddaşda (cache-də) saxlanılır.
//   İnkişaf mərhələsində server yenidən başladılmadan kod dəyişdiriləndə
//   (hot reload — nodemon) köhnə model cache-də qalır.
//   Yeni schema ilə köhnə model toqquşur → "Cannot overwrite model" xətası.
//
// delete mongoose.models["Commission"] — modeli cache-dən silir.
// delete mongoose.modelSchemas?.["Commission"] — schema cache-ini silir.
//   ?.  — modelSchemas mövcud deyilsə xəta verməsin deyə optional chaining.
//
// İstehsal mühitində bu lazım deyil — server bir dəfə başlayır,
// yenidən yüklənmir. Yalnız inkişaf üçün faydalıdır.
// =====================================================================
delete mongoose.models["Commission"];
delete mongoose.modelSchemas?.["Commission"];


// =====================================================================
// KOMİSYA SCHEMA-SI — commissionSchema
// ---------------------------------------------------------------------
// Hər sifariş yarandıqda bir komisya qeydi yaradılır.
// Bu qeyd: hansı sifarişdən, hansı satıcıdan, nə qədər komisya
// alındığını, statusunu və ödəniş məlumatlarını saxlayır.
//
// İş axını:
//   Sifariş yaranır → createCommission() çağırılır →
//   Commission qeydi "pending" olaraq yaradılır →
//   Ay sonu transferCommission() ilə Stripe-a ödəniş edilir →
//   Status "transferred" olur.
// =====================================================================
const commissionSchema = new mongoose.Schema(
    {
        // ── SİFARİŞ REFERANSİ ─────────────────────────────────────────
        // orderId — bu komisyanın hansı sifarişə aid olduğu.
        // ref: "Order" — populate() ilə sifariş detalları çəkilə bilər.
        orderId: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "Order",
            required: true,
        },

        // ── SATICI İDENTİFİKATORU ─────────────────────────────────────
        // sellerId — satıcının mağaza adı (String).
        // Niyə ObjectId deyil, String?
        //   Admin modelindəki sellerInfo.storeName istifadə olunur.
        //   Mağaza adı ilə axtarış daha sadədir.
        //   (Gələcəkdə ObjectId-yə keçmək daha yaxşı olar — normalizasiya)
        sellerId: {
            type:     String,
            required: true,
        },

        // ── MALİYYƏ SAHƏLƏRİ ─────────────────────────────────────────
        // orderAmount — sifarişin ümumi məbləği (100 AZN)
        orderAmount: {
            type:     Number,
            required: true,
        },

        // commissionPercentage — komisya faizi (default: 8%)
        // COMMISSION_PERCENTAGE sabitindən gəlir — commissionController-da.
        // Bazada saxlanılır: faiz gələcəkdə dəyişsə köhnə qeydlər
        // orijinal faizlə qalır (tarixçə doğruluğu üçün vacibdir).
        commissionPercentage: {
            type:    Number,
            default: 8,
        },

        // commissionAmount — şirkətə düşən hissə (100 * 8/100 = 8 AZN)
        commissionAmount: {
            type:     Number,
            required: true,
        },

        // sellerEarning — satıcıya düşən hissə (100 - 8 = 92 AZN)
        sellerEarning: {
            type:     Number,
            required: true,
        },

        // ── STATUS ────────────────────────────────────────────────────
        // enum — yalnız bu 3 dəyər qəbul edilir:
        //   "pending"     → komisya hesablanıb, hələ köçürülməyib (ay sonu gözlənilir)
        //   "transferred" → Stripe ilə şirkət hesabına uğurla köçürüldü
        //   "failed"      → Stripe ödənişi uğursuz oldu
        status: {
            type:    String,
            enum:    ["pending", "transferred", "failed"],
            default: "pending",
        },

        // ── STRIPE ÖDƏNIŞ MELUMATı ────────────────────────────────────
        // stripePaymentIntentId — uğurlu köçürmənin Stripe-dakı ID-si.
        // Ödənişi Stripe dashboard-da izləmək və sübut etmək üçün lazımdır.
        // default: null — köçürmə edilənə qədər boş qalır.
        stripePaymentIntentId: {
            type:    String,
            default: null,
        },

        // receiptUrl — PDF çekin URL-i.
        // generateReceipt() funksiyası tərəfindən doldurulur.
        // default: null — çek yaradılana qədər boş qalır.
        receiptUrl: {
            type:    String,
            default: null,
        },

        // transferredAt — köçürmənin baş verdiyi tarix/vaxt.
        // default: null — köçürmə edilənə qədər boş qalır.
        transferredAt: {
            type:    Date,
            default: null,
        },

        // ── AYLIK QRUPLAŞDIRMA ────────────────────────────────────────
        // month + year — komisyaları aylıq qruplaşdırmaq üçün saxlanılır.
        // Niyə Date.getMonth() ilə hesablamırıq?
        //   Hər sorğuda createdAt-dan ay çıxarmaq əlavə hesablama deməkdir.
        //   Birbaşa month/year saxlamaq: { sellerId, month: 3, year: 2026 }
        //   kimi filter qurmağı çox asanlaşdırır.
        month: {
            type:     Number,
            required: true, // 1-12 arası (getMonth() + 1)
        },
        year: {
            type:     Number,
            required: true, // məsələn: 2026
        },
    },
    {
        // timestamps: true — createdAt və updatedAt avtomatik əlavə olunur.
        timestamps: true,
    }
);


// =====================================================================
// COMPOUND INDEX (Mürəkkəb İndeks)
// ---------------------------------------------------------------------
// commissionSchema.index({ sellerId: 1, month: 1, year: 1, status: 1 })
//
// İndeks nədir?
//   Kitabda mündəricat kimidir — axtarışı sürətləndirir.
//   İndeks olmadan MongoDB bütün sənədləri bir-bir yoxlayır (full scan).
//   İndeks ilə birbaşa uyğun sənədlərə gedir.
//
// Bu 4 sahə birlikdə indekslənir — niyə?
//   commissionController-dakı ən çox istifadə olunan sorğu:
//   Commission.find({ sellerId, month, year, status: "pending" })
//   Bu sorğu bu 4 sahənin hamısını eyni anda istifadə edir.
//   Mürəkkəb indeks bu sorğunu çox sürətləndirir.
//
// 1 → artan sıra (ascending) — axtarış istiqaməti
//
// Nə zaman kritikdir?
//   Komisya sayı minlərlə olduqda — indekssiz bu sorğu çox yavaş olar.
// =====================================================================
commissionSchema.index({ sellerId: 1, month: 1, year: 1, status: 1 });


// =====================================================================
// MODEL EXPORT
// ---------------------------------------------------------------------
// mongoose.model("Commission", commissionSchema):
//   "Commission" → kolleksiya adı "commissions" olur.
// =====================================================================
export default mongoose.model("Commission", commissionSchema);