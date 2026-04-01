import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom"; // useNavigate əlavə edildi
import { useSearchProductsQuery } from "../redux/api/productsApi";
import StarRatings from "react-star-ratings";
import { Search, Home, ShoppingBag, ShoppingCart, AlertCircle, FilterX } from "lucide-react";

// 1. Skeleton Komponenti (Yüklənmə zamanı görünüş)
const ProductSkeleton = () => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-pulse flex flex-col md:flex-row items-center gap-6">
    <div className="w-full md:w-32 h-32 bg-gray-200 rounded-lg shrink-0"></div>
    <div className="flex-1 w-full space-y-3">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
    <div className="w-full md:w-40 flex flex-col gap-3">
      <div className="h-8 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate(); // React Router üçün düzgün yönləndirmə
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get("query") || "";
  const { data: results, isLoading, isError } = useSearchProductsQuery({ query });
  const [searchInput, setSearchInput] = useState(query);
  const defaultImageUrl = "https://via.placeholder.com/300";

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // window.location.href əvəzinə navigate istifadə etmək daha yaxşıdır (SPA üçün)
    navigate(`/search-results?query=${encodeURIComponent(searchInput)}`);
  };

  // Loading Ekranı
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl space-y-4 mt-10">
        {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
      </div>
    );
  }

  // Xəta Ekranı
  if (isError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Xəta baş verdi</h2>
        <p className="text-gray-500 mt-2">Məlumatları yükləyərkən problem yarandı. Zəhmət olmasa yenidən cəhd edin.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header Bölməsi */}
      <div className="bg-white shadow-sm border-b border-gray-100 mb-8">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
              <Home className="w-4 h-4" /> Ana Səhifə
            </Link>
            <span className="mx-2 text-gray-300">/</span>
            <Link to="/shop" className="hover:text-blue-600 flex items-center gap-1 transition-colors">
              <ShoppingBag className="w-4 h-4" /> Mağaza
            </Link>
            <span className="mx-2 text-gray-300">/</span>
            <span className="text-gray-800 font-medium">Axtarış</span>
          </div>

          {/* Axtarış Formu */}
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              "{query}" üçün axtarış nəticələri
            </h1>
            
            <form onSubmit={handleSearchSubmit} className="relative shadow-lg rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Məhsul axtar..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-4 py-4 border-0 rounded-xl ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-700 placeholder-gray-400"
              />
              <button 
                type="submit" 
                className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Axtar
              </button>
            </form>

            {results && (
               <p className="text-gray-500 mt-4 font-medium">
                 {results.totalProducts} məhsul tapıldı
               </p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Nəticə Tapılmadıqda */}
        {(!results || results.products.length === 0) ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FilterX className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Heç bir nəticə tapılmadı</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Axtarış sözünü dəyişdirərək və ya daha ümumi sözlər istifadə edərək yenidən cəhd edin.
            </p>
            <Link to="/shop" className="inline-block mt-8 px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all">
              Bütün Məhsullara Bax
            </Link>
          </div>
        ) : (
          /* Məhsul Siyahısı */
          <div className="space-y-4">
            {results.products.map((product) => {
              const imageUrl = product?.images?.[0]?.url || defaultImageUrl;
              const inStock = product.stock > 0;

              return (
                <div 
                  key={product._id} 
                  className="group bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                    
                    {/* Şəkil */}
                    <div className="relative w-full md:w-48 aspect-[4/3] md:aspect-square shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {!inStock && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                          <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">Bitib</span>
                        </div>
                      )}
                    </div>

                    {/* Məlumatlar */}
                    <div className="flex-1 text-center md:text-left w-full">
                      <Link 
                        to={`/product/${product._id}`}
                        className="text-lg md:text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 mb-2"
                      >
                        {product.name}
                      </Link>
                      
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                        <div className="flex text-yellow-400 text-sm">
                            <StarRatings
                              rating={product.ratings || 0}
                              starRatedColor="#FBBF24"
                              numberOfStars={5}
                              starDimension="16px"
                              starSpacing="1px"
                            />
                        </div>
                        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-md">
                          {product.numOfReviews} rəy
                        </span>
                      </div>

                      <p className="text-gray-500 text-sm line-clamp-2 mb-4 hidden md:block">
                        {product.description || "Məhsul haqqında ətraflı məlumat üçün keçid edin."}
                      </p>

                      {/* Mobil Stok Statusu */}
                      <div className="md:hidden mb-3">
                         <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${
                            inStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            {inStock ? 'Stokda var' : 'Stokda yoxdur'}
                          </span>
                      </div>
                    </div>

                    {/* Sağ Tərəf: Qiymət və Düymə */}
                    <div className="w-full md:w-auto flex flex-col gap-4 md:items-end md:justify-between md:h-full md:border-l md:pl-6 md:border-gray-100">
                      <div className="text-center md:text-right">
                        <span className="block text-2xl font-extrabold text-blue-600">
                          {product.price} ₼
                        </span>
                        <span className="text-xs text-gray-400 line-through mr-2">
                           {/* Əgər endirim varsa köhnə qiyməti bura yaza bilərsiniz */}
                        </span>
                         {/* Desktop Stok Statusu */}
                        <span className={`hidden md:inline-flex items-center gap-1 text-xs font-medium mt-1 ${
                          inStock ? 'text-green-600' : 'text-red-500'
                        }`}>
                          {inStock ? '● Stokda var' : '● Stokda yoxdur'}
                        </span>
                      </div>

                      <button 
                        disabled={!inStock}
                        className="w-full md:w-auto whitespace-nowrap bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-semibold shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {inStock ? 'Səbətə At' : 'Mövcud Deyil'}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;