// =====================================================
// İcazəli blogger siyahısı — qeydiyyat və girişdə istifadə olunur.
// Hər blogger { name, phone } cütü ilə təyin edilir.
// Sistem giriş zamanı istifadəçinin adını və nömrəsini
// bu siyahı ilə müqayisə edir.
// =====================================================

const allowedBloggers = [
    { name: "Nabat Nəsirova",        phone: "050-723-73-16" },
    { name: "Aydan",                 phone: "050-858-95-86" },
    { name: "Aydan Rzayeva",         phone: "055-269-85-06" },
    { name: "Sevda Nəcəfova",        phone: "051-927-15-66" },
    { name: "Fatimə Aslanova",       phone: "051-619-25-07" },
    { name: "Nəzmin Bağızadə",       phone: "055-800-14-85" },
    { name: "Agsun Həsənzadə",       phone: "050-361-47-86" },
    { name: "Samir Mərdanova",       phone: "051-513-26-63" },
    { name: "",                      phone: "050-778-28-82" }, // ← Ad yazılmayıb; yalnız nömrəyə görə tanınacaq
    { name: "Aytaç Məmmədova",       phone: "051-559-30-30" },
    { name: "Rüzgar Nəsibova SMM",   phone: "055-727-53-74" },
    { name: "Aytən Quliyeva",        phone: "055-803-66-62" },
    { name: "Ülkər İbrahimli",       phone: "051-874-71-03" },
    { name: "Günel Rzayeva",         phone: "050-500-50-61" },
    { name: "Aysel Əzizova",         phone: "010-110-31-08" },
    { name: "Sevinc Ağazadə",        phone: "050-694-90-48" },
    { name: "Məhicən Qarayeva",      phone: "070-430-80-90" },
    { name: "Arzu Əliqızı",          phone: "070-340-37-35" },
    { name: "Asya Şahbazlı",         phone: "051-964-85-03" },
    { name: "Ayşən Seyidova",        phone: "050-827-03-64" },
    { name: "Aynur Ələkbərli",       phone: "050-734-32-88" },
    { name: "Aydan Xəlilzadə",       phone: ""              }, // ← Nömrə yazılmayıb; yalnız ada görə tanınacaq
    { name: "Əliyeva Səidə",         phone: "050-835-01-25" },
    { name: "Həsənova Hüsnüyyə",     phone: "055-747-78-30" },
    { name: "Məmmədli Fatimə",       phone: "077-616-08-28" },
    { name: "Fidan İlyaszadə",       phone: "050-808-50-55" },
    { name: "Xəyalə Rzayeva",        phone: "055-825-80-27" },
    { name: "Könül Raufqızı",        phone: "055-701-68-88" },
    { name: "Ləman Məmmədova",       phone: "077-315-90-25" },
    { name: "Məryəm Məmmədova",      phone: "077-377-49-96" },
    { name: "Müjgan Hüseynova",      phone: "055-727-01-15" },
    { name: "Simə Xəlilova",         phone: "050-585-67-14" },
    { name: "Mətanət Abdullayeva",   phone: "055-545-60-35" }
];

/**
 * isBloggerAllowed — giriş/qeydiyyat zamanı blogger yoxlaması
 *
 * @param {string} inputName  — İstifadəçinin daxil etdiyi ad
 * @param {string} inputPhone — İstifadəçinin daxil etdiyi telefon nömrəsi
 * @returns {boolean}         — true: icazəli blogger | false: icazəsiz
 *
 * Necə işləyir:
 *   1. Daxil edilmiş ad və nömrə normalizasiya edilir.
 *   2. allowedBloggers massivinin HƏR ELEMENTİ yoxlanır (Array.some).
 *   3. Siyahıdakı həmin elementin adı və nömrəsi də normalizasiya edilir.
 *   4. Hər iki sahə dolursa → İKİSİ BİRDƏN uyğun gəlməlidir.
 *      Bir sahə boşdursa → YALNIZ DOLU SAHƏ yoxlanır.
 *   5. Hər hansı bir element uyğun gələrsə some() dərhal true qaytarır.
 */
