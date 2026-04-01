// multer — HTTP sorğularından gələn faylları (şəkil, sənəd və s.) emal edən kitabxana.
// Express özü fayl yükləməsini dəstəkləmir — multer bu boşluğu doldurur.
// Middleware kimi router-ə əlavə edilir: router.post("/", uploadImages, controller)
import multer from "multer";

// fs — Node.js-in daxili fayl sistemi modulu.
// Qovluqların mövcudluğunu yoxlamaq və yaratmaq üçün lazımdır.
import fs from "fs";

// path — Node.js-in daxili yol (path) modulu.
// Fayl yollarını əməliyyat sistemindən asılı olmayaraq düzgün qurmaq üçündür.
// Windows-da: "uploads\image.jpg", Linux-da: "uploads/image.jpg" — path avtomatik idarə edir.
import path from "path";


// =====================================================================
// 1. UPLOAD QOVLUĞUNUN YARADILMASI
// ---------------------------------------------------------------------
// Yüklənən fayllar Cloudinary-ə göndərilməzdən əvvəl müvəqqəti burada saxlanılır.
// Cloudinary-ə yüklədikdən sonra bu fayllar silinir (controller-də fs.unlinkSync()).
// =====================================================================

// path.resolve("uploads") — "uploads" qovluğunun tam mütləq yolunu qaytarır.
// Məsələn: "/home/user/project/uploads" (Linux) və ya "C:\Users\user\project\uploads" (Windows)
// Niyə tam yol? Nisbi yollar (".") proqramın haradan işlədildiyinə görə dəyişə bilər.
const uploadDirectory = path.resolve("uploads");

// Qovluq mövcud deyilsə — yarat.
// Niyə yoxlayırıq? Qovluq olmadan multer fayl saxlaya bilmir → xəta atar.
// fs.existsSync() — sinkron yoxlama (server başlayanda bir dəfə işləyir, performans problemi yoxdur).
// fs.mkdirSync() — sinkron qovluq yaratma.
// { recursive: true } — "uploads/products/2024" kimi iç-içə yollar da yaradılır,
//   olmayan hər bir valideyn qovluq avtomatik yaradılır.
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}


// =====================================================================
// 2. SAXLAMA KONFİQURASİYASI (diskStorage)
// ---------------------------------------------------------------------
// Faylların diskdə necə saxlanacağını müəyyən edir.
// Alternativ: multer.memoryStorage() — faylı RAM-da saxlayır (Cloudinary stream üçün).
// Burada diskStorage seçilib — fayl əvvəl diskə yazılır, sonra Cloudinary-ə yüklənir.
// =====================================================================
const storage = multer.diskStorage({

    // ── QOVLUQ TƏYİN ET ─────────────────────────────────────────────
    // destination — hər fayl üçün çağırılır, faylın hara yazılacağını bildirir.
    //
    // Parametrlər:
    //   req  → HTTP sorğusu (giriş etmiş istifadəçi məlumatları burada)
    //   file → yüklənən fayl haqqında məlumat (originalname, mimetype, size)
    //   cb   → callback: cb(xəta, yol) — xəta yoxdursa null, yol isə qovluq
    destination: (req, file, cb) => {
        cb(null, uploadDirectory); // bütün fayllar "uploads" qovluğuna yazılır
    },

    // ── FAYL ADI TƏYİN ET ───────────────────────────────────────────
    // filename — hər fayl üçün çağırılır, faylın diskdəki adını müəyyən edir.
    //
    // Niyə orijinal ad istifadə edilmir?
    //   İki istifadəçi eyni adlı fayl ("photo.jpg") yükləsə — biri digərini üzər.
    //   Unikal ad bu problemi həll edir.
    //
    // Unikal ad necə yaradılır?
    //   Date.now()              → millisaniyə (1718923456789) — hər an fərqli
    //   Math.random() * 1E9     → 0-1000000000 arası təsadüfi ədəd
    //   Math.round()            → tam ədədə yuvarlaqlaşdır
    //   Birlikdə: "1718923456789_473829104" — demək olar ki heç vaxt təkrarlanmır
    //
    // path.extname(file.originalname) — faylın genişlənməsini saxlayır:
    //   "photo.jpg" → ".jpg"
    //   "image.PNG" → ".PNG"
    //   Genişlənməni saxlamaq Cloudinary-nin fayl növünü tanıması üçün vacibdir.
    filename: (req, file, cb) => {
        const uniqueSuffix  = Date.now() + "_" + Math.round(Math.random() * 1e9);
        const fileExtension = path.extname(file.originalname);
        // Nəticə: "1718923456789_473829104.jpg"
        cb(null, `${uniqueSuffix}${fileExtension}`);
    },
});


