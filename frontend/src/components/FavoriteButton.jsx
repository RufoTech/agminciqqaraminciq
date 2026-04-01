// ============================================================
// FavoriteButton.jsx
// Bu komponent istifadəçinin favori məhsullarını göstərir.
// Redux Toolkit Query (RTK Query) ilə API-dən məlumat çəkir.
// ============================================================

import { useEffect, useState } from "react"
// useDispatch — Redux store-a action göndərmək üçün istifadə olunur
import { useDispatch } from "react-redux"
// useGetFavoritesQuery — favoriləri API-dən çəkən RTK Query hook-u
// useRemoveFromFavoritesMutation — favori silən mutation hook-u
// productApi — tag invalidasiyası üçün lazım olan API obyekti
import { useGetFavoritesQuery, useRemoveFromFavoritesMutation, productApi } from "../redux/api/productsApi"
// Link — səhifə yeniləmədən naviqasiya üçün React Router komponenti
import { Link } from "react-router-dom"
// toast — istifadəçiyə bildiriş göstərmək üçün kitabxana
import { toast } from "react-toastify"
// Lucide-dən lazımi ikonlar import edilir
import { Heart, Trash2, ShoppingBag, ArrowRight, AlertCircle, ShoppingCart, ArrowLeft } from "lucide-react"

