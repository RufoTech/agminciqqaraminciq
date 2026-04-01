// mongoose — MongoDB ilə işləmək üçün kitabxana.
import mongoose from "mongoose";


// =====================================================================
// SATICI BALANSI SCHEMA-SI — sellerBalanceSchema
// ---------------------------------------------------------------------
// Hər satıcının maliyyə vəziyyətini izləyir.
// Bu model Commission modeli ilə birlikdə işləyir:
//   Commission → hər sifariş üçün ayrıca qeyd
//   SellerBalance → satıcının cəmlənmiş (ümumi) maliyyə vəziyyəti
//
// Niyə ayrı model?
//   Hər dəfə satıcının balansını bilmək üçün bütün Commission
//   qeydlərini toplamaq (aggregate) lazım olmur — bu model
//   cəmi hazır saxlayır. Dashboard widget-i üçün sürətlidir.
//
// İş axını:
//   Sifariş yaranır → createCommission() →
//     availableBalance  += sellerEarning    (satıcının payı)
//     pendingCommission += commissionAmount  (şirkətin payı)
//     totalEarned       += sellerEarning
//   Ay sonu transferCommission() →
//     pendingCommission -= totalCommission  (sıfırlayır)
//     totalCommissionPaid += totalCommission
//   Satıcı withdrawBalance() →
//     availableBalance -= amount
//     totalWithdrawn   += amount
// =====================================================================
const sellerBalanceSchema = new mongoose.Schema(
    {
        // ── SATICI İDENTİFİKATORU ─────────────────────────────────────
        // sellerId — satıcının mağaza adı (String).
        //
        // Niyə ObjectId deyil, String?
        //   Commission.sellerId ilə eyni tip saxlanılır — uyğunluq üçün.
        //   commissionController-da: getOrCreateBalance(sellerId)
        //   sellerId = Admin.sellerInfo.storeName (mağaza adı).
        //
        // unique: true — hər mağaza üçün yalnız BİR balans qeydi olur.
        //   İki dəfə eyni satıcı üçün qeyd yaratmaq mümkün deyil.
        //   getOrCreateBalance() funksiyası: findOne → yoxdursa create.
        sellerId: {
            type:     String,
            required: true,
            unique:   true,
        },

        // ── MALİYYƏ SAHƏLƏRİ ─────────────────────────────────────────

        // availableBalance — satıcının indi çəkə biləcəyi pul.
        // Artır:  +sellerEarning (hər sifarişdə)
        // Azalır: -amount       (withdrawBalance() çağırılanda)
        //
        // Məsələn: 100 AZN-lik sifarişdən 8% komisya →
        //   availableBalance += 92 AZN
        availableBalance: {
            type:    Number,
            default: 0,
        },

        // pendingCommission — şirkətə aid olan hissə.
        // Satıcı bu pula TOXUNA BİLMƏZ — şirkətindir.
        // Artır:  +commissionAmount (hər sifarişdə)
        // Azalır: -commissionAmount (transferCommission() sonra sıfırlanır)
        //
        // Bu sahə dashboard-da "Gözləyən komisya: 80 AZN" kimi göstərilir.
        // Satıcı görür amma çəkə bilmir — şeffaflıq üçün saxlanılır.
        pendingCommission: {
            type:    Number,
            default: 0,
        },

        // totalEarned — satıcının bütün zamanlarda qazandığı ümumi məbləğ.
        // Heç vaxt azalmır — yalnız artır.
        // Niyə lazımdır?
        //   availableBalance azalır (çəkildikdə).
        //   totalEarned həmişə tam tarixçəni göstərir.
        //   Dashboard-da "Bu günə qədər 5000 AZN qazandınız" üçün.
        totalEarned: {
            type:    Number,
            default: 0,
        },

        // totalWithdrawn — satıcının indiyə qədər çıxardığı ümumi məbləğ.
        // Heç vaxt azalmır — yalnız artır.
        // availableBalance - totalWithdrawn = cari balans yoxlaması üçün
        // istifadə oluna bilər (audit məqsədi ilə).
        totalWithdrawn: {
            type:    Number,
            default: 0,
        },

        // totalCommissionPaid — şirkətə ödənilmiş ümumi komisya.
        // Heç vaxt azalmır — yalnız artır.
        // Niyə lazımdır?
        //   pendingCommission sıfırlanır (ay sonu köçürüldükdən sonra).
        //   totalCommissionPaid isə ümumi tarixçəni saxlayır.
        //   Admin panelindəki "İndiyə qədər 400 AZN komisya ödəndi" üçün.
        totalCommissionPaid: {
            type:    Number,
            default: 0,
        },
    },
    {
        // timestamps: true — createdAt və updatedAt avtomatik əlavə olunur.
        // updatedAt — balansın son dəyişiklik tarixi.
        timestamps: true,
    }
);


// =====================================================================
// MODEL EXPORT
// ---------------------------------------------------------------------
// mongoose.model("SellerBalance", sellerBalanceSchema):
//   "SellerBalance" → kolleksiya adı "sellerbalances" olur.
//
// Bu model vasitəsilə əməliyyatlar:
//   SellerBalance.findOne({ sellerId })        → balansı tap
//   SellerBalance.create({ sellerId })         → yeni balans yarat (default 0-lar)
//   SellerBalance.findOneAndUpdate(...)        → $inc ilə artır/azalt
//   balance.save()                             → birbaşa dəyişiklik yaz
// =====================================================================
export default mongoose.model("SellerBalance", sellerBalanceSchema);