import React, { useEffect } from 'react';
import ProductCard from './ProductCard';
import { useGetProductsQuery } from '../redux/api/productsApi';
import { toast } from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { PackageSearch, Boxes } from 'lucide-react';

const Product = ({ category }) => {
  const { data, error, isError } = useGetProductsQuery();
  const { name } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (isError) {
      toast.error(error?.data?.message);
    }
  }, [isError, error]);

  const filteredProducts = data?.products?.filter((product) => {
    if (name) {
      return (
        product.name.toLowerCase().includes(name.toLowerCase()) &&
        (!category || product.category === category)
      );
    }
    return !category || product.category === category;
  });

  useEffect(() => {
    if (name && filteredProducts?.length === 0) {
      navigate('/404');
    }
  }, [name, filteredProducts, navigate]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 40px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .section-title-wrapper {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .red-accent {
          width: 6px;
          height: 30px;
          background: #E8192C;
          border-radius: 2px;
        }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: #0f0606;
          text-transform: uppercase;
          letter-spacing: -0.5px;
        }

        .result-badge {
          background: #0f0606;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 6px;
          letter-spacing: 1px;
          box-shadow: 4px 4px 0px #E8192C;
        }

        .product-grid {
          display: grid;
          gap: 24px;
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }

        @media (min-width: 768px) { .product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (min-width: 1024px) { .product-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

        .product-card-wrapper {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.06);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          position: relative;
        }

        .product-card-wrapper:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border-color: #E8192C;
        }

        .empty-state {
          background: #fff;
          border: 2px dashed #ddd;
          border-radius: 24px;
          padding: 60px 20px;
          text-align: center;
          transition: border-color 0.3s;
        }

        .empty-state:hover {
          border-color: #E8192C;
        }

        .empty-icon-box {
          width: 80px;
          height: 80px;
          background: #0f0606;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: #fff;
          transform: rotate(-5deg);
          box-shadow: 8px 8px 0px #E8192C;
        }
      `}</style>

      <div>
        {/* Başlıq Bölməsi */}
        <div className="section-header">
          <div className="section-title-wrapper">
            <div className="red-accent" />
            <h2 className="section-title">
              {category ? `${category}` : "Bütün Məhsullar"}
            </h2>
          </div>
          
          {filteredProducts?.length > 0 && (
            <div className="result-badge">
              {filteredProducts.length} MƏHSUL
            </div>
          )}
        </div>

        {/* Məhsullar Şəbəkəsi */}
        {filteredProducts?.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <div key={product.id || product._id} className="product-card-wrapper">
                <ProductCard mehsul={product} />
              </div>
            ))}
          </div>
        ) : (
          /* Boş vəziyyət (Tapılmadıqda) */
          <div className="empty-state">
            <div className="empty-icon-box">
              <PackageSearch size={40} />
            </div>
            <h3 style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: 700, color: '#0f0606' }}>
              Məhsul tapılmadı
            </h3>
            <p style={{ color: '#666', marginTop: '8px', fontSize: '14px' }}>
              Axtarışınıza uyğun heç bir nəticə tapılmadı. <br /> 
              Zəhmət olmasa digər kateqoriyalara nəzər yetirin.
            </p>
            <button 
              onClick={() => navigate('/shop')}
              style={{
                marginTop: '25px',
                padding: '10px 25px',
                background: '#E8192C',
                color: '#fff',
                fontWeight: 'bold',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            >
              Mağazaya qayıt
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Product;