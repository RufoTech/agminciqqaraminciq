"use client";

// React — UI yaratmaq üçün, useState — lokal state idarəetməsi üçün
import React, { useState } from "react";

// useNavigate — React Router ilə səhifə yönləndirməsi üçün
import { useNavigate } from "react-router-dom";

// useSelector — Redux store-dan state oxumaq üçün
import { useSelector } from "react-redux";

// RTK Query hook-ları:
//   useDeleteProductMutation — məhsul silmə (DELETE sorğusu)
//   useGetProductsQuery      — məhsul siyahısını çəkmək (GET sorğusu)
import {
  useDeleteProductMutation,
  useGetProductsQuery,
} from "../../redux/api/productsApi";

// Satış statistikasını bar chart kimi göstərən ayrıca komponent
// labels → X oxu, dataPoints → Y oxu dəyərləri
import ChartComponent from "./ChartComponent";

// React Icons — redaktə ikonu (qələm)
import { FaRegEdit } from "react-icons/fa";

// React Icons — silmə ikonu (süpürgə)
import { MdDeleteSweep } from "react-icons/md";

// Lucide ikonları — UI elementləri və kateqoriya ikonları üçün
import {
  BarChart3, ShoppingBag, PlusCircle, DollarSign, Package,
  ChevronDown, ChevronUp, Smartphone, Laptop, Camera,
  Headphones, Gamepad2, Tablet, Shirt, Home, Flower2,
  Dumbbell, Car, Sparkles, Store,
} from "lucide-react";

// SweetAlert2 — xoş görünüşlü modal/alert pəncərələri
// Silmə təsdiqini göstərmək üçün istifadə olunur
import Swal from "sweetalert2";


// =====================================================================
// CATEGORY_CONFIG — KATEQORİYA KONFİQURASİYASI
// ---------------------------------------------------------------------
// Bu obyekt hər kateqoriya üçün:
//   icon   → kateqoriya ikonu (Lucide komponenti)
//   label  → Azərbaycanca görünən ad (badge üçün)
//   fields → məhsul detalları panelindəki sahələr:
//              key   → məhsul obyektindəki açar adı
//              label → UI-da göstəriləcək başlıq
//
// Niyə ayrıca konfiqurasiya?
//   Kateqoriyaya görə fərqli texniki sahələr göstərmək lazımdır.
//   Telefonda "RAM" var, kamerada yox.
//   Bu obyekt olmasa hər kateqoriya üçün ayrıca if/else yazardıq.
// =====================================================================
const CATEGORY_CONFIG = {
  Phones: { icon: Smartphone, label: "Telefonlar", fields: [{ key: "screenSize", label: "Ekran" }, { key: "storage", label: "Yaddaş" }, { key: "ram", label: "RAM" }, { key: "frontCamera", label: "Ön Kamera" }, { key: "backCamera", label: "Arxa Kamera" }, { key: "battery", label: "Batareya" }, { key: "processor", label: "Prosessor" }, { key: "operatingSystem", label: "OS" }] },
  Laptops: { icon: Laptop, label: "Noutbuklar", fields: [{ key: "screenSize", label: "Ekran" }, { key: "storage", label: "Yaddaş" }, { key: "ram", label: "RAM" }, { key: "gpu", label: "GPU" }, { key: "processor", label: "CPU" }, { key: "batteryLife", label: "Batareya Ömrü" }, { key: "operatingSystem", label: "OS" }] },
  Cameras: { icon: Camera, label: "Kameralar", fields: [{ key: "resolution", label: "Çözümlülük" }, { key: "opticalZoom", label: "Optik Zoom" }, { key: "sensorType", label: "Sensor Növü" }, { key: "imageStabilization", label: "Stabilizasiya" }] },
  Headphones: { icon: Headphones, label: "Qulaqcıqlar", fields: [{ key: "connectivity", label: "Bağlantı" }, { key: "batteryLife", label: "Batareya" }, { key: "noiseCancellation", label: "Səs Ləğvi" }] },
  Console: { icon: Gamepad2, label: "Konsollar", fields: [{ key: "cpu", label: "CPU" }, { key: "gpu", label: "GPU" }, { key: "storage", label: "Yaddaş" }, { key: "memory", label: "Memory" }, { key: "supportedResolution", label: "Çözümlülük" }, { key: "connectivity", label: "Bağlantı" }, { key: "controllerIncluded", label: "Controller" }] },
  iPad: { icon: Tablet, label: "Planşetlər", fields: [{ key: "screenSize", label: "Ekran" }, { key: "storage", label: "Yaddaş" }, { key: "ram", label: "RAM" }, { key: "battery", label: "Batareya" }, { key: "processor", label: "CPU" }, { key: "operatingSystem", label: "OS" }, { key: "cellular", label: "Cellular" }] },
  WomenClothing: { icon: Shirt, label: "Qadın Geyimi", fields: [{ key: "size", label: "Ölçü" }, { key: "material", label: "Material" }, { key: "color", label: "Rəng" }] },
  MenClothing: { icon: Shirt, label: "Kişi Geyimi", fields: [{ key: "size", label: "Ölçü" }, { key: "material", label: "Material" }, { key: "color", label: "Rəng" }] },
  KidsClothing: { icon: Shirt, label: "Uşaq Geyimi", fields: [{ key: "size", label: "Ölçü" }, { key: "material", label: "Material" }] },
  HomeAppliances: { icon: Home, label: "Ev Texnikası", fields: [{ key: "power", label: "Güc (W)" }, { key: "dimensions", label: "Ölçülər" }] },
  HomeAndGarden: { icon: Home, label: "Ev və Bağ", fields: [{ key: "dimensions", label: "Ölçülər" }, { key: "material", label: "Material" }] },
  Beauty: { icon: Flower2, label: "Gözəllik", fields: [{ key: "volume", label: "Həcm" }, { key: "ingredients", label: "Tərkib" }] },
  Sports: { icon: Dumbbell, label: "İdman", fields: [{ key: "size", label: "Ölçü" }, { key: "weight", label: "Çəki" }, { key: "material", label: "Material" }] },
  Automotive: { icon: Car, label: "Avtomobil", fields: [{ key: "compatibility", label: "Uyğunluq" }, { key: "material", label: "Material" }] },
};


