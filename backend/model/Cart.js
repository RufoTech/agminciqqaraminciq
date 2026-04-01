// mongoose — MongoDB ilə işləmək üçün kitabxana.
// Schema strukturu, model yaratma, ref (referans) hamısı buradan gəlir.
import mongoose from "mongoose";


// =====================================================================
// SƏBƏT (CART) SCHEMA-SI
// ---------------------------------------------------------------------
// Hər istifadəçinin bir səbəti olur.
// Səbət içindəki hər element: məhsul ID-si + miqdar.
//
// Niyə ayrı kolleksiya?
//   Səbət məlumatları istifadəçi və ya məhsul modelinə daxil edilsəydi —
//   hər iki model şişərdi, sorğular mürəkkəbləşərdi.
//   Ayrı "carts" kolleksiyası bu ayrılığı təmin edir.
// =====================================================================
const cartSchema = new mongoose.Schema(
    {
        // ── İSTİFADƏÇİ REFERANSİ ─────────────────────────────────────
        // user — bu səbətin sahibi kimdir?
        //
        // ObjectId — MongoDB-nin referans tipidir.
        // ref: "User" — populate() çağırılanda User kolleksiyasından
        //   tam istifadəçi məlumatı çəkilir.
        //
        // Niyə yalnız ID saxlanılır, tam istifadəçi deyil?
        //   İstifadəçi məlumatları (ad, email) dəyişə bilər.
        //   ID isə heç vaxt dəyişmir — referans həmişə düzgün qalır.
        //   populate() ilə lazım olanda tam məlumat çəkilir.
        user: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "User",
            required: true, // hər səbətin mütləq sahibi olmalıdır
        },

        // ── MƏHSULLAR MASSOVİ ─────────────────────────────────────────
        // products — səbətdəki bütün məhsulların siyahısı.
        // [] — massiv (array) deməkdir: bir səbətdə çoxlu məhsul ola bilər.
        //
        // Hər element: { product: ObjectId, quantity: Number }
        products: [
            {
                // ── MƏHSUL REFERANSİ ──────────────────────────────────
                // product — səbətdəki məhsulun ID-si.
                // ref: "Product" — populate() ilə tam məhsul məlumatı çəkilir:
                //   ad, qiymət, şəkil, stok.
                //
                // cartController-da:
                //   Cart.findOne({user}).populate({
                //     path: "products.product",
                //     select: "name price images stock"
                //   })
                //   → ID-lər tam məhsul məlumatına çevrilir.
                product: {
                    type:     mongoose.Schema.Types.ObjectId,
                    ref:      "Product",
                    required: true, // məhsul ID-si olmayan element olmaz
                },

                // ── MİQDAR ────────────────────────────────────────────
                // quantity — bu məhsuldan neçə ədəd istənilir.
                //
                // default: 1 — "Səbətə əlavə et" düyməsi ilk dəfə basılanda
                //   miqdar göndərilməsə 1 götürülür.
                //   cartController-da: const { quantity = 1 } = req.body;
                //   ilə eyni məntiq — iki qat default qoruma.
                //
                // required: true — miqdar olmayan məhsul elementi olmaz.
                quantity: {
                    type:     Number,
                    required: true,
                    default:  1,
                },
            },
        ],
    },
    {
        // timestamps: true — Mongoose avtomatik iki sahə əlavə edir:
        //   createdAt → səbətin ilk yaradılma tarixi
        //   updatedAt → sonuncu dəfə məhsul əlavə/silindi tarixi
        // Bu sahələri əl ilə yazmaq lazım deyil.
        timestamps: true,
    }
);


// =====================================================================
// MODEL EXPORT
// ---------------------------------------------------------------------
// mongoose.model("Cart", cartSchema):
//   "Cart" → kolleksiya adı "carts" olur (mongoose avtomatik çoxluq edir).
//
// Bu model vasitəsilə bütün CRUD əməliyyatları aparılır:
//   Cart.findOne({ user: userId })          → səbəti tap
//   Cart.create({ user, products })         → yeni səbət yarat
//   cart.save()                             → dəyişiklikləri yaz
//   Cart.findOneAndDelete({ user: userId }) → səbəti sil
// =====================================================================
export default mongoose.model("Cart", cartSchema);