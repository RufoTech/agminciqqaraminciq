import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Phone, Mail, Facebook, Instagram, Loader2, Store as StoreIcon, Package, ArrowLeft, ShoppingBag } from 'lucide-react'
import { useGetStoreBySlugQuery } from '../redux/api/authApi'
import ProductCard from './ProductCard'

const Store = () => {
  const { slug } = useParams()       // URL-dəki 'vsal-market-4114' hissəsini tutur
  const navigate  = useNavigate()

  // ════════════════════════════════════════════════════
  // Backend-dən mağaza məlumatlarını + məhsulları çək
  // authApi-dəki getStoreBySlug endpoint-i çağırılır
  // Cavab: { success, store, products, totalProducts }
  // ════════════════════════════════════════════════════
  const { data, isLoading, isError } = useGetStoreBySlugQuery(slug)

  // ── Yüklənmə ekranı ──
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
      </div>
    )
  }

  // ── Tapılmadı / xəta ekranı ──
  if (isError || !data?.store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Mağaza tapılmadı!</h2>
          <p className="text-gray-500 mt-2">Daxil etdiyiniz link yanlış ola bilər.</p>
        </div>
      </div>
    )
  }

  const { store, products, totalProducts } = data

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');

        .store-products-section { max-width: 1280px; margin: 48px auto 0; padding: 0 24px 60px; }

        .section-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 28px; padding-bottom: 14px;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .section-title-wrap { display: flex; align-items: center; gap: 12px; }
        .red-bar { width: 5px; height: 26px; background: #E8192C; border-radius: 2px; }
        .section-title {
          font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800;
          color: #111; text-transform: uppercase; letter-spacing: -0.3px;
        }
        .product-count-badge {
          background: #0f0606; color: #fff;
          font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
          padding: 6px 14px; border-radius: 6px; letter-spacing: 1px;
          box-shadow: 4px 4px 0 #E8192C;
        }

        .store-product-grid {
          display: grid; gap: 22px;
          grid-template-columns: repeat(1, 1fr);
        }
        @media (min-width: 640px)  { .store-product-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .store-product-grid { grid-template-columns: repeat(4, 1fr); } }

        .store-product-card {
          background: #fff; border-radius: 12px; overflow: hidden;
          border: 1px solid rgba(0,0,0,0.06);
          transition: all 0.35s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .store-product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 36px rgba(0,0,0,0.08);
          border-color: #E8192C;
        }

        .empty-products {
          text-align: center; padding: 60px 20px;
          background: #fff; border: 2px dashed #ddd; border-radius: 20px;
        }
      `}</style>

      {/* ════════ MAĞAZA BAŞLIĞI (köhnə dizayn qorunur) ════════ */}
      <section className="py-20 bg-gray-50 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Geri düyməsi */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-8 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Geri
          </button>

          {/* Mağaza Başlığı */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              {store.storeName}
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
              Mağazamızın keyfiyyətli məhsullarını kəşf edin.
            </p>
            {/* Məhsul sayı badge */}
            <div className="mt-4 inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-semibold">
              <Package size={15} />
              {totalProducts} məhsul
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* SAĞ SÜTUN - Şəkil */}
            <div className="lg:order-2 relative group flex justify-center">
              <div className="absolute inset-4 bg-gradient-to-br from-red-500/30 to-pink-500/30 rounded-3xl blur-2xl opacity-50"></div>
              <div className="relative w-full max-w-xl overflow-hidden rounded-3xl shadow-2xl ring-4 ring-white">
                <img
                  src="https://res.cloudinary.com/dwdvr0oxa/image/upload/v1740241625/1_xxbets.jpg"
                  alt={store.storeName}
                  className="w-full object-cover aspect-[4/3]"
                />
              </div>
            </div>

            {/* SOL SÜTUN - Bazadan gələn real məlumatlar */}
            <div className="lg:order-1 space-y-10">
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6">
                <h3 className="text-2xl font-bold text-gray-800 border-b pb-4">Mağaza Məlumatları</h3>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <MapPin className="w-6 h-6 text-red-600 mr-4 mt-1" />
                    <div>
                      <p className="text-base font-semibold text-gray-700">Ünvan</p>
                      <p className="text-lg text-gray-900 mt-1">{store.storeAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="w-6 h-6 text-red-600 mr-4 mt-1" />
                    <div>
                      <p className="text-base font-semibold text-gray-700">Telefon</p>
                      <a href={`tel:${store.phone}`}
                        className="text-lg text-gray-900 hover:text-red-600 transition-colors">
                        {store.phone}
                      </a>
                    </div>
                  </div>

                  {/* VÖN — backend cavabında vonNumber yoxdur, store.storeSlug göstərə bilərik */}
                  <div className="flex items-start">
                    <Mail className="w-6 h-6 text-red-600 mr-4 mt-1" />
                    <div>
                      <p className="text-base font-semibold text-gray-700">Mağaza ID</p>
                      <p className="text-lg text-gray-900 mt-1">{store.storeSlug}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sosial Media */}
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Bizimlə Əlaqə</h3>
                <div className="flex space-x-6">
                  <a href="#" className="p-3 rounded-full bg-gray-100 hover:bg-blue-600 hover:text-white transition-all shadow-md">
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a href="#" className="p-3 rounded-full bg-gray-100 hover:bg-pink-600 hover:text-white transition-all shadow-md">
                    <Instagram className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════ MAĞAZA MƏHSULLARİ (YENİ ƏLAVƏ) ════════ */}
      <div className="store-products-section">
        <div className="section-header">
          <div className="section-title-wrap">
            <div className="red-bar" />
            <h2 className="section-title">Mağaza Məhsulları</h2>
          </div>
          {totalProducts > 0 && (
            <span className="product-count-badge">{totalProducts} MƏHSUL</span>
          )}
        </div>

        {products && products.length > 0 ? (
          <div className="store-product-grid">
            {products.map((product) => (
              <div key={product._id} className="store-product-card">
                <ProductCard mehsul={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-products">
            <div style={{
              width: 72, height: 72, background: '#0f0606', borderRadius: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px', color: '#fff',
              transform: 'rotate(-5deg)', boxShadow: '6px 6px 0 #E8192C'
            }}>
              <ShoppingBag size={32} />
            </div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: '#111' }}>
              Hələ məhsul yoxdur
            </h3>
            <p style={{ color: '#888', fontSize: 14, marginTop: 8 }}>
              Bu mağaza hələ məhsul əlavə etməyib.
            </p>
          </div>
        )}
      </div>
    </>
  )
}

export default Store