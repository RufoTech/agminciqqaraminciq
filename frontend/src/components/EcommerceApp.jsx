// ============================================================
// EcommerceApp.jsx  (Shop Səhifəsi)
// Bu komponent məhsulları filtrləyib sıralayan əsas mağaza
// səhifəsidir. RTK Query ilə məhsulları çəkir, dinamik
// filterlər qurur, səhifələmə (pagination) tətbiq edir.
// ============================================================

"use client";

import { useState, useEffect } from "react";
// Axtarış, filter, səhifələmə ikonları
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
// Hər bir məhsulu render edən ayrıca komponent
import ProductCard from "./ProductCard";
// Toast bildirişlər üçün kitabxana
import { toast } from "react-hot-toast";

// RTK Query hook-ları:
// useGetProductsQuery — bütün məhsulları çəkmək üçün (filter seçimləri üçün istifadə olunur)
// useGetFilteredProductsQuery — seçilmiş filterlərə uyğun məhsulları çəkmək üçün
import { useGetProductsQuery, useGetFilteredProductsQuery } from "../redux/api/productsApi";

// ============================================================
// Button — yenidən istifadə edilə bilən düymə komponenti
// variant: düymənin vizual növü (primary, outline, ghost, pagination...)
// size: ölçüsü (sm, md, lg)
// ============================================================
const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props  // qalan bütün HTML atributları (onClick, disabled və s.)
}) => {
  // Bütün variantlarda ortaq olan əsas stillər
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Hər variant üçün ayrı Tailwind class-ları
  const variants = {
    primary: "bg-gray-900 text-white hover:bg-black focus:ring-gray-500 shadow-sm hover:shadow-md",
    outline: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-300 shadow-sm hover:shadow-md",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
    pagination: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-300",
    paginationActive: "bg-gray-900 text-white border-gray-900 hover:bg-black focus:ring-gray-500",
  };

  // Hər ölçü üçün padding/font class-ları
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// ============================================================
// Slider — xüsusi qiymət aralığı seçmə komponenti
// min/max: minimum və maksimum dəyər
// value: xaricdən idarə olunan dəyər (controlled)
// defaultValue: başlanğıc dəyər (uncontrolled rejim üçün)
// onChange: dəyər dəyişdikdə çağırılan callback
// ============================================================
const Slider = ({
  min,
  max,
  step = 1,
  value: controlledValue,
  defaultValue = min,
  onChange,
}) => {
  // Daxili state — yalnız xaricdən dəyər verilmədikdə istifadə olunur
  const [internalValue, setInternalValue] = useState(defaultValue);

  // Controlled rejim varsa xarici dəyər, yoxsa daxili dəyər istifadə olunur
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    // Controlled rejim deyilsə, daxili state-i yeniləyirik
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    // Hər iki halda xarici callback çağırılır
    if (onChange) {
      onChange(newValue);
    }
  };

  // Doldurulmuş hissənin faizini hesablayırıq (CSS width üçün)
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative w-full h-6">
      {/* Arxa fon — boz boş zolaq */}
      <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 rounded-full transform -translate-y-1/2">
        {/* Doldurulmuş (aktiv) hissə — qara zolaq */}
        <div
          className="absolute top-0 left-0 h-full bg-gray-900 rounded-full transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Şəffaf real range input — istifadəçi bu hissə ilə qarşılıqlı əlaqəyə girir */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
      />

      {/* Görünən sürüşdürmə dairəsi (thumb) — CSS ilə mövqeyi hesablanır */}
      <div
        className="absolute top-1/2 w-5 h-5 bg-gray-900 border-2 border-white rounded-full shadow-lg transform -translate-y-1/2 transition-all duration-200 hover:scale-110"
        style={{ left: `calc(${percentage}% - 10px)` }}
      />
    </div>
  );
};

// ============================================================
// Checkbox — etiketli xüsusi checkbox komponenti
// label: yanında göstəriləcək mətn
// ...props: checked, onChange və s. HTML atributları
// ============================================================
const Checkbox = ({ label, ...props }) => {
  return (
    // label tagi sayəsində checkbox-un yanına tıklamaq da seçimi dəyişir
    <label className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
      <input
        type="checkbox"
        className="form-checkbox h-4 w-4 text-gray-900 rounded border-gray-300 focus:ring-gray-900 transition-colors duration-200"
        {...props}
      />
      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200 font-medium">
        {label}
      </span>
    </label>
  );
};

