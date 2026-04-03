// ============================================================
// Stripe — onlayn kart ödəməsini emal edən kitabxana.
// PaymentIntent yaratmaq üçün istifadə olunur.
// ============================================================
import Stripe from 'stripe';

// catchAsyncErrors — async funksiyalardakı xətaları avtomatik tutur,
// try/catch yazmaqdan xilas edir.
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';

// ErrorHandler — özəl xəta sinifi.
// new ErrorHandler("mesaj", statusKod) şəklində istifadə olunur.
import ErrorHandler from '../utils/errorHandler.js';


// Stripe obyekti funksiya daxilində yaradılacaq (Lazy Initialization).
// Bu, app.js-də mühit dəyişənlərinin yüklənmə sırasından asılılığı azaldır.
let stripeInstance;
const getStripe = () => {
    if (!stripeInstance) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("STRIPE_SECRET_KEY təyin edilməyib! .env faylını yoxlayın.");
        }
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripeInstance;
};


// =====================================================================
// ÖDƏNİŞ NİYYƏTİ YARAT — createPaymentIntent
// ---------------------------------------------------------------------
// POST /api/v1/payment/process
// Body: { amount, currency }
//
// PaymentIntent nədir?
//   Stripe-da ödəniş prosesini başladan obyektdir.
//   Frontend bu endpoint-i çağırır → clientSecret alır →
//   Stripe.js ilə kart məlumatlarını birbaşa Stripe-a göndərir.
//   Kart məlumatları heç vaxt bizim serverə gəlmir — PCI DSS tələbi.
//
// Niyə server tərəfdə yaradılır, frontend-də deyil?
//   Əgər frontend-də yaradılsaydı, istifadəçi məbləği dəyişdirə bilərdi.
//   Məsələn: 500 AZN-lik məhsul üçün 1 AZN-lik PaymentIntent yarada bilərdi.
//   Server tərəfində yaradılması bu saxtakarlığın qarşısını alır.
// =====================================================================
export const createPaymentIntent = catchAsyncErrors(async (req, res, next) => {

    // Frontend paymentSlice.js-dən gələn məbləğ və valyuta
    const { amount, currency } = req.body;

    // ── MƏBLƏĞ YOXLAMASI ─────────────────────────────────────────────
    // !amount       → göndərilməyib (undefined, null, boş string)
    // isNaN(amount) → rəqəm deyil ("abc" kimi)
    // <= 0          → mənfi və ya sıfır məbləğ qəbul edilmir
    //
    // Niyə bu yoxlamalar vacibdir?
    //   Stripe-a yanlış məbləğ göndərərsək Stripe xəta atacaq —
    //   bunu əvvəlcədən yoxlamaq daha aydın xəta mesajı verir.
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        return next(new ErrorHandler("Keçərsiz ödəniş məbləği", 400));
    }

    // ── VALYUTA YOXLAMASI ────────────────────────────────────────────
    // Yalnız dəstəklənən valyutalar qəbul edilir.
    // .toLowerCase() — "AZN", "azn", "Azn" hamısı eyni işləyir.
    // || "azn" — valyuta göndərilməsə default olaraq AZN seçilir.
    const allowedCurrencies = ["azn", "usd", "eur", "try"];
    const selectedCurrency  = currency?.toLowerCase() || "azn";

    if (!allowedCurrencies.includes(selectedCurrency)) {
        return next(new ErrorHandler("Dəstəklənməyən valyuta", 400));
    }

    // ── MƏBLƏĞ ÇEVRÍLƏSI (AZN → qəpik) ─────────────────────────────
    // Stripe bütün məbləğləri tam ədəd (integer) qəpik formatında qəbul edir.
    // Məsələn: 559.98 AZN → 55998 qəpik
    //          100    AZN → 10000 qəpik
    //          0.50   AZN → 50    qəpik
    //
    // Niyə parseFloat + toFixed(2) + Math.round?
    //   Kompüterlər ondalıq ədədləri dəqiq saxlaya bilmir (floating point problemi).
    //   Məsələn: 1.1 + 2.2 = 3.3000000000000003 → bu Stripe-a göndərilsə xəta verir.
    //
    //   Addımlar:
    //   1. parseFloat(amount)        → string-i ədədə çevirir: "559.98" → 559.98
    //   2. .toFixed(2)               → 2 ondalıq rəqəmə yuvarlaqlaşdırır: "559.98"
    //   3. parseFloat(...)           → string-i yenidən ədədə çevirir: 559.98
    //   4. * 100                     → qəpiklərə çevirir: 55998.0
    //   5. Math.round(...)           → tam ədədə yuvarlaqlaşdırır: 55998
    const amountInCents = Math.round(parseFloat(parseFloat(amount).toFixed(2)) * 100);

    // ── PAYMENTİNTENT YARAT ──────────────────────────────────────────
    // stripe.paymentIntents.create() — Stripe serverinə sorğu göndərir
    // və yeni PaymentIntent obyekti qaytarır.
    //
    // metadata.userId — yalnız texniki istifadəçi ID-si saxlanılır.
    // Ad, email, kart nömrəsi kimi şəxsi məlumatlar göndərilmir —
    // bu, GDPR və məxfilik prinsiplərinə uyğundur.
    //
    // metadata Stripe dashboard-da görünür — ödənişi hansı istifadəçiyə
    // aid olduğunu izləmək üçün faydalıdır.
    // getStripe() — lazım olduqda Stripe-ı initialize edir.
    const stripe = getStripe();

    const paymentIntent = await stripe.paymentIntents.create({
        amount:   amountInCents,
        currency: selectedCurrency,
        metadata: {
            userId: req.user.id,
        },
    });

    // ── CAVAB ────────────────────────────────────────────────────────
    // Frontend-ə yalnız clientSecret göndərilir.
    //
    // clientSecret nədir?
    //   Stripe-ın verdiyi birdəfəlik açardır. Frontend bu açarı
    //   Stripe.js-ə verir → Stripe.js kart məlumatlarını birbaşa
    //   Stripe serverinə göndərir → bizim serverimiz kart nömrəsini
    //   heç vaxt görmür.
    //
    // Niyə tam paymentIntent obyekti göndərilmir?
    //   paymentIntent-in içində həssas məlumatlar var (payment method ID,
    //   livemode, customer ID və s.) — bunları frontend-ə açmaq lazımsızdır.
    //   Minimum məlumat açıqlama prinsipi (principle of least privilege).
    res.status(200).json({
        success:      true,
        clientSecret: paymentIntent.client_secret,
    });
});