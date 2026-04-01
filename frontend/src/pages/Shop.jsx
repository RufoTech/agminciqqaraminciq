import React from 'react';
import Product from '../components/Product';
import { ChevronRight, Home, ShoppingBag, Star, Package, Layers } from 'lucide-react';

const Shop = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .shop-root {
          min-height: 100vh;
          background: #fafafa;
          font-family: 'DM Sans', sans-serif;
          padding-bottom: 50px;
        }

        /* ── BANNER SECTION ── */
        .shop-banner {
          position: relative;
          border-radius: 32px;
          overflow: hidden;
          background: #0f0606; /* Tünd fon */
          margin-top: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .banner-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #E8192C 0%, #7a0010 60%, #1a0003 100%);
          opacity: 0.94;
        }

        .banner-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 60px 40px;
          gap: 40px;
        }

        @media (min-width: 768px) {
          .banner-content { flex-direction: row; padding: 70px 80px; text-align: left; }
        }

        /* Dekorativ dairələr (Login-dəki kimi) */
        .banner-circle {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.08);
          pointer-events: none;
        }

        /* Yazı Stilləri */
        .banner-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 12px;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          backdrop-filter: blur(10px);
          margin-bottom: 20px;
        }

        .banner-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -1px;
        }

        .banner-title span {
          color: rgba(255,255,255,0.5);
          font-style: italic;
        }

        /* Breadcrumb */
        .shop-breadcrumb {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 24px;
        }

        .breadcrumb-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.7);
          font-size: 14px;
          font-weight: 500;
          transition: 0.2s;
        }

        .breadcrumb-item.active {
          color: #fff;
          font-weight: 700;
        }

        /* Stats */
        .shop-stats {
          display: flex;
          gap: 30px;
          margin-top: 40px;
        }

        .stat-card {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: #fff;
        }

        .stat-label {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .banner-image-container {
          position: relative;
          flex-shrink: 0;
        }

        .image-glow {
          position: absolute;
          inset: -20px;
          background: #E8192C;
          filter: blur(60px);
          opacity: 0.3;
          border-radius: 50%;
        }

        .banner-img {
          position: relative;
          z-index: 2;
          height: clamp(180px, 25vw, 320px);
          object-fit: contain;
          filter: drop-shadow(0 20px 50px rgba(0,0,0,0.3));
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .banner-img:hover {
          transform: translateY(-15px) rotate(2deg) scale(1.05);
        }
      `}</style>

      <div className="shop-root">
        <div className="container mx-auto px-4">
          
          {/* BANNER SECTION */}
          <div className="shop-banner">
            <div className="banner-overlay" />
            
            {/* Dekorativ dairələr */}
            <div className="banner-circle" style={{ width: 400, height: 400, top: -100, left: -100 }} />
            <div className="banner-circle" style={{ width: 300, height: 300, bottom: -50, right: 100 }} />

            <div className="banner-content">
              
              {/* Sol tərəf: Mətnlər */}
              <div className="max-w-2xl">
                <div className="banner-tag">
                  <Layers size={14} />
                  Bütün Kateqoriyalar
                </div>

                <h1 className="banner-title">
                  Brendex <span>Mağaza</span><br />
                  Premium Seçimlər
                </h1>

                {/* Breadcrumb */}
                <div className="shop-breadcrumb">
                  <div className="breadcrumb-item">
                    <Home size={14} />
                    Ana Səhifə
                  </div>
                  <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
                  <div className="breadcrumb-item active">
                    <ShoppingBag size={14} />
                    Mağaza
                  </div>
                </div>

                {/* Stats */}
                <div className="shop-stats">
                  <div className="stat-card">
                    <span className="stat-value">12k+</span>
                    <span className="stat-label">Məhsul</span>
                  </div>
                  <div className="stat-card" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '30px' }}>
                    <span className="stat-value">4.9</span>
                    <span className="stat-label">Reytinq</span>
                  </div>
                  <div className="stat-card" style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '30px' }}>
                    <span className="stat-value">24/7</span>
                    <span className="stat-label">Dəstək</span>
                  </div>
                </div>
              </div>

              {/* Sağ tərəf: Şəkil */}
              <div className="banner-image-container">
                <div className="image-glow" />
                <img
                  src="https://res.cloudinary.com/dwdvr0oxa/image/upload/v1739266328/banner_eqhh6u.png"
                  alt="Shop Banner"
                  className="banner-img"
                />
              </div>

            </div>
          </div>

          {/* PRODUCTS SECTION */}
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-8">
               <div style={{ width: 40, height: 3, background: '#E8192C', borderRadius: 2 }} />
               <h2 style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, color: '#111' }}>
                 Sizin üçün seçilənlər
               </h2>
            </div>
            <Product />
          </div>

        </div>
      </div>
    </>
  );
};

export default Shop;