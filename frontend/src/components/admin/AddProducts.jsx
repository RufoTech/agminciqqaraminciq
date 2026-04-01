"use client";

// =====================================================================
// MƏHSUL ƏLAVƏ ET SƏHİFƏSİ — AddProduct
// ---------------------------------------------------------------------
// Bu komponent 3 addımlı (wizard) forma təqdim edir:
//   Addım 1: Ümumi məlumatlar (ad, qiymət, kateqoriya, açıqlama)
//   Addım 2: Texniki xüsusiyyətlər (kateqoriyaya görə dəyişir)
//   Addım 3: Şəkillər (yüklə, önizlə, sil)
//
// Admin bu formu doldurub "Məhsulu Əlavə Et" düyməsinə basanda:
//   → FormData obyekti yaradılır (şəkillər üçün multipart/form-data)
//   → RTK Query addProduct mutasiyası ilə API-yə göndərilir
//   → Uğurlu olduqda məhsul siyahısına yönləndirilir
// =====================================================================

// useState — lokal state idarəetməsi üçün React hook-u
import { useState } from "react";

// useNavigate — React Router ilə səhifə yönləndirməsi
import { useNavigate } from "react-router-dom";

// useSelector — Redux store-dan state oxumaq üçün
import { useSelector } from "react-redux";

// SweetAlert2 — xoş görünüşlü modal/alert pəncərələri kitabxanası.
// Standart browser alert()-dən daha ətraflı ve stillənmiş.
import Swal from "sweetalert2";

// RTK Query hook-ları:
//   useAddProductMutation — yeni məhsul əlavə etmək (POST sorğusu)
//   useGetProductsQuery   — məhsul siyahısını yeniləmək üçün (refetch)
import {
    useAddProductMutation,
    useGetProductsQuery,
} from "../../redux/api/productsApi";

// Lucide ikonları — kateqoriya düymələri və UI elementləri üçün
import {
    Smartphone, Laptop, Camera, Headphones, Gamepad2, Tablet,
    Shirt, Home, Flower2, Dumbbell, Car, Upload, X,
    Store, ChevronRight,
} from "lucide-react";


// =====================================================================
// KATEQORIYALAR SİYAHISI
// ---------------------------------------------------------------------
// value  → API-yə göndəriləcək dəyər (Product.category sahəsi)
// label  → istifadəçiyə göstəriləcək Azərbaycanca ad
// icon   → Lucide ikon komponenti (kateqoriya düyməsindəki ikon)
//
// Bu massiv həm kateqoriya seçim grid-ini, həm de
// addım 2-dəki başlığı (selectedCat) doldurmaq üçün istifadə olunur.
// =====================================================================
const CATEGORIES = [
    { value: "Phones",         label: "Telefonlar",      icon: Smartphone },
    { value: "Laptops",        label: "Noutbuklar",      icon: Laptop     },
    { value: "Cameras",        label: "Kameralar",       icon: Camera     },
    { value: "Headphones",     label: "Qulaqcıqlar",     icon: Headphones },
    { value: "Console",        label: "Oyun Konsolları", icon: Gamepad2   },
    { value: "iPad",           label: "Planşetlər",      icon: Tablet     },
    { value: "WomenClothing",  label: "Qadın Geyimləri", icon: Shirt      },
    { value: "MenClothing",    label: "Kişi Geyimləri",  icon: Shirt      },
    { value: "KidsClothing",   label: "Uşaq Geyimləri",  icon: Shirt      },
    { value: "HomeAppliances", label: "Ev Texnikası",    icon: Home       },
    { value: "HomeAndGarden",  label: "Ev və Bağ",       icon: Home       },
    { value: "Beauty",         label: "Gözəllik",        icon: Flower2    },
    { value: "Sports",         label: "İdman",           icon: Dumbbell   },
    { value: "Automotive",     label: "Avtomobil",       icon: Car        },
];


