import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useGetProductsQuery, useAddToCartMutation } from "../redux/api/productsApi";
import { toast } from "react-toastify";
import { Plus, Heart, ShoppingBag, Loader2 } from "lucide-react";

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

// Real product card (uses API data)
const RealProductCard = ({ product, onAddToCart }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      minWidth: 155,
      maxWidth: 175,
      flexShrink: 0,
      position: "relative",
      transition: "transform 0.2s, box-shadow 0.2s",
      cursor: "pointer",
      overflow: "hidden",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = "translateY(-3px)";
      e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.13)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)";
    }}
  >
    {product.discount > 0 && (
      <span style={{
        position: "absolute", top: 10, left: 10, zIndex: 10,
        background: "#e53935", color: "#fff", fontSize: 10, fontWeight: 700,
        padding: "2px 7px", borderRadius: 4,
      }}>
        -{product.discount}%
      </span>
    )}

    <button style={{
      position: "absolute", top: 10, right: 10, zIndex: 10,
      background: "none", border: "none", cursor: "pointer", padding: 4,
    }}>
      <Heart size={14} color="#ccc" />
    </button>

    <Link to={`/product/${product._id}`}>
      <div style={{
        width: "100%", aspectRatio: "1/1", background: "#f8f8f8",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <ShoppingBag size={40} color="#ccc" />
        )}
      </div>
    </Link>

    <div style={{ padding: "10px 12px 12px" }}>
      <Link to={`/product/${product._id}`} style={{ textDecoration: "none" }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: "#222",
          marginBottom: 4, lineHeight: 1.3,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {product.name}
        </div>
      </Link>

      {product.originalPrice && product.originalPrice > product.price && (
        <div style={{ fontSize: 10, color: "#aaa", textDecoration: "line-through" }}>
          {product.originalPrice} ₼
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ color: "#e53935", fontWeight: 800, fontSize: 15 }}>
          {product.price} ₼
        </span>
        <button
          onClick={() => onAddToCart(product._id)}
          style={{
            width: 26, height: 26,
            background: "#e53935", border: "none", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "background 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#c62828"}
          onMouseLeave={e => e.currentTarget.style.background = "#e53935"}
        >
          <Plus size={14} color="#fff" />
        </button>
      </div>
    </div>
  </div>
);

function RealProductRow({ title }) {
  const rowRef = useRef(null);
  const [addToCart] = useAddToCartMutation();
  const { data: productsData, isLoading } = useGetProductsQuery({});

  const allProducts =
    productsData?.products ||
    productsData?.data ||
    (Array.isArray(productsData) ? productsData : []);

  const scroll = (dir) => {
    rowRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart({ productId, quantity: 1 }).unwrap();
      toast.success("Məhsul səbətə əlavə edildi");
    } catch {
      toast.error("Xəta baş verdi");
    }
  };

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a1a1a", margin: 0 }}>{title}</h2>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => scroll(-1)} style={navBtn}>‹</button>
          <button onClick={() => scroll(1)} style={navBtn}>›</button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
          <Loader2 size={28} color="#e53935" />
        </div>
      ) : (
        <div
          ref={rowRef}
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            paddingBottom: 8,
            scrollbarWidth: "none",
            // Mobil: scroll snap
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <style>{`.product-row-hide::-webkit-scrollbar{display:none}`}</style>
          {allProducts.map(p => (
            <div key={p._id} style={{ scrollSnapAlign: "start" }}>
              <RealProductCard product={p} onAddToCart={handleAddToCart} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EcommerceHome() {
  const [slide, setSlide] = useState(0);
  const slides = [
    { title: "50%-dək", bold: "ENDİRİM!", sub: "Ən yaxşı elektronika məhsulları", emoji: "🎧" },
    { title: "30%-dək", bold: "ENDİRİM!", sub: "Yeni gələn məhsullar", emoji: "📱" },
  ];

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % slides.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <style>{`
        /* ── MOBİL EcommerceHome ── */
        .eco-home-wrap {
          font-family: 'Segoe UI', sans-serif;
          background: #f5f5f5;
          min-height: 100vh;
        }
        .eco-home-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 20px 16px;
        }
        /* Promo banner — mobilə uyğun */
        .promo-banner {
          background: linear-gradient(120deg, #c62828, #e53935);
          border-radius: 14px;
          padding: 24px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          overflow: hidden;
          position: relative;
        }
        .promo-banner-circle {
          position: absolute; right: -40px; top: -40px;
          width: 220px; height: 220px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          pointer-events: none;
        }
        .promo-title {
          color: #fff;
          font-size: 20px;
          font-weight: 800;
          line-height: 1.3;
          margin-bottom: 8px;
        }
        .promo-emoji {
          font-size: 70px;
          flex-shrink: 0;
          margin-left: 12px;
        }
        .promo-btn {
          background: #ffd600;
          color: #b71c1c;
          border: none;
          border-radius: 8px;
          padding: 9px 20px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          margin-top: 8px;
        }

        @media (max-width: 480px) {
          .eco-home-inner { padding: 14px 12px; }
          .promo-banner { padding: 18px 16px; border-radius: 12px; margin-bottom: 18px; }
          .promo-title { font-size: 16px; }
          .promo-emoji { font-size: 50px; }
          .promo-btn { padding: 8px 16px; font-size: 12px; }
        }
      `}</style>

      <div className="eco-home-wrap">
        <div className="eco-home-inner">
          {/* Promo Banner */}
          <div className="promo-banner">
            <div className="promo-banner-circle" />
            <div>
              <div className="promo-title">
                Yüksək Endirimlər<br />
                <span style={{ color: "#ffd600" }}>Möhtəşəm Endirimlər</span>i<br />
                Qaçırmayın!
              </div>
              <button className="promo-btn">İndi Al →</button>
            </div>
            <div className="promo-emoji">🛍️</div>
          </div>

          {/* Real Products */}
          <RealProductRow title="Yeni Gələnlər" />
        </div>
      </div>
    </>
  );
}