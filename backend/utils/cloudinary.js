// dotenv — .env faylındakı gizli məlumatları process.env-ə yükləyən kitabxana.
// CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
// kimi dəyərlər .env-dən oxunur.
import dotenv from "dotenv";

// path — Node.js-in daxili fayl/qovluq yolu modulu.
// Müxtəlif əməliyyat sistemlərindəki yol fərqlərini avtomatik idarə edir:
//   Windows: "config\config.env"
//   Linux:   "config/config.env"
import path from "path";

// cloudinary — şəkil yükləmə, silmə, URL yaratma üçün bulud servisi.
// Məhsul şəkilləri birbaşa bizim serverə yox, Cloudinary-ə yüklənir.
import cloudinary from "cloudinary";

// fileURLToPath — ES modul sistemindəki URL-i adi fayl yoluna çevirir.
// Niyə lazımdır? — aşağıda izah edilir.
import { fileURLToPath } from "url";


// =====================================================================
// FAYL YOLUNU MÜƏYYƏNLƏŞDİR
// ---------------------------------------------------------------------
// Niyə bu mürəkkəb yol hesablaması lazımdır?
//
// CommonJS (require) sistemində Node.js avtomatik verir:
//   __filename → "/project/utils/cloudinary.js"
//   __dirname  → "/project/utils"
//
// ES Modul sistemində (import/export) bu dəyişənlər mövcud DEYİL.
// Əl ilə yaratmaq lazımdır — bu 3 sətir standart həlldir.
// =====================================================================

// import.meta.url — bu faylın tam URL-i.
// Formatı: "file:///project/utils/cloudinary.js"
// fileURLToPath() → URL-i adi yola çevirir: "/project/utils/cloudinary.js"
const __filename = fileURLToPath(import.meta.url);

// path.dirname() — faylın yerləşdiyi qovluğu götürür.
// "/project/utils/cloudinary.js" → "/project/utils"
const __dirname = path.dirname(__filename);


// =====================================================================
// .ENV FAYLINI YÜKLƏ
// ---------------------------------------------------------------------
// Niyə standart dotenv.config() yox, path ilə xüsusi yol?
//   Standart: dotenv.config() → yalnız kök qovluqdakı .env faylını axtarır.
//   Bu layihədə: konfiqurasiya faylı "config/config.env"-dədir — ayrı qovluq.
//   path.resolve() ilə dəqiq yol verilir.
//
// path.resolve(__dirname, "../config/config.env"):
//   __dirname = "/project/utils"
//   "../config/config.env" → bir qovluq geri + config qovluğu
//   Nəticə: "/project/config/config.env"
// =====================================================================
const envPath = path.resolve(__dirname, "../config/config.env");

// dotenv.config({ path }) — göstərilən faylı oxuyur,
// içindəki bütün dəyişənləri process.env-ə yükləyir.
// Bundan sonra: process.env.CLOUDINARY_CLOUD_NAME mövcuddur.
dotenv.config({ path: envPath });


// =====================================================================
// CLOUDİNARY KONFIQURASIYASI
// ---------------------------------------------------------------------
// Cloudinary-ə qoşulmaq üçün 3 məlumat lazımdır:
//
//   cloud_name  → Cloudinary hesabının adı (ictimai — URL-lərdə görünür)
//   api_key     → API açarı (ictimai — amma gizli saxlanılır)
//   api_secret  → API gizli açarı (ŞƏXSİ — heç vaxt paylaşılmır!)
//
// Niyə .env-dən oxunur, koda yazılmır?
//   api_secret GitHub-a düşsə — hesabınıza icazəsiz daxil oluna bilər.
//   Şəkillər silinə, yüklənilə bilər.
//   .env faylı .gitignore-a əlavə edilir — GitHub-a getmir.
//
// cloudinary.v2 — Cloudinary kitabxanasının 2-ci versiyası.
// v2 daha müasir API-yə malikdir — v1 köhnəlmişdir.
// =====================================================================
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


// =====================================================================
// EXPORT
// ---------------------------------------------------------------------
// Konfiqurasiya edilmiş cloudinary obyekti export edilir.
// Digər fayllar import edib birbaşa istifadə edir:
//
//   import cloudinary from "../utils/cloudinary.js";
//   await cloudinary.v2.uploader.upload(file.path, { folder: "products" })
//   await cloudinary.v2.uploader.destroy(public_id)
//
// Singleton pattern:
//   Bu fayl bir dəfə import edilir — Node.js cache-də saxlayır.
//   Hər import yeni konfiqurasiya yaratmır — eyni obyekt paylaşılır.
// =====================================================================
export default cloudinary;