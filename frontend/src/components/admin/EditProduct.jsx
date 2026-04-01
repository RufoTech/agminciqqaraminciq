"use client";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EditProduct.jsx
// Mövcud məhsulu redaktə etmək üçün 3 addımlı wizard formu.
// Admin panelindəki "Redaktə et" düyməsinə basıldıqda açılır.
// URL: /admin/edit-product/:id
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// React — JSX render üçün əsas kitabxana.
// useEffect → yan təsirlər üçün (API məlumatı gəldikdə formu doldur).
// useState  → lokal state idarəetməsi (aktiv addım, form məlumatları, şəkillər).
import React, { useEffect, useState } from 'react';

// useParams   → URL-dən dinamik parametrləri oxuyur.
//               /admin/edit-product/abc123 → { id: "abc123" }
//               Hansı məhsulu redaktə etdiyimizi bilmək üçün lazımdır.
// useNavigate → Proqrammatik səhifə keçidi.
//               Uğurlu redaktədən sonra /admin/products-a yönləndirmək üçün.
import { useParams, useNavigate } from 'react-router-dom';

// useSelector → Redux store-dan qlobal state oxumaq üçün.
//               Cari giriş etmiş satıcının adını almaq üçün istifadə olunur.
//               Satıcı adı form-a avtomatik əlavə edilir (istifadəçi dəyişə bilməz).
import { useSelector } from 'react-redux';

// RTK Query hook-ları — backend ilə işləmək üçün:
//
//   useGetProductDetailsQuery → GET /products/:id
//     Redaktə ediləcək məhsulun bütün məlumatlarını çəkir.
//     id dəyişdikdə avtomatik yenidən çağırılır.
//
//   useEditProductMutation → PUT /admin/products/:id
//     FormData formatında məhsul məlumatlarını (şəkillər daxil) göndərir.
//     isLoading (isUpdating adlandırırıq) → submit gedərkən düymə disabled olur.
//
//   useGetProductsQuery → GET /products
//     Bilavasitə işlətmirik, lakin refetch() funksiyasına ehtiyacımız var.
//     Redaktə uğurlu olduqda siyahı avtomatik yenilənsin deyə çağırırıq.
import {
  useGetProductDetailsQuery,
  useEditProductMutation,
  useGetProductsQuery
} from '../../redux/api/productsApi';

// SweetAlert2 — brauzerin standart alert() əvəzinə xoş görünüşlü modal pəncərələr.
// İki yerdə istifadə olunur:
//   1. İcazəsiz giriş (başqa satıcının məhsulu) → xəbərdarlıq + yönləndir
//   2. Uğurlu/uğursuz redaktə nəticəsi → bildiriş
import Swal from 'sweetalert2';

// React Icons kitabxanasından ikonlar:
//   FaTrash  → Mövcud/yeni şəkilləri silmək üçün kiçik zibil qutunu ikonu
//   FaUpload → Yeni şəkil yükləmə zonasında göstərilən yükləmə ikonu
import { FaTrash, FaUpload } from 'react-icons/fa';

// Lucide React — kateqoriya ikonları + irəli ox ikonu:
//   Smartphone, Laptop... → Kateqoriya seçim düymələrinin ikonları
//   ChevronRight          → "İrəli" düymələrinin sağ ox ikonu
import {
  Smartphone, Laptop, Camera, Headphones, Gamepad2, Tablet,
  Shirt, Home, Flower2, Dumbbell, Car, ChevronRight,
} from 'lucide-react';


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CATEGORIES — KATEQORİYALAR SİYAHISI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Hər kateqoriya obyektinin 3 sahəsi var:
//   value → Backend/MongoDB-dəki kateqoriya adı (formData.category sahəsinə yazılır)
//   label → UI-da istifadəçiyə göstərilən Azərbaycanca ad
//   icon  → Lucide ikon komponenti (kateqoriya seçim düyməsinin içinə qoyulur)
//
// Bu massiv 2 yerdə istifadə olunur:
//   1. Addım 1-dəki kateqoriya seçim grid-i
//   2. Addım 2-nin başlığında seçilmiş kateqoriyanın ikonunu göstərmək üçün
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CATEGORIES = [
  { value: "Phones",         label: "Telefonlar",       icon: Smartphone },
  { value: "Laptops",        label: "Noutbuklar",        icon: Laptop },
  { value: "Cameras",        label: "Kameralar",         icon: Camera },
  { value: "Headphones",     label: "Qulaqcıqlar",       icon: Headphones },
  { value: "Console",        label: "Oyun Konsolları",   icon: Gamepad2 },
  { value: "iPad",           label: "Planşetlər",        icon: Tablet },
  { value: "WomenClothing",  label: "Qadın Geyimləri",   icon: Shirt },
  { value: "MenClothing",    label: "Kişi Geyimləri",    icon: Shirt },
  { value: "KidsClothing",   label: "Uşaq Geyimləri",    icon: Shirt },
  { value: "HomeAppliances", label: "Ev Texnikası",      icon: Home },
  { value: "HomeAndGarden",  label: "Ev və Bağ",         icon: Home },
  { value: "Beauty",         label: "Gözəllik",          icon: Flower2 },
  { value: "Sports",         label: "İdman",             icon: Dumbbell },
  { value: "Automotive",     label: "Avtomobil",         icon: Car },
];


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SPEC_FIELDS — KATEQORİYAYA GÖRƏ TEXNİKİ SAHƏLƏR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// NƏ EDİR:
//   Addım 2-də hansı texniki sahələrin göstəriləcəyini müəyyən edir.
//   Seçilmiş kateqoriyaya görə SPEC_FIELDS[category] massivi götürülür.
//   Bu massiv üzərindən keçib hər sahə üçün input render edilir.
//
// AddProduct-dən FƏRQI:
//   Bəzi kateqoriyalarda sahə adları (name) fərqlidir.
//   Məsələn: Konsol üçün "consoleGPU", iPad üçün "ipadScreenSize".
//   Niyə? Fərqli kateqoriyaların eyni adlı sahələri (storage, ram...) bir-birinə qarışmasın.
//   MongoDB-də hər kateqoriyanın öz açarları var.
//
// "type: checkbox" sahələr:
//   Boolean (true/false) dəyərli sahələr üçün.
//   Render zamanı xüsusi checkbox UI göstərilir (standart <input> deyil).
//   Məsələn: "Controller daxildir?", "Cellular dəstəyi var?"
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SPEC_FIELDS = {
  Phones: [
    { name: "screenSize",      label: "Ekran Ölçüsü" },
    { name: "storage",         label: "Yaddaş" },
    { name: "ram",             label: "RAM" },
    { name: "frontCamera",     label: "Ön Kamera" },
    { name: "backCamera",      label: "Arxa Kamera" },
    { name: "battery",         label: "Batareya" },
    { name: "processor",       label: "Prosessor" },
    { name: "operatingSystem", label: "OS" },
  ],

  Laptops: [
    // colors — vergüllə ayrılmış string kimi saxlanılır: "qırmızı, mavi, yaşıl"
    // Göndərərkən split(',') ilə massivə çevrilir.
    { name: "colors",          label: "Rənglər (vergüllə)" },
    { name: "screenSize",      label: "Ekran Ölçüsü" },
    { name: "storage",         label: "Yaddaş" },
    { name: "ram",             label: "RAM" },
    { name: "gpu",             label: "GPU" },
    { name: "camera",          label: "Kamera" },
    { name: "processor",       label: "Prosessor" },
    { name: "batteryLife",     label: "Batareya Ömrü" },
    { name: "operatingSystem", label: "OS" },
  ],

  Cameras: [
    { name: "resolution",         label: "Çözümlülük" },
    { name: "opticalZoom",        label: "Optik Zoom" },
    { name: "sensorType",         label: "Sensor Növü" },
    { name: "imageStabilization", label: "Sabitləşdirmə" },
  ],

  Headphones: [
    { name: "connectivity",         label: "Bağlantı" },
    // headphoneBatteryLife → telefon batteryLife-dan ayrı açar.
    // Çünki hər ikisi eyni formData-dadır, üst-üstə yazılmasın.
    { name: "headphoneBatteryLife", label: "Batareya Ömrü" },
    { name: "noiseCancellation",    label: "Səs Ləğvi" },
  ],

  Console: [
    { name: "cpu",                 label: "CPU" },
    { name: "consoleGPU",          label: "GPU" },          // konsol üçün ayrı açar
    { name: "consoleStorage",      label: "Yaddaş" },       // konsol üçün ayrı açar
    { name: "memory",              label: "Memory" },
    { name: "supportedResolution", label: "Dəstəklənən Çözümlülük" },
    { name: "consoleConnectivity", label: "Bağlantı" },     // konsol üçün ayrı açar
    // type: "checkbox" → bu sahə üçün checkbox UI render edilir (boolean dəyər)
    { name: "controllerIncluded",  label: "Controller Daxildir", type: "checkbox" },
  ],

  iPad: [
    { name: "color",               label: "Rəng" },
    // ipad prefiksi — telefon/laptop sahələri ilə qarışmasın deyə
    { name: "ipadScreenSize",      label: "Ekran" },
    { name: "ipadStorage",         label: "Yaddaş" },
    { name: "ipadRam",             label: "RAM" },
    { name: "ipadBattery",         label: "Batareya" },
    { name: "ipadProcessor",       label: "Prosessor" },
    { name: "ipadOperatingSystem", label: "OS" },
    { name: "ipadCamera",          label: "Kamera" },
    { name: "cellular",            label: "Cellular Dəstəyi", type: "checkbox" }, // boolean
  ],

  // Sadə kateqoriyalar — az sayda sahə, adi mətn inputları
  WomenClothing:  [{ name: "size", label: "Ölçü" }, { name: "material", label: "Material" }, { name: "color", label: "Rəng" }],
  MenClothing:    [{ name: "size", label: "Ölçü" }, { name: "material", label: "Material" }, { name: "color", label: "Rəng" }],
  KidsClothing:   [{ name: "size", label: "Ölçü" }, { name: "material", label: "Material" }],
  HomeAppliances: [{ name: "power", label: "Güc (W)" }, { name: "dimensions", label: "Ölçülər" }],
  HomeAndGarden:  [{ name: "dimensions", label: "Ölçülər" }, { name: "material", label: "Material" }],
  Beauty:         [{ name: "volume", label: "Həcm" }, { name: "ingredients", label: "Tərkib" }],
  Sports:         [{ name: "size", label: "Ölçü" }, { name: "weight", label: "Çəki" }, { name: "material", label: "Material" }],
  Automotive:     [{ name: "compatibility", label: "Uyğunluq" }, { name: "material", label: "Material" }],
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PAYLAŞILAN STİL OBYEKTLƏRİ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// NİYƏ KOMPONENT XARİCİNDƏ?
//   Komponent daxilindəki obyektlər hər render-də yenidən yaradılır.
//   Bu isə React-ın stil müqayisəsini çətinləşdirir (referans dəyişir).
//   Xaricdə tərif edilmiş obyektlər isə yalnız bir dəfə yaradılır.
//   Bundan əlavə, birdən çox input-da eyni stili bölüşmək üçün rahatdır.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// inputStyle → bütün text input-lar üçün eyni bazis stil
const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  border: "1.5px solid #f0f0f0",
  borderRadius: 10,
  fontSize: 13,
  color: "#1a1a1a",
  background: "white",
  outline: "none",           // Brauzer default fokus xəttini sıfırla (özümüz idarə edirik)
  boxSizing: "border-box",   // Padding eni artırmır — width: 100% düzgün işləsin
  transition: "border-color 0.2s", // Focus zamanı hamar rəng keçidi
};

