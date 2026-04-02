"use client"

import {
  useGetCartQuery,
  useRemoveFromCartMutation,
  useUpdateCartQuantityMutation,
  useGetProductsQuery,
  useAddToCartMutation,
} from "../redux/api/productsApi"
import { Link, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight,
  ChevronLeft, Heart, Shield, RotateCcw, Loader2, Tag
} from "lucide-react"

const SebetCart = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.userSlice)
  const { data: cartData, isLoading, error } = useGetCartQuery(undefined, { skip: !isAuthenticated })
  const [removeFromCart] = useRemoveFromCartMutation()
  const [updateQuantity] = useUpdateCartQuantityMutation()
  const [addToCart] = useAddToCartMutation()

  // Fetch ALL products (no limit) for recommendations
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery({})

  const calculateTotal = () => {
    if (!cartData?.cart) return 0
    return cartData.cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  const subtotal = calculateTotal()
  const shipping = subtotal > 100 ? 0 : 5
  const total = subtotal + shipping

  const handleQuantityChange = async (productId, currentQuantity, stock, change) => {
    const newQuantity = currentQuantity + change
    if (newQuantity < 1 || newQuantity > stock) {
      toast.error(newQuantity < 1 ? "Minimum say 1 olmalıdır" : "Stokda kifayət qədər məhsul yoxdur")
      return
    }
    try {
      await updateQuantity({ productId, quantity: newQuantity }).unwrap()
    } catch {
      toast.error("Xəta baş verdi")
    }
  }

  const handleRemoveFromCart = async (productId) => {
    try {
      await removeFromCart(productId).unwrap()
      toast.success("Məhsul silindi")
    } catch {
      toast.error("Silinmə zamanı xəta baş verdi")
    }
  }

  const handleAddToCart = async (productId) => {
    try {
      await addToCart({ productId, quantity: 1 }).unwrap()
      toast.success("Məhsul səbətə əlavə edildi")
    } catch {
      toast.error("Xəta baş verdi")
    }
  }

  const handleGoToPayment = () => {
    navigate("/payment")
  }

  // Normalize products from any API shape
  const allProducts =
    productsData?.products ||
    productsData?.data ||
    (Array.isArray(productsData) ? productsData : [])

  // ─── Loading ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 text-[#E63946] animate-spin mb-3" />
        <p className="text-gray-400 text-sm">Səbətiniz yüklənir...</p>
      </div>
    )
  }

  // ─── Empty Cart ────────────────────────────────────────────
  if (error || !cartData?.cart?.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <Link to="/shop" className="text-gray-500 hover:text-[#E63946] transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-gray-900">Səbət</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Empty state card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center mb-10">
            <div className="w-24 h-24 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
              <ShoppingBag className="w-12 h-12 text-[#E63946]" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Səbətiniz boşdur</h2>
            <p className="text-gray-500 text-sm text-center mb-6 max-w-xs">
              Gəlin bunu düzəldək! Arzuladığınız məhsulları tapmaq üçün indi başlayın.
            </p>
            <Link
              to="/shop"
              className="flex items-center gap-2 bg-[#E63946] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              Alış-verişə başla
            </Link>
          </div>

          {/* Recommendations */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Sizin üçün tövsiyə olunanlar</h3>
            <Link to="/shop" className="text-xs text-[#E63946] font-medium hover:underline">
              Hamısına bax →
            </Link>
          </div>

          {productsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-[#E63946] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {allProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─── Full Cart ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Link to="/shop" className="text-gray-500 hover:text-[#E63946] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">Səbət</h1>
          <span className="text-xs bg-[#E63946] text-white rounded-full px-2 py-0.5 font-semibold">
            {cartData.cart.length}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Cart Items (left 2/3) ── */}
          <div className="lg:col-span-2 space-y-3">
            {cartData.cart.map((item) => (
              <div
                key={item.product._id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <Link to={`/product/${item.product._id}`} className="shrink-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden">
                    <img
                      className="w-full h-full object-cover"
                      src={item.product.images?.[0]?.url || "/placeholder.svg"}
                      alt={item.product.name}
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product._id}`}>
                    <h3 className="text-sm font-semibold text-gray-900 hover:text-[#E63946] transition-colors line-clamp-1 mb-0.5">
                      {item.product.name}
                    </h3>
                  </Link>
                  {item.product.color && (
                    <p className="text-xs text-gray-400">
                      Rəng: {item.product.color}
                      {item.product.size ? ` · Ölçü: ${item.product.size}` : ""}
                      {item.product.memory ? ` · Yaddaş: ${item.product.memory}` : ""}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleQuantityChange(item.product._id, item.quantity, item.product.stock, -1)}
                    disabled={item.quantity <= 1}
                    className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all text-xs
                      ${item.quantity <= 1
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-[#E63946] bg-[#E63946] text-white hover:bg-red-600'}`}
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="w-7 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.product._id, item.quantity, item.product.stock, 1)}
                    className="w-6 h-6 rounded-md border border-[#E63946] text-[#E63946] flex items-center justify-center hover:bg-[#E63946] hover:text-white transition-all"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Price */}
                <div className="shrink-0 text-right w-20">
                  <p className="text-sm font-bold text-[#E63946]">
                    {(item.product.price * item.quantity).toFixed(2)} ₼
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-[10px] text-gray-400">{item.product.price} ₼ / ədəd</p>
                  )}
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleRemoveFromCart(item.product._id)}
                  className="shrink-0 p-1.5 text-gray-300 hover:text-[#E63946] hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Continue shopping */}
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-sm text-[#E63946] font-medium hover:underline mt-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Alış-verişə davam et
            </Link>
          </div>

          {/* ── Order Summary (right 1/3) ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sticky top-24">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#E63946]" />
                Sifariş Məlumatı
              </h3>

              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between text-gray-500">
                  <span>Məhsullar ({cartData.cart.length} ədəd)</span>
                  <span className="font-medium text-gray-800">{subtotal.toFixed(2)} ₼</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Çatdırılma</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                    {shipping === 0 ? "Pulsuz" : `${shipping} ₼`}
                  </span>
                </div>
                {subtotal <= 100 && (
                  <p className="text-[11px] text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                    💡 {(100 - subtotal).toFixed(2)} ₼ daha əlavə et — çatdırılma pulsuz olsun!
                  </p>
                )}
              </div>

              <div className="border-t border-dashed border-gray-200 pt-4 mb-5 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900">Cəmi</span>
                <span className="text-xl font-extrabold text-[#E63946]">{total.toFixed(2)} ₼</span>
              </div>

              {/* ── Payment Button (useNavigate ilə) ── */}
              <button
                onClick={handleGoToPayment}
                className="w-full bg-[#E63946] text-white py-3 rounded-xl text-sm font-bold hover:bg-red-600 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                Sifarişi tamamla
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 flex items-center justify-center gap-5 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#E63946]" />
                  Təhlükəsiz ödəniş
                </span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3 h-3 text-[#E63946]" />
                  Asan qaytarılma
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Recommendations below cart ── */}
        {allProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Sizin üçün tövsiyə olunanlar</h3>
              <Link to="/shop" className="text-xs text-[#E63946] font-medium hover:underline">
                Hamısına bax →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {allProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Reusable Product Card ─────────────────────────────────
const ProductCard = ({ product, onAddToCart }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative">
    {product.discount > 0 && (
      <span className="absolute top-2 left-2 z-10 text-[10px] font-bold bg-[#E63946] text-white px-1.5 py-0.5 rounded-full">
        -{product.discount}%
      </span>
    )}

    <button className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
      <Heart className="w-3.5 h-3.5 text-gray-400 hover:text-[#E63946] transition-colors" />
    </button>

    <Link to={`/product/${product._id}`}>
      <div className="w-full aspect-square bg-gray-50 overflow-hidden">
        {product.images?.[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>
    </Link>

    <div className="p-2.5">
      <Link to={`/product/${product._id}`}>
        <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-relaxed mb-1.5 hover:text-[#E63946] transition-colors">
          {product.name}
        </p>
      </Link>

      {product.originalPrice && product.originalPrice > product.price && (
        <p className="text-[10px] text-gray-400 line-through">{product.originalPrice} ₼</p>
      )}

      <div className="flex items-center justify-between mt-1">
        <span className="text-sm font-bold text-gray-900">{product.price} ₼</span>
        <button
          onClick={() => onAddToCart(product._id)}
          className="w-6 h-6 bg-[#E63946] rounded-full flex items-center justify-center hover:bg-red-600 active:scale-90 transition-all shadow-sm"
        >
          <Plus className="w-3 h-3 text-white" />
        </button>
      </div>
    </div>
  </div>
)

export default SebetCart