import { useRef } from "react";
import { useGetProductsQuery, useAddToCartMutation } from "../redux/api/productsApi";
import { Link } from "react-router-dom";
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

const ProductCard = ({ product, onAddToCart }) => (
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
    {/* Discount badge */}
    {product.discount > 0 && (
      <span style={{
        position: "absolute", top: 10, left: 10, zIndex: 10,
        background: "#e53935", color: "#fff", fontSize: 10, fontWeight: 700,
        padding: "2px 7px", borderRadius: 4,
      }}>
        -{product.discount}%
      </span>
    )}

    {/* Wishlist button */}
    <button style={{
      position: "absolute", top: 10, right: 10, zIndex: 10,
      background: "none", border: "none", cursor: "pointer", padding: 4,
    }}>
      <Heart size={14} color="#ccc" />
    </button>

    {/* Image */}
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

    {/* Info */}
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

export default function BestSellers() {
  const rowRef = useRef(null);
  const [addToCart] = useAddToCartMutation();
  const { data: productsData, isLoading } = useGetProductsQuery({});

  const allProducts =
    productsData?.products ||
    productsData?.data ||
    (Array.isArray(productsData) ? productsData : []);

  const scroll = (dir) => {
    rowRef.current.scrollBy({ left: dir * 200, behavior: "smooth" });
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
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#f5f5f5", padding: "24px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", margin: 0 }}>
            Ən Çox Satılan Məhsullar
          </h2>
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
              gap: 12,
              overflowX: "auto",
              paddingBottom: 8,
              scrollbarWidth: "none",
            }}
          >
            {allProducts.map(p => (
              <ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}