// =====================================================================
// SpecPanel — DESKTOPDA AÇILAN TEXNİKİ XÜSUSİYYƏTLƏR PANELİ
// ---------------------------------------------------------------------
// Cədvəldə məhsulun "SPEC" düyməsinə basıldıqda altında açılır.
// colSpan=6 — cədvəlin bütün 6 sütununu əhatə edən bir sətir.
//
// Props:
//   product → tam məhsul obyekti
// =====================================================================
const SpecPanel = ({ product }) => {
  // Məhsulun kateqoriyasına uyğun konfiqurasiyanı tap
  const cfg = CATEGORY_CONFIG[product.category];

  // Naməlum kateqoriya — heç nə göstərmə
  if (!cfg) return null;

  // Boş olmayan sahələri hazırla:
  //   .map() → hər sahə üçün {label, value} obyekti yarat
  //   .filter() → boş/null/undefined dəyərləri çıxar
  const specs = cfg.fields
    .map((f) => ({ label: f.label, value: product[f.key] }))
    .filter((s) => s.value !== undefined && s.value !== "" && s.value !== null);

  return (
    // Cədvəlin bütün sütunlarını əhatə edən xüsusi sətir
    <tr>
      <td colSpan="6" style={{ padding: 0 }}>
        <div style={{ background: "linear-gradient(135deg, #fff5f6 0%, #fff 100%)", borderLeft: "4px solid #E8192C", borderBottom: "1px solid #fde8ea", padding: "16px 16px 20px" }}>

          {/* Kateqoriya ikonu + başlıq */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            {/* React.createElement() — dinamik ikon render üçün.
                            JSX: <cfg.icon size={14} /> — bu işləmir (böyük hərflə başlamalı).
                            React.createElement(cfg.icon, {size:14}) — işləyir. */}
            {React.createElement(cfg.icon, { size: 14, color: "#E8192C" })}
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "#E8192C" }}>
              {cfg.label} — Spesifikasiyalar
            </span>
          </div>

          {specs.length === 0 ? (
            // Sahə yoxdursa məlumat mesajı
            <p style={{ color: "#ccc", fontSize: 13, fontStyle: "italic" }}>
              Bu məhsul üçün spesifikasiya daxil edilməyib.
            </p>
          ) : (
            // Sahələr grid şəklində göstərilir — auto-fill ilə responsive
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
              {specs.map((s) => (
                <div key={s.label} style={{ background: "white", borderRadius: 12, padding: "10px 12px", border: "1px solid #fde8ea", boxShadow: "0 1px 4px rgba(232,25,44,0.06)" }}>
                  <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#bbb", margin: "0 0 4px" }}>
                    {s.label}
                  </p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                    {/* Boolean dəyərlər (controllerIncluded, cellular) üçün xüsusi göstərici.
                                            true  → "✓ Bəli" (yaşıl)
                                            false → "✗ Xeyr" (boz) */}
                    {typeof s.value === "boolean"
                      ? (s.value ? "✓ Bəli" : "✗ Xeyr")
                      : s.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};


// =====================================================================
// StatCard — STATİSTİKA KARTI KOMPONENTİ
// ---------------------------------------------------------------------
// Yuxarı hissədəki 3 rəngli statistika kartı.
// Gradient fon, ağ ikon qutusu, dekorativ dairə.
//
// Props:
//   title → "Məhsul Sayı", "Orta Qiymət", "Ümumi Satış"
//   value → göstəriləcək dəyər
//   icon  → Lucide ikon komponenti
//   bg    → CSS gradient string
//   sub   → kiçik alt mətn (ixtiyari)
// =====================================================================
const StatCard = ({ title, value, icon: Icon, bg, sub }) => (
  <div style={{ background: bg, borderRadius: 20, padding: "20px 22px", color: "white", position: "relative", overflow: "hidden", boxShadow: "0 8px 24px rgba(232,25,44,0.18)" }}>

    {/* Dekorativ dairə — sağ üst küncündə yarı şəffaf effekt.
            overflow: hidden → kartın kənarını aşmaz. */}
    <div style={{ position: "absolute", right: -16, top: -16, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.15)" }} />

    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, fontWeight: 600, opacity: 0.85, letterSpacing: "0.04em", margin: 0 }}>{title}</p>
        {/* İkon qutusu — yarı şəffaf ağ fon */}
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={16} />
        </div>
      </div>
      {/* Əsas dəyər — iri şrift */}
      <p className="ap-stat-value" style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", margin: 0 }}>{value}</p>
      {/* Alt mətn — ixtiyari */}
      {sub && <p style={{ fontSize: 11, opacity: 0.7, margin: "4px 0 0", fontWeight: 500 }}>{sub}</p>}
    </div>
  </div>
);


// =====================================================================
// MobileProductCard — MOBİL MƏHSUL KARTI
// ---------------------------------------------------------------------
// 768px-dən kiçik ekranlarda cədvəl yerinə göstərilən kart görünüşü.
// Hər məhsul ayrıca kart kimi render edilir.
//
// Props:
//   product      → tam məhsul obyekti
//   onEdit       → redaktə handler-i (navigate çağırır)
//   onDelete     → silmə handler-i (SweetAlert + API)
//   expandedId   → hansı məhsulun spec paneli açıqdır (null = heç biri)
//   toggleExpand → açma/bağlama funksiyası
// =====================================================================
const MobileProductCard = ({ product, onEdit, onDelete, expandedId, toggleExpand }) => {
  const cfg = CATEGORY_CONFIG[product.category];
  // Naməlum kateqoriya üçün ulduz ikonu
  const CatIcon = cfg?.icon || Sparkles;

  // Bu kartın spec paneli açıqdırmı?
  const isOpen = expandedId === product._id;

  // Boş olmayan texniki sahələri hazırla
  const specs = cfg
    ? cfg.fields
      .map(f => ({ label: f.label, value: product[f.key] }))
      .filter(s => s.value !== undefined && s.value !== "" && s.value !== null)
    : [];

  return (
    <div style={{ background: "white", borderRadius: 16, border: "1px solid #f0f0f0", marginBottom: 10, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
      <div style={{ padding: "14px 14px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>

          {/* SOL: Məhsul məlumatları */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* MongoDB ID-nin son 6 simvolu — qısa identifikator
                            .toUpperCase() → "A3F8B2" formatı */}
            <p style={{ fontSize: 10, fontFamily: "monospace", color: "#bbb", margin: "0 0 3px" }}>
              #{product._id.slice(-6).toUpperCase()}
            </p>
            <p style={{ fontWeight: 700, color: "#1a1a1a", fontSize: 14, margin: "0 0 8px", lineHeight: 1.3, wordBreak: "break-word" }}>
              {product.name}
            </p>
            {/* Kateqoriya badge + qiymət */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 20, background: "#fff0f1", color: "#E8192C", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>
                <CatIcon size={9} />{cfg?.label || product.category}
              </span>
              <span style={{ fontWeight: 900, color: "#E8192C", fontSize: 15, whiteSpace: "nowrap" }}>
                {product.price} ₼
              </span>
            </div>
            {/* Satış sayı */}
            <div style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 10, color: "#bbb", fontWeight: 600 }}>Satışlar:</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#22c55e" }}>
                {product.salesCount || 0} ədəd
              </span>
            </div>
          </div>

          {/* SAĞ: Düymələr */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
            {/* Redaktə — açıq qırmızı fon */}
            <button onClick={() => onEdit(product._id)} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, border: "1.5px solid #fdd", background: "#fff0f1", color: "#E8192C", cursor: "pointer" }}>
              <FaRegEdit size={13} />
            </button>
            {/* Silmə — tam qırmızı fon */}
            <button onClick={() => onDelete(product._id)} style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, border: "none", background: "#E8192C", color: "white", cursor: "pointer", boxShadow: "0 3px 10px rgba(232,25,44,0.3)" }}>
              <MdDeleteSweep size={15} />
            </button>
          </div>
        </div>

        {/* SPEC toggle düyməsi — yalnız texniki sahə varsa göstər.
                    Açıq olduqda: qırmızı fon + ağ mətn + ChevronUp.
                    Bağlı olduqda: açıq qırmızı fon + qırmızı mətn + ChevronDown. */}
        {specs.length > 0 && (
          <button onClick={() => toggleExpand(product._id)}
            style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 11px", borderRadius: 20, border: `1.5px solid ${isOpen ? "#E8192C" : "#fdd"}`, background: isOpen ? "#E8192C" : "#fff0f1", color: isOpen ? "white" : "#E8192C", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}>
            <CatIcon size={9} />
            SPEC
            {isOpen ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
          </button>
        )}
      </div>

      {/* Açılır spec paneli — conditional rendering:
                isOpen === true VƏ specs varsa render edilir.
                false olarsa DOM-dan tamamilə çıxarılır (display:none deyil). */}
      {isOpen && specs.length > 0 && (
        <div style={{ background: "linear-gradient(135deg, #fff5f6 0%, #fff 100%)", borderTop: "1px solid #fde8ea", borderLeft: "4px solid #E8192C", padding: "12px 14px 14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 7 }}>
            {specs.map((s) => (
              <div key={s.label} style={{ background: "white", borderRadius: 10, padding: "8px 10px", border: "1px solid #fde8ea" }}>
                <p style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#bbb", margin: "0 0 3px" }}>{s.label}</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#1a1a1a", margin: 0, wordBreak: "break-word" }}>
                  {typeof s.value === "boolean" ? (s.value ? "✓ Bəli" : "✗ Xeyr") : s.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


// =====================================================================
// AdminProducts — ANA KOMPONENT
// ---------------------------------------------------------------------
// Satıcının öz məhsullarını idarə etdiyi panel.
//
// Funksionallıq:
//   ① Redux-dan cari satıcının adını alır
//   ② API-dən bütün məhsulları çəkir, satıcıya görə filter edir
//   ③ Statistika kartları + satış chart-ı göstərir
//   ④ Desktop: cədvəl, Mobil: kart görünüşü
//   ⑤ Hər məhsulda: redaktə, silmə, spec toggle
// =====================================================================
const AdminProducts = () => {

  // ── REDUX STATE ──────────────────────────────────────────────────
  const { user } = useSelector((state) => state.userSlice);

  // Satıcının mağaza adı — məhsulları filter etmək üçün lazımdır.
  // product.seller === currentStoreName → yalnız bu satıcının məhsulları
  const currentStoreName = user?.user?.sellerInfo?.storeName || user?.user?.name || "";

  // Mağaza slug-u — ictimai mağaza linki üçün
  const storeSlug = user?.user?.sellerInfo?.storeSlug || "";

  // ── RTK QUERY ────────────────────────────────────────────────────
  // useGetProductsQuery — GET /products sorğusu, caching + refetch.
  // refetch() → silmə sonrası siyahını yenilər.
  const { data, error, isLoading, refetch } = useGetProductsQuery();

  // useDeleteProductMutation → DELETE /admin/products/:id
  const [deleteProduct] = useDeleteProductMutation();

  // React Router navigate hook-u
  const navigate = useNavigate();

  // Hansı məhsulun spec panelinin açıq olduğunu izləyir.
  // null   → heç biri açıq deyil
  // string → açıq olan məhsulun _id-si
  const [expandedId, setExpandedId] = useState(null);

  // ── VERİLƏNLƏR ───────────────────────────────────────────────────
  const allProducts = data?.products || [];

  // Yalnız cari satıcının məhsullarını göstər.
  // Niyə frontend-də filter? API cəmi məhsulları qaytarır,
  // satıcı yalnız öz məhsullarını görməlidir.
  const products = allProducts.filter((p) => p.seller === currentStoreName);

  // ── STATİSTİKA HESABLAMALARİ ─────────────────────────────────────
  const productNames = products.map((p) => p.name);
  const sales = products.map((p) => p.salesCount || 0);
  const totalProducts = products.length;
  // || 1 — sıfıra bölünmənin qarşısını alır (məhsul yoxdursa 0/1=0)
  const averagePrice = products.reduce((acc, p) => acc + p.price, 0) / (totalProducts || 1);
  const totalSales = sales.reduce((a, b) => a + b, 0);


  // =====================================================================
  // HADİSƏ İDARƏEDİCİLƏRİ
  // =====================================================================

  // Redaktə səhifəsinə yönləndir
  const handleEdit = (id) => navigate(`/admin/edit-product/${id}`);

  // Yeni məhsul yaratma səhifəsinə yönləndir
  const handleCreate = () => navigate("/admin/create-product");

  // Spec panelini aç/bağla:
  //   Eyni ID-yə basıldıqda → null (bağla)
  //   Fərqli ID-yə basıldıqda → həmin ID (aç)
  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  // Məhsul silmə — SweetAlert2 ilə təsdiq + API çağırışı
  const handleDelete = async (id) => {
    // Silmə təsdiqi modal-ı
    const result = await Swal.fire({
      title: "Məhsulu silmək istədiyinizdən əminsinizmi?",
      text: "Bu əməliyyat geri qaytarıla bilməz!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E8192C",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Bəli, sil",
      cancelButtonText: "Xeyr",
      reverseButtons: true,  // Ləğv sol, Sil sağda
    });

    if (result.isConfirmed) {
      try {
        // RTK Query mutasiyası — .unwrap() xəta atarsa catch-ə düşür
        await deleteProduct(id).unwrap();
        // Siyahını yenilə — silinmiş məhsul UI-dan çıxsın
        await refetch();
        Swal.fire({ title: "Silindi!", text: "Məhsul uğurla silindi.", icon: "success", confirmButtonColor: "#E8192C" });
      } catch {
        Swal.fire({ title: "Xəta!", text: "Silinmə zamanı xəta baş verdi.", icon: "error", confirmButtonColor: "#E8192C" });
      }
    }
  };


  // ── YÜKLƏMƏ VƏZİYYƏTİ ───────────────────────────────────────────
  // CSS animasiya ilə fırlanan spinner
  if (isLoading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f8f8f8", gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", border: "4px solid #fdd", borderTopColor: "#E8192C", animation: "spin 0.8s linear infinite" }} />
      <span style={{ color: "#E8192C", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>Yüklənir...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ── XƏTA VƏZİYYƏTİ ──────────────────────────────────────────────
  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#E8192C", fontSize: 18, fontWeight: 700, padding: 20, textAlign: "center" }}>
      ❌ Xəta: {error.data?.message || error.error}
    </div>
  );

  // Mağaza ictimai linki — storeSlug varsa tam URL, yoxdursa null
  const storeLink = storeSlug ? `${window.location.origin}/store/${storeSlug}` : null;


  // =====================================================================
  // RENDER
  // =====================================================================
  return (
    <div style={{ minHeight: "100vh", background: "#f6f6f7", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* ── QLobal CSS stilləri + responsive breakpoint-lər ── */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* HEADER: qırmızı, sticky */
        .ap-header { background: #E8192C; padding: 0 40px; height: 64px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 30; box-shadow: 0 4px 20px rgba(232,25,44,0.25); }

        /* CONTENT: mərkəzlənmiş, maks. 1200px */
        .ap-content { max-width: 1200px; margin: 0 auto; padding: 32px 20px; width: 100%; }

        /* STATİSTİKA GRİD: 3 bərabər sütun */
        .ap-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }

        /* GÖRÜNÜŞ KEÇİDİ:
           Default: cədvəl görünür (desktop), kartlar gizli (mobil)
           768px-dən kiçikdə CSS ilə tərsinə çevrilir */
        .ap-desktop-table { display: block; overflow-x: auto; }
        .ap-mobile-cards  { display: none; }

        .ap-store-link   { display: flex; align-items: center; gap: 10px; background: #fff8f8; border: 1.5px solid #fdd; border-radius: 12px; padding: 10px 14px; flex-wrap: wrap; width: 100%; }
        .ap-store-header { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .ap-table-header { padding: 18px 32px; border-bottom: 1px solid #f5f5f5; display: flex; align-items: center; gap: 10px; background: #fafafa; }
        .ap-chart-wrapper { background: white; border-radius: 24px; padding: 28px 32px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); margin-bottom: 24px; border: 1px solid #f0f0f0; }

        /* TABLET (≤ 1024px) */
        @media (max-width: 1024px) {
          .ap-header { padding: 0 24px; }
          .ap-content { padding: 24px 16px; }
          .ap-chart-wrapper { padding: 22px 24px; }
          .ap-table-header  { padding: 16px 24px; }
        }

        /* BÖYÜK MOBİL (≤ 768px) */
        @media (max-width: 768px) {
          .ap-header { padding: 0 14px; height: 56px; }
          .ap-brand-title { font-size: 15px !important; }
          .ap-brand-sub   { display: none !important; }   /* Alt başlıq gizlənir */
          .ap-create-btn-text { display: none; }          /* "Yeni Məhsul" yazısı gizlənir */
          .ap-create-btn  { padding: 8px 10px !important; min-width: 36px; }
          .ap-content { padding: 14px 10px; }
          .ap-page-title { font-size: 18px !important; }
          .ap-page-sub   { font-size: 12px !important; }

          /* Statistika: 2 sütun, son kart tam genişlik */
          .ap-stats { grid-template-columns: 1fr 1fr; gap: 10px; }
          .ap-stats > div:last-child { grid-column: 1 / -1; }
          .ap-stat-value { font-size: 20px !important; }

          .ap-chart-wrapper { padding: 16px 14px; border-radius: 16px; }
          .ap-chart-title   { font-size: 15px !important; }
          .ap-table-header  { padding: 12px 14px; border-radius: 14px 14px 0 0; }

          /* ƏSAS KEÇİD: cədvəl → kart görünüşü */
          .ap-desktop-table { display: none !important; }
          .ap-mobile-cards  { display: block !important; padding: 10px; }

          .ap-store-link { padding: 8px 10px; gap: 7px; }
          .ap-store-link a { font-size: 12px !important; }
          .ap-store-header { gap: 8px; }
          .ap-store-icon { width: 34px !important; height: 34px !important; border-radius: 10px !important; }
        }

        /* KİÇİK TELEFONLAR (≤ 480px) */
        @media (max-width: 480px) {
          .ap-header { padding: 0 10px; }
          .ap-content { padding: 10px 8px; }
          .ap-stats { grid-template-columns: 1fr; }  /* 1 sütun */
          .ap-stats > div:last-child { grid-column: auto; }
          .ap-chart-wrapper { padding: 14px 12px; border-radius: 14px; }
          .ap-table-header  { padding: 10px 12px; }
        }

        /* ÇOX KİÇİK (≤ 360px) */
        @media (max-width: 360px) {
          .ap-brand-title { font-size: 13px !important; }
          .ap-header-logo { width: 30px !important; height: 30px !important; }
          .ap-page-title  { font-size: 16px !important; }
        }
      `}</style>


      {/* ═════════════════════════
                HEADER
            ═════════════════════════ */}
      <div className="ap-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="ap-header-logo" style={{ width: 36, height: 36, background: "white", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
            <span style={{ color: "#E8192C", fontWeight: 900, fontSize: 18, lineHeight: 1 }}>B</span>
          </div>
          <div>
            <p className="ap-brand-title" style={{ color: "white", fontWeight: 900, fontSize: 17, letterSpacing: "-0.01em", lineHeight: 1, margin: 0 }}>BRENDEX</p>
            <p className="ap-brand-sub" style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>Admin Panel</p>
          </div>
        </div>

        {/* Yeni məhsul düyməsi — mobilde yalnız ikon */}
        <button onClick={handleCreate} className="ap-create-btn"
          style={{ display: "flex", alignItems: "center", gap: 6, background: "white", color: "#E8192C", border: "none", borderRadius: 12, padding: "9px 18px", fontWeight: 800, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}>
          <PlusCircle size={15} />
          <span className="ap-create-btn-text">Yeni Məhsul</span>
        </button>
      </div>


      <div className="ap-content">

        {/* ── MAĞAZA BAŞLIĞI + LİNKİ ── */}
        <div style={{ marginBottom: 20 }}>
          <div className="ap-store-header">
            <div className="ap-store-icon" style={{ width: 40, height: 40, background: "#fff0f1", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1.5px solid #fdd" }}>
              <Store size={20} color="#E8192C" />
            </div>
            <div>
              <h1 className="ap-page-title" style={{ fontSize: 24, fontWeight: 900, color: "#1a1a1a", margin: 0, letterSpacing: "-0.02em" }}>
                {currentStoreName} — Məhsullar
              </h1>
              <p className="ap-page-sub" style={{ color: "#999", fontSize: 13, marginTop: 2, marginBottom: 0 }}>
                Yalnız sizin mağazanızın məhsulları göstərilir
              </p>
            </div>
          </div>

          {/* Mağaza linki — storeLink null deyilsə göstər */}
          {storeLink && (
            <div className="ap-store-link" style={{ marginTop: 14 }}>
              <Store size={14} color="#E8192C" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#999", whiteSpace: "nowrap" }}>Mağaza linkiniz:</span>
              {/* target="_blank" → yeni tabda açılır
                                rel="noreferrer" → təhlükəsizlik üçün */}
              <a href={storeLink} target="_blank" rel="noreferrer"
                style={{ fontSize: 13, fontWeight: 700, color: "#E8192C", textDecoration: "none", wordBreak: "break-all", flex: 1, minWidth: 0 }}>
                {storeLink}
              </a>
              {/* Clipboard API ilə kopyalama */}
              <button
                onClick={() => { navigator.clipboard.writeText(storeLink); }}
                style={{ padding: "4px 12px", borderRadius: 8, border: "1.5px solid #fdd", background: "#fff0f1", color: "#E8192C", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                Kopyala
              </button>
            </div>
          )}
        </div>


        {/* ═════════════════════════
                    STATİSTİKA KARTLARI
                    3 kart: Məhsul | Qiymət | Satış
                ═════════════════════════ */}
        <div className="ap-stats">
          <StatCard title="Məhsul Sayı" value={totalProducts} icon={Package} bg="linear-gradient(135deg, #E8192C 0%, #ff4f61 100%)" sub="Aktiv məhsullar" />
          <StatCard title="Orta Qiymət" value={`${averagePrice.toFixed(2)} ₼`} icon={DollarSign} bg="linear-gradient(135deg, #bf1124 0%, #E8192C 100%)" sub="Bütün məhsullar üzrə" />
          <StatCard title="Ümumi Satış" value={totalSales} icon={BarChart3} bg="linear-gradient(135deg, #1c1c2e 0%, #2e2e42 100%)" sub="Ədəd" />
        </div>


        {/* ═════════════════════════
                    SATISH CHART
                    Yalnız məhsul varsa göstərilir.
                    productNames → X oxu etiketləri
                    sales        → Y oxu dəyərləri
                ═════════════════════════ */}
        {products.length > 0 && (
          <div className="ap-chart-wrapper">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ background: "#fff0f1", borderRadius: 10, padding: 8, flexShrink: 0 }}>
                <BarChart3 size={20} color="#E8192C" />
              </div>
              <h2 className="ap-chart-title" style={{ fontSize: 18, fontWeight: 900, color: "#1a1a1a", margin: 0 }}>
                Satış Statistikası
              </h2>
            </div>
            <ChartComponent labels={productNames} dataPoints={sales} gradientFrom="#E8192C" gradientTo="#ff9ca5" />
          </div>
        )}


        {/* ═════════════════════════
                    MƏHSUL CƏDVƏLİ / KARTLARI
                ═════════════════════════ */}
        <div style={{ background: "white", borderRadius: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", overflow: "hidden", border: "1px solid #f0f0f0" }}>

          {/* Cədvəl başlığı çubuğu */}
          <div className="ap-table-header">
            <div style={{ background: "#fff0f1", borderRadius: 10, padding: 7, flexShrink: 0 }}>
              <ShoppingBag size={18} color="#E8192C" />
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 900, color: "#1a1a1a", margin: 0 }}>Məhsullarım</h2>
            {/* Məhsul sayı badge-i */}
            <span style={{ marginLeft: "auto", background: "#fff0f1", color: "#E8192C", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" }}>
              {totalProducts} məhsul
            </span>
          </div>


          {/* ════════════════════════════════════
                        DESKTOP CƏDVƏLİ
                        ap-desktop-table CSS class-ı ilə
                        768px-dən kiçikdə gizlənir
                    ════════════════════════════════════ */}
          <div className="ap-desktop-table">
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f5f5f5" }}>
                  {["ID", "Məhsul", "Qiymət", "Satış", "Kateqoriya", "Əməliyyat"].map((h, i) => (
                    <th key={h} style={{ padding: "12px 20px", textAlign: i === 5 ? "center" : "left", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#bbb", background: "#fafafa", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? products.map((product) => {
                  const cfg = CATEGORY_CONFIG[product.category];
                  const CatIcon = cfg?.icon || Sparkles;
                  const isOpen = expandedId === product._id;

                  return (
                    // React.Fragment — iki <tr> (məlumat + spec paneli) birlikdə.
                    // key → Fragment-ə verilir, çünki uşaqlar key istəyir.
                    <React.Fragment key={product._id}>

                      {/* Məhsul məlumatları sətiri */}
                      <tr style={{ borderBottom: "1px solid #f9f9f9", background: isOpen ? "#fff5f6" : "white", transition: "background 0.2s" }}>

                        {/* ID — son 6 simvol */}
                        <td style={{ padding: "14px 20px", fontSize: 11, fontFamily: "monospace", color: "#bbb", whiteSpace: "nowrap" }}>
                          #{product._id.slice(-6).toUpperCase()}
                        </td>

                        {/* Ad + SPEC toggle düyməsi */}
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 700, color: "#1a1a1a", fontSize: 14 }}>{product.name}</span>
                            <button onClick={() => toggleExpand(product._id)}
                              style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 9px", borderRadius: 20, border: `1.5px solid ${isOpen ? "#E8192C" : "#fdd"}`, background: isOpen ? "#E8192C" : "#fff0f1", color: isOpen ? "white" : "#E8192C", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", whiteSpace: "nowrap" }}>
                              <CatIcon size={9} />SPEC{isOpen ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
                            </button>
                          </div>
                        </td>

                        {/* Qiymət */}
                        <td style={{ padding: "14px 20px", fontWeight: 900, color: "#E8192C", fontSize: 15, whiteSpace: "nowrap" }}>
                          {product.price} ₼
                        </td>

                        {/* Satış sayı — 0-dan böyüksə yaşıl, yoxdursa boz */}
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, background: (product.salesCount || 0) > 0 ? "#f0fdf4" : "#fafafa", color: (product.salesCount || 0) > 0 ? "#16a34a" : "#bbb", fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" }}>
                            {product.salesCount || 0} ədəd
                          </span>
                        </td>

                        {/* Kateqoriya badge */}
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, background: "#fff0f1", color: "#E8192C", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
                            <CatIcon size={11} />{cfg?.label || product.category}
                          </span>
                        </td>

                        {/* Redaktə + Silmə düymələri */}
                        <td style={{ padding: "14px 20px", textAlign: "center" }}>
                          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                            <button onClick={() => handleEdit(product._id)} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, border: "1.5px solid #fdd", background: "#fff0f1", color: "#E8192C", cursor: "pointer" }}>
                              <FaRegEdit size={14} />
                            </button>
                            <button onClick={() => handleDelete(product._id)} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, border: "none", background: "#E8192C", color: "white", cursor: "pointer", boxShadow: "0 3px 10px rgba(232,25,44,0.3)" }}>
                              <MdDeleteSweep size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Spec paneli — yalnız isOpen=true olduqda render edilir */}
                      {isOpen && <SpecPanel product={product} />}

                    </React.Fragment>
                  );
                }) : (
                  // Boş vəziyyət — məhsul yoxdursa
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "60px 20px", color: "#ccc" }}>
                      <Package size={48} style={{ margin: "0 auto 12px", opacity: 0.3, display: "block" }} />
                      <p style={{ fontWeight: 600, marginBottom: 4 }}>Heç bir məhsul tapılmadı</p>
                      <p style={{ fontSize: 13 }}>Yeni məhsul əlavə etmək üçün yuxarıdakı düyməyə basın</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>


          {/* ════════════════════════════════════
                        MOBİL KARTLAR
                        ap-mobile-cards CSS class-ı ilə
                        768px-dən böyükdə gizlənir
                    ════════════════════════════════════ */}
          <div className="ap-mobile-cards">
            {products.length > 0 ? (
              products.map((product) => (
                <MobileProductCard
                  key={product._id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  expandedId={expandedId}
                  toggleExpand={toggleExpand}
                />
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#ccc" }}>
                <Package size={40} style={{ margin: "0 auto 12px", opacity: 0.3, display: "block" }} />
                <p style={{ fontWeight: 600, marginBottom: 4 }}>Heç bir məhsul tapılmadı</p>
                <p style={{ fontSize: 13 }}>Yeni məhsul əlavə etmək üçün yuxarıdakı düyməyə basın</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminProducts;