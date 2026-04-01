// ============================================================
// Stripe — onlayn ödəmə sistemidir.
// Kart məlumatlarını təhlükəsiz şəkildə emal edir,
// ödəniş qəbul etmək, geri qaytarmaq, abunəlik idarə etmək
// kimi əməliyyatlar üçün istifadə olunur.
//
// NİYƏ STRIPE KİTABXANASI İSTİFADƏ EDİLİR?
//   Birbaşa Stripe API-yə HTTP sorğusu göndərmək mümkündür,
//   amma bu kitabxana bütün mürəkkəb işləri (sorğu formatı,
//   xəta idarəsi, təhlükəsizlik başlıqları) avtomatik həll edir.
// ============================================================
import Stripe from "stripe";


// ============================================================
// NİYƏ "new Stripe()" İLƏ YARADILIR?
// ------------------------------------------------------------
// Stripe bir "class"-dır. new Stripe() çağırıldıqda:
//   1. Gizli açar yoxlanılır
//   2. API versiyası təyin edilir
//   3. Bütün metodlar (stripe.paymentIntents, stripe.charges və s.)
//      istifadəyə hazır hala gəlir
//
// NİYƏ AÇAR BİRBAŞA YAZILMAYIB? ("sk_test_abc123..." kimi)
//   Əgər açar kodu içinə yazılsaydı:
//     — GitHub-a push edəndə hər kəs görərdi
//     — Stripe hesabın oğurlana bilərdi
//     — Real pul itkisi yarana bilərdi
//   process.env.STRIPE_SECRET_KEY — açarı .env faylından oxuyur,
//   .env faylı isə heç vaxt GitHub-a yüklənmir (.gitignore ilə).
//
// "sk_test_" prefiksi nə deməkdir?
//   — sk_test_ → test modu, real pul çəkilmir
//   — sk_live_ → canlı modu, real pul çəkilir
//   İnkişaf mərhələsində həmişə "sk_test_" istifadə edilir.
// ============================================================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// ============================================================
// NİYƏ EXPORT EDİLİR?
// ------------------------------------------------------------
// stripe obyekti bir dəfə yaradılır və bütün fayllar
// bu tək nüsxədən istifadə edir — bu "Singleton" dizayn nümunəsidir.
//
// Əgər hər faylda "new Stripe()" yazılsaydı:
//   — Hər dəfə yeni bağlantı açılardı — bu israfçılıqdır
//   — Eyni açarla çoxlu obyekt yaratmaq gərəksizdir
//
// İstifadəsi digər fayllarda belə olur:
//   import stripe from "./stripe.js";
//   await stripe.paymentIntents.create({ amount: 1000, currency: "usd" });
// ============================================================
export default stripe;