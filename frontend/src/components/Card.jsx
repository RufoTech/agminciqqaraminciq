// React kitabxanası və useEffect hook-u idxal edilir.
// useEffect — komponentin lifecycle-ını idarə etmək üçün istifadə olunur.
// Burada xəta baş verdikdə toast bildirişi göstərmək üçün lazımdır.
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

// ProductCard — hər bir məhsulu kart şəklində göstərən ayrı komponent.
// Bu komponent məhsulun şəklini, adını, qiymətini və s. render edir.
import ProductCard from './ProductCard';

// Redux Toolkit Query hook-u — səbətin məlumatlarını serverdən yükləyir (GET sorğusu).
import { useGetCartQuery } from '../redux/api/productsApi';

// react-hot-toast kitabxanasından toast funksiyası idxal edilir.
// toast.error() — ekranın küncündə qırmızı rəngli xəta bildirişi göstərir.
import { toast } from "react-hot-toast";

/**
 * @component Card
 * @description İstifadəçinin səbətindəki məhsulları grid şəklində göstərən komponent.
 * Məhsullar serverdən yüklənir; xəta olarsa toast bildirişi göstərilir;
 * səbət boş olarsa məlumat mesajı göstərilir.
 */
const Card = () => {

  // ============================================================
  // HOOK İSTİFADƏSİ
  // ============================================================

  // useGetCartQuery — Redux Toolkit Query ilə səbət məlumatlarını serverdan yükləyir.
  // Qaytardığı dəyərlər:
  //   data    — API cavabı (içərisində products massivi var)
  //   error   — sorğu uğursuz olarsa xəta obyekti
  //   isError — xəta olub-olmadığını göstərən boolean dəyər
  //   refetch — səbəti yenidən serverdən yükləmək üçün funksiya
  const { isAuthenticated } = useSelector((state) => state.userSlice);
  const { data, error, isError, refetch } = useGetCartQuery(undefined, { skip: !isAuthenticated });


  // ============================================================
  // XƏTA İDARƏETMƏSİ (useEffect ilə)
  // ============================================================

  // [isError, error] — asılılıq massivi:
  // isError və ya error dəyişdikdə bu effect yenidən işə düşür.
  useEffect(() => {
    if (isError) {
      // error?.data?.message — optional chaining ilə backend-dən gələn xəta mətni oxunur.
      // Əgər bu mətn yoxdursa — "Bir hata oluştu." default mesajı göstərilir.
      // toast.error() — ekranda müvəqqəti qırmızı bildiriş popup-u göstərir.
      toast.error(error?.data?.message || "Bir hata oluştu.");
    }
  }, [isError, error]);


  // ============================================================
  // BOŞ SƏBƏT VƏZİYYƏTİ
  // ============================================================

  // Aşağıdakı şərtlərdən hər hansı biri doğrudursa — boş səbət mesajı göstərilir:
  //   !data              — API cavabı hələ gəlməyib (undefined/null)
  //   !data.products     — products sahəsi yoxdur
  //   data.products.length === 0 — səbətdə heç bir məhsul yoxdur
  if (!data || !data.products || data.products.length === 0) {
    return (
      <div className="text-center text-gray-600">
        Sepetiniz boş.
      </div>
    );
  }


  // ============================================================
  // ƏSAS RENDER HİSSƏSİ (JSX)
  // ============================================================

  return (
    // Responsive grid layout:
    //   grid-cols-1      — mobil: 1 sütun
    //   md:grid-cols-2   — orta ekran: 2 sütun
    //   lg:grid-cols-4   — böyük ekran: 4 sütun
    //   gap-2            — kartlar arasında 8px boşluq
    //   container mx-auto — mərkəzləndirilmiş konteyner
    //   my-[20px]        — yuxarı və aşağıdan 20px xarici boşluq
    <>
      {/* ── MOBİL STILLER (əlavə edildi, heç nə silinmədi) ── */}
      <style>{`
        @media (max-width: 767px) {
          /* Mobil ekranda 2 sütunlu grid */
          .card-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
        }
        @media (max-width: 380px) {
          /* Çox kiçik telefonda 1 sütun */
          .card-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div className="card-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 container mx-auto my-[20px]">

        {/* data.products massivi üzərində map() ilə hər məhsul üçün ProductCard render edirik.
            key={product._id}  — React-ın siyahı elementlərini izləməsi üçün unikal açar (MongoDB ID).
            mehsul={product}   — məhsul məlumatları ProductCard komponentinə prop olaraq ötürülür. */}
        {data.products.map((product) => (
          <ProductCard key={product._id} mehsul={product} />
        ))}

      </div>
    </>
  );
};

// Komponenti ixrac edirik ki, başqa fayllarda import edilə bilsin.
export default Card;