// =====================================================================
// KATEQORİYAYA GÖRƏ TEXNİKİ SAHƏLƏR — SPEC_FIELDS
// ---------------------------------------------------------------------
// Addım 2-də göstəriləcək sahələri müəyyən edir.
// Hər kateqoriyanın özünəməxsus texniki xüsusiyyətləri var:
//   Phones  → screenSize, ram, battery, processor...
//   Laptops → gpu, batteryLife, operatingSystem...
//
// Sahə obyektinin strukturu:
//   name        → formData state-indəki açar adı
//   placeholder → input-da göstəriləcək ipucu
//   type        → "checkbox" varsa boolean sahədir (adi input deyil)
//
// "type: checkbox" sahələr:
//   controllerIncluded — Konsolda pult daxildir/deyil (boolean)
//   cellular           — iPad-in SIM kart dəstəyi var/yox (boolean)
// =====================================================================
const SPEC_FIELDS = {
    Phones: [
        { name: "screenSize",      placeholder: "Ekran Ölçüsü (məs. 6.7\")" },
        { name: "storage",         placeholder: "Yaddaş (məs. 256GB)" },
        { name: "ram",             placeholder: "RAM (məs. 8GB)" },
        { name: "frontCamera",     placeholder: "Ön Kamera (məs. 12MP)" },
        { name: "backCamera",      placeholder: "Arxa Kamera (məs. 48MP)" },
        { name: "battery",         placeholder: "Batareya (məs. 4500mAh)" },
        { name: "processor",       placeholder: "Prosessor (məs. Snapdragon 8 Gen 3)" },
        { name: "operatingSystem", placeholder: "OS (məs. Android 14)" },
    ],
    Laptops: [
        { name: "screenSize",      placeholder: "Ekran (məs. 15.6\")" },
        { name: "storage",         placeholder: "Yaddaş (məs. 512GB SSD)" },
        { name: "ram",             placeholder: "RAM (məs. 16GB)" },
        { name: "gpu",             placeholder: "GPU (məs. RTX 4060)" },
        { name: "camera",          placeholder: "Kamera (məs. 1080p)" },
        { name: "processor",       placeholder: "Prosessor (məs. Intel i7-13700H)" },
        { name: "batteryLife",     placeholder: "Batareya Ömrü (məs. 10 saat)" },
        { name: "operatingSystem", placeholder: "OS (məs. Windows 11)" },
    ],
    Cameras: [
        { name: "resolution",         placeholder: "Çözümlülük (məs. 24MP)" },
        { name: "opticalZoom",        placeholder: "Optik Zoom (məs. 3x)" },
        { name: "sensorType",         placeholder: "Sensor Növü (məs. APS-C)" },
        { name: "imageStabilization", placeholder: "Sabitləşdirmə (məs. OIS)" },
    ],
    Headphones: [
        { name: "connectivity",      placeholder: "Bağlantı (məs. Bluetooth 5.3)" },
        { name: "batteryLife",       placeholder: "Batareya Ömrü (məs. 30 saat)" },
        { name: "noiseCancellation", placeholder: "Səs Ləğvi (məs. ANC)" },
    ],
    Console: [
        { name: "cpu",                 placeholder: "CPU (məs. AMD Zen 2)" },
        { name: "gpu",                 placeholder: "GPU (məs. AMD RDNA 2)" },
        { name: "storage",             placeholder: "Yaddaş (məs. 825GB SSD)" },
        { name: "memory",              placeholder: "RAM (məs. 16GB GDDR6)" },
        { name: "supportedResolution", placeholder: "Çözümlülük (məs. 4K)" },
        { name: "connectivity",        placeholder: "Bağlantı (məs. Wi-Fi 6)" },
        // type: "checkbox" — bu sahə text deyil, boolean checkbox kimi render edilir
        { name: "controllerIncluded",  placeholder: "Controller Daxildir", type: "checkbox" },
    ],
    iPad: [
        { name: "screenSize",      placeholder: "Ekran (məs. 11\")" },
        { name: "storage",         placeholder: "Yaddaş (məs. 256GB)" },
        { name: "ram",             placeholder: "RAM (məs. 8GB)" },
        { name: "battery",         placeholder: "Batareya (məs. 7606mAh)" },
        { name: "processor",       placeholder: "Prosessor (məs. Apple M2)" },
        { name: "operatingSystem", placeholder: "OS (məs. iPadOS 17)" },
        { name: "camera",          placeholder: "Kamera (məs. 12MP)" },
        // type: "checkbox" — SIM kart dəstəyi var/yox
        { name: "cellular",        placeholder: "Cellular Dəstəyi", type: "checkbox" },
    ],
    // Geyim kateqoriyaları — sadə sahələr: ölçü, material, rəng
    WomenClothing:  [{ name: "size", placeholder: "Ölçü (S/M/L/XL)" }, { name: "material", placeholder: "Material" }, { name: "color", placeholder: "Rəng" }],
    MenClothing:    [{ name: "size", placeholder: "Ölçü (S/M/L/XL)" }, { name: "material", placeholder: "Material" }, { name: "color", placeholder: "Rəng" }],
    KidsClothing:   [{ name: "size", placeholder: "Ölçü (məs. 3-4 yaş)" }, { name: "material", placeholder: "Material" }],
    HomeAppliances: [{ name: "power", placeholder: "Güc (məs. 1500W)" }, { name: "dimensions", placeholder: "Ölçülər" }],
    HomeAndGarden:  [{ name: "dimensions", placeholder: "Ölçülər" }, { name: "material", placeholder: "Material" }],
    Beauty:         [{ name: "volume", placeholder: "Həcm (məs. 50ml)" }, { name: "ingredients", placeholder: "Əsas Tərkib" }],
    Sports:         [{ name: "size", placeholder: "Ölçü" }, { name: "weight", placeholder: "Çəki" }, { name: "material", placeholder: "Material" }],
    Automotive:     [{ name: "compatibility", placeholder: "Uyğunluq" }, { name: "material", placeholder: "Material" }],
};


// =====================================================================
// PAYLAŞILAN STİL OBYEKTLƏRİ
// ---------------------------------------------------------------------
// Bir çox sahədə eyni stillər istifadə olunur.
// Ayrıca saxlamaq inline kodu qısaldır və dəyişikliyi asanlaşdırır.
// =====================================================================

// Adi text input sahələri üçün stil
const inputStyle = {
    width:       "100%",
    padding:     "12px 16px",
    border:      "1.5px solid #f0f0f0",
    borderRadius: 12,
    fontSize:    14,
    color:       "#1a1a1a",
    background:  "white",
    outline:     "none",
    transition:  "border-color 0.2s",
    boxSizing:   "border-box",
};

// Sahə başlıqları (label) üçün stil
const labelStyle = {
    display:       "block",
    fontSize:      11,
    fontWeight:    800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color:         "#999",
    marginBottom:  6,
};


