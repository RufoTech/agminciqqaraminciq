// Product — məhsul modeli. MongoDB-dəki "products" kolleksiyası ilə işləyir.
// Bütün filter, axtarış və sıralama əməliyyatları bu model üzərindən aparılır.
import { Product } from "../model/Product.js";


// =====================================================================
// FİLTERLİ MƏHSUL AXTAR — getFilteredProducts
// ---------------------------------------------------------------------
// GET /api/v1/products/filter?name=iphone&category=phones&priceMin=100
//
// İstifadəçi filtr panelindən seçim etdikdə işləyir.
// Bütün filterlər isteğe bağlıdır — göndərilməyənlər nəzərə alınmır.
// Nəticə sort parametrinə görə sıralanır.
//
// Niyə catchAsyncErrors yoxdur?
//   Bu funksiya daxili try/catch ilə xətaları özü idarə edir.
//   catchAsyncErrors middleware-i olmasa da işləyir.
// =====================================================================
export const getFilteredProducts = async (req, res) => {
    try {

        // ── BÜTÜN QUERY PARAMETRLƏRİNİ ÇƏK ─────────────────────────
        // req.query — URL-dəki bütün parametrləri saxlayan obyektdir.
        // Məsələn: /filter?category=phones&priceMin=200&color=black
        //   → req.query = { category: "phones", priceMin: "200", color: "black" }
        //
        // Bütün dəyərlər STRING olaraq gəlir — Number() çevirməsi lazım olan yerlər var.
        // ─────────────────────────────────────────────────────────────
        const {
            name,               // Məhsul adında axtarış (hissəvi, böyük/kiçik hərf fərqsiz)
            seller,             // Satıcı adı (birdən çox ola bilər: "Apple,Samsung")
            priceMin,           // Qiymət aralığının alt həddi
            priceMax,           // Qiymət aralığının üst həddi
            category,           // Kateqoriya: "phones", "laptops", "cameras" və s.
            subcategory,        // Subkateqoriya

            // ── TELEFON / iPad XÜSUSİYYƏTLƏRİ ──────────────────────
            color,              // Rəng: "black", "white", "gold"
            screenSize,         // Ekran: "6.1 inch", "6.7 inch"
            storage,            // Daxili yaddaş: "128GB", "256GB"
            ram,                // Operativ yaddaş: "8GB", "16GB"
            frontCamera,        // Ön kamera: "12MP", "32MP"
            backCamera,         // Arxa kamera: "48MP", "108MP"
            battery,            // Batareya: "4000mAh", "5000mAh"
            processor,          // Prosessor: "A17 Pro", "Snapdragon 8 Gen 3"
            operatingSystem,    // ƏS: "iOS", "Android"

            // ── LAPTOP XÜSUSİYYƏTLƏRİ ───────────────────────────────
            gpu,                // Qrafik kart: "RTX 4060", "M3 Pro"
            camera,             // Laptop kamerası: "1080p", "720p"
            batteryLife,        // Batareya ömrü: "10 hours", "18 hours"

            // ── KAMERA XÜSUSİYYƏTLƏRİ ───────────────────────────────
            resolution,         // Çözünürlük: "24MP", "50MP"
            opticalZoom,        // Optik zoom: "3x", "10x"
            sensorType,         // Sensor: "Full-frame", "APS-C"
            imageStabilization, // Görüntü sabitləşdirmə: "Yes", "No"

            // ── QULAQLIQ XÜSUSİYYƏTLƏRİ ─────────────────────────────
            connectivity,       // Bağlantı: "Bluetooth 5.3", "Wired"
            noiseCancellation,  // Aktiv səs-küy azaltma: "Yes", "No"

            // ── OYUN KONSOLİ XÜSUSİYYƏTLƏRİ ─────────────────────────
            cpu,                // Konsol prosessoru: "AMD Zen 2", "ARM Cortex"
            memory,             // Konsol yaddaşı: "16GB GDDR6"
            supportedResolution,// Dəstəklənən çözünürlük: "4K", "1080p"
            controllerIncluded, // Kontroller daxildirmi?: "true" / "false" (string gəlir!)

            // ── iPad XÜSUSİYYƏTİ ─────────────────────────────────────
            cellular,           // Mobil şəbəkə dəstəyi: "true" / "false" (string gəlir!)

            // ── SIRALAMA ─────────────────────────────────────────────
            sort,               // "rating" | "price-low" | "price-high" | "newest"
        } = req.query;


        // ── DİNAMİK FİLTER OBYEKTİ ──────────────────────────────────
        // Boş {} ilə başlayır — yalnız göndərilən parametrlər əlavə olunur.
        // Bu sayəsində göndərilməyən filter bütün məhsulları gətirir.
        // Məsələn: yalnız category gəlibsə → {category: "phones"}
        //   MongoDB bütün telefon məhsullarını qaytarır.
        let filterQuery = {};


        // ── AD ÜZRƏ AXTARIŞ ─────────────────────────────────────────
        if (name) {
            // $regex — hissəvi axtarış: "pro" axtaranda "iPhone 15 Pro" tapılır.
            // $options: "i" — "PRO", "Pro", "pro" hamısı eyni nəticəni verir.
            // Alternativ: tam uyğunluq istəsəydik: filterQuery.name = name
            filterQuery.name = { $regex: name, $options: "i" };
        }

        // ── SATICIYA GÖRƏ FİLTER ────────────────────────────────────
        if (seller) {
            // Frontend birdən çox satıcı göndərə bilər: "Apple,Samsung,Xiaomi"
            // split(",") → ["Apple", "Samsung", "Xiaomi"]
            // .map(trim) → boşluqları təmizlər: " Apple " → "Apple"
            // $in → bu dəyərlərdən hər hansı birinə uyğun gələnləri gətirir
            const sellersArray = seller.split(",").map((s) => s.trim());
            filterQuery.seller = { $in: sellersArray };
        }

        // ── QİYMƏT ARALIĞI ──────────────────────────────────────────
        if (priceMin || priceMax) {
            // İkisi birlikdə: {price: {$gte: 100, $lte: 500}} → 100-500 AZN aralığı
            // Yalnız biri: {price: {$gte: 100}} → 100 AZN-dən yuxarı hamısı
            filterQuery.price = {};
            // Number() — string "200"-ü rəqəm 200-ə çevirir (req.query hər şeyi string verir)
            if (priceMin) filterQuery.price.$gte = Number(priceMin); // greater than or equal
            if (priceMax) filterQuery.price.$lte = Number(priceMax); // less than or equal
        }

        // ── KATEQORİYA ──────────────────────────────────────────────
        if (category) {
            // Tam uyğunluq — "phones" yalnız "phones" ilə uyğun gəlir, "phone" ilə yox.
            filterQuery.category = category;
        }

        if (subcategory) {
            filterQuery.subcategory = subcategory;
        }


        // ── BÜTÜN DİGƏR XÜSUSİYYƏTLƏR ──────────────────────────────
        // Bunların hərəsi yalnız göndərildikdə filter siyahısına əlavə olunur.
        // Məsələn: color gəlibsə → {color: "black"} — tam uyğunluq axtarışı.
        // Niyə $regex yox? Bunlar seçim siyahısından (dropdown) gəlir,
        // hissəvi axtarış lazım deyil — istifadəçi dəqiq dəyər seçir.
        if (color)              filterQuery.color              = color;
        if (screenSize)         filterQuery.screenSize         = screenSize;
        if (storage)            filterQuery.storage            = storage;
        if (ram)                filterQuery.ram                = ram;
        if (frontCamera)        filterQuery.frontCamera        = frontCamera;
        if (backCamera)         filterQuery.backCamera         = backCamera;
        if (battery)            filterQuery.battery            = battery;
        if (processor)          filterQuery.processor          = processor;
        if (operatingSystem)    filterQuery.operatingSystem    = operatingSystem;
        if (gpu)                filterQuery.gpu                = gpu;
        if (camera)             filterQuery.camera             = camera;
        if (batteryLife)        filterQuery.batteryLife        = batteryLife;
        if (resolution)         filterQuery.resolution         = resolution;
        if (opticalZoom)        filterQuery.opticalZoom        = opticalZoom;
        if (sensorType)         filterQuery.sensorType         = sensorType;
        if (imageStabilization) filterQuery.imageStabilization = imageStabilization;
        if (connectivity)       filterQuery.connectivity       = connectivity;
        if (noiseCancellation)  filterQuery.noiseCancellation  = noiseCancellation;
        if (cpu)                filterQuery.cpu                = cpu;
        if (memory)             filterQuery.memory             = memory;
        if (supportedResolution)filterQuery.supportedResolution= supportedResolution;

        // ── BOOLEAN ÇEVRÍMƏ ──────────────────────────────────────────
        // req.query-dən gələn bütün dəyərlər STRING-dir.
        // MongoDB-də boolean sahə üçün string "true" yanlış nəticə verər:
        //   "true" !== true → heç nə tapılmaz
        //
        // === "true" müqayisəsi:
        //   "true"  === "true" → true  (boolean)
        //   "false" === "true" → false (boolean)
        //
        // undefined yoxlaması: parametr heç göndərilməyibsə filter əlavə etmirik.
        if (controllerIncluded !== undefined)
            filterQuery.controllerIncluded = controllerIncluded === "true";
        if (cellular !== undefined)
            filterQuery.cellular = cellular === "true";


        // ── SIRALAMA ─────────────────────────────────────────────────
        // sortOptions boş qalarsa — MongoDB default sıralama istifadə edir (_id artaraq).
        //
        // MongoDB sort dəyərləri:
        //   1  → artan sıra  (ascending)  — kiçikdən böyüyə
        //  -1  → azalan sıra (descending) — böyükdən kiçiyə
        let sortOptions = {};
        if (sort) {
            if (sort === "rating") {
                sortOptions.ratings = -1;   // ən yüksək reytingli əvvəl
            } else if (sort === "price-low") {
                sortOptions.price  = 1;     // ən ucuz əvvəl
            } else if (sort === "price-high") {
                sortOptions.price  = -1;    // ən baha əvvəl
            } else if (sort === "newest") {
                sortOptions.createdAt = -1; // ən yeni əvvəl
            }
        }


        // ── SORĞUNU İCRA ET ──────────────────────────────────────────
        // Product.find(filterQuery) — bütün şərtlərə uyğun məhsulları tapır.
        // .sort(sortOptions) — tapılan nəticələri seçilmiş qaydada sıralayır.
        //
        // filterQuery = {} olarsa — bütün məhsullar gəlir (filter yoxdur).
        // sortOptions = {} olarsa — default sıralama tətbiq olunur.
        const products = await Product.find(filterQuery).sort(sortOptions);

        // 200 OK — uğurlu cavab
        // products — tapılan məhsulların massivi (boş ola bilər, xəta deyil)
        return res.status(200).json({ success: true, products });

    } catch (error) {
        // ── XƏTA İDARƏSİ ─────────────────────────────────────────────
        // console.error — xəta haqqında serverdə log yaradır (debug üçün).
        // 500 Internal Server Error — server tərəfli problem olduqda.
        // error.message — xətanın qısa izahı frontend-ə göndərilir.
        console.error("Məhsulları filterləmə zamanı xəta:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
