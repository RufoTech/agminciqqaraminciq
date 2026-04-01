import React from 'react';
import { Phone, Package, Award, Truck } from 'lucide-react';

const Sever = () => {
  const features = [
    {
      icon: <Phone className="w-12 h-12" />,
      title: '24/7 Customer Service',
      description: "We're here to help you with any questions or concerns you have, 24/7."
    },
    {
      icon: <Package className="w-12 h-12" />,
      title: '14-Day Money Back',
      description: "If you're not satisfied with your purchase, simply return it within 14 days for a refund."
    },
    {
      icon: <Award className="w-12 h-12" />,
      title: 'Our Guarantee',
      description: 'We stand behind our products and services and guarantee your satisfaction.'
    },
    {
      icon: <Truck className="w-12 h-12" />,
      title: 'Shipping Worldwide',
      description: 'We ship our products worldwide, making them accessible to customers everywhere.'
    }
  ];

  return (
    <div className="w-full">

      {/* ── Promo Banners ── */}
      <div className="w-full bg-white py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Banner 1 – New Products -30% */}
          <div
            className="relative rounded-2xl overflow-hidden flex items-center justify-between px-8 py-6 min-h-[140px]"
            style={{
              background: 'linear-gradient(135deg, #1a0000 0%, #7f0000 50%, #cc0000 100%)',
            }}
          >
            {/* Glow blob */}
            <div
              style={{
                position: 'absolute', right: '80px', top: '50%',
                transform: 'translateY(-50%)',
                width: '160px', height: '160px',
                background: 'radial-gradient(circle, rgba(255,80,0,0.55) 0%, transparent 70%)',
                filter: 'blur(18px)',
                pointerEvents: 'none',
              }}
            />

            {/* Text */}
            <div className="relative z-10 flex flex-col gap-3">
              <div>
                <p className="text-white text-lg font-semibold leading-tight">Yeni Məhsullar</p>
                <p className="text-white text-4xl font-extrabold leading-tight">-30%</p>
              </div>
              <button
                style={{
                  background: 'linear-gradient(90deg, #e6a800, #ffcc00)',
                  color: '#1a0000',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.03em',
                  width: 'fit-content',
                  boxShadow: '0 2px 8px rgba(230,168,0,0.4)',
                }}
              >
                İndi AL
              </button>
            </div>

            {/* Sneaker image placeholder – flame-style decorative circle */}
            <div className="relative z-10 flex items-center justify-center"
              style={{ width: '130px', height: '110px' }}>
              {/* Outer flame glow */}
              <div style={{
                position: 'absolute',
                width: '110px', height: '110px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,120,0,0.7) 0%, rgba(255,0,0,0.3) 50%, transparent 75%)',
                filter: 'blur(8px)',
              }} />
              {/* Sneaker emoji as stand-in */}
              <span style={{ fontSize: '4.5rem', filter: 'drop-shadow(0 0 12px rgba(255,100,0,0.9))' }}>
                👟
              </span>
            </div>
          </div>

          {/* Banner 2 – Beauty 25% off */}
          <div
            className="relative rounded-2xl overflow-hidden flex items-center justify-between px-8 py-6 min-h-[140px]"
            style={{
              background: 'linear-gradient(135deg, #1a0000 0%, #7f0000 50%, #cc0000 100%)',
            }}
          >
            {/* Glow blob */}
            <div
              style={{
                position: 'absolute', right: '80px', top: '50%',
                transform: 'translateY(-50%)',
                width: '160px', height: '160px',
                background: 'radial-gradient(circle, rgba(255,80,0,0.45) 0%, transparent 70%)',
                filter: 'blur(18px)',
                pointerEvents: 'none',
              }}
            />

            {/* Text */}
            <div className="relative z-10 flex flex-col gap-3">
              <div>
                <p className="text-white text-2xl font-extrabold leading-tight">25%-dək Gözəllik</p>
                <p className="text-white text-2xl font-extrabold leading-tight">Məhsullarında Endirim</p>
              </div>
              <button
                style={{
                  background: 'linear-gradient(90deg, #e6a800, #ffcc00)',
                  color: '#1a0000',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.03em',
                  width: 'fit-content',
                  boxShadow: '0 2px 8px rgba(230,168,0,0.4)',
                }}
              >
                Kəşf Et
              </button>
            </div>

            {/* Cosmetics decorative */}
            <div className="relative z-10 flex items-center justify-center"
              style={{ width: '130px', height: '110px' }}>
              <div style={{
                position: 'absolute',
                width: '110px', height: '110px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,80,80,0.6) 0%, rgba(200,0,0,0.25) 55%, transparent 75%)',
                filter: 'blur(8px)',
              }} />
              <span style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 10px rgba(255,80,80,0.9))' }}>
                💄
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Sever;