const FavoriteButton = () => {
  // Redux dispatch funksiyasını alırıq (action göndərmək üçün)
  const dispatch = useDispatch()

  // API-dən favoriləri çəkirik
  // refetchOnMountOrArgChange: true — komponent hər mount olduqda yenidən sorğu göndərir
  const {
    data: favoriteData,   // API-dən gələn cavab məlumatı
    isLoading,            // sorğu hələ davam edirsə true olur
    refetch,              // sorğunu əl ilə yenidən göndərən funksiya
  } = useGetFavoritesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })

  // Silmə əməliyyatı üçün mutation hook-u
  const [removeFromFavorites] = useRemoveFromFavoritesMutation()

  // Lokalda saxlanılan favorilər siyahısı (UI-ı dərhal yeniləmək üçün)
  const [localFavorites, setLocalFavorites] = useState([])

  // API məlumatı dəyişdikdə lokal state-i sinxronlaşdırırıq
  useEffect(() => {
    if (favoriteData?.favorites) {
      // API-dən favorilər gəldisə, lokal state-ə yazırıq
      setLocalFavorites(favoriteData.favorites)
    } else {
      // Favorilər boşdursa və ya xəta varsa, boş array qoyuruq
      setLocalFavorites([])
    }
  }, [favoriteData]) // favoriteData dəyişdikdə bu effect işə düşür

  // Məhsulu favorilərdən silən funksiya
  // e — click hadisəsi (Link-in işləməsinin qarşısını almaq üçün lazım)
  // productId — silinəcək məhsulun ID-si
  const handleRemoveFromFavorites = async (e, productId) => {
    // e.preventDefault() — Link-in aktivləşməsinin qarşısını alır,
    // yəni kart tıklananda product səhifəsinə getmir, yalnız silmə işlənir
    e.preventDefault()
    try {
      // API-yə silmə sorğusu göndəririk, .unwrap() xətanı catch-ə ötürür
      await removeFromFavorites(productId).unwrap()

      // Lokal state-dən silinən məhsulu çıxarırıq (UI dərhal yenilənir)
      setLocalFavorites((prev) => prev.filter((item) => item._id !== productId))

      // Uğurlu bildiriş göstəririk
      toast.success("Məhsul favorilərdən silindi")

      // RTK Query cache-dəki "Favorites" tag-ını etibarsız edir ki,
      // növbəti sorğuda yenilənmiş məlumat gəlsin
      dispatch(productApi.util.invalidateTags(["Favorites"]))

      // API-dən ən son məlumatı yenidən çəkirik
      await refetch()
    } catch (error) {
      // Xəta baş verərsə, xəta bildirişi göstəririk
      toast.error("Xəta baş verdi")
    }
  }

  // ── YÜKLƏNİR EKRANı ──
  // API sorğusu davam edərkən göstərilən loading vəziyyəti
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        {/* Dönən yükləmə animasiyası */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Favorilər yüklənir...</p>
      </div>
    )
  }

  // ── BOŞ SİYAHI EKRANı ──
  // Favorilər boş olduqda göstərilən vəziyyət
  if (!localFavorites || localFavorites.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
          {/* Böyük ürək ikonu — boş siyahı vizualı */}
          <div className="bg-red-50 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6">
            <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 fill-red-500" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Favoriləriniz Boşdur</h2>
          <p className="text-gray-500 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
            Bəyəndiyiniz məhsulları yadda saxlamaq üçün ürək ikonuna klikləyin.
          </p>
          {/* Mağazaya yönləndirən düymə */}
          <Link
            to="/shop"
            className="inline-flex items-center justify-center w-full bg-gray-900 text-white px-6 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-gray-300"
          >
            <ShoppingBag className="mr-2 w-5 h-5" />
            Mağazaya Keç
          </Link>
        </div>
      </div>
    )
  }

  // ── ANA RENDER — FAVORİLƏR SİYAHISI ──
  return (
    <section className="bg-gray-50 min-h-screen py-8 sm:py-12 font-sans">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── BAŞLIQ HİSSƏSİ ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-7 sm:mb-10 gap-3 sm:gap-4">
          <div>
            {/* Başlıq: "Favorilər" yazısı + ürək ikonu */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2 sm:gap-3">
              Favorilər <Heart className="text-red-500 fill-red-500 w-6 h-6 sm:w-8 sm:h-8" />
            </h1>
            {/* Neçə məhsulun siyahıda olduğunu göstərir */}
            <p className="text-gray-500 mt-1 sm:mt-2 text-base sm:text-lg">
              Siyahınızda <span className="font-bold text-gray-900">{localFavorites.length}</span> məhsul var
            </p>
          </div>

          {/* Alış-verişə davam et linki — /shop səhifəsinə aparır */}
          <Link
            to="/shop"
            className="group flex items-center text-indigo-600 font-semibold hover:text-indigo-800 transition-colors text-sm sm:text-base"
          >
            {/* Sol ox ikonu — hover-da sola hərəkət animasiyası var */}
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 group-hover:-translate-x-1 transition-transform" />
            Alış-verişə davam et
          </Link>
        </div>

        {/* ── MƏHSUL GRİD-İ ── */}
        {/* Responsiv sütun sayı: mobil 2, sm 2, lg 3, xl 4 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-8">

          {/* Hər bir favori məhsul üçün kart render edilir */}
          {localFavorites.map((product) => (
            // Karta tıklandıqda məhsulun detail səhifəsinə keçir
            <Link
              to={`/product/${product._id}`}
              key={product._id}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* ── ŞƏKİL SAHƏSİ ── */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                {/* Məhsul şəkli — hover-da böyüyür (scale-110) */}
                <img
                  src={product.images?.[0]?.url || "/default-product.jpg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* ── SİLMƏ DÜYMƏSİ ── */}
                {/* e.preventDefault() sayəsində Link-i aktivləşdirmədən yalnız silir */}
                <button
                  onClick={(e) => handleRemoveFromFavorites(e, product._id)}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 sm:p-2.5 bg-white/90 backdrop-blur-sm text-gray-400 rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-all duration-200 z-10"
                  title="Favorilərdən sil"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* ── STOK BADGE-İ ── */}
                {/* Stok 1-4 arasındadırsa "az qalıb" xəbərdarlığı göstərir */}
                {product.stock < 5 && product.stock > 0 && (
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full flex items-center shadow-sm">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {/* "Son" sözü yalnız SM və yuxarı ekranlarda görünür */}
                    <span className="hidden sm:inline">Son </span>{product.stock}
                  </div>
                )}

                {/* Stok 0 olduqda məhsulun üzərinə "Bitib" overlay-i göstərilir */}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="bg-gray-900 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold">Bitib</span>
                  </div>
                )}
              </div>

              {/* ── MƏLUMAT SAHƏSİ ── */}
              <div className="p-3 sm:p-5 flex flex-col flex-1">
                <div className="flex-1">
                  {/* Məhsul adı — maksimum 2 sətir göstərilir (line-clamp-2) */}
                  <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">
                    {product.name}
                  </h3>

                  {/* Qiymət sahəsi */}
                  <div className="flex items-baseline gap-1.5 sm:gap-2 mb-2 sm:mb-4">
                    {/* Cari qiymət */}
                    <span className="text-base sm:text-xl font-extrabold text-indigo-600">
                      {product.price.toFixed(2)} ₼
                    </span>
                    {/* Köhnə qiymət varsa üstü xəttli göstərilir */}
                    {product.oldPrice && (
                      <span className="text-xs sm:text-sm text-gray-400 line-through decoration-gray-400">
                        {product.oldPrice.toFixed(2)} ₼
                      </span>
                    )}
                  </div>
                </div>

                {/* ── AKSİYON DÜYMƏSİ ── */}
                {/* Məhsula bax düyməsi — karta tıklayanda Link işlədiyindən
                    bu düymə əslində əlavə naviqasiya təmin edir */}
                <div className="mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-gray-100">
                  <button className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 hover:bg-indigo-600 hover:text-white text-gray-900 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 group/btn text-xs sm:text-sm">
                    <ShoppingCart className="w-4 h-4" />
                    <span>Məhsula Bax</span>
                    {/* Sağ ox ikonu — yalnız hover-da görünür, SM+ ekranlarda aktiv */}
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all hidden sm:block" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FavoriteButton