export const isBloggerAllowed = (inputName, inputPhone) => {

    // ── Köməkçi funksiyalar ──────────────────────────────────────────────

    /**
     * normalize — mətn sahələrini standartlaşdırır:
     *   • Hamısını kiçik hərfə çevirir  ("Aydan" → "aydan")
     *   • Baştərəf/sontərəf boşluqları sil  ("  Aydan  " → "aydan")
     *   • Aralarındakı qoşa boşluqları tək boşluğa endir  ("Ad  Soyad" → "ad soyad")
     *   • null/undefined gəlsə boş string qaytarır
     */
    const normalize = (str) =>
        str?.toLowerCase().trim().replace(/\s+/g, " ") || "";

    /**
     * normalizePhone — nömrə sahəsini standartlaşdırır:
     *   • Yalnız rəqəmləri saxlayır  ("050-723-73-16" → "0507237316")
     *   • Tire, mötərizə, boşluq kimi bütün simvollar silinir
     *   • null/undefined gəlsə boş string qaytarır
     */
    const normalizePhone = (ph) =>
        ph?.replace(/[^0-9]/g, "") || "";

    // ── Giriş məlumatlarının normalizasiyası ─────────────────────────────
    const name  = normalize(inputName);      // istifadəçinin daxil etdiyi ad
    const phone = normalizePhone(inputPhone); // istifadəçinin daxil etdiyi nömrə

    // ── Siyahı yoxlaması ─────────────────────────────────────────────────
    // Array.some() — birinci uyğun gələn elementdə dərhal true qaytarır,
    // heç biri uyğun gəlməsə false qaytarır.
    return allowedBloggers.some(entry => {

        // Siyahıdakı elementin sahələrini də normalizasiya et
        const entryName  = normalize(entry.name);
        const entryPhone = normalizePhone(entry.phone);

        // ── Uyğunluq məntiqi ─────────────────────────────────────────────

        // nameMatches — ad uyğunluğu:
        //   • entryName boşdursa (siyahıda ad yazılmayıb) → uyğun sayılır (true)
        //   • Dolu isə → istifadəçinin adı tam uyğun gəlməlidir
        const nameMatches  = entryName  === "" || name  === entryName;

        // phoneMatches — nömrə uyğunluğu:
        //   • entryPhone boşdursa (siyahıda nömrə yazılmayıb) → uyğun sayılır (true)
        //   • Dolu isə → istifadəçinin nömrəsi tam uyğun gəlməlidir
        const phoneMatches = entryPhone === "" || phone === entryPhone;

        // ── İki hissəli qərar ────────────────────────────────────────────

        if (entryName !== "" && entryPhone !== "") {
            // Siyahıda HƏM AD HƏM NÖMRƏsi dolu olan elementlər:
            // İstifadəçi hər iki sahəni düzgün daxil etməlidir.
            // Misal: { name: "Günel Rzayeva", phone: "050-500-50-61" }
            //   → Yalnız ad uyğun gəlirsə → false
            //   → Yalnız nömrə uyğun gəlirsə → false
            //   → Hər ikisi uyğun gəlirsə → true
            return nameMatches && phoneMatches;
        }

        // Siyahıda AD BOŞDUR (yalnız nömrə var):
        //   nameMatches artıq true-dur (yuxarıdakı || entryName==="" şərti)
        //   phoneMatches nömrə uyğunluğunu yoxlayır
        //   → Yalnız nömrə yetəridir
        //
        // Siyahıda NÖMRƏ BOŞDUR (yalnız ad var):
        //   phoneMatches artıq true-dur (yuxarıdakı || entryPhone==="" şərti)
        //   nameMatches ad uyğunluğunu yoxlayır
        //   → Yalnız ad yetəridir
        return nameMatches && phoneMatches;
    });
};

// ── Default export ───────────────────────────────────────────────────────────
// Digər fayllar allowedBloggers massivini birbaşa import edə bilər:
//   import allowedBloggers from './bloggers'
export default allowedBloggers;