// =====================================================================
// ANA KOMPONENT — AddProduct
// =====================================================================
const AddProduct = () => {

    // ── REDUX STATE ──────────────────────────────────────────────────
    // userSlice-dən giriş etmiş istifadəçini alırıq.
    // user.user.sellerInfo.storeName — adminin mağaza adı.
    // user.user.name — mağaza adı yoxdursa istifadəçi adı.
    const { user } = useSelector((state) => state.userSlice);

    // Satıcı adı — form-a avtomatik yazılır, istifadəçi dəyişdirə bilmir.
    // Niyə Redux-dan? Form göndəriləndə birbaşa Redux-dan götürülür —
    // istifadəçi Developer Tools-da formu manipulyasiya etsə belə
    // backend-ə doğru satıcı adı gedir.
    const storeName = user?.user?.sellerInfo?.storeName || user?.user?.name || "";


    // ── FORM İLKİN VƏZİYYƏTİ ─────────────────────────────────────────
    // Bütün kateqoriyaların bütün sahələri burada birlikdə saxlanılır.
    // Addım 2-də yalnız seçilmiş kateqoriyaya uyğun sahələr göstərilir,
    // amma hamısı formData-da mövcuddur (göndəriləndə gereksizlər nəzərə alınmır).
    //
    // Niyə hamısı bir arada?
    //   İstifadəçi kateqoriya dəyişdirsə əvvəlki doldurduğu sahələr qalır.
    //   Ayrıca state yaratmaq lazım deyil — bütün sahələr bir yerdə.
    const initialState = {
        name: "", price: "", description: "", category: "",
        seller: storeName,  // Avtomatik doldurulur — istifadəçi dəyişdirə bilməz
        stock: "", ratings: "",
        // ── Telefon / Laptop / iPad ──
        screenSize: "", storage: "", ram: "", battery: "",
        processor: "", operatingSystem: "", frontCamera: "", backCamera: "",
        // ── Laptop / Konsol əlavəsi ──
        gpu: "", camera: "", batteryLife: "", resolution: "",
        // ── Kamera ──
        opticalZoom: "", sensorType: "", imageStabilization: "",
        // ── Qulaqlıq / Konsol ──
        connectivity: "", noiseCancellation: "", cpu: "", memory: "",
        supportedResolution: "",
        // ── Geyim / İdman ──
        size: "", material: "", color: "",
        // ── Ev / Bağ / Gözəllik ──
        power: "", dimensions: "", volume: "", ingredients: "",
        weight: "", compatibility: "",
        // ── Checkbox sahələr (boolean) ──
        controllerIncluded: false,  // Konsol: pult daxildirmi?
        cellular:           false,  // iPad: SIM kart dəstəyi varmı?
    };

    // Form məlumatlarının state-i — hər input dəyişdikdə yenilənir
    const [formData, setFormData]   = useState(initialState);

    // Seçilmiş şəkil faylları — File obyektlərinin massivi
    // URL.createObjectURL(file) ilə önizlənir, FormData-ya əlavə edilir
    const [images, setImages]       = useState([]);

    // Şəkil yükləmə xəta mesajı (15-dən çox seçiləndə göstərilir)
    const [imageError, setImageError] = useState("");

    // Cari addım: 1=Ümumi, 2=Texniki, 3=Şəkillər
    // Addım dəyişdikdə komponent yenidən render olunur — müvafiq form göstərilir
    const [step, setStep]           = useState(1);

    // ── RTK QUERY HOOK-LARI ───────────────────────────────────────────
    // addProduct → POST /admin/products endpoint-ini çağırır
    // refetch    → məhsul siyahısını yeniləmək üçün (əlavə sonra UI güncəllənir)
    const [addProduct]    = useAddProductMutation();
    const { refetch }     = useGetProductsQuery();

    // React Router navigate hook-u — uğurlu göndərişdən sonra yönləndirir
    const navigate = useNavigate();


    // =====================================================================
    // HADİSƏ İDARƏEDİCİLƏRİ (Event Handlers)
    // =====================================================================

    // ── INPUT DƏYİŞİKLİYİ ────────────────────────────────────────────
    // Həm adi input (text, number), həm checkbox üçün eyni funksiya.
    // type === "checkbox" olarsa → checked (boolean) istifadə edilir.
    // Deyilsə → value (string) istifadə edilir.
    //
    // [name]: ... — computed property: dəyişənin dəyəri açar adı olur.
    //   name="price" → formData.price yenilənir.
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // ── ŞƏKİL SEÇİMİ ─────────────────────────────────────────────────
    // e.target.files → FileList obyektidir.
    // Array.from() ilə adi massivə çevrilir — map(), filter() istifadə üçün.
    //
    // 15 şəkil limiti — multer middleware-i də limit qoyur,
    // amma frontend-də əvvəlcədən yoxlamaq daha yaxşı UX verir.
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 15) {
            setImageError("Maksimum 15 şəkil yükləyə bilərsiniz.");
            setImages([]);
        } else {
            setImageError("");
            setImages(files);
        }
    };

    // ── ŞƏKİLİ SİL ───────────────────────────────────────────────────
    // filter() ilə seçilmiş şəkili massivdən çıxarır.
    // i !== idx → bu indeksli elementi atla, qalanları saxla.
    const removeImage = (idx) =>
        setImages((prev) => prev.filter((_, i) => i !== idx));


    // =====================================================================
    // FORM GÖNDƏRİLMƏSİ — handleSubmit
    // =====================================================================
    const handleSubmit = async (e) => {
        // Brauzerin default form göndərmə davranışını (səhifəni yeniləmə) blokla
        e.preventDefault();

        // Şəkil xətası varsa — göndərmə
        if (imageError) return;

        // Ən azı 1 şəkil məcburidir
        if (images.length === 0) {
            Swal.fire({
                title: "Xəta!",
                text:  "Ən az 1 şəkil əlavə edin.",
                icon:  "error",
                confirmButtonColor: "#E8192C",
            });
            return;
        }

        // ── FORMDATA OBYEKTİ YARAT ────────────────────────────────────
        // Niyə FormData? Şəkillər (File) var — multipart/form-data lazımdır.
        // Adi JSON ilə fayl göndərmək olmur.
        const form = new FormData();

        // formData state-indəki bütün açar-dəyər cütlərini form-a əlavə et
        for (const key in formData) {
            form.append(key, formData[key]);
        }

        // Satıcı adını Redux-dan birbaşa götür — state deyil.
        // form.set() — mövcud "seller" dəyərini üzə yazır (loop-da əlavə edildisə).
        // Niyə Redux-dan? İstifadəçi localStorage-i dəyişdirə bilər,
        // amma Redux state server tokenindən gəlir — daha etibarlıdır.
        form.set("seller", storeName);

        // Seçilmiş şəkilləri form-a əlavə et.
        // "newImages" — multer middleware-dəki field adı ilə eyni olmalıdır:
        //   .array("newImages") → req.files["newImages"]
        images.forEach((file) => form.append("newImages", file));

        try {
            // RTK Query mutasiyası çağırılır.
            // .unwrap() — uğurlu cavabı qaytarır, xəta olarsa throw edir.
            await addProduct(form).unwrap();

            // Uğurlu mesaj — SweetAlert2 modal
            Swal.fire({
                title: "Uğurla əlavə edildi! 🎉",
                text:  "Məhsul əlavə edildi.",
                icon:  "success",
                confirmButtonColor: "#E8192C",
            });

            // Məhsul siyahısını yenilə — yeni məhsul siyahıda görünsün
            await refetch();

            // Admin məhsul siyahısı səhifəsinə yönləndir
            navigate("/admin/products");

            // Formu sıfırla — satıcı adını qoru (dəyişməməlidir)
            setFormData({ ...initialState, seller: storeName });
            setImages([]);

        } catch (error) {
            console.error("Xəta:", error);
            // API-dən gələn xəta mesajını göstər, yoxdursa ümumi mesaj
            Swal.fire({
                title: "Xəta!",
                text:  error?.data?.message || error?.error || "Xəta baş verdi.",
                icon:  "error",
                confirmButtonColor: "#E8192C",
            });
        }
    };


    // =====================================================================
    // HESABLANMIŞ DƏYƏRLƏr (render öncəsi)
    // =====================================================================

    // Seçilmiş kateqoriyaya uyğun texniki sahələr.
    // Kateqoriya seçilməyibsə (initialState.category = "") → boş massiv.
    const specFields = SPEC_FIELDS[formData.category] || [];

    // Seçilmiş kateqoriyanın tam obyekti — addım 2-dəki başlıq ikonu üçün.
    // find() → uyğun element tapılmadısa undefined qaytarır (optional chaining lazımdır).
    const selectedCat = CATEGORIES.find((c) => c.value === formData.category);

    // 1-ci addımdan keçmək üçün bütün məcburi sahələrin dolu olması şərti.
    // Boolean coercion: boş string ("") → false, dolu string → true.
    const step1Valid = formData.name && formData.price && formData.category &&
                       formData.description && formData.stock;

    // Addım göstəricisi üçün massiv — .map() ilə render edilir
    const STEPS = [
        { n: 1, label: "Ümumi"   },
        { n: 2, label: "Texniki" },
        { n: 3, label: "Şəkillər"},
    ];


    // =====================================================================
    // RENDER
    // =====================================================================
    return (
        <div style={{ minHeight: "100vh", background: "#f6f6f7", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>

            {/* ── QLobal CSS stilləri
                Responsive breakpoint-lər, animasiyalar, focus stilləri buradadır.
                React-da <style> tagi JSX içinə yerləşdirilə bilir.
                Alternativ: CSS Modules və ya styled-components. ── */}
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* RESET — bütün elementlər üçün box-sizing */
        *, *::before, *::after { box-sizing: border-box; }

        /* HEADER — qırmızı, yapışqan (sticky), kölgəli */
        .addp-header {
          background: #E8192C;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          position: sticky;    /* Scroll zamanı header yuxarıda qalır */
          top: 0;
          z-index: 30;
          box-shadow: 0 4px 20px rgba(232,25,44,0.25);
        }

        /* CONTENT — mərkəzlənmiş, maksimum 780px genişlik */
        .addp-content { max-width: 780px; margin: 0 auto; padding: 32px 20px; width: 100%; }

        /* GRID HELPERS */
        .addp-grid2     { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .addp-span2     { grid-column: 1 / -1; }       /* 2 sütunun hamısını əhatə et */
        .addp-spec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        /* CATEGORY GRID — auto-fill ilə responsive */
        .addp-cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 8px;
        }

        /* CARD — ağ, yuvarlaq, kölgəli konteyner */
        .addp-card {
          background: white; border-radius: 24px; padding: 32px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; width: 100%;
        }

        /* FOOTER DÜYMƏLƏRI */
        .addp-footer-between { display: flex; justify-content: space-between; margin-top: 28px; gap: 10px; flex-wrap: wrap; }
        .addp-footer-end     { display: flex; justify-content: flex-end; margin-top: 28px; }

        /* ŞƏKİL ÖNİZLƏMƏLƏRİ */
        .addp-img-previews { display: flex; flex-wrap: wrap; gap: 10px; }
        .addp-img-preview  { width: 80px; height: 80px; object-fit: cover; border-radius: 12px; border: 2px solid #fdd; display: block; }

        /* ADDIM GÖSTƏRİCİSİ */
        .addp-steps-wrapper { display: flex; align-items: center; justify-content: center; margin-bottom: 28px; }
        .addp-step-btn      { width: 44px; height: 44px; border-radius: 50%; border: none; font-weight: 900; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .addp-step-label    { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; }
        .addp-step-connector { width: 60px; height: 2px; margin: 0 10px; margin-bottom: 18px; border-radius: 2px; flex-shrink: 0; }

        /* FOCUS STİLLƏRİ — border qırmızıya dönür */
        .addp-input:focus   { border-color: #E8192C !important; }
        .addp-textarea:focus { border-color: #E8192C !important; }

        /* ════ RESPONSİV BREAKPOINTLƏR ════ */

        /* Tablet: 1024px */
        @media (max-width: 1024px) {
          .addp-header { padding: 0 24px; }
          .addp-content { padding: 24px 16px; }
          .addp-card { padding: 28px 24px; }
          .addp-cat-grid { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); }
        }

        /* Tablet kiçik / böyük mobil: 768px */
        @media (max-width: 768px) {
          .addp-header { padding: 0 16px; height: 56px; }
          .addp-brand-sub { display: none; }       /* Alt başlıq gizlənir */
          .addp-back-btn-text { display: none; }   /* "Geri" yazısı gizlənir */
          .addp-back-btn { padding: 7px 12px !important; }
          .addp-content { padding: 16px 12px; }
          .addp-card { padding: 20px 16px; border-radius: 18px; }
          .addp-grid2 { grid-template-columns: 1fr !important; }  /* 2→1 sütun */
          .addp-span2 { grid-column: 1 !important; }
          .addp-spec-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
          .addp-cat-grid { grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 6px; }
          .addp-step-connector { width: 36px !important; margin: 0 6px; margin-bottom: 18px; }
          .addp-step-label { font-size: 9px !important; }
          .addp-step-btn { width: 38px !important; height: 38px !important; font-size: 13px !important; }
          .addp-img-preview { width: 72px !important; height: 72px !important; }
          .addp-store-banner { flex-wrap: wrap; gap: 6px; }
          .addp-store-auto { margin-left: 0 !important; width: 100%; }
        }

        /* Mobil: 600px — texniki sahələr 1 sütuna keçir */
        @media (max-width: 600px) {
          .addp-spec-grid { grid-template-columns: 1fr !important; }
          .addp-cat-grid { grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: 5px; }
        }

        /* Kiçik mobil: 420px */
        @media (max-width: 420px) {
          .addp-header { padding: 0 10px; height: 52px; }
          .addp-brand-title { font-size: 14px !important; }
          .addp-content { padding: 12px 8px; }
          .addp-card { padding: 16px 12px; border-radius: 16px; }
          .addp-cat-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 5px; }
          .addp-step-connector { width: 20px !important; margin: 0 4px; margin-bottom: 18px; }
          .addp-step-btn { width: 34px !important; height: 34px !important; font-size: 12px !important; }
          .addp-step-label { font-size: 8px !important; }
          .addp-img-preview { width: 60px !important; height: 60px !important; }
          /* Footer düymələri tam genişliyə keçir */
          .addp-footer-between { flex-direction: column; }
          .addp-footer-between button, .addp-footer-end button { width: 100%; justify-content: center; }
        }

        /* Çox kiçik: 360px */
        @media (max-width: 360px) {
          .addp-cat-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .addp-header-logo { width: 30px !important; height: 30px !important; }
          .addp-brand-title { font-size: 13px !important; }
        }
      `}</style>


            {/* ═══════════════════════════════════════════
                HEADER
                Brendex loqosu (sol) + Geri düyməsi (sağ)
                position: sticky → scroll zamanı yuxarıda qalır
            ═══════════════════════════════════════════ */}
            <div className="addp-header">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Loqo: ağ kvadrat içində qırmızı "B" hərfi */}
                    <div className="addp-header-logo" style={{ width: 36, height: 36, background: "white", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: "#E8192C", fontWeight: 900, fontSize: 18, lineHeight: 1 }}>B</span>
                    </div>
                    <div>
                        <p className="addp-brand-title" style={{ color: "white", fontWeight: 900, fontSize: 17, letterSpacing: "-0.01em", lineHeight: 1, margin: 0 }}>BRENDEX</p>
                        {/* 768px-dən kiçik ekranlarda bu gizlənir (addp-brand-sub CSS-də) */}
                        <p className="addp-brand-sub" style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>Yeni Məhsul Əlavə Et</p>
                    </div>
                </div>

                {/* Geri düyməsi — admin məhsul siyahısına aparır */}
                <button
                    className="addp-back-btn"
                    onClick={() => navigate("/admin/products")}
                    style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 10, padding: "7px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    ←<span className="addp-back-btn-text"> Geri</span>
                </button>
            </div>


            <div className="addp-content">

                {/* ── MAĞAZA BANNERİ ────────────────────────────────────────────
                    storeName varsa göstərilir.
                    Satıcı adının avtomatik təyin ediləcəyini bildirən informasiya paneli.
                ── */}
                {storeName && (
                    <div className="addp-store-banner" style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff0f1", borderRadius: 14, padding: "12px 16px", marginBottom: 24, border: "1.5px solid #fdd" }}>
                        <Store size={16} color="#E8192C" style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "#999" }}>Satıcı mağazası:</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#E8192C" }}>{storeName}</span>
                        {/* Kiçik ekranlarda tam genişliyə keçir (CSS-da addp-store-auto) */}
                        <span className="addp-store-auto" style={{ marginLeft: "auto", fontSize: 11, color: "#ccc" }}>Avtomatik təyin edilir</span>
                    </div>
                )}


                {/* ═══════════════════════════════════════════
                    ADDIM GÖSTƏRİCİSİ (Step Indicator)
                    ───────────────────────────────────────────
                    3 dairəvi düymə, aralarında bağlayıcı xətt.
                    Tamamlanmış addım → qırmızı fon + ✓
                    Cari addım        → qırmızı fon + kölgə
                    Gələcək addım     → boz fon + boz rəqəm
                    İstifadəçi keçmiş addımlara klikləyərək qayıda bilər.
                ═══════════════════════════════════════════ */}
                <div className="addp-steps-wrapper">
                    {STEPS.map((s, i) => (
                        <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                <button
                                    type="button"
                                    onClick={() => setStep(s.n)}
                                    className="addp-step-btn"
                                    style={{
                                        // step > s.n → tamamlandı (qırmızı ✓)
                                        // step === s.n → cari (qırmızı + kölgə)
                                        // step < s.n → gələcək (boz)
                                        background:  step >= s.n ? "#E8192C" : "#f0f0f0",
                                        color:       step >= s.n ? "white" : "#bbb",
                                        boxShadow:   step === s.n ? "0 4px 14px rgba(232,25,44,0.35)" : "none",
                                    }}>
                                    {/* Tamamlanmış addımda rəqəm yerinə ✓ */}
                                    {step > s.n ? "✓" : s.n}
                                </button>
                                <span className="addp-step-label" style={{ color: step === s.n ? "#E8192C" : "#bbb" }}>{s.label}</span>
                            </div>
                            {/* Son elementdən sonra connector göstərmə */}
                            {i < STEPS.length - 1 && (
                                <div className="addp-step-connector" style={{ background: step > s.n ? "#E8192C" : "#f0f0f0" }} />
                            )}
                        </div>
                    ))}
                </div>


                <form onSubmit={handleSubmit}>

                    {/* ═══════════════════════════════════════════
                        ADDIM 1: ÜMUMİ MƏLUMATLAR
                        ───────────────────────────────────────────
                        Məhsul adı, qiymət, stok → 2 sütunlu grid
                        Kateqoriya → 14 düyməli grid
                        Açıqlama   → textarea
                        Satıcı     → readOnly, avtomatik
                        Rating     → ixtiyari, 0-5
                        İrəli düyməsi step1Valid-ə görə disable/aktiv
                    ═══════════════════════════════════════════ */}
                    {step === 1 && (
                        <div className="addp-card">
                            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1a1a1a", marginTop: 0, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #f5f5f5" }}>Ümumi Məlumatlar</h2>

                            <div className="addp-grid2">

                                {/* Məhsul adı — addp-span2 ilə hər iki sütunu əhatə edir */}
                                <div className="addp-span2">
                                    <label style={labelStyle}>Məhsul Adı *</label>
                                    <input className="addp-input" name="name" value={formData.name} onChange={handleInputChange} placeholder="Məhsulun adını daxil edin" required style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = "#E8192C"}
                                        onBlur={(e)  => e.target.style.borderColor = "#f0f0f0"} />
                                </div>

                                {/* Qiymət — sol sütun */}
                                <div>
                                    <label style={labelStyle}>Qiymət (₼) *</label>
                                    <input className="addp-input" name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="0.00" required style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = "#E8192C"}
                                        onBlur={(e)  => e.target.style.borderColor = "#f0f0f0"} />
                                </div>

                                {/* Stok — sağ sütun */}
                                <div>
                                    <label style={labelStyle}>Stok *</label>
                                    <input className="addp-input" name="stock" type="number" value={formData.stock} onChange={handleInputChange} placeholder="0" required style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = "#E8192C"}
                                        onBlur={(e)  => e.target.style.borderColor = "#f0f0f0"} />
                                </div>

                                {/* Kateqoriya seçim grid-i — addp-span2 ilə tam genişlik */}
                                <div className="addp-span2">
                                    <label style={labelStyle}>Kateqoriya *</label>
                                    <div className="addp-cat-grid">
                                        {CATEGORIES.map(({ value, label, icon: Icon }) => (
                                            // Seçilmiş kateqoriya: qırmızı border + açıq qırmızı fon
                                            // Seçilməmiş: boz border + ağ fon
                                            <button key={value} type="button"
                                                onClick={() => setFormData((p) => ({ ...p, category: value }))}
                                                style={{
                                                    display: "flex", flexDirection: "column", alignItems: "center",
                                                    justifyContent: "center", padding: "10px 6px", borderRadius: 12,
                                                    border:     `2px solid ${formData.category === value ? "#E8192C" : "#f0f0f0"}`,
                                                    background: formData.category === value ? "#fff0f1" : "white",
                                                    color:      formData.category === value ? "#E8192C" : "#999",
                                                    cursor: "pointer", gap: 5, transition: "all 0.18s",
                                                }}>
                                                <Icon size={16} />
                                                <span style={{ fontSize: 9, fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Açıqlama — textarea, çox sətirli, addp-span2 */}
                                <div className="addp-span2">
                                    <label style={labelStyle}>Açıqlama *</label>
                                    <textarea className="addp-textarea" name="description" value={formData.description} onChange={handleInputChange}
                                        placeholder="Məhsulun ətraflı açıqlaması" required rows={4}
                                        style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                                        onFocus={(e) => e.target.style.borderColor = "#E8192C"}
                                        onBlur={(e)  => e.target.style.borderColor = "#f0f0f0"} />
                                </div>

                                {/* Satıcı — readOnly, boz fon, "not-allowed" kursor
                                    Redux-dan gəlir — istifadəçi dəyişdirə bilməz */}
                                <div>
                                    <label style={labelStyle}>Satıcı (Avtomatik)</label>
                                    <input value={storeName} readOnly
                                        style={{ ...inputStyle, background: "#fafafa", color: "#bbb", cursor: "not-allowed" }} />
                                </div>

                                {/* Rating — ixtiyari, step 0.1 ilə onluq dəqiqlik */}
                                <div>
                                    <label style={labelStyle}>Rating (0-5)</label>
                                    <input className="addp-input" name="ratings" type="number" step="0.1" min="0" max="5"
                                        value={formData.ratings} onChange={handleInputChange} placeholder="4.5" style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = "#E8192C"}
                                        onBlur={(e)  => e.target.style.borderColor = "#f0f0f0"} />
                                </div>
                            </div>

                            {/* İrəli düyməsi — step1Valid false olarsa opacity 0.4 + not-allowed */}
                            <div className="addp-footer-end">
                                <button type="button" onClick={() => setStep(2)} disabled={!step1Valid}
                                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 12, border: "none", background: "#E8192C", color: "white", fontWeight: 800, fontSize: 14, cursor: step1Valid ? "pointer" : "not-allowed", opacity: step1Valid ? 1 : 0.4, boxShadow: "0 4px 14px rgba(232,25,44,0.3)" }}>
                                    Texniki <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}


                    {/* ═══════════════════════════════════════════
                        ADDIM 2: TEXNİKİ XÜSUSİYYƏTLƏR
                        ───────────────────────────────────────────
                        SPEC_FIELDS[category] — seçilmiş kateqoriyanın sahələri.
                        Checkbox sahə → xüsusi vizual checkbox UI.
                        Text sahə    → adi input.
                        Sahə yoxdursa → məlumat mesajı.
                    ═══════════════════════════════════════════ */}
                    {step === 2 && (
                        <div className="addp-card">
                            {/* Başlıqda kateqoriyanın ikonu + adı */}
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #f5f5f5" }}>
                                {selectedCat && <selectedCat.icon size={20} color="#E8192C" />}
                                <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1a1a1a", margin: 0 }}>
                                    {selectedCat?.label || "Kateqoriya"} — Texniki
                                </h2>
                            </div>

                            {specFields.length > 0 ? (
                                <div className="addp-spec-grid">
                                    {specFields.map((field) => (
                                        <div key={field.name}
                                            // Checkbox sahə tam genişlikdə olsun (1 / -1 → hər iki sütun)
                                            style={field.type === "checkbox" ? { gridColumn: "1 / -1" } : {}}>

                                            {field.type === "checkbox" ? (
                                                /* Xüsusi checkbox UI:
                                                   Əsl <input type="checkbox"> gizlənir.
                                                   Vizual div — seçildikdə qırmızı fon + ✓ göstərir.
                                                   label onClick → gizli input-u tetikləyir. */
                                                <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "14px 16px", background: "#fafafa", borderRadius: 12, border: "1.5px solid #f0f0f0" }}>
                                                    {/* Vizual checkbox */}
                                                    <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${formData[field.name] ? "#E8192C" : "#ddd"}`, background: formData[field.name] ? "#E8192C" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                        {/* Seçildikcə ✓ göstər */}
                                                        {formData[field.name] && <span style={{ color: "white", fontSize: 12, fontWeight: 900 }}>✓</span>}
                                                    </div>
                                                    {/* Əsl checkbox gizli — vizual div ilə sinxronlaşır */}
                                                    <input type="checkbox" name={field.name} checked={formData[field.name]} onChange={handleInputChange} style={{ display: "none" }} />
                                                    <span style={{ fontWeight: 700, color: "#1a1a1a", fontSize: 14 }}>{field.placeholder}</span>
                                                </label>
                                            ) : (
                                                /* Adi text input sahəsi */
                                                <>
                                                    {/* Label: "Ekran Ölçüsü (məs. 6.7\")" → mötərizədən əvvəl "Ekran Ölçüsü" */}
                                                    <label style={labelStyle}>{field.placeholder.split(" (")[0]}</label>
                                                    <input className="addp-input" name={field.name}
                                                        value={formData[field.name] || ""}
                                                        onChange={handleInputChange}
                                                        placeholder={field.placeholder}
                                                        style={inputStyle}
                                                        onFocus={(e) => e.target.style.borderColor = "#E8192C"}
                                                        onBlur={(e)  => e.target.style.borderColor = "#f0f0f0"} />
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                // Kateqoriya üçün texniki sahə yoxdursa məlumat mesajı
                                <p style={{ textAlign: "center", color: "#ccc", padding: "40px 0", fontSize: 14 }}>
                                    Bu kateqoriya üçün əlavə sahə yoxdur.
                                </p>
                            )}

                            {/* Geri + İrəli düymələri */}
                            <div className="addp-footer-between">
                                <button type="button" onClick={() => setStep(1)} style={{ padding: "12px 24px", borderRadius: 12, border: "1.5px solid #f0f0f0", background: "white", color: "#999", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Geri</button>
                                <button type="button" onClick={() => setStep(3)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, border: "none", background: "#E8192C", color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(232,25,44,0.3)" }}>
                                    Şəkillər <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}


                    {/* ═══════════════════════════════════════════
                        ADDIM 3: ŞƏKİLLƏR
                        ───────────────────────────────────────────
                        Drag-drop görünüşlü yükləmə zonası.
                        multiple → birdən çox fayl seçilə bilər.
                        URL.createObjectURL(file) → lokal önizləmə.
                        X düyməsi → şəkili siyahıdan çıxar.
                        type="submit" → form onSubmit-i tetikləyir.
                    ═══════════════════════════════════════════ */}
                    {step === 3 && (
                        <div className="addp-card">
                            <h2 style={{ fontSize: 18, fontWeight: 900, color: "#1a1a1a", marginTop: 0, marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid #f5f5f5" }}>Şəkillər</h2>

                            {/* Şəkil yükləmə zonası.
                                htmlFor="img-upload" → label-ə klikləmək input-u açır.
                                border: dashed — "yükləmə zonası" vizual işarəsi.
                                imageError varsa kənar qırmızı olur. */}
                            <label htmlFor="img-upload" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "36px 16px", border: `2px dashed ${imageError ? "#E8192C" : "#fcc"}`, borderRadius: 18, cursor: "pointer", background: images.length > 0 ? "#fff8f8" : "#fafafa" }}>
                                <div style={{ width: 56, height: 56, borderRadius: 16, background: "#fff0f1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Upload size={24} color="#E8192C" />
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <p style={{ fontWeight: 800, color: "#1a1a1a", fontSize: 15, margin: "0 0 4px" }}>Şəkilləri seçin</p>
                                    <p style={{ color: "#bbb", fontSize: 12, margin: 0 }}>Maks. 15 şəkil · JPG, PNG, WEBP</p>
                                </div>
                                {/* Əsl fayl input-u gizli — label klikinə cavab verir.
                                    multiple → birdən çox fayl seçimə icazə verir.
                                    accept="image/*" → yalnız şəkil faylları */}
                                <input id="img-upload" type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                            </label>

                            {/* 15 şəkil limitini aşdıqda xəta mesajı */}
                            {imageError && (
                                <p style={{ color: "#E8192C", fontWeight: 700, fontSize: 13, marginTop: 8 }}>⚠ {imageError}</p>
                            )}

                            {/* Seçilmiş şəkillərin thumbnail önizləməsi */}
                            {images.length > 0 && (
                                <div style={{ marginTop: 20 }}>
                                    <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#bbb", marginBottom: 12 }}>
                                        {images.length} şəkil seçildi
                                    </p>
                                    <div className="addp-img-previews">
                                        {images.map((file, idx) => (
                                            <div key={idx} style={{ position: "relative" }}>
                                                {/* URL.createObjectURL(file) — File obyektindən
                                                    geçici URL yaradır (yalnız bu sessiyada işləyir).
                                                    Şəkil hələ serverə yüklənməyib — lokal önizləmədir. */}
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Preview ${idx + 1}`}
                                                    className="addp-img-preview"
                                                />
                                                {/* X düyməsi — position: absolute ilə şəkilin üstündədir */}
                                                <button type="button" onClick={() => removeImage(idx)}
                                                    style={{ position: "absolute", top: -6, right: -6, width: 22, height: 22, borderRadius: "50%", background: "#E8192C", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                                    <X size={11} color="white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Geri + Submit düymələri */}
                            <div className="addp-footer-between">
                                <button type="button" onClick={() => setStep(2)} style={{ padding: "12px 24px", borderRadius: 12, border: "1.5px solid #f0f0f0", background: "white", color: "#999", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>← Geri</button>

                                {/* type="submit" → form-un onSubmit={handleSubmit}-ni tetikləyir */}
                                <button type="submit" style={{ padding: "14px 32px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #E8192C 0%, #ff4f61 100%)", color: "white", fontWeight: 900, fontSize: 15, cursor: "pointer", boxShadow: "0 6px 20px rgba(232,25,44,0.35)" }}>
                                    ✓ Məhsulu Əlavə Et
                                </button>
                            </div>
                        </div>
                    )}

                </form>
            </div>
        </div>
    );
};

export default AddProduct;