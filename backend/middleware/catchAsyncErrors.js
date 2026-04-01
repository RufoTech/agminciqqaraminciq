// =====================================================================
// ASINXRON XƏTA TUTMA MİDDLEWARE-İ — catchAsyncErrors
// ---------------------------------------------------------------------
// NƏDİR?
//   Hər async controller funksiyasını "sarıyır" (wraps) və
//   içindəki xətaları avtomatik Express xəta middleware-inə ötürür.
//
// NİYƏ LAZIMDIR?
//   Express-in özü sinxron xətaları avtomatik tutur.
//   Lakin async funksiyalardakı xətaları tutmur — bunlar "unhandled
//   promise rejection" olaraq qalır və server çökə bilər.
//
//   Bu middleware olmadan hər controller-də belə yazmalıydıq:
//     export const getProducts = async (req, res, next) => {
//       try {
//         const products = await Product.find();
//         res.json({ products });
//       } catch (err) {
//         next(err); // ← bunu hər yerdə əl ilə yazmaq lazım idi
//       }
//     }
//
//   Bu middleware ilə sadəcə:
//     export const getProducts = catchAsyncErrors(async (req, res, next) => {
//       const products = await Product.find();
//       res.json({ products });
//     });
//
// NƏ EDİR?
//   controllerFunction → Express middleware-inə çevrilmiş yeni funksiya qaytarır.
//   Yeni funksiya çağırılanda:
//     1. controllerFunction-u icra edir
//     2. Xəta yaranarsa → .catch(next) → Express xəta middleware-inə ötürür
// =====================================================================
export default (controllerFunction) =>

    // ── QAYTARİLAN MİDDLEWARE FUNKSİYASI ───────────────────────────
    // (req, res, next) — Express-in standart middleware imzasıdır.
    // Bu funksiya route-da birbaşa işlədilir:
    //   router.get("/products", catchAsyncErrors(getProducts))
    //                                               ↑
    //                           catchAsyncErrors bu (req,res,next) funksiyasını qaytarır
    (req, res, next) =>

        // ── PROMISE.RESOLVE ──────────────────────────────────────────
        // Promise.resolve() — niyə lazımdır?
        //   Əgər controllerFunction async-dirsə   → Promise qaytarır (artıq Promise)
        //   Əgər controllerFunction sinxrondursa   → adi dəyər qaytarır
        //   Promise.resolve() hər iki halda nəticəni Promise-ə çevirir.
        //   Bu sayəsində .catch() həmişə işləyir — növ fərqi problem olmur.
        //
        // controllerFunction(req, res, next) çağırılır:
        //   req  → sorğu məlumatları (body, params, query, user...)
        //   res  → cavab göndərmək üçün
        //   next → xəta olduqda növbəti middleware-ə ötürmək üçün
        Promise.resolve(controllerFunction(req, res, next))

            // ── .CATCH(NEXT) ─────────────────────────────────────────
            // Controller içindəki xəta .catch()-ə düşür.
            // next(error) çağırılır → Express-in xəta middleware-inə gedir:
            //   app.use((err, req, res, next) => { ... }) — errorHandler.js
            //
            // .catch(next) — .catch((err) => next(err)) ilə eynidir,
            // sadəcə daha qısa yazılışdır.
            //
            // Nəticə:
            //   await Product.find() xəta atsaydı →
            //   .catch(next) tutardı →
            //   errorHandler.js xətanı formatlaşdırıb istifadəçiyə göndərərdi.
            .catch(next);