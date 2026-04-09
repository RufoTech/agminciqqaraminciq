// ============================================================
// mongoose — Node.js ilə MongoDB arasında körpü rolunu oynayan kitabxanadır.
// Birbaşa MongoDB driveri çox mürəkkəbdir; mongoose onu sadələşdirir.
// Məsələn: mongoose.connect() — bağlantı, mongoose.Schema() — model yaratmaq üçündür.
//
// Mongoose-un əsas üstünlükləri:
//   • Schema (şablon) — bazaya hansı formatlı məlumat girəcəyini təyin edir
//   • Validation (yoxlama) — yanlış məlumatın bazaya düşməsinin qarşısını alır
//   • Model — cədvəl əvəzinə istifadə olunur, CRUD əməliyyatları aparır
//   • Middleware — yadda saxlamadan əvvəl/sonra kod işlətmək imkanı verir
// ============================================================
import mongoose from "mongoose";


// ============================================================
// NİYƏ FUNKSIYA KİMİ YAZILIR?
// ------------------------------------------------------------
// Bağlantı kodu birbaşa faylın içinə yazılsaydı,
// bu fayl import edilən kimi avtomatik işləyərdi — bu təhlükəlidir.
// Funksiya kimi yazılması sayəsində biz özümüz nə vaxt
// bağlanmaq istədiyimizi idarə edirik.
// Adətən server.js və ya app.js faylında bir dəfə çağırılır:
//   connectDatabase();
//
// Düzgün istifadə nümunəsi (server.js-də):
//   import { connectDatabase } from "./config/database.js";
//   connectDatabase();           // ← server başlayanda bir dəfə çağırılır
//   app.listen(PORT, () => { }); // ← bağlantıdan sonra server dinləməyə başlayır
// ============================================================
export const connectDatabase = () => {

    // ============================================================
    // NİYƏ BOŞ STRING İLƏ BAŞLAYIR?
    // ------------------------------------------------------------
    // Aşağıda if blokları bu dəyişənə dəyər təyin edir.
    // Əgər heç bir şərt ödənməsə (məsələn NODE_ENV = "TEST" olarsa),
    // DB_URI boş qalar və mongoose.connect("") çağırılacaq —
    // bu da birbaşa xəta verəcək, sessiz keçməyəcək.
    // Bu, "fail loudly" (səs-küylü uğursuzluq) prinsipidir —
    // gizli xəta olmasından yaxşıdır.
    //
    // "Fail loudly" nə deməkdir?
    //   Proqram səhv konfiqurasiya ilə işləməyə davam etmək əvəzinə
    //   dərhal xəta verir — beləliklə proqramçı problemi gec deyil,
    //   erkən görür. Gizli xətalar debug etmək çox çətindir.
    // ============================================================
    let DB_URI = "";


    // ============================================================
    // NİYƏ İKİ AYRI MÜHİT VAR? (DEVELOPMENT vs PRODUCTION)
    // ------------------------------------------------------------
    // DEVELOPMENT (inkişaf mühiti):
    //   — Proqramçı öz kompüterində işləyir
    //   — LOCAL_URI = mongodb://localhost:27017/e-commerce
    //   — Lokal bazada real məlumat yoxdur, test məlumatları var
    //   — Sürət vacibdir, internet bağlantısı lazım deyil
    //
    // PRODUCTION (canlı mühit):
    //   — Kod real serverə (Render, Railway, Heroku və s.) deploy edilib
    //   — DB_URI = MongoDB Atlas buludu (internet üzərindən)
    //   — Real istifadəçilərin məlumatları burada saxlanılır
    //   — Təhlükəsizlik və etibarlılıq prioritetdir
    //
    // Bu ayrım sayəsində developer öz kompüterindəki bazanı
    // təsadüfən məhv etmir, real məlumatları pozmur.
    //
    // process.env — Node.js-in mühit dəyişənləri obyektidir.
    // .env faylındakı bütün dəyərlər buradan oxunur.
    // dotenv kitabxanası bu dəyərləri process.env-ə yükləyir:
    //   import dotenv from "dotenv";
    //   dotenv.config(); // ← bu olmasa process.env.NODE_ENV undefined olur
    // ============================================================
    if (process.env.NODE_ENV === "DEVELOPMENT") DB_URI = process.env.LOCAL_URI;
    if (process.env.NODE_ENV === "PRODUCTION")  DB_URI = process.env.DB_URI;


    // ============================================================
    // mongoose.connect() — NƏ EDİR?
    // ------------------------------------------------------------
    // Bu funksiya Node.js prosesini MongoDB serverinə qoşur.
    // Qoşulma bir dəfə qurulur və bütün uygulama boyu açıq qalır.
    // Hər sorğuda yenidən qoşulmur — bu performansı artırır.
    // (Bu pattern "connection pooling" adlanır — bağlantı hovuzu)
    //
    // mongoose.connect() bir "Promise" qaytarır:
    //   — .then()  → qoşulma uğurlu olduqda işləyir
    //   — .catch() → qoşulma uğursuz olduqda işləyir
    //
    // NİYƏ async/await DEYİL, .then()/.catch() İSTİFADƏ EDİLİB?
    //   Hər iki üsul eyni işi görür. Bu sadəcə üslub seçimidir.
    //   async/await versiyası belə olardı:
    //     try { await mongoose.connect(DB_URI); }
    //     catch(err) { console.error(err); }
    //
    // Promise nədir?
    //   Gələcəkdə tamamlanacaq əməliyyatı təmsil edən obyektdir.
    //   Üç vəziyyəti var: pending (gözlənir) → fulfilled (uğurlu) → rejected (uğursuz)
    //   Bağlantı qurulana qədər "pending", qurulandan sonra "fulfilled",
    //   xəta olduqda isə "rejected" vəziyyətinə keçir.
    // ============================================================
    mongoose.connect(DB_URI)


        // ============================================================
        // .then() — UĞURLU QOŞULMA
        // ------------------------------------------------------------
        // "con" parametri — mongoose bağlantı obyektidir.
        // con.connection.host → hansı serverə qoşulduğunu göstərir
        // con.connection.name → hansı bazanın adını göstərir
        //
        // NİYƏ ŞU AN BOŞ BURAXILIB?
        //   Hazırda heç nə etmir, amma real proyektdə buraya
        //   aşağıdakıları əlavə etmək tövsiyə olunur:
        //
        //   console.log(`✅ Baza qoşuldu: ${con.connection.host}`);
        //   console.log(`📦 Baza adı: ${con.connection.name}`);
        //
        //   Bu log sayəsində server başlayanda hansı bazaya
        //   qoşulduğunu dərhal görə bilirik — debug üçün çox faydalıdır.
        //
        // "con" obyektinin digər faydalı sahələri:
        //   con.connection.port      → bağlantı portu (default: 27017)
        //   con.connection.readyState → 1 = qoşulub, 0 = kəsilib
        //   con.connection.models    → qeydiyyatdan keçmiş bütün modellər
        // ============================================================
        .then((con) => {
        })


        // ============================================================
        // .catch() — UĞURSUZ QOŞULMA — NİYƏ VACİBDİR?
        // ------------------------------------------------------------
        // Qoşulma bu səbəblərdən uğursuz ola bilər:
        //   1. MongoDB servisi işləmir (lokaldə mongod başlamayıb)
        //   2. DB_URI yanlışdır (şifrə, ünvan xətalıdır)
        //   3. İnternet bağlantısı yoxdur (Atlas üçün)
        //   4. IP ünvanı Atlas-da whitelist-ə əlavə edilməyib
        //   5. Cluster dayandırılıb və ya silinib
        //
        // "err" obyektinin içində xətanın tam izahı var:
        //   err.message → qısa açıqlama
        //   err.stack   → xətanın kodda harada baş verdiyini göstərir
        //   err.name    → xəta növü (məs: "MongoServerError", "MongoNetworkError")
        //   err.code    → xəta kodu (məs: 8000 = authentication xətası)
        //
        // console.error() — console.log()-dan fərqli olaraq
        // xətaları qırmızı rənglə göstərir (terminaldə daha görünən olur).
        //
        // PROFESSİONAL PROYEKTDƏ BURAYA NƏ ƏLAVƏ ETMƏK OLAR?
        //   process.exit(1) — baza olmadan server işləməsin deyə
        //   prosesi dayandırmaq üçün istifadə olunur.
        //   Çünki baza olmadan API sorğuları cavabsız qalacaq.
        //
        //   Tövsiyə olunan tam versiya:
        //     .catch((err) => {
        //         console.error("❌ Baza xətası:", err.message);
        //         process.exit(1); // ← 1 = xəta ilə çıxış (0 = normal çıxış)
        //     });
        // ============================================================
        .catch((err) => {
            console.error("Verilənlər bazasına qoşularkən xəta baş verdi:", err);
        });
}