// labelStyle → bütün input etiketləri üçün eyni stil
const labelStyle = {
  display: "block",           // Ayrıca sətirdə olsun (input-dan üstdə)
  fontSize: 10,
  fontWeight: 800,
  textTransform: "uppercase", // "məhsul adı" → "MƏHSUL ADI"
  letterSpacing: "0.08em",
  color: "#aaa",
  marginBottom: 5,
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EditProduct — ANA KOMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// AXIN:
//   1. URL-dən məhsul ID-sini al (useParams)
//   2. API-dən məhsul məlumatlarını çək (useGetProductDetailsQuery)
//   3. useEffect ilə gələn məlumatı form state-inə yaz
//   4. İstifadəçi 3 addımda formu redaktə edir
//   5. Submit: FormData yarat → API-yə göndər → bildiriş → yönləndir
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const EditProduct = () => {

  // ════════════════════════════════════════
  // HOOKS VƏ STATE
  // ════════════════════════════════════════

  // URL parametrindən məhsul ID-sini alırıq.
  // /admin/edit-product/507f1a2b3c4d → id = "507f1a2b3c4d"
  const { id } = useParams();

  // Uğurlu redaktədən sonra /admin/products-a qayıtmaq üçün.
  const navigate = useNavigate();

  // Redux store-dan cari satıcının məlumatını alırıq.
  // Optional chaining (?.) — user mövcud deyilsə xəta atmır.
  // || zənciri — sellerInfo.storeName yoxdursa name, o da yoxdursa boş string.
  const { user } = useSelector((state) => state.userSlice);
  const currentStoreName = user?.user?.sellerInfo?.storeName || user?.user?.name || "";

  // API-dən məhsul detallarını çəkirik.
  // id dəyişdikdə RTK Query avtomatik yeni sorğu göndərir.
  // data → { product: {...} } formatında gəlir
  // isLoading → sorğu davam edir (spinner göstərilir)
  // error → sorğu uğursuz oldu (xəta ekranı göstərilir)
  const { data, error, isLoading } = useGetProductDetailsQuery(id);

  // Məhsul siyahısını yeniləmək üçün refetch funksiyası.
  // Redaktə uğurlu olduqda AdminProducts-dakı siyahı köhnə məlumatla qalmasın.
  const { refetch } = useGetProductsQuery();

  // Redaktə mutasiyası:
  //   editProduct  → API çağırış funksiyası
  //   isUpdating   → submit gedərkən true (düymə disabled, spinner göstərilir)
  //   Array destructuring: [editProduct, { isLoading: isUpdating }]
  //   isLoading adını isUpdating olaraq dəyişdiririk — yuxarıdakı isLoading ilə qarışmasın.
  const [editProduct, { isLoading: isUpdating }] = useEditProductMutation();

  // Cari aktiv addım: 1, 2 və ya 3.
  // 1 → Ümumi məlumatlar
  // 2 → Texniki xüsusiyyətlər
  // 3 → Şəkil idarəetməsi
  const [step, setStep] = useState(1);

  // ════════════════════════════════════════
  // FORM STATE — bütün input sahələri
  // ════════════════════════════════════════
  //
  // NİYƏ HAMISI BİR YERDƏ?
  //   React-da "controlled input" — input-un dəyərini state idarə edir.
  //   Bütün sahələr bir state obyektindədir ki:
  //   - handleInputChange funksiyası tək yazılsın (hər sahə üçün ayrı useState yox)
  //   - FormData-ya çevirərkən Object.entries() ilə hamısını keçmək asan olsun
  //   - useEffect-də API məlumatı ilə bir dəfəyə doldurulsun
  //
  // Boş string default dəyərlər:
  //   API məlumatı gəlməmişdən əvvəl input-lar "uncontrolled" olmaqdan çəkinsin.
  //   Uncontrolled input → React xətası: "value prop on input should not be null"
  //
  // false → boolean checkbox sahələri üçün
  const [formData, setFormData] = useState({
    // ── Əsas sahələr (bütün kateqoriyalar üçün ortaq) ──
    name: '', price: '', description: '', category: '',
    seller: '', stock: '', ratings: '', color: '',

    // ── Telefon sahələri ──
    screenSize: '', storage: '', ram: '',
    frontCamera: '', backCamera: '', battery: '',
    processor: '', operatingSystem: '',

    // ── Laptop əlavə sahələri ──
    gpu: '', camera: '', batteryLife: '',
    colors: '', // Vergüllə ayrılmış string: "qırmızı, mavi, yaşıl"

    // ── Kamera sahələri ──
    resolution: '', opticalZoom: '', sensorType: '', imageStabilization: '',

    // ── Qulaqlıq sahələri ──
    connectivity: '',
    headphoneBatteryLife: '', // Telefon batteryLife-dan ayrıdır
    noiseCancellation: '',

    // ── Konsol sahələri (prefix ilə) ──
    cpu: '', consoleGPU: '', consoleStorage: '', memory: '',
    supportedResolution: '', consoleConnectivity: '',
    controllerIncluded: false, // boolean — checkbox üçün

    // ── iPad sahələri (prefix ilə) ──
    ipadScreenSize: '', ipadStorage: '', ipadRam: '',
    ipadBattery: '', ipadProcessor: '', ipadOperatingSystem: '',
    ipadCamera: '',
    cellular: false, // boolean — checkbox üçün

    // ── Sadə kateqoriya sahələri ──
    size: '', material: '', power: '', dimensions: '',
    volume: '', ingredients: '', weight: '', compatibility: '',
  });

  // Yeni seçilmiş şəkil faylları (hələ yüklənməmiş).
  // File obyektlərinin massivi — API-yə FormData vasitəsilə göndərilir.
  const [newImages, setNewImages] = useState([]);

  // Silinmək üçün işarələnmiş mövcud şəkillərin public_id-ləri.
  // Toggle məntiqi: eyni şəkilə ikinci dəfə bassanız işarə geri götürülür.
  // Backend bu ID-lərə görə Cloudinary-dən silir.
  const [removedImages, setRemovedImages] = useState([]);

  // Yeni şəkillərin önizləmə URL-ləri.
  // URL.createObjectURL(file) → lokal fayl üçün müvəqqəti URL yaradır.
  // Bu URL-lər yalnız bu sessiyada keçərlidir — server tərəfə getmir.
  const [newImagePreviews, setNewImagePreviews] = useState([]);


  // ════════════════════════════════════════
  // useEffect — API MƏLUMATı GƏLDİKDƏ FORMU DOLDUR
  // ════════════════════════════════════════
  //
  // NƏ EDIR:
  //   API sorğusu tamamlandıqda (data mövcud olduqda) form sahələrini doldurur.
  //   İlk render-də data hələ yoxdur (undefined) → setFormData çağırılmır.
  //   Sorğu bitdikdən sonra data gəlir → effect yenidən işləyir → form doldurulur.
  //
  // TƏHLÜKƏSİZLİK YOXLAMASI:
  //   Başqa satıcının məhsulunu redaktə etməyə cəhd edərsə,
  //   xəbərdarlıq göstərilir və /admin/products-a yönləndirilir.
  //   Bu frontend mühafizəsidir — backend-də də yoxlama olmalıdır.
  //
  // ASİLLİK MASSIVI [data, currentStoreName, navigate]:
  //   Bu dəyərlərdən biri dəyişdikdə effect yenidən işləyir.
  //   data → API sorğusu tamamlandıqda dəyişir (undefined → {product: {...}})
  useEffect(() => {
    if (data) {
      const p = data.product;

      // İcazə yoxlaması: məhsulun satıcısı cari satıcıdan fərqlidirsə
      if (p.seller && currentStoreName && p.seller !== currentStoreName) {
        Swal.fire({
          title: "İcazə yoxdur!",
          text: "Bu məhsul sizin mağazanıza aid deyil.",
          icon: "error",
          confirmButtonColor: "#E8192C"
        }).then(() => navigate("/admin/products"));
        return; // Form doldurma burada dayanır
      }

      // Form sahələrini API məlumatı ilə doldur.
      // || '' → null/undefined dəyərləri boş string-ə çevirir.
      //   Niyə? null dəyərli controlled input React-da xəta verir.
      // || false → boolean sahələr üçün (null → false)
      // p.colors?.join(", ") → ["qırmızı","mavi"] → "qırmızı, mavi"
      //   UI-da string kimi göstərilir, göndərərkən yenidən massivə çevrilir.
      setFormData({
        name:        p.name        || '',
        price:       p.price       || '',
        description: p.description || '',
        category:    p.category    || '',
        seller:      p.seller      || currentStoreName,
        stock:       p.stock       || '',
        ratings:     p.ratings     || '',
        color:       p.color       || '',

        // Telefon sahələri
        screenSize:      p.screenSize      || '',
        storage:         p.storage         || '',
        ram:             p.ram             || '',
        frontCamera:     p.frontCamera     || '',
        backCamera:      p.backCamera      || '',
        battery:         p.battery         || '',
        processor:       p.processor       || '',
        operatingSystem: p.operatingSystem || '',

        // Laptop sahələri
        gpu:         p.gpu         || '',
        camera:      p.camera      || '',
        batteryLife: p.batteryLife || '',
        // p.colors massivini vergüllə ayrılmış string-ə çevir
        // p.colors mövcud deyilsə boş string qal
        colors: p.colors ? p.colors.join(", ") : '',

        // Kamera sahələri
        resolution:         p.resolution         || '',
        opticalZoom:        p.opticalZoom         || '',
        sensorType:         p.sensorType         || '',
        imageStabilization: p.imageStabilization || '',

        // Qulaqlıq sahələri
        connectivity:         p.connectivity         || '',
        headphoneBatteryLife: p.headphoneBatteryLife || '',
        noiseCancellation:    p.noiseCancellation    || '',

        // Konsol sahələri
        cpu:                 p.cpu                 || '',
        consoleGPU:          p.consoleGPU          || '',
        consoleStorage:      p.consoleStorage      || '',
        memory:              p.memory              || '',
        supportedResolution: p.supportedResolution || '',
        consoleConnectivity: p.consoleConnectivity || '',
        controllerIncluded:  p.controllerIncluded  || false, // boolean

        // iPad sahələri
        ipadScreenSize:      p.ipadScreenSize      || '',
        ipadStorage:         p.ipadStorage         || '',
        ipadRam:             p.ipadRam             || '',
        ipadBattery:         p.ipadBattery         || '',
        ipadProcessor:       p.ipadProcessor       || '',
        ipadOperatingSystem: p.ipadOperatingSystem || '',
        ipadCamera:          p.ipadCamera          || '',
        cellular:            p.cellular            || false, // boolean

        // Sadə kateqoriya sahələri
        size:          p.size          || '',
        material:      p.material      || '',
        power:         p.power         || '',
        dimensions:    p.dimensions    || '',
        volume:        p.volume        || '',
        ingredients:   p.ingredients   || '',
        weight:        p.weight        || '',
        compatibility: p.compatibility || '',
      });
    }
  }, [data, currentStoreName, navigate]);


  // ════════════════════════════════════════
  // HADİSƏ İDARƏEDİCİLƏRİ
  // ════════════════════════════════════════

  // Adi input və textarea dəyişikliyi — hamısı bu tək funksiya ilə idarə olunur.
  // e.target.name  → input-un "name" atributu (formData-dakı açar adına uyğun olmalı)
  // e.target.type  → "checkbox" olarsa checked, digər hallarda value götürülür
  // Spread (...prev) → köhnə state saxlanır, yalnız dəyişən sahə yenilənir
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
      // [name] → computed property: dəyişən açar adı (JavaScript ES6+)
    }));
  };

  // Yeni şəkil faylları seçildikdə çağırılır.
  // İki paralel state yenilənir:
  //   newImages        → File obyektlərinin massivi (API-yə göndərmək üçün)
  //   newImagePreviews → Lokal önizləmə URL-ləri (UI-da göstərmək üçün)
  //
  // Array.from() → FileList obyektini (DOM API) adi JavaScript massivinə çevirir.
  // FileList-ə .map() birbaşa tətbiq edilmir.
  const handleNewImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    // URL.createObjectURL → fayl üçün müvəqqəti `blob:` URL yaradır
    // Bu URL-i <img src={...}> -ə verəndə brauzer faylı göstərir
    setNewImagePreviews(files.map(f => URL.createObjectURL(f)));
  };

  // Mövcud (serverdə olan) şəkli silinmək üçün işarələ/işarəni geri al (toggle).
  // imageId → Cloudinary-dəki public_id (məs. "brendex/products/abc123")
  //
  // .includes(imageId) → artıq siyahıdadırsa → siyahıdan çıxar (ləğv et)
  // yoxdursa           → siyahıya əlavə et (silinəcək kimi işarələ)
  const handleRemoveExistingImage = (imageId) => {
    if (removedImages.includes(imageId)) {
      // İşarəni geri götür — filter ilə həmin ID-ni çıxar
      setRemovedImages(removedImages.filter((id) => id !== imageId));
    } else {
      // İşarələ — spread ilə yeni ID-ni əlavə et
      setRemovedImages([...removedImages, imageId]);
    }
  };

  // Yeni seçilmiş (hələ yüklənməmiş) şəkili indeksə görə siyahıdan sil.
  // Həm File massivi, həm önizləmə URL massivi eyni anda yenilənir.
  // _ → filter callback-inin birinci parametri (dəyər) — istifadə etmirik, onu atırıq
  // i → cari elementin indeksi — yalnız bunu yoxlayırıq
  const handleRemoveNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
  };


  // ════════════════════════════════════════
  // FORM GÖNDƏRİLMƏSİ
  // ════════════════════════════════════════
  //
  // NİYƏ FormData?
  //   Şəkil faylları (binary data) JSON formatında göndərilə bilməz.
  //   FormData → multipart/form-data → həm mətn, həm fayl birlikdə göndərilir.
  //   Backend Multer middleware-i bu formatı emal edir.
  const handleSubmit = async (e) => {
    // Default HTML form göndərməsini (səhifə yenilənməsi) blokla
    e.preventDefault();

    const updatedData = new FormData();

    // Bütün form sahələrini FormData-ya əlavə et
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'colors' && typeof value === 'string') {
        // colors sahəsi xüsusi emal tələb edir:
        // "qırmızı, mavi, yaşıl" → ["qırmızı", "mavi", "yaşıl"]
        // .split(',') → vergülə görə böl
        // .map(s => s.trim()) → hər elementin başındakı/sonundakı boşluqları sil
        // .filter(s => s.length > 0) → boş string-ləri çıxar
        updatedData.append(key,
          value.split(',').map(s => s.trim()).filter(s => s.length > 0)
        );
      } else {
        updatedData.append(key, value);
      }
    });

    // Satıcı adını Redux-dan yaz — formdan deyil.
    // Niyə? Satıcı adı "readOnly" input-da göstərilir amma formData-dakı
    // seller sahəsi dəyişdirilmiş ola bilər (URL manipulyasiyası vs.).
    // .set() → əvvəl append edilmiş "seller" dəyərini üzərinə yazar.
    updatedData.set('seller', currentStoreName);

    // Yeni şəkil fayllarını əlavə et.
    // Hər fayl ayrıca "newImages" açarı ilə əlavə edilir.
    // Backend Multer bu açarı tanıyaraq şəkilləri emal edir.
    newImages.forEach((image) => updatedData.append("newImages", image));

    // Silinəcək mövcud şəkilləri JSON formatında göndər.
    // Backend bu public_id-lərə görə Cloudinary-dən silir.
    // JSON.stringify → JavaScript massivini JSON string-ə çevirir.
    if (removedImages.length > 0) {
      updatedData.append(
        "existingImages",
        JSON.stringify(removedImages.map(id => ({ public_id: id })))
      );
    }

    try {
      // RTK Query mutasiyasını çağır.
      // { id, formData: updatedData } → backend { id } ilə URL-i, { formData } ilə body-ni alır.
      // .unwrap() → uğurlu olsa dəyər, uğursuz olsa xəta atır (catch-ə düşür).
      await editProduct({ id, formData: updatedData }).unwrap();

      // Uğurlu redaktə:
      // 1. SweetAlert modalı göstər
      // 2. İstifadəçi "OK" bassandan sonra siyahıya qayıt + refetch
      Swal.fire({
        title: "Uğurlu! 🎉",
        text: "Məhsul uğurla yeniləndi!",
        icon: "success",
        confirmButtonColor: "#E8192C"
      }).then(() => {
        navigate("/admin/products"); // Admin məhsul siyahısına qayıt
        refetch();                   // Siyahını yenilə ki, yeni məlumat görünsün
      });

    } catch (err) {
      // Uğursuz redaktə — xəta mesajını göstər
      // err.data?.message → backend-in göndərdiyi xəta mesajı
      Swal.fire({
        title: "Xəta!",
        text: err.data?.message || "Məhsul yenilənmədi!",
        icon: "error",
        confirmButtonColor: "#E8192C"
      });
    }
  };


  // ════════════════════════════════════════
  // YÜKLƏMƏ VƏZİYYƏTİ
  // ════════════════════════════════════════
  // API sorğusu davam edərkən spinner göstərilir.
  // CSS animasiya @keyframes spin ilə yaradılır.
  if (isLoading) return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: "100vh", background: "#f6f6f7"
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        border: "4px solid #fdd",
        borderTopColor: "#E8192C", // Yalnız üst kənar qırmızı → fırlanma effekti
        animation: "spin 0.8s linear infinite"
      }} />
      <p style={{
        marginTop: 16, color: "#E8192C", fontWeight: 700,
        fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase"
      }}>Yüklənir...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ════════════════════════════════════════
  // XƏTA VƏZİYYƏTİ
  // ════════════════════════════════════════
  // API sorğusu uğursuz olduqda xəta mesajı göstərilir.
  if (error) return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", color: "#E8192C", fontSize: 18, fontWeight: 700
    }}>
      ❌ Xəta: {error.data?.message || error.message}
    </div>
  );


  // ════════════════════════════════════════
  // HESABLANMIŞ DƏYİŞKƏNLƏR
  // ════════════════════════════════════════

  // Cari kateqoriyaya uyğun texniki sahələr massivi.
  // formData.category → "Phones", "Laptops" və s.
  // SPEC_FIELDS["Phones"] → [{name: "screenSize", label: "Ekran Ölçüsü"}, ...]
  // || [] → naməlum kateqoriya olarsa boş massiv (heç bir sahə göstərilmir)
  const specFields = SPEC_FIELDS[formData.category] || [];

  // Seçilmiş kateqoriyanın tam obyekti — Addım 2-nin başlığında ikon+ad üçün.
  // CATEGORIES.find() → şərtə uyan ilk elementi tapır.
  // Heç biri tapılmasa undefined qaytarır (?.  ilə qorunur).
  const selectedCat = CATEGORIES.find(c => c.value === formData.category);

  // Wizard addımlarının məlumat massivi — addım göstəricisini render etmək üçün.
  // Burada tərif edilir ki, hər render-də yenidən yaradılmasın (performance).
  // Lakin komponent daxilindədir çünki Azərbaycanca label-lar lokallaşmaya lazım ola bilər.
  const STEPS = [
    { n: 1, label: "Ümumi" },
    { n: 2, label: "Texniki" },
    { n: 3, label: "Şəkillər" }
  ];


  // ════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════
  return (
    <div style={{
      minHeight: "100vh",
      background: "#f6f6f7",
      fontFamily: "'DM Sans','Segoe UI',sans-serif"
    }}>

      {/* ──────────────────────────────────────────────────────────
          QLOBAL CSS STİLLƏRİ + RESPONSİV BREAKPOINT-LƏR
          <style> teqi JSX içindədir çünki media query-lər
          inline stil ilə yazıla bilmir.
          CSS class-ları → birden çox elementdə eyni stil üçün.
      ────────────────────────────────────────────────────────── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* HEADER — qırmızı, sticky (scroll edərkən yuxarıda sabit) */
        .ep-header {
          background: #E8192C;
          padding: 0 40px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;  /* Yuxarıda sabit qalmaq üçün */
          top: 0;
          z-index: 30;       /* Digər elementlərin üstündə */
          box-shadow: 0 4px 20px rgba(232,25,44,0.25);
        }

        /* CONTENT — mərkəzlənmiş, maksimum 820px genişlik */
        .ep-content {
          max-width: 820px;
          margin: 0 auto;  /* Mərkəzləndirir */
          padding: 32px 20px;
          width: 100%;
        }

        /* SECTION — hər addımın ağ kart konteyneri */
        .ep-section {
          background: white;
          border-radius: 20px;
          padding: 28px;
          margin-bottom: 20px;
          box-shadow: 0 2px 14px rgba(0,0,0,0.05);
          border: 1px solid #f0f0f0;
          width: 100%;
        }

        /* GRID SİSTEMİ */
        .ep-grid2     { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .ep-span2     { grid-column: 1 / -1; }  /* Hər iki sütunu doldurur */
        .ep-spec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        /* KATEQORİYA GRİDİ — responsive auto-fill */
        .ep-cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 8px;
        }

        /* FOOTER DÜYMƏ DÜZÜLÜŞLƏRİ */
        /* Geri + İrəli → iki tərəfdə */
        .ep-footer-between {
          display: flex; justify-content: space-between;
          margin-top: 24px; gap: 10px; flex-wrap: wrap;
        }
        /* Yalnız bir düymə → sağda */
        .ep-footer-end {
          display: flex; justify-content: flex-end; margin-top: 24px;
        }

        /* ŞƏKİL GRID VƏ THUMBNAIL */
        .ep-img-grid  { display: flex; flex-wrap: wrap; gap: 10px; }
        .ep-img-thumb {
          width: 88px; height: 88px;
          object-fit: cover;  /* Şəkil konteynerə sığsın, kəsilsin */
          border-radius: 12px; display: block;
        }

        /* ADDIM GÖSTƏRİCİSİ */
        .ep-steps-wrapper {
          display: flex; align-items: center;
          justify-content: center; margin-bottom: 32px;
        }
        .ep-step-btn {
          width: 44px; height: 44px; border-radius: 50%; border: none;
          font-weight: 900; font-size: 14px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ep-step-label {
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap;
        }
        /* Addım düymələri arasındakı birləşdirici xətt */
        .ep-step-connector {
          width: 60px; height: 2px; margin: 0 10px;
          margin-bottom: 18px;  /* Düymə ilə hizalanma */
          border-radius: 2px; flex-shrink: 0;
        }

        /* BANNER — redaktə edilən məhsulun adı */
        .ep-banner {
          display: flex; align-items: center; gap: 10px;
          background: #fff0f1; border-radius: 14px; padding: 12px 18px;
          margin-bottom: 24px; border: 1.5px solid #fdd;
          flex-wrap: wrap; width: 100%;
        }

        /* ════════ TABLET (≤ 1024px) ════════ */
        @media (max-width: 1024px) {
          .ep-header  { padding: 0 24px; }
          .ep-content { padding: 24px 16px; }
          .ep-section { padding: 24px 20px; }
        }

        /* ════════ BÖYÜK MOBİL (≤ 768px) ════════ */
        @media (max-width: 768px) {
          .ep-header { padding: 0 14px; height: 56px; }
          .ep-brand-sub     { display: none !important; }  /* Alt yazı gizlənir */
          .ep-back-btn-text { display: none; }             /* "Geri" yazısı gizlənir */
          .ep-back-btn { padding: 7px 10px !important; }

          .ep-content { padding: 14px 10px; }
          .ep-section { padding: 18px 14px; border-radius: 16px; }

          /* 2 sütunlu layout → 1 sütuna keçir */
          .ep-grid2     { grid-template-columns: 1fr !important; }
          .ep-span2     { grid-column: 1 !important; }
          .ep-spec-grid { grid-template-columns: 1fr 1fr; gap: 10px; }

          .ep-cat-grid { grid-template-columns: repeat(auto-fill, minmax(78px, 1fr)); gap: 6px; }

          /* Addım göstəricisi kiçilir */
          .ep-step-btn       { width: 38px !important; height: 38px !important; font-size: 13px !important; }
          .ep-step-connector { width: 36px !important; margin: 0 6px; margin-bottom: 18px; }
          .ep-step-label     { font-size: 9px !important; }

          .ep-img-thumb { width: 72px !important; height: 72px !important; border-radius: 10px !important; }
          .ep-banner    { padding: 10px 12px; }
        }

        /* ════════ KİÇİK MOBİL (≤ 600px) ════════ */
        @media (max-width: 600px) {
          /* Texniki sahələr grid 2 sütun → 1 sütun */
          .ep-spec-grid { grid-template-columns: 1fr !important; }
        }

        /* ════════ KİÇİK TELEFONLAR (≤ 420px) ════════ */
        @media (max-width: 420px) {
          .ep-header { padding: 0 10px; height: 52px; }
          .ep-brand-title { font-size: 14px !important; }
          .ep-content { padding: 10px 8px; }
          .ep-section { padding: 14px 12px; border-radius: 14px; }

          /* Kateqoriya grid — 3 bərabər sütun */
          .ep-cat-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 5px; }

          /* Daha kiçik addım göstəricisi */
          .ep-step-connector { width: 22px !important; margin: 0 4px; margin-bottom: 18px; }
          .ep-step-btn       { width: 34px !important; height: 34px !important; font-size: 12px !important; }
          .ep-step-label     { font-size: 8px !important; }

          .ep-img-thumb { width: 60px !important; height: 60px !important; }

          /* Footer düymələri tam genişliyə keçir (şaquli düzülüş) */
          .ep-footer-between { flex-direction: column; }
          .ep-footer-between button { width: 100%; justify-content: center; }
          .ep-footer-end button     { width: 100%; justify-content: center; }
        }

        /* ════════ ÇOX KİÇİK (≤ 360px) ════════ */
        @media (max-width: 360px) {
          .ep-cat-grid    { grid-template-columns: repeat(3, 1fr) !important; }
          .ep-brand-title { font-size: 13px !important; }
          .ep-header-logo { width: 30px !important; height: 30px !important; }
        }
      `}</style>


      {/* ════════════════════════════════════════
          HEADER — Brend loqosu + Geri düyməsi
      ════════════════════════════════════════ */}
      <div className="ep-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Logo qutusu */}
          <div className="ep-header-logo" style={{
            width: 36, height: 36, background: "white", borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            <span style={{ color: "#E8192C", fontWeight: 900, fontSize: 18, lineHeight: 1 }}>B</span>
          </div>
          <div>
            <p className="ep-brand-title" style={{
              color: "white", fontWeight: 900, fontSize: 17,
              letterSpacing: "-0.01em", lineHeight: 1, margin: 0
            }}>BRENDEX</p>
            {/* ep-brand-sub → 768px-dən dar ekranda display:none ilə gizlənir */}
            <p className="ep-brand-sub" style={{
              color: "rgba(255,255,255,0.7)", fontSize: 10,
              letterSpacing: "0.12em", textTransform: "uppercase", margin: 0
            }}>Məhsulu Redaktə Et</p>
          </div>
        </div>

        {/* Geri düyməsi — admin məhsul siyahısına qayıdır
            ep-back-btn-text → mobil ekranda "Geri" yazısı gizlənir, yalnız ← qalır */}
        <button
          className="ep-back-btn"
          onClick={() => navigate("/admin/products")}
          style={{
            background: "rgba(255,255,255,0.15)", color: "white",
            border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: 10,
            padding: "7px 16px", fontWeight: 700, fontSize: 13,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 5
          }}>
          ←<span className="ep-back-btn-text"> Geri</span>
        </button>
      </div>


      <div className="ep-content">

        {/* ════════════════════════════════════════
            BANNER — Redaktə edilən məhsulun adı
            Yalnız məhsul adı mövcud olduqda render edilir (&&).
            data?.product?.name → data hələ yüklənməyibsə crash etmiz.
        ════════════════════════════════════════ */}
        {data?.product?.name && (
          <div className="ep-banner">
            <span style={{
              fontSize: 11, fontWeight: 800,
              textTransform: "uppercase", letterSpacing: "0.08em",
              color: "#E8192C", whiteSpace: "nowrap"
            }}>Redaktə edilir:</span>

            {/* Məhsulun adı — uzun adlar kəsilsin deyə wordBreak */}
            <span style={{
              fontSize: 14, fontWeight: 700, color: "#1a1a1a",
              flex: 1, minWidth: 0, wordBreak: "break-word"
            }}>{data.product.name}</span>

            {/* Qısa ID — son 6 simvol, böyük hərflə */}
            <span style={{ fontSize: 11, color: "#ccc", whiteSpace: "nowrap" }}>
              #{id.slice(-6).toUpperCase()}
            </span>

            {/* Mağaza adı — yalnız mövcuddursa göstər */}
            {currentStoreName && (
              <span style={{
                width: "100%", fontSize: 12,
                color: "#E8192C", fontWeight: 600, marginTop: 4
              }}>
                🏪 {currentStoreName}
              </span>
            )}
          </div>
        )}


        {/* ════════════════════════════════════════
            ADDIM GÖSTƏRİCİSİ (WIZARD STEPPER)
            3 addım: Ümumi → Texniki → Şəkillər
            İstifadəçi istənilən addıma birbaşa keçə bilər (onClick → setStep).
            Tamamlanmış addımlarda rəqəm əvəzinə ✓ göstərilir.
        ════════════════════════════════════════ */}
        <div className="ep-steps-wrapper">
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
              {/* Hər addım: dairəvi düymə + altındakı etiket */}
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 4
              }}>
                <button
                  type="button"
                  onClick={() => setStep(s.n)} // Birbaşa addıma keçid
                  className="ep-step-btn"
                  style={{
                    // Aktiv addım → qırmızı + kölgə
                    // Tamamlanmış addım → qırmızı (kölgəsiz)
                    // Gələcək addım → boz
                    background: step === s.n ? "#E8192C" : step > s.n ? "#E8192C" : "#f0f0f0",
                    color: step >= s.n ? "white" : "#bbb",
                    boxShadow: step === s.n ? "0 4px 14px rgba(232,25,44,0.35)" : "none"
                  }}>
                  {/* Tamamlanmış addımda rəqəm → ✓ */}
                  {step > s.n ? "✓" : s.n}
                </button>
                {/* Addım adı etiketi */}
                <span className="ep-step-label" style={{
                  color: step === s.n ? "#E8192C" : "#bbb"
                }}>{s.label}</span>
              </div>

              {/* Addımlar arası birləşdirici xətt — son addımdan sonra göstərilmir */}
              {i < STEPS.length - 1 && (
                <div className="ep-step-connector" style={{
                  // Tamamlanmış addımdan sonrakı xətt → qırmızı, digərləri boz
                  background: step > s.n ? "#E8192C" : "#f0f0f0"
                }} />
              )}
            </div>
          ))}
        </div>


        {/* encType="multipart/form-data" — şəkil faylları olan formda MÜTLƏQ lazımdır.
            Bu olmasa brauzer faylları göndərə bilmir (JSON formatı faylları dəstəkləmir). */}
        <form onSubmit={handleSubmit} encType="multipart/form-data">

          {/* ════════════════════════════════════════
              ADDIM 1: ÜMUMİ MƏLUMATLAR
              Ad, qiymət, stok, satıcı, rating, kateqoriya, açıqlama
          ════════════════════════════════════════ */}
          {step === 1 && (
            <div className="ep-section">
              <h2 style={{
                fontSize: 17, fontWeight: 900, color: "#1a1a1a",
                marginTop: 0, marginBottom: 22,
                paddingBottom: 14, borderBottom: "1px solid #f5f5f5"
              }}>Ümumi Məlumatlar</h2>

              {/* ep-grid2 → 2 sütunlu layout (mobilde 1 sütuna keçir) */}
              <div className="ep-grid2">

                {/* Məhsul adı — ep-span2 ilə hər iki sütunu tutur (tam genişlik) */}
                <div className="ep-span2">
                  <label style={labelStyle}>Məhsul Adı *</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Məhsulun adı"
                    required
                    style={inputStyle}
                    // onFocus/onBlur → fokus zamanı border rəngini dəyişdir
                    onFocus={e => e.target.style.borderColor = "#E8192C"}
                    onBlur={e => e.target.style.borderColor = "#f0f0f0"}
                  />
                </div>

                {/* Qiymət + Stok — yan-yana (hər biri 1 sütun) */}
                <div>
                  <label style={labelStyle}>Qiymət (₼) *</label>
                  <input
                    name="price" type="number" value={formData.price}
                    onChange={handleInputChange} placeholder="0.00" required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#E8192C"}
                    onBlur={e => e.target.style.borderColor = "#f0f0f0"}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Stok *</label>
                  <input
                    name="stock" type="number" value={formData.stock}
                    onChange={handleInputChange} placeholder="0" required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#E8192C"}
                    onBlur={e => e.target.style.borderColor = "#f0f0f0"}
                  />
                </div>

                {/* Satıcı adı — oxunmaz (readOnly).
                    Redux-dan gəlir, istifadəçi dəyişə bilməz.
                    cursor: not-allowed → siçan işarəsi dəyişir (UI hint) */}
                <div>
                  <label style={labelStyle}>Satıcı (Avtomatik)</label>
                  <input
                    value={currentStoreName}
                    readOnly
                    style={{ ...inputStyle, background: "#fafafa", color: "#bbb", cursor: "not-allowed" }}
                  />
                </div>

                {/* Rating — ixtiyari, 0-5 arası, 0.1 addımla */}
                <div>
                  <label style={labelStyle}>Rating (0-5)</label>
                  <input
                    name="ratings" type="number" step="0.1" min="0" max="5"
                    value={formData.ratings} onChange={handleInputChange} placeholder="4.5"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#E8192C"}
                    onBlur={e => e.target.style.borderColor = "#f0f0f0"}
                  />
                </div>

                {/* Kateqoriya seçimi — tam genişlik, grid düymələri
                    Seçilmiş kateqoriya: qırmızı kənar + açıq qırmızı fon */}
                <div className="ep-span2">
                  <label style={labelStyle}>Kateqoriya *</label>
                  <div className="ep-cat-grid">
                    {CATEGORIES.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button" // form-u submit etməsin
                        onClick={() => setFormData(p => ({ ...p, category: value }))}
                        style={{
                          display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center",
                          padding: "10px 6px", borderRadius: 10,
                          // Seçilmişdirsə qırmızı kənar, deyilsə boz kənar
                          border: `2px solid ${formData.category === value ? "#E8192C" : "#f0f0f0"}`,
                          background: formData.category === value ? "#fff0f1" : "white",
                          color: formData.category === value ? "#E8192C" : "#bbb",
                          cursor: "pointer", gap: 5, transition: "all 0.15s"
                        }}>
                        <Icon size={16} />
                        <span style={{ fontSize: 9, fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Açıqlama — tam genişlik, çox sətirli textarea */}
                <div className="ep-span2">
                  <label style={labelStyle}>Açıqlama *</label>
                  <textarea
                    name="description" value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Məhsulun ətraflı açıqlaması"
                    required rows={4}
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                    onFocus={e => e.target.style.borderColor = "#E8192C"}
                    onBlur={e => e.target.style.borderColor = "#f0f0f0"}
                  />
                </div>
              </div>

              {/* İrəli düyməsi — ad, qiymət, kateqoriya doldurulmayıbsa disabled.
                  opacity: 0.4 → disabled görünüş (cursor dəyişmir amma klikləmək olmur) */}
              <div className="ep-footer-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.name || !formData.price || !formData.category}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "11px 26px", borderRadius: 11,
                    border: "none", background: "#E8192C", color: "white",
                    fontWeight: 800, fontSize: 13, cursor: "pointer",
                    opacity: (!formData.name || !formData.price || !formData.category) ? 0.4 : 1,
                    boxShadow: "0 4px 14px rgba(232,25,44,0.3)"
                  }}>
                  Texniki Xüsusiyyətlər <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}


          {/* ════════════════════════════════════════
              ADDIM 2: TEXNİKİ XÜSUSİYYƏTLƏR
              Seçilmiş kateqoriyaya görə dinamik sahələr.
              SPEC_FIELDS-dən gəlir — hər kateqoriyanın öz sahələri var.
          ════════════════════════════════════════ */}
          {step === 2 && (
            <div className="ep-section">
              {/* Başlıqda seçilmiş kateqoriyanın ikonu + adı */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                marginBottom: 22, paddingBottom: 14, borderBottom: "1px solid #f5f5f5"
              }}>
                {/* selectedCat?.icon → selectedCat null/undefined olarsa crash etmir */}
                {selectedCat && <selectedCat.icon size={18} color="#E8192C" />}
                <h2 style={{ fontSize: 17, fontWeight: 900, color: "#1a1a1a", margin: 0 }}>
                  {selectedCat?.label || "Kateqoriya"} — Texniki
                </h2>
              </div>

              {/* Sahələr varsa grid render et, yoxdursa boş vəziyyət mesajı */}
              {specFields.length > 0 ? (
                <div className="ep-spec-grid">
                  {specFields.map((field) => (
                    <div
                      key={field.name}
                      // Checkbox sahələri tam genişlik tutur (grid-column: 1 / -1)
                      style={field.type === "checkbox" ? { gridColumn: "1 / -1" } : {}}
                    >
                      {field.type === "checkbox" ? (
                        /* ── Xüsusi Checkbox UI ──
                           Standart checkbox çirkin görünür.
                           Gizli <input type="checkbox"> + vizual div kombinasiyası.
                           Label-a basılanda gizli input aktivləşir → onChange çağırılır. */
                        <label style={{
                          display: "flex", alignItems: "center", gap: 10,
                          cursor: "pointer", padding: "12px 14px",
                          background: "#fafafa", borderRadius: 10, border: "1.5px solid #f0f0f0"
                        }}>
                          {/* Vizual checkbox qutusu — əsl input deyil, yalnız görünüş */}
                          <div style={{
                            width: 20, height: 20, borderRadius: 5,
                            border: `2px solid ${formData[field.name] ? "#E8192C" : "#ddd"}`,
                            background: formData[field.name] ? "#E8192C" : "white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0
                          }}>
                            {/* Seçildikdə ağ ✓ göstər */}
                            {formData[field.name] && (
                              <span style={{ color: "white", fontSize: 11, fontWeight: 900 }}>✓</span>
                            )}
                          </div>
                          {/* Əsl checkbox — gizli, amma funksional */}
                          <input
                            type="checkbox"
                            name={field.name}
                            checked={formData[field.name]}
                            onChange={handleInputChange}
                            style={{ display: "none" }} // Görünməz amma DOM-da var
                          />
                          <span style={{ fontWeight: 700, color: "#1a1a1a", fontSize: 13 }}>
                            {field.label}
                          </span>
                        </label>
                      ) : (
                        /* ── Adi Mətn Input-u ── */
                        <>
                          <label style={labelStyle}>{field.label}</label>
                          <input
                            name={field.name}
                            value={formData[field.name] || ""}
                            onChange={handleInputChange}
                            placeholder={field.label}
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = "#E8192C"}
                            onBlur={e => e.target.style.borderColor = "#f0f0f0"}
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // Kateqoriya üçün texniki sahə yoxdursa
                <p style={{ textAlign: "center", color: "#ccc", padding: "30px 0", fontSize: 13 }}>
                  Bu kateqoriya üçün əlavə sahə yoxdur.
                </p>
              )}

              {/* Geri + İrəli düymələri */}
              <div className="ep-footer-between">
                <button type="button" onClick={() => setStep(1)} style={{
                  padding: "11px 22px", borderRadius: 11,
                  border: "1.5px solid #f0f0f0", background: "white",
                  color: "#aaa", fontWeight: 700, fontSize: 13, cursor: "pointer"
                }}>← Geri</button>

                <button type="button" onClick={() => setStep(3)} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "11px 26px", borderRadius: 11, border: "none",
                  background: "#E8192C", color: "white", fontWeight: 800,
                  fontSize: 13, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(232,25,44,0.3)"
                }}>Şəkillər <ChevronRight size={15} /></button>
              </div>
            </div>
          )}


          {/* ════════════════════════════════════════
              ADDIM 3: ŞƏKİL İDARƏETMƏSİ
              Mövcud şəkillər: sil/bərpa et (toggle)
              Yeni şəkillər: seç və önizlə
              Submit düyməsi bu addımdadır
          ════════════════════════════════════════ */}
          {step === 3 && (
            <div className="ep-section">
              <h2 style={{
                fontSize: 17, fontWeight: 900, color: "#1a1a1a",
                marginTop: 0, marginBottom: 22,
                paddingBottom: 14, borderBottom: "1px solid #f5f5f5"
              }}>Şəkil İdarəetməsi</h2>

              {/* Mövcud şəkillər bölməsi — yalnız şəkil varsa render edilir */}
              {data?.product?.images?.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{
                    fontSize: 11, fontWeight: 800, textTransform: "uppercase",
                    letterSpacing: "0.08em", color: "#aaa", marginBottom: 12
                  }}>Mövcud Şəkillər</p>

                  <div className="ep-img-grid">
                    {data.product.images.map((img) => {
                      // Şəklin unikal identifikatoru.
                      // Backend formata görə public_id və ya id açarı istifadə oluna bilər.
                      const imageId = img.public_id || img.id;

                      // Bu şəkil silinmək üçün işarələnibmi?
                      const isRemoved = removedImages.includes(imageId);

                      return (
                        <div key={imageId} style={{
                          position: "relative",
                          // Silinəcək şəkil solğun görünür (opacity azalır)
                          opacity: isRemoved ? 0.35 : 1,
                          transition: "opacity 0.2s"
                        }}>
                          <img
                            src={img.url} alt={formData.name}
                            className="ep-img-thumb"
                            style={{
                              // Silinəcəksə qırmızı kənar, normal isə çəhrayı kənar
                              border: `2px solid ${isRemoved ? "#E8192C" : "#f0e8e9"}`
                            }}
                          />

                          {/* Silmə/Bərpa düyməsi — şəklin yuxarı sağ küncündə.
                              position: absolute → şəkilin üzərindədir.
                              isRemoved === true → yaşıl (bərpa et)
                              isRemoved === false → qırmızı (sil) */}
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(imageId)}
                            style={{
                              position: "absolute", top: -6, right: -6,
                              width: 22, height: 22, borderRadius: "50%",
                              background: isRemoved ? "#22c55e" : "#E8192C",
                              border: "2px solid white", // Ağ kənar — şəkil fonundan ayrılsın
                              display: "flex", alignItems: "center",
                              justifyContent: "center", cursor: "pointer"
                            }}>
                            <FaTrash size={9} color="white" />
                          </button>

                          {/* "Silinəcək" overlay-i — işarələnmiş şəkilin üstündə.
                              position: absolute + inset: 0 → şəkili tam örtür */}
                          {isRemoved && (
                            <div style={{
                              position: "absolute", inset: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              background: "rgba(0,0,0,0.5)", // Yarı şəffaf qara pərdə
                              borderRadius: 12
                            }}>
                              <span style={{
                                color: "white", fontWeight: 800,
                                fontSize: 9, textTransform: "uppercase"
                              }}>Silinəcək</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Yeni şəkil yükləmə zonası.
                  Əsl <input type="file"> gizlədilir.
                  <label htmlFor="file-upload"> → kliklənəndə input aktivləşir.
                  Bu texnika özelleştirilmiş fayl seçim UI yaratmağa imkan verir. */}
              <label htmlFor="file-upload" style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 10, padding: "32px 20px",
                border: "2px dashed #fcc", // Kəsik kənar → "buraya yüklə" mesajı
                borderRadius: 16, cursor: "pointer", background: "#fafafa"
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "#fff0f1", display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  <FaUpload size={18} color="#E8192C" />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 800, color: "#1a1a1a", fontSize: 14, margin: "0 0 3px" }}>
                    Yeni Şəkillər Yüklə
                  </p>
                  <p style={{ color: "#bbb", fontSize: 11, margin: 0 }}>JPG, PNG, WEBP</p>
                </div>
                {/* Əsl input — gizli amma funksional.
                    multiple → birdən çox fayl seçməyə imkan verir.
                    accept="image/*" → yalnız şəkil faylları göstərilir (PDF, DOC yox). */}
                <input
                  type="file"
                  multiple
                  onChange={handleNewImagesChange}
                  name="newImages"
                  id="file-upload"
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </label>

              {/* Yeni seçilmiş şəkillərin önizləməsi.
                  Yalnız ən azı 1 şəkil seçilibsə render edilir. */}
              {newImagePreviews.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <p style={{
                    fontSize: 11, fontWeight: 800, textTransform: "uppercase",
                    letterSpacing: "0.08em", color: "#aaa", marginBottom: 10
                  }}>
                    {newImagePreviews.length} yeni şəkil seçildi
                  </p>
                  <div className="ep-img-grid">
                    {newImagePreviews.map((preview, index) => (
                      <div key={index} style={{ position: "relative" }}>
                        {/* URL.createObjectURL ilə yaradılmış lokal önizləmə.
                            Server tərəfinə getmir — yalnız brauzerdə görünür. */}
                        <img
                          src={preview} alt={`Yeni ${index + 1}`}
                          className="ep-img-thumb"
                          style={{ border: "2px solid #fdd" }}
                        />
                        {/* Silmə düyməsi — bu yeni şəkili siyahıdan çıxar */}
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          style={{
                            position: "absolute", top: -6, right: -6,
                            width: 22, height: 22, borderRadius: "50%",
                            background: "#E8192C", border: "2px solid white",
                            display: "flex", alignItems: "center",
                            justifyContent: "center", cursor: "pointer"
                          }}>
                          <FaTrash size={9} color="white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer: Geri (Addım 2-yə) + Submit düyməsi */}
              <div className="ep-footer-between">
                <button type="button" onClick={() => setStep(2)} style={{
                  padding: "11px 22px", borderRadius: 11,
                  border: "1.5px solid #f0f0f0", background: "white",
                  color: "#aaa", fontWeight: 700, fontSize: 13, cursor: "pointer"
                }}>← Geri</button>

                {/* Submit düyməsi — yeniləmə gedərkən:
                    - disabled → iki dəfə klik qarşısını alır
                    - boz fon → vizual disabled göstərgəsi
                    - spinner → istifadəçiyə proses getdiyini bildirir */}
                <button
                  type="submit"
                  disabled={isUpdating}
                  style={{
                    padding: "13px 34px", borderRadius: 11, border: "none",
                    // Yeniləmə gedərkən boz fon, əks halda gradient
                    background: isUpdating
                      ? "#f0f0f0"
                      : "linear-gradient(135deg, #E8192C 0%, #ff4f61 100%)",
                    color: isUpdating ? "#aaa" : "white",
                    fontWeight: 900, fontSize: 14,
                    cursor: isUpdating ? "not-allowed" : "pointer",
                    boxShadow: isUpdating ? "none" : "0 6px 20px rgba(232,25,44,0.35)",
                    display: "flex", alignItems: "center", gap: 8
                  }}>
                  {isUpdating ? (
                    // Yeniləmə gedərkən spinner + mətn
                    <>
                      <div style={{
                        width: 16, height: 16, borderRadius: "50%",
                        border: "3px solid #ddd",
                        borderTopColor: "#E8192C",
                        animation: "spin 0.8s linear infinite"
                      }} />
                      Yenilənir...
                    </>
                  ) : (
                    "✓ Məhsulu Yenilə"
                  )}
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};

// Default export — başqa fayllarda belə import edilir:
// import EditProduct from "./EditProduct"
export default EditProduct;