// ============================================================
// Pagination — səhifə nömrəsi naviqasiyası komponenti
// currentPage: hal-hazırki aktiv səhifə
// totalPages: ümumi səhifə sayı
// onPageChange: səhifə dəyişdikdə çağırılan callback
// ============================================================
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];

  // Göstəriləcək səhifə nömrələrini müəyyən edirik
  // Qaydalar: ilk, son, cari ±1 səhifə həmişə göstərilir
  // Aradakı boşluqlar "..." ilə əvəz olunur
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||                              // həmişə ilk səhifə
      i === totalPages ||                     // həmişə son səhifə
      (i >= currentPage - 1 && i <= currentPage + 1)  // cari ətrafındakı 2 səhifə
    ) {
      pages.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      // Boşluq varsa "..." əlavə edirik
      pages.push("...");
    }
  }

  // Eyni dəyərli elementləri (məs. ardıcıl "...") filtriləyirik
  const uniquePages = pages.filter((page, index) => pages.indexOf(page) === index);

  return (
    <div className="flex items-center justify-center space-x-2 mt-12 flex-wrap gap-y-2">
      {/* "Əvvəlki" düyməsi — birinci səhifədə deaktiv olur */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm"
      >
        <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      {/* Nömrəli səhifə düymələri */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        {uniquePages.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            // "..." tıklana bilməz
            disabled={page === "..."}
            className={`min-w-[36px] sm:min-w-[44px] h-9 sm:h-10 px-2 sm:px-3 rounded-lg font-semibold transition-all duration-200 border text-sm ${
              page === currentPage
                ? "bg-gray-900 text-white border-gray-900 shadow-md"   // aktiv səhifə
                : page === "..."
                ? "text-gray-400 cursor-default border-transparent"    // ellipsis
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"  // passiv səhifə
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* "Növbəti" düyməsi — son səhifədə deaktiv olur */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-sm"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4 ml-1 sm:ml-2" />
      </Button>
    </div>
  );
};

// ============================================================
// EcommerceApp — Əsas Mağaza Komponenti
// ============================================================
const EcommerceApp = () => {
  // ── QİYMƏT FİLTERİ STATE-LƏRİ ──
  const [priceMin, setPriceMin] = useState(0);      // minimum qiymət həddi
  const [priceMax, setPriceMax] = useState(5000);   // maksimum qiymət həddi

  // ── ÇOXLU SEÇİM FİLTERLƏRİ ──
  // Hər biri seçilmiş dəyərlərin massivini saxlayır
  const [selectedCategories, setSelectedCategories] = useState([]);    // kateqoriyalar
  const [selectedBrands, setSelectedBrands] = useState([]);            // brendlər (seller)
  const [selectedMemory, setSelectedMemory] = useState([]);            // RAM
  const [selectedColors, setSelectedColors] = useState([]);            // rənglər
  const [selectedScreenSizes, setSelectedScreenSizes] = useState([]);  // ekran ölçüsü
  const [selectedStorage, setSelectedStorage] = useState([]);          // yaddaş
  const [selectedBatteries, setSelectedBatteries] = useState([]);      // batareya
  const [selectedProcessors, setSelectedProcessors] = useState([]);    // prosessor

  // ── SƏHİFƏLƏMƏ STATE-LƏRİ ──
  const [currentPage, setCurrentPage] = useState(1);      // hal-hazırki aktiv səhifə
  const [itemsPerPage] = useState(9);                      // hər səhifədə neçə məhsul göstərilsin

  // ── GENİŞLƏNMİŞ BÖLMƏLƏR ──
  // Sidebar-da hansı filter bölmələrinin açıq (genişlənmiş) olduğunu saxlayır
  // Başlanğıcda hamısı açıqdır
  const [expandedSections, setExpandedSections] = useState([
    "category", "brand", "memory", "screenSize",
    "storage", "battery", "processor", "color",
  ]);

  // ── MOBİL FİLTER PANELİ ──
  // true olduqda mobil bottom sheet açılır
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // ── API SORĞULARI ──
  // Bütün məhsulları çəkirik — filter seçimləri (checkbox-lar) üçün dinamik siyahılar yaratmaq məqsədilə
  const { data: allData, isError: isAllError, error: allError } =
    useGetProductsQuery();

  // Ümumi sorğu xətası bildirişi
  useEffect(() => {
    if (isAllError) {
      console.log(allError);
      toast.error(allError?.data?.message || "Bir xəta baş verdi.");
    }
  }, [isAllError, allError]);

  // Səhifə dəyişdikdə yuxarıya sürüşdürür (istifadəçi yeni məhsulları yuxarıdan görür)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // ── DİNAMİK FİLTER SİYAHILARININ HAZIRLANMASI ──
  // API-dən gələn bütün məhsullar əsasında unikal dəyərlər çıxarılır

  // Kateqoriyaları saymaq: { "Telefon": 12, "Noutbuk": 5, ... }
  const categoryObj = allData?.products?.reduce((acc, product) => {
    const cat = product.category;
    if (cat) {
      acc[cat] = (acc[cat] || 0) + 1;
    }
    return acc;
  }, {});
  // Obyekti massivə çeviririk: [{ name: "Telefon", count: 12 }, ...]
  const dynamicCategories = categoryObj
    ? Object.entries(categoryObj).map(([name, count]) => ({ name, count }))
    : [];

  // Kateqoriya seçilmişsə yalnız o kateqoriyaya uyğun məhsullar üzərindən
  // brend, RAM, rəng və s. siyahılar hesablanır. Bu UX-i daha dəqiq edir.
  const filteredProductsForFilters =
    selectedCategories.length > 0
      ? allData?.products?.filter((product) =>
          selectedCategories.includes(product.category)
        )
      : allData?.products;

  // Brendlər (seller) siyahısını dinamik hesablayırıq
  const brandObj = filteredProductsForFilters?.reduce((acc, product) => {
    const seller = product.seller;
    if (seller) {
      acc[seller] = (acc[seller] || 0) + 1;
    }
    return acc;
  }, {});
  const dynamicBrands = brandObj
    ? Object.entries(brandObj).map(([name, count]) => ({ name, count }))
    : [];

  // RAM siyahısını dinamik hesablayırıq
  const memoryObj = filteredProductsForFilters?.reduce((acc, product) => {
    const mem = product.ram;
    if (mem) {
      acc[mem] = (acc[mem] || 0) + 1;
    }
    return acc;
  }, {});
  const dynamicMemory = memoryObj
    ? Object.entries(memoryObj).map(([size, count]) => ({ size, count }))
    : [];

  // Rəng siyahısını dinamik hesablayırıq
  const colorObj = filteredProductsForFilters?.reduce((acc, product) => {
    const clr = product.color;
    if (clr) {
      acc[clr] = (acc[clr] || 0) + 1;
    }
    return acc;
  }, {});
  const dynamicColors = colorObj
    ? Object.entries(colorObj).map(([name, count]) => ({ name, count }))
    : [];

  // Ekran ölçüsü siyahısını dinamik hesablayırıq
  const screenSizeObj = filteredProductsForFilters?.reduce((acc, product) => {
    const size = product.screenSize;
    if (size) {
      acc[size] = (acc[size] || 0) + 1;
    }
    return acc;
  }, {});
  const dynamicScreenSizes = screenSizeObj
    ? Object.entries(screenSizeObj).map(([name, count]) => ({ name, count }))
    : [];

  // Yaddaş siyahısını dinamik hesablayırıq
  const storageObj = filteredProductsForFilters?.reduce((acc, product) => {
    const st = product.storage;
    if (st) {
      acc[st] = (acc[st] || 0) + 1;
    }
    return acc;
  }, {});
  const dynamicStorage = storageObj
    ? Object.entries(storageObj).map(([name, count]) => ({ name, count }))
    : [];

  // Batareya siyahısını dinamik hesablayırıq
  const batteryObj = filteredProductsForFilters?.reduce((acc, product) => {
    const bat = product.battery;
    if (bat) {
      acc[bat] = (acc[bat] || 0) + 1;
    }
    return acc;
  }, {});
  const dynamicBatteries = batteryObj
    ? Object.entries(batteryObj).map(([name, count]) => ({ name, count }))
    : [];

  // Prosessor siyahısını dinamik hesablayırıq
  const processorObj = filteredProductsForFilters?.reduce((acc, product) => {
    const proc = product.processor;
    if (proc) {
      acc[proc] = (acc[proc] || 0) + 1;
    }
    return acc;
  }, {});
  const dynamicProcessors = processorObj
    ? Object.entries(processorObj).map(([name, count]) => ({ name, count }))
    : [];

  // ── FİLTER DATA OBYEKTİ ──
  // Bütün filterləri bir yerdə idarə etmək üçün vahid struktur.
  // Bu obyekt sayəsində sidebar bölmələrini dövr ilə render etmək mümkündür.
  const filterData = {
    category: {
      label: "Category",
      items: dynamicCategories,      // kateqoriya siyahısı
      selected: selectedCategories,  // seçilmiş kateqoriyalar
      setSelected: setSelectedCategories,
    },
    brand: {
      label: "Brand",
      items: dynamicBrands,
      selected: selectedBrands,
      setSelected: setSelectedBrands,
    },
    memory: {
      label: "RAM",
      items: dynamicMemory,
      selected: selectedMemory,
      setSelected: setSelectedMemory,
    },
    screenSize: {
      label: "Screen Size",
      items: dynamicScreenSizes,
      selected: selectedScreenSizes,
      setSelected: setSelectedScreenSizes,
    },
    storage: {
      label: "Storage",
      items: dynamicStorage,
      selected: selectedStorage,
      setSelected: setSelectedStorage,
    },
    battery: {
      label: "Battery",
      items: dynamicBatteries,
      selected: selectedBatteries,
      setSelected: setSelectedBatteries,
    },
    processor: {
      label: "Processor",
      items: dynamicProcessors,
      selected: selectedProcessors,
      setSelected: setSelectedProcessors,
    },
    color: {
      label: "Color",
      items: dynamicColors,
      selected: selectedColors,
      setSelected: setSelectedColors,
    },
  };

  // ── API SORĞUSU ÜÇÜN FILTER PARAMETRLƏRİ ──
  // Seçilmiş dəyərləri vergüllə birləşdirib API-yə göndəririk
  // Boş massivlər undefined olaraq göndərilir (API-yə lazımsız parametr getməsin)
  const filterParams = {
    priceMin,
    priceMax,
    category: selectedCategories.length ? selectedCategories.join(",") : undefined,
    seller: selectedBrands.length ? selectedBrands.join(",") : undefined,
    ram: selectedMemory.length ? selectedMemory.join(",") : undefined,
    color: selectedColors.length ? selectedColors.join(",") : undefined,
    screenSize: selectedScreenSizes.length ? selectedScreenSizes.join(",") : undefined,
    storage: selectedStorage.length ? selectedStorage.join(",") : undefined,
    battery: selectedBatteries.length ? selectedBatteries.join(",") : undefined,
    processor: selectedProcessors.length ? selectedProcessors.join(",") : undefined,
  };

  // Filterlənmiş məhsulları API-dən çəkirik
  // filterParams dəyişdikdə RTK Query avtomatik yenidən sorğu göndərir
  const { data: filteredData, error: filterError, isError: isFilterError } =
    useGetFilteredProductsQuery(filterParams);

  // Filter sorğusu xətası bildirişi
  useEffect(() => {
    if (isFilterError) {
      console.log(filterError);
      toast.error(
        filterError?.data?.message || "Məhsullar filterlənərkən xəta baş verdi."
      );
    }
  }, [isFilterError, filterError]);

  // ── SƏHİFƏLƏMƏ HESABLAMALARI ──
  const filteredProducts = filteredData?.products || [];
  const totalItems = filteredProducts.length;                         // ümumi məhsul sayı
  const totalPages = Math.ceil(totalItems / itemsPerPage);            // ümumi səhifə sayı

  // Hal-hazırki səhifədə göstəriləcək məhsulların indeks aralığı
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // Array.slice ilə yalnız o səhifənin məhsullarını kəsirik
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Filter dəyişdikdə səhifəni 1-ə sıfırlayırıq
  // (əks halda seçim dəyişdikdə istifadəçi yanlış səhifədə qala bilər)
  useEffect(() => {
    setCurrentPage(1);
  }, [priceMin, priceMax, selectedCategories, selectedBrands, selectedMemory,
      selectedColors, selectedScreenSizes, selectedStorage, selectedBatteries, selectedProcessors]);

  // Sidebar bölməsini açıb-bağlayan funksiya
  const toggleSection = (section) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)   // varsa çıxar (bağla)
        : [...prev, section]                  // yoxdursa əlavə et (aç)
    );
  };

  // ── AKTİV FİLTER SAYI ──
  // Mobil badge-i üçün neçə filterin aktiv olduğunu hesablayırıq
  const activeFilterCount = [
    ...selectedCategories,
    ...selectedBrands,
    ...selectedMemory,
    ...selectedColors,
    ...selectedScreenSizes,
    ...selectedStorage,
    ...selectedBatteries,
    ...selectedProcessors,
  ].length + (priceMin > 0 || priceMax < 5000 ? 1 : 0);  // qiymət filteri də varsa +1

  // Bütün filterləri bir anda sıfırlayan funksiya
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedMemory([]);
    setSelectedColors([]);
    setSelectedScreenSizes([]);
    setSelectedStorage([]);
    setSelectedBatteries([]);
    setSelectedProcessors([]);
    setPriceMin(0);
    setPriceMax(5000);
  };

  // ── SİDEBAR FİLTER BÖLMƏLƏRININ RENDER FUNKSIYASI ──
  // Bu funksiya həm desktop sidebar-da, həm də mobil bottom sheet-də istifadə olunur.
  // Kodu dublikat etməmək üçün paylaşılan JSX buraya çıxarılıb.
  const renderFilterSections = () => (
    <div className="space-y-8">
      {/* ── QİYMƏT FİLTERİ ── */}
      <div className="bg-gray-50 p-4 sm:p-5 rounded-xl">
        <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
        <div className="space-y-5">
          {/* Min/Max qiymət input-ları */}
          <div className="flex gap-3 sm:gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Min</label>
              <input
                type="number"
                placeholder="0"
                value={priceMin}
                onChange={(e) => setPriceMin(Number(e.target.value))}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Max</label>
              <input
                type="number"
                placeholder="5000"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>
          </div>
          {/* Sürüşdürmə slider-i — yalnız max qiyməti dəyişir */}
          <Slider min={0} max={5000} value={priceMax} onChange={setPriceMax} />
        </div>
      </div>

      {/* ── DİNAMİK FİLTER BÖLMƏLƏR ── */}
      {/* filterData obyektinin hər açarı üçün bir bölmə render edirik */}
      {Object.keys(filterData).map((section) => (
        <div key={section} className="border-b border-gray-200 pb-6">
          {/* Bölmə başlığı — tıklandıqda aç/bağla işlənir */}
          <Button
            variant="ghost"
            onClick={() => toggleSection(section)}
            className="flex justify-between items-center w-full py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          >
            <span className="font-bold text-gray-900 text-sm sm:text-base">
              {filterData[section].label}
            </span>
            {/* Ok ikonu — açıq olduqda rotate-180 animasiyası */}
            <span
              className={`transform transition-transform duration-200 text-xs ${
                expandedSections.includes(section) ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </Button>

          {/* Bölmə açıqdırsa axtarış və checkbox-lar göstərilir */}
          {expandedSections.includes(section) && (
            <div className="mt-4 space-y-4">
              {/* Rəng bölməsində axtarış lazım deyil (az seçim olur) */}
              {section !== "color" && (
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-12 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-sm"
                  />
                </div>
              )}

              {/* Checkbox siyahısı — max-h-52 ilə scroll-a gedir */}
              <div className="space-y-1 max-h-52 overflow-y-auto">
                {filterData[section].items.map((item) => (
                  <div
                    key={item.name || item.size}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Checkbox
                      label={item.name || item.size}
                      // Seçilmiş massivdə bu dəyər varsa checked olur
                      checked={filterData[section].selected.includes(
                        item.name || item.size
                      )}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Yeni dəyəri siyahıya əlavə et
                          filterData[section].setSelected([
                            ...filterData[section].selected,
                            item.name || item.size,
                          ]);
                        } else {
                          // Dəyəri siyahıdan çıxar
                          filterData[section].setSelected(
                            filterData[section].selected.filter(
                              (val) => val !== (item.name || item.size)
                            )
                          );
                        }
                      }}
                    />
                    {/* Məhsul sayı badge-i */}
                    <span className="text-gray-500 text-xs font-medium bg-gray-100 px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ── HEADER / BAŞLIQ SAHƏSİ ── */}
      <div className="bg-[#faf7f0] py-8 sm:py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#faf7f0]">
          <div className="text-center">
            {/* Breadcrumb naviqasiyası */}
            <nav className="text-sm text-gray-500 mb-4">
              <ol className="flex items-center justify-center space-x-2 bg-[#faf7f0]">
                <li>
                  <a href="#" className="hover:text-gray-700 transition-colors duration-200">
                    DEMO
                  </a>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium">Shop</li>
              </ol>
            </nav>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-8">
              Shop
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* ── ANA LAYOUT: SIDEBAR + MƏZMUN ── */}
        {/* LG+ ekranlarda 2 sütunlu layout: 300px sidebar + qalan hissə */}
        <div className="lg:grid lg:grid-cols-[300px_1fr] gap-8">

          {/* ── MOBİL FİLTER DÜYMƏSİ (yalnız LG-dən kiçik ekranlarda görünür) ── */}
          <div className="lg:hidden mb-4">
            <div className="flex gap-3">
              {/* Filter panelini açan düymə — aktiv filter sayını badge-lə göstərir */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all duration-200 shadow-lg font-semibold text-sm relative"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters & Sort
                {/* Aktiv filter sayı badge-i — heç filter yoxdursa göstərilmir */}
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Filter aktivdirsə "Sıfırla" düyməsi göstərilir */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-3.5 border border-gray-300 bg-white text-gray-600 rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm font-medium flex items-center gap-1.5"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              )}
            </div>

            {/* Aktiv filterləri etiket kimi göstərir — hər birini ayrıca silmək mümkündür */}
            {activeFilterCount > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  // Bütün seçilmiş dəyərləri birləşdirib massivə çeviririk
                  // Hər biri label (göstərilən mətn) və clear (silmə funksiyası) saxlayır
                  ...selectedCategories.map(v => ({ label: v, clear: () => setSelectedCategories(p => p.filter(x => x !== v)) })),
                  ...selectedBrands.map(v => ({ label: v, clear: () => setSelectedBrands(p => p.filter(x => x !== v)) })),
                  ...selectedMemory.map(v => ({ label: v, clear: () => setSelectedMemory(p => p.filter(x => x !== v)) })),
                  ...selectedColors.map(v => ({ label: v, clear: () => setSelectedColors(p => p.filter(x => x !== v)) })),
                  ...selectedScreenSizes.map(v => ({ label: v, clear: () => setSelectedScreenSizes(p => p.filter(x => x !== v)) })),
                  ...selectedStorage.map(v => ({ label: v, clear: () => setSelectedStorage(p => p.filter(x => x !== v)) })),
                  ...selectedBatteries.map(v => ({ label: v, clear: () => setSelectedBatteries(p => p.filter(x => x !== v)) })),
                  ...selectedProcessors.map(v => ({ label: v, clear: () => setSelectedProcessors(p => p.filter(x => x !== v)) })),
                ].map(({ label, clear }, i) => (
                  // Hər filter etiketi — X düyməsi ilə ayrıca silinir
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-900 text-white text-xs font-medium rounded-full"
                  >
                    {label}
                    <button onClick={clear} className="hover:text-gray-300 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── MOBİL FİLTER MODALİ (BOTTOM SHEET) ── */}
          {/* isMobileFilterOpen true olduqda ekrana gəlir */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              {/* Qara şəffaf overlay — tıklandıqda panel bağlanır */}
              <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={() => setIsMobileFilterOpen(false)}
              />

              {/* Bottom Sheet — aşağıdan yuxarıya sürüşən panel */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl"
                style={{
                  maxHeight: "90vh",
                  display: "flex",
                  flexDirection: "column",
                  // Açılış animasiyası
                  animation: "slideUp 0.28s cubic-bezier(0.34,1.20,0.64,1)",
                }}
              >
                {/* Animasiya keyframe-i */}
                <style>{`
                  @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                  }
                `}</style>

                {/* Handle bar — vizual tutma nöqtəsi */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
                </div>

                {/* Panel başlığı + bağlama/sıfırla düymələri */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                    {/* Aktiv filter sayı badge-i */}
                    {activeFilterCount > 0 && (
                      <span className="px-2 py-0.5 bg-gray-900 text-white text-xs font-bold rounded-full">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Hamısını sıfırla linki */}
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="text-sm text-red-500 font-semibold hover:text-red-700 transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                    {/* Paneli bağlayan X düyməsi */}
                    <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Filterlərin siyahısı — scroll olunur */}
                <div className="overflow-y-auto flex-1 px-5 py-4">
                  {renderFilterSections()}
                </div>

                {/* Alt footer — "Məhsulları göstər" düyməsi */}
                <div className="px-5 py-4 border-t border-gray-100 bg-white">
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all duration-200 text-sm"
                  >
                    {/* Neçə məhsulun tapıldığını göstərir */}
                    {totalItems} məhsul göstər
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── DESKTOP SİDEBAR (yalnız LG+ ekranlarda görünür) ── */}
          {/* sticky: aşağı scroll edərkən ekranda qalır */}
          {/* max-h + overflow-y-auto: çox filter varsa scroll olunur */}
          <div className="hidden lg:block sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto bg-white shadow-xl rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              {/* Aktiv filter varsa "Hamısını sil" linki göstərilir */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-red-500 font-semibold hover:text-red-700 transition-colors flex items-center gap-1"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear all
                </button>
              )}
            </div>
            {/* Paylaşılan filter bölmələri funksiyasını çağırırıq */}
            {renderFilterSections()}
          </div>

          {/* ── ANA MƏZMUN (MƏHSUL GRİD-İ) ── */}
          <main>
            <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6">
              {/* Başlıq + sıralama seçimi */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-0">
                <div className="text-base sm:text-lg text-gray-700">
                  <span className="font-bold text-gray-900 text-lg sm:text-xl">
                    {totalItems}
                  </span>{" "}
                  products found
                  {/* Birdən çox səhifə varsa "Səhifə X / Y" göstərilir */}
                  {totalPages > 1 && (
                    <span className="ml-2 sm:ml-3 text-gray-500 font-medium text-sm">
                      (Page {currentPage} of {totalPages})
                    </span>
                  )}
                </div>
                {/* Sıralama dropdown-u — hal-hazırda yalnız UI, funksionallıq bağlanmayıb */}
                <select className="w-full sm:w-auto px-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 font-medium shadow-sm text-sm">
                  <option value="relevance">Sort by Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>

              {/* ── MƏHSUL GRİD-İ ── */}
              {/* Responsiv sütun: mobil 2, xl 3 */}
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
                {currentItems.map((product) => (
                  // Hər məhsul üçün ProductCard render edilir
                  <ProductCard key={product._id} mehsul={product} />
                ))}
              </div>

              {/* Heç bir məhsul tapılmadıqda boş vəziyyət */}
              {currentItems.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <SlidersHorizontal className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium text-sm">Heç bir məhsul tapılmadı</p>
                  {/* Filterləri sıfırlamağa dəvət */}
                  <button
                    onClick={clearAllFilters}
                    className="mt-3 text-sm text-gray-900 underline font-semibold"
                  >
                    Filterləri sıfırla
                  </button>
                </div>
              )}

              {/* Birdən çox səhifə varsa pagination göstərilir */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default EcommerceApp;