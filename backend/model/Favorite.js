// mongoose — MongoDB ilə işləmək üçün kitabxana.
import mongoose from "mongoose";


// =====================================================================
// FAVORİLƏR SCHEMA-SI — favoriteSchema
// ---------------------------------------------------------------------
// Hər istifadəçinin bir favori siyahısı olur.
// Siyahı içindəki hər element: məhsul ID-si.
//
// Niyə ayrı kolleksiya?
//   Favori ID-lərini User modelinə daxil etsəydik —
//   User modeli şişərdi, hər istifadəçi sorğusunda
//   bütün favori siyahısı da gələrdi (lazımsız yük).
//   Ayrı "favorites" kolleksiyası bu problemi həll edir.
//
// Niyə Cart modelindən fərqli quruluş?
//   Cart-da hər məhsulun miqdarı lazımdır → [{product, quantity}]
//   Favoridə yalnız ID lazımdır → [ObjectId]
//   Daha sadə struktur — miqdar sahəsi yoxdur.
// =====================================================================
const favoriteSchema = new mongoose.Schema(
    {
        // ── İSTİFADƏÇİ REFERANSİ ─────────────────────────────────────
        // user — bu favori siyahısının sahibi.
        //
        // ObjectId + ref: "User":
        //   Yalnız istifadəçinin ID-si saxlanılır.
        //   populate() ilə tam istifadəçi məlumatı çəkilə bilər.
        //   Lakin favoriteController-da populate istifadə edilmir —
        //   yalnız { user: userId } filteri ilə axtarış aparılır.
        //
        // required: true — hər favori siyahısının mütləq sahibi olmalıdır.
        // unique yoxdur — Mongoose avtomatik tətbiq etmir, amma
        // controller-da Cart kimi "findOne({ user: userId })" istifadə
        // edilir — bir istifadəçinin yalnız bir siyahısı olur.
        user: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "User",
            required: true,
        },

        // ── FAVORİ MƏHSULLAR ─────────────────────────────────────────
        // products — favorilərdəki məhsulların ID-lərinin massivi.
        //
        // [{ type: ObjectId, ref: "Product" }] — massiv içində ObjectId.
        //
        // Cart.products vs Favorite.products fərqi:
        //   Cart:     [{ product: ObjectId, quantity: Number }] — alt-obyekt
        //   Favorite: [ObjectId]                                — birbaşa ID
        //
        // populate() istifadəsi (getFavoriteProducts-da):
        //   Favorite.findOne({user}).populate({
        //     path: "products",
        //     select: "name price images"
        //   })
        //   → ID massivi tam məhsul məlumatına çevrilir.
        //
        // required yoxdur — boş siyahı yaradıla bilər:
        //   new Favorite({ user: userId, products: [] })
        //   Məhsul əlavə ediləndən sonra push() ilə doldurulur.
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref:  "Product",
            },
        ],
    },
    {
        // timestamps: true — Mongoose avtomatik iki sahə əlavə edir:
        //   createdAt → siyahının ilk yaradılma tarixi
        //   updatedAt → son dəfə məhsul əlavə/silindi tarixi
        timestamps: true,
    }
);


// =====================================================================
// MODEL EXPORT
// ---------------------------------------------------------------------
// mongoose.model("Favorite", favoriteSchema):
//   "Favorite" → kolleksiya adı "favorites" olur.
//
// Bu model vasitəsilə əməliyyatlar:
//   Favorite.findOne({ user: userId })         → siyahını tap
//   new Favorite({ user, products: [] })       → yeni boş siyahı yarat
//   favorite.products.push(productId)          → məhsul əlavə et
//   favorite.products.splice(index, 1)         → məhsul çıxar
//   Favorite.findOneAndDelete({ user: userId })→ siyahını sil
// =====================================================================
export default mongoose.model("Favorite", favoriteSchema);