// =====================================================================
// 3. MULTER YÜKLƏMƏ KONFİQURASİYASI
// ---------------------------------------------------------------------
// storage + ölçü limiti + fayl növü yoxlaması birlikdə qurulur.
// =====================================================================
const upload = multer({

    // Yuxarıda hazırladığımız diskStorage konfiqurasiyası
    storage,

    // ── FAYL ÖLÇÜSÜ LİMİTİ ──────────────────────────────────────────
    // fileSize: 5 * 1024 * 1024 = 5,242,880 bayt = 5 MB
    //   5 MB-dan böyük fayl yüklənməyə çalışılsa → multer xəta atır.
    //   Niyə limit? Böyük fayllar serveri yavaşladır, disk doldurar,
    //   Cloudinary yüklənmə müddətini uzadar.
    limits: { fileSize: 5 * 1024 * 1024 },

    // ── FAYL NÖVÜ YOXLAMASI ──────────────────────────────────────────
    // fileFilter — hər fayl üçün çağırılır.
    // Yalnız şəkil formatlarına icazə verir — sənəd, exe, zip qəbul edilmir.
    //
    // MIME tipi nədir?
    //   Faylın növünü bildirən standart etiket:
    //   "image/jpeg" → .jpg, .jpeg
    //   "image/png"  → .png
    //   "image/gif"  → .gif
    //
    // Niyə file.originalname ilə deyil, mimetype ilə yoxlanılır?
    //   İstifadəçi "virus.exe"-ni "photo.jpg" adlandırıb göndərə bilər.
    //   MIME tipi isə faylın əsl məzmununa əsaslanır — daha etibarlıdır.
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];

        if (allowedMimeTypes.includes(file.mimetype)) {
            // Fayl qəbul edilir: cb(null, true)
            cb(null, true);
        } else {
            // Fayl rədd edilir: cb(xəta, false)
            // xəta göndərilir → Express xəta middleware-i tutur
            cb(new Error("Yalnız şəkil formatları yükləyə bilərsiniz!"), false);
        }
    },
})

// ── .array("newImages") ──────────────────────────────────────────────
// Bir anda birdən çox şəkil qəbul edir.
// "newImages" — frontend formadakı input field adı ilə eyni olmalıdır:
//   <input type="file" name="newImages" multiple />
//
// .array() vs .single() vs .fields():
//   .single("image")       → yalnız bir fayl
//   .array("images")       → eyni adla çoxlu fayl
//   .fields([...])         → fərqli adlı sahələrdən fayl
//
// req.files — bu middleware-dən sonra controller-də mövcud olur:
//   [{ fieldname, originalname, path, mimetype, size }, ...]
.array("newImages");


// =====================================================================
// 4. EXPORT
// ---------------------------------------------------------------------
// uploadImages — route-da middleware kimi istifadə olunur:
//   router.post("/product/new", isAuthenticatedUser, uploadImages, newProduct)
//
// İş axını:
//   Sorğu gəlir → uploadImages faylları "uploads"-a yazır →
//   newProduct controller req.files-dən faylları oxuyur →
//   Cloudinary-ə yükləyir → fs.unlinkSync() ilə "uploads"-dan silir
// =====================================================================
export const uploadImages = upload;