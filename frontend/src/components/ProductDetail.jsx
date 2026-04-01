"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import {
  useGetProductDetailsQuery,
  useAddToCartMutation,
  useAddToFavoritesMutation,
  useCreateOrUpdateReviewMutation,
  useGetProductReviewsQuery,
} from "../redux/api/productsApi"

import {
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Star,
  User,
  CheckCircle,
  AlertCircle,
  Zap,
  Store,
  Minus,
  Plus,
  ChevronDown,
  Share2,
  ArrowLeft,
} from "lucide-react"

import { toast, Toaster } from "react-hot-toast"
import StarRatings from "react-star-ratings"

const ProductDetail = () => {
  const params = useParams()

  const { data, isLoading, error } = useGetProductDetailsQuery(params?.id, {
    refetchOnMountOrArgChange: true,
  })
  const product = data?.product

  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError } =
    useGetProductReviewsQuery(params?.id, { refetchOnMountOrArgChange: true })

  const [addToCart] = useAddToCartMutation()
  const [addToFavorites] = useAddToFavoritesMutation()
  const [createOrUpdateReview] = useCreateOrUpdateReviewMutation()

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [descExpanded, setDescExpanded] = useState(false)

  // Countdown timer state — starts at 2h 30m 45s
  const [timeLeft, setTimeLeft] = useState(2 * 3600 + 30 * 60 + 45)

  useEffect(() => {
    if (timeLeft <= 0) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [timeLeft])

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, "0")} : ${String(m).padStart(2, "0")} : ${String(s).padStart(2, "0")}`
  }

  const productImages = product?.images || []
  const productImageUrl =
    productImages.length > 0
      ? productImages[currentImageIndex].url
      : "https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front-dark.svg"

  const handleAddToCart = async (e) => {
    e.preventDefault()
    try {
      await addToCart({ productId: product._id, quantity }).unwrap()
      toast.success("Məhsul səbətə əlavə edildi")
    } catch (error) {
      toast.error("Xəta baş verdi")
    }
  }

  const handleAddToFavorites = async (e) => {
    e.preventDefault()
    try {
      const result = await addToFavorites(product._id).unwrap()
      if (result.success) toast.success("Favorilərə əlavə edildi")
    } catch (error) {
      const message = error.data?.message || "Xəta baş verdi"
      if (message.toLowerCase().includes("already")) {
        toast("Bu məhsul artıq favorilərdədir", { icon: "ℹ️" })
      } else {
        toast.error(message)
      }
    }
  }

  const handleImageNavigation = (direction) => {
    if (direction === "prev") {
      setCurrentImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))
    } else {
      setCurrentImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))
    }
  }

  // ════════════════════════════════════════════════════
  // getSpecs — kateqoriyaya görə texniki xüsusiyyətlər
  // ════════════════════════════════════════════════════
  const getSpecs = () => {
    if (!product) return []
    switch (product.category) {

      case "Phones":
        return [
          { label: "Ekran Ölçüsü",      value: product.screenSize },
          { label: "Yaddaş",            value: product.storage },
          { label: "RAM",               value: product.ram },
          { label: "Ön Kamera",         value: product.frontCamera },
          { label: "Arxa Kamera",       value: product.backCamera },
          { label: "Batareya",          value: product.battery },
          { label: "Prosessor",         value: product.processor },
          { label: "Əməliyyat Sistemi", value: product.operatingSystem },
        ].filter(s => s.value)

      case "Laptops":
        return [
          { label: "Ekran Ölçüsü",      value: product.screenSize },
          { label: "Yaddaş",            value: product.storage },
          { label: "RAM",               value: product.ram },
          { label: "GPU",               value: product.gpu },
          { label: "Kamera",            value: product.camera },
          { label: "Prosessor",         value: product.processor },
          { label: "Batareya Ömrü",     value: product.batteryLife },
          { label: "Əməliyyat Sistemi", value: product.operatingSystem },
        ].filter(s => s.value)

      case "Cameras":
        return [
          { label: "Həlledicilik",           value: product.resolution },
          { label: "Optik Zoom",             value: product.opticalZoom },
          { label: "Sensor Tipi",            value: product.sensorType },
          { label: "Görüntü Sabitləşdirmə", value: product.imageStabilization },
        ].filter(s => s.value)

      case "Headphones":
        return [
          { label: "Bağlantı",         value: product.connectivity },
          { label: "Batareya Ömrü",    value: product.batteryLife },
          { label: "Səs İzolyasiyası", value: product.noiseCancellation },
        ].filter(s => s.value)

      case "Console":
        return [
          { label: "CPU",                      value: product.cpu },
          { label: "GPU",                      value: product.gpu },
          { label: "Yaddaş",                   value: product.storage },
          { label: "RAM",                      value: product.memory },
          { label: "Dəstəklənən Həlledicilik", value: product.supportedResolution },
          { label: "Bağlantı",                 value: product.connectivity },
          { label: "Controller",               value: product.controllerIncluded ? "Daxildir" : null },
        ].filter(s => s.value)

      case "iPad":
        return [
          { label: "Ekran Ölçüsü",      value: product.ipadScreenSize || product.screenSize },
          { label: "Yaddaş",            value: product.ipadStorage || product.storage },
          { label: "RAM",               value: product.ipadRam || product.ram },
          { label: "Prosessor",         value: product.ipadProcessor || product.processor },
          { label: "Batareya",          value: product.ipadBattery || product.battery },
          { label: "Əməliyyat Sistemi", value: product.ipadOperatingSystem || product.operatingSystem },
          { label: "Kamera",            value: product.ipadCamera || product.camera },
          { label: "Cellular",          value: product.cellular ? "Bəli" : null },
        ].filter(s => s.value)

      case "WomenClothing":
      case "MenClothing":
      case "KidsClothing":
        return [
          { label: "Ölçü",        value: product.size },
          { label: "Rəng",        value: product.color },
          { label: "Material",    value: product.material },
          { label: "Brend",       value: product.brand },
          { label: "Mövsüm",      value: product.season },
          { label: "Yaş Aralığı", value: product.ageRange },
          { label: "Cins",        value: product.gender },
        ].filter(s => s.value)

      case "HomeAppliances":
        return [
          { label: "Brend",         value: product.brand },
          { label: "Güc İstehlakı", value: product.powerConsumption },
          { label: "Zəmanət",       value: product.warranty },
          { label: "Ölçülər",       value: product.dimensions },
          { label: "Rəng",          value: product.color },
        ].filter(s => s.value)

      case "HomeAndGarden":
        return [
          { label: "Material",      value: product.material },
          { label: "Ölçülər",       value: product.dimensions },
          { label: "Rəng",          value: product.color },
          { label: "Brend",         value: product.brand },
          { label: "İstifadə Yeri", value: product.indoorOutdoor },
        ].filter(s => s.value)

      case "Beauty":
        return [
          { label: "Brend",               value: product.brand },
          { label: "Dəri Tipi",           value: product.skinType },
          { label: "Həcm",                value: product.volume },
          { label: "Tərkib",              value: product.ingredients },
          { label: "Son İstifadə Tarixi", value: product.expiryDate },
        ].filter(s => s.value)

      case "Sports":
        return [
          { label: "Brend",    value: product.brand },
          { label: "Material", value: product.material },
          { label: "Çəki",     value: product.weight },
          { label: "Uyğundur", value: product.suitableFor },
          { label: "Rəng",     value: product.color },
        ].filter(s => s.value)

      case "Automotive":
        return [
          { label: "Brend",          value: product.brand },
          { label: "Uyğun Modellər", value: product.compatibleModels },
          { label: "Material",       value: product.material },
          { label: "Zəmanət",        value: product.warranty },
          { label: "Rəng",           value: product.color },
        ].filter(s => s.value)

      default:
        return []
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (reviewRating === 0) { toast.error("Zəhmət olmasa ulduz seçin"); return }
    try {
      const response = await createOrUpdateReview({
        productId: product._id,
        rating: reviewRating,
        comment: reviewComment,
      }).unwrap()
      toast.success(response.message || "Rəy göndərildi")
      setReviewRating(0)
      setReviewComment("")
    } catch (err) {
      toast.error(err.data?.message || "Xəta baş verdi")
    }
  }

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
      </div>
    )

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-600 gap-4">
        <AlertCircle size={48} />
        <p className="text-xl font-semibold">Xəta: {error.message}</p>
      </div>
    )

  const originalPrice = product?.originalPrice || Math.round((product?.price || 0) * 1.25)
  const discountPercent = product?.discount || 25

  /* ─────────────────────────────────────────────
     RIGHT / DETAIL PANEL — shared between mobile & desktop
  ───────────────────────────────────────────── */
  const DetailPanel = () => (
    <div className="flex flex-col">
      {/* Flash Sale */}
      <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-red-500 fill-red-500" />
          <span className="text-red-500 font-bold text-xs tracking-widest uppercase">Flash Sale</span>
        </div>
        <span className="text-red-500 font-mono font-bold tracking-widest text-sm">{formatTime(timeLeft)}</span>
      </div>

      {/* Price */}
      <div className="flex items-end gap-3 mb-2">
        <span className="text-3xl font-extrabold text-gray-900">₼{product?.price}</span>
        <span className="text-lg text-gray-400 line-through mb-0.5">₼{originalPrice}</span>
        <span className="mb-0.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
          -{discountPercent}% ENDİRİM
        </span>
      </div>

      {/* Name */}
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 leading-snug">
        {product?.name}
      </h1>

      {/* Store row */}
      <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
            <Store size={16} className="text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Elite Store</p>
            <div className="flex items-center gap-1">
              <Star size={11} fill="#f59e0b" className="text-amber-400" />
              <span className="text-xs text-gray-500">4.8 (1k rəy)</span>
            </div>
          </div>
        </div>
        <button className="text-xs font-semibold text-red-500 border border-red-400 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors">
          Mağazaya bax
        </button>
      </div>

      {/* Quantity + Cart + Fav */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="w-10 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Minus size={15} />
          </button>
          <span className="w-8 text-center font-bold text-gray-800 text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            className="w-10 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Plus size={15} />
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          className="flex-1 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-200 text-sm"
        >
          <ShoppingCart size={18} />
          Səbətə əlavə et
        </button>

        <button
          onClick={handleAddToFavorites}
          className="w-11 h-11 border-2 border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <Heart size={18} />
        </button>
      </div>

      {/* Stock */}
      <div className={`text-sm font-medium flex items-center gap-1.5 mb-4 ${product?.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
        {product?.stock > 0
          ? <><CheckCircle size={14} /> Stokda var ({product?.stock} ədəd)</>
          : <><AlertCircle size={14} /> Stokda yoxdur</>
        }
      </div>

      {/* Description */}
      <div className="mb-5 border-t border-gray-100 pt-4">
        <p className={`text-gray-500 leading-relaxed text-sm ${!descExpanded ? "line-clamp-3" : ""}`}>
          {product?.description || "Məhsul haqqında məlumat yoxdur."}
        </p>
        <button
          onClick={() => setDescExpanded(v => !v)}
          className="flex items-center gap-1 text-red-500 text-xs font-semibold mt-2"
        >
          {descExpanded ? "Daha az" : "Daha çox oxu"}
          <ChevronDown size={12} className={`transition-transform ${descExpanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Specs */}
      {getSpecs().length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Texniki Göstəricilər</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 text-sm">
            {getSpecs().map((spec, index) => (
              <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-400 text-xs">{spec.label}</span>
                <span className="font-semibold text-gray-800 text-xs text-right">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  /* ─────────────────────────────────────────────
     REVIEWS SECTION — shared
  ───────────────────────────────────────────── */
  const ReviewsSection = () => (
    <div className="mt-8 grid lg:grid-cols-3 gap-6">
      {/* Review form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-5 rounded-2xl shadow-lg sticky top-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Rəy Bildirin</h3>
          <form onSubmit={handleReviewSubmit}>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-2">Qiymətləndirmə</label>
              <StarRatings
                rating={reviewRating}
                changeRating={setReviewRating}
                numberOfStars={5}
                starRatedColor="#EF4444"
                starHoverColor="#EF4444"
                starDimension="22px"
                starSpacing="3px"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-2">Şərhiniz</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Məhsul haqqında fikirləriniz..."
                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all resize-none h-28 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 active:scale-95 text-white py-2.5 rounded-xl font-bold transition-all shadow-md shadow-red-100 text-sm"
            >
              Rəyi Göndər
            </button>
          </form>
        </div>
      </div>

      {/* Existing reviews */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-gray-900">İstifadəçi Rəyləri</h3>
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
            <Star size={13} fill="#f59e0b" className="text-amber-400" />
            <span className="text-xs font-bold text-amber-700">{product?.ratings?.toFixed(1) || "0.0"}</span>
          </div>
        </div>

        {reviewsLoading ? (
          <div className="text-center py-10 text-gray-400 text-sm">Yüklənir...</div>
        ) : reviewsError ? (
          <div className="text-red-500 text-sm">Rəyləri gətirmək mümkün olmadı.</div>
        ) : reviewsData?.reviews?.length > 0 ? (
          <div className="grid gap-3">
            {reviewsData.reviews.map((review, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-3">
                <div className="shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    <User size={18} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 text-sm">İstifadəçi</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < review.rating ? "#f59e0b" : "none"}
                          className={i < review.rating ? "text-amber-400" : "text-gray-300"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400">
            <p className="text-sm">Bu məhsul üçün hələ heç kim rəy yazmayıb. İlk siz olun!</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <section className="bg-gray-100 min-h-screen font-sans text-gray-800">
      <Toaster position="top-center" />

      {/* ══════════════════════════════════════
          MOBILE LAYOUT  (< lg)
      ══════════════════════════════════════ */}
      <div className="lg:hidden">
        {/* Hero image area — full bleed with beige bg */}
        <div className="relative bg-[#f5ede3]" style={{ paddingBottom: "100%" }}>
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-10 pb-4">
            <button
              onClick={() => window.history.back()}
              className="w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow"
            >
              <ArrowLeft size={18} className="text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow">
                <Share2 size={16} className="text-gray-700" />
              </button>
              <button
                onClick={handleAddToFavorites}
                className="w-9 h-9 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow"
              >
                <Heart size={16} className="text-gray-700" />
              </button>
            </div>
          </div>

          {/* Product image */}
          <div className="absolute inset-0 flex items-center justify-center group">
            <img
              src={productImageUrl}
              alt={product?.name}
              className="w-3/4 h-3/4 object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
            />
            {productImages.length > 1 && (
              <>
                <button
                  onClick={() => handleImageNavigation("prev")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur text-gray-800 p-1.5 rounded-full shadow-lg"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => handleImageNavigation("next")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur text-gray-800 p-1.5 rounded-full shadow-lg"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Dot indicators */}
          {productImages.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentImageIndex === index ? "w-5 bg-red-500" : "w-1.5 bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* White card content */}
        <div className="bg-white rounded-t-3xl -mt-5 relative z-10 px-5 pt-6 pb-8">
          <DetailPanel />
        </div>

        {/* Reviews */}
        <div className="px-4 pb-10">
          <ReviewsSection />
        </div>
      </div>

      {/* ══════════════════════════════════════
          DESKTOP LAYOUT  (lg+)
          Left: sticky image column
          Right: scrollable detail + reviews
      ══════════════════════════════════════ */}
      <div className="hidden lg:flex min-h-screen">

        {/* ── LEFT: Sticky image panel ── */}
        <div className="w-[42%] xl:w-[40%] shrink-0 sticky top-0 h-screen bg-[#f5ede3] flex flex-col justify-center p-8 xl:p-12">
          <div className="relative aspect-square rounded-2xl overflow-hidden flex items-center justify-center group">
            <img
              src={productImageUrl}
              alt={product?.name}
              className="w-4/5 h-4/5 object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
            />
            {productImages.length > 1 && (
              <>
                <button
                  onClick={() => handleImageNavigation("prev")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => handleImageNavigation("next")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {productImages.length > 1 && (
            <div className="flex justify-center mt-6 gap-3 overflow-x-auto py-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    currentImageIndex === index
                      ? "border-red-500 ring-2 ring-red-200 ring-offset-2"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={image.url} alt={`Thumb ${index}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Scrollable content ── */}
        <div className="flex-1 overflow-y-auto bg-gray-100">
          <div className="p-8 xl:p-12">

            {/* Detail card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 xl:p-10 mb-8">
              <DetailPanel />
            </div>

            {/* Reviews */}
            <ReviewsSection />

            <div className="h-10" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductDetail