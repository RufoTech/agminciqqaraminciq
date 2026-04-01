// ============================================================
// BestSellers.jsx
// Bu komponent "Çox Satılanlar" bölməsini göstərir.
// Məhsullar yatay sürüşdürmə (horizontal scroll) ilə
// kart şəklində sıralanır. RTK Query ilə API-dən çəkilir.
// ============================================================

import { useRef } from "react";
// useGetProductsQuery — bütün məhsulları çəkən RTK Query hook-u
// useAddToCartMutation — məhsulu səbətə əlavə edən mutation hook-u
import { useGetProductsQuery, useAddToCartMutation } from "../redux/api/productsApi";
// Link — səhifə yeniləmədən məhsul detail-ə keçmək üçün
import { Link } from "react-router-dom";
// Toast bildirişlər
import { toast } from "react-toastify";
// Lucide ikonları
import { Plus, Heart, ShoppingBag, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

// ── NAVİQASİYA DÜYMƏLƏRİ STİLİ ──
// Sol/sağ sürüşdürmə düymələri üçün paylaşılan inline stil obyekti.
// Ayrıca CSS class yazmaq əvəzinə burada saxlanılır ki, hər iki
// düymə eyni görünüşə sahib olsun.
const navBtn = {
  background: "none",
  border: "1.5px solid #ddd",
  borderRadius: 6,
  width: 32,
  height: 32,
  cursor: "pointer",
  fontSize: 18,
  color: "#555",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

// ============================================================
// ProductCard — Hər bir məhsul kartını render edən komponent
// Props:
//   product    — məhsul məlumatları (name, price, images, discount, ...)
//   onAddToCart — "+" düyməsinə tıklandıqda çağırılan funksiya
// ============================================================
const ProductCard = ({ product, onAddToCart }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      minWidth: 155,    // yatay scroll-da kartın minimum eni
      maxWidth: 175,    // kartın maksimum eni
      flexShrink: 0,    // flex konteynerində kartın kiçilməsinin qarşısını alır
      position: "relative",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer",
      overflow: "hidden",
    }}
    // Hover-da kartı yuxarı qaldırır — "lift" effekti
    onMouseEnter={e => {
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.13)";
    }}
    // Mouse ayrıldıqda orijinal vəziyyətə qayıdır
    onMouseLeave={e => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)";
    }}
  >
    {/* ── ENDİRİM BADGE-İ ── */}
    {/* discount > 0 olduqda sol üst küncdə qırmızı badge göstərilir */}
    {product.discount > 0 && (
      <span style={{
        position: "absolute", top: 10, left: 10, zIndex: 10,
        background: "#e53935", color: "#fff", fontSize: 10, fontWeight: 700,
        padding: "2px 7px", borderRadius: 4,
      }}>
        -{product.discount}%
      </span>
    )}

    {/* ── İSTƏK SİYAHISI DÜYMƏSİ ── */}
    {/* Hal-hazırda funksionallıq bağlanmayıb — yalnız UI elementi kimi var */}
    <button style={{
      position: "absolute", top: 10, right: 10, zIndex: 10,
      background: "none", border: "none", cursor: "pointer", padding: 4,
    }}>
      <Heart size={14} color="#ccc" />
    </button>

    {/* ── MƏHSUL ŞƏKLİ ── */}
    {/* Link sayəsində şəklə tıklandıqda məhsul detail səhifəsinə keçir */}
    <Link to={`/product/${product._id}`}>
      <div style={{
        width: "100%",
        aspectRatio: "1/1",       // kvadrat ölçü — şəkil uzanmır
        background: "#f8f8f8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}>
        {/* Şəkil varsa göstər, yoxdursa placeholder ikonu */}
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          // Şəkil yoxdursa çanta ikonu placeholder kimi göstərilir
          <ShoppingBag size={40} color="#ccc" />
        )}
      </div>
    </Link>

    {/* ── MƏHSUL MƏLUMATLARı ── */}
    <div style={{ padding: "10px 12px 12px" }}>
      {/* Məhsul adı — Link ilə detail səhifəsinə aparır */}
      <Link to={`/product/${product._id}`} style={{ textDecoration: "none" }}>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#222",
          marginBottom: 4,
          lineHeight: 1.3,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,         // maksimum 2 sətir — artıq hissə kəsilir
          WebkitBoxOrient: "vertical",
        }}>
          {product.name}
        </div>
      </Link>

      {/* Köhnə qiymət — yalnız originalPrice mövcuddursa və cari qiymətdən böyükdürsə göstərilir */}
      {product.originalPrice && product.originalPrice > product.price && (
        <div style={{ fontSize: 10, color: "#aaa", textDecoration: "line-through" }}>
          {product.originalPrice} ₼
        </div>
      )}

      {/* Qiymət + "Səbətə əlavə et" düyməsi */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
        {/* Cari qiymət — qırmızı rəngdə vurğulanır */}
        <span style={{ color: "#e53935", fontWeight: 800, fontSize: 15 }}>
          {product.price} ₼
        </span>

        {/* "+" düyməsi — tıklandıqda onAddToCart callback-ini çağırır */}
        <button
          onClick={() => onAddToCart(product._id)}
          style={{
            width: 26,
            height: 26,
            background: "#e53935",
            border: "none",
            borderRadius: "50%",      // dairəvi düymə
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          // Hover effekti — tünd qırmızıya keçir
          onMouseEnter={e => e.currentTarget.style.background = "#c62828"}
          onMouseLeave={e => e.currentTarget.style.background = "#e53935"}
        >
          <Plus size={14} color="#fff" />
        </button>
      </div>
    </div>
  </div>
);

// ============================================================
// BestSellers — Əsas "Çox Satılanlar" Bölməsi
// ============================================================
export default function BestSellers() {
  // rowRef — sürüşdürmə konteynerinə birbaşa DOM erişimi üçün
  // scroll() funksiyasında .scrollBy() çağırmaq üçün lazımdır
  const rowRef = useRef(null);

  // Səbətə əlavə etmə mutation-u
  const [addToCart] = useAddToCartMutation();

  // Bütün məhsulları API-dən çəkirik
  const { data: productsData, isLoading } = useGetProductsQuery({});

  // ── MƏHSUL SİYAHISININ NORMALLAŞDIRILMASI ──
  // API fərqli strukturlarda cavab verə bilər:
  // { products: [...] } || { data: [...] } || [...]
  // Hər üç halı idarə etmək üçün zəncirvari yoxlama aparılır
  const allProducts =
    productsData?.products ||
    productsData?.data ||
    (Array.isArray(productsData) ? productsData : []);

  // ── YATAY SÜRÜŞDÜRMƏ ──
  // dir: -1 (sola) və ya 1 (sağa)
  // scrollBy ilə 200px-lik hamar sürüşmə həyata keçirilir
  const scroll = (dir) => {
    rowRef.current.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  // ── SƏBƏTƏ ƏLAVƏ ET ──
  // Müvəffəqiyyət: toast bildirişi göstərir
  // Xəta: xəta bildirişi göstərir
  const handleAddToCart = async (productId) => {
    try {
      // .unwrap() — RTK Query-nin promise-ini açır, xəta varsa catch-ə düşür
      await addToCart({ productId, quantity: 1 }).unwrap();
      toast.success("Məhsul səbətə əlavə edildi");
    } catch {
      toast.error("Xəta baş verdi");
    }
  };

  return (
    <>
      {/* ── CSS STİLLƏR ── */}
      {/* <style> tagi ilə komponent-spesifik stillər və responsiv qaydalar */}
      <style>{`
        /* Ana bölmə — padding və arxa fon */
        .bestsellers-section {
          padding: 32px 16px;
          background: #f9f9f9;
        }

        /* Başlıq + naviqasiya düymələri sırası */
        .bestsellers-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        /* "Çox Satılanlar" başlığı */
        .bestsellers-title {
          font-size: 20px;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0;
        }

        /* Sol/sağ naviqasiya düymələrinin konteyner-i */
        .bestsellers-nav {
          display: flex;
          gap: 8px;
        }

        /* Yatay sürüşən kart sırası */
        .bestsellers-row {
          display: flex;
          gap: 14px;
          overflow-x: auto;               /* yatay scroll aktiv */
          scroll-snap-type: x mandatory;  /* snap scroll — kart hüduduna yapışır */
          -webkit-overflow-scrolling: touch; /* iOS-da hamar scroll */
          scrollbar-width: none;          /* Firefox-da scrollbar gizlədilir */
          padding-bottom: 8px;
        }

        /* Chrome/Safari-da scrollbar gizlədilir */
        .bestsellers-row::-webkit-scrollbar {
          display: none;
        }

        /* Hər kart scroll snap nöqtəsi kimi işlənir */
        .bestsellers-row > * {
          scroll-snap-align: start;
        }

        /* ── MOBİL (≤ 480px) ── */
        @media (max-width: 480px) {
          .bestsellers-section {
            padding: 20px 12px;
          }
          .bestsellers-title {
            font-size: 17px;
          }
          .bestsellers-row {
            gap: 10px;
          }
          /* Kart ölçüsü mobilə uyğunlaşdırılır */
          .bestsellers-row > div {
            min-width: 140px !important;
            max-width: 150px !important;
          }
          /* Nav düymələri mobilə uyğunlaşdırılır */
          .bestsellers-nav button {
            width: 30px !important;
            height: 30px !important;
          }
        }

        /* ── KİÇİK TABLET (481px – 768px) ── */
        @media (min-width: 481px) and (max-width: 768px) {
          .bestsellers-section {
            padding: 24px 16px;
          }
          /* Kart ölçüsü tablet üçün tənzimlənir */
          .bestsellers-row > div {
            min-width: 148px !important;
            max-width: 162px !important;
          }
        }
      `}</style>

      <section className="bestsellers-section">
        {/* ── BAŞLIQ + NAVİQASİYA DÜYMƏLƏRİ ── */}
        <div className="bestsellers-header">
          <h2 className="bestsellers-title">🔥 Çox Satılanlar</h2>
          <div className="bestsellers-nav">
            {/* Sola sürüşdürmə düyməsi */}
            <button style={navBtn} onClick={() => scroll(-1)} aria-label="Sola">
              <ChevronLeft size={16} />
            </button>
            {/* Sağa sürüşdürmə düyməsi */}
            <button style={navBtn} onClick={() => scroll(1)} aria-label="Sağa">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ── VƏZİYYƏT RENDER-İ ── */}
        {isLoading ? (
          // Yüklənir vəziyyəti — dönən loader ikonu
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <Loader2 size={32} color="#e53935" style={{ animation: "spin 1s linear infinite" }} />
            {/* Döndürmə animasiyası */}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : allProducts.length === 0 ? (
          // Məhsul tapılmadı vəziyyəti
          <div style={{ textAlign: "center", padding: "40px 0", color: "#aaa", fontSize: 14 }}>
            Məhsul tapılmadı
          </div>
        ) : (
          // Normal vəziyyət — yatay sürüşən kart sırası
          // ref={rowRef} ilə DOM elementinə birbaşa erişim əldə edirik
          <div className="bestsellers-row" ref={rowRef}>
            {allProducts.map((product) => (
              // Hər məhsul üçün ProductCard render edirik
              // key={product._id} — React-in list rendering optimizasiyası üçün lazım
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}   // callback ötürülür
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}