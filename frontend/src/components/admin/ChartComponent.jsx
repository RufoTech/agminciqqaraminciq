// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ChartComponent.jsx
// Satış statistikasını bar chart (sütun diaqramı) ilə göstərən komponent.
// AdminProducts səhifəsindəki "Satış Statistikası" bölməsində istifadə olunur.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// React — JSX-i render etmək üçün əsas kitabxana.
// Bu komponentdə hook istifadə edilmir, amma React import olunmasa JSX işləməz.
import React from "react";

// react-chartjs-2 — Chart.js kitabxanasının React üçün sarmalayıcısı (wrapper).
// Bar → sütun diaqramı komponenti.
// Birbaşa Chart.js istifadə etsəydik, canvas elementini manual idarə etməli olardıq.
// react-chartjs-2 bunu React-a uyğun şəkildə avtomatik həll edir.
import { Bar } from "react-chartjs-2";

// Chart.js — qrafik çizmək üçün əsas kitabxana.
// Lakin hamısını bir yerdə import etmək əvəzinə, yalnız lazımi modulları götürürük.
// Bu "tree shaking" adlanır — istifadə edilməyən kod paket ölçüsünə əlavə edilmir.
//
//   Chart as ChartJS → Chart.js-in əsas sinifi. .register() üçün lazımdır.
//   CategoryScale    → X oxu üçün "kateqoriya" miqyası.
//                      Məsələn: ["iPhone", "MacBook", "iPad"] kimi mətn etiketləri.
//                      Bu olmasa X oxu məhsul adlarını göstərə bilməz.
//   LinearScale      → Y oxu üçün rəqəmsal (xətti) miqyas.
//                      Satış saylarını (0, 5, 10...) göstərmək üçün.
//   BarElement       → Hər sütunun (bar-ın) özü — forması, rəngi, radiusu.
//                      Bu olmasa sütunlar heç render edilməz.
//   Title            → Qrafik başlığı plagini. Biz istifadə etmirik,
//                      amma register etməzsək Chart.js xəta verə bilər.
//   Tooltip          → Siçan (hover) zamanı göstərilən məlumat qutusu.
//                      "iPhone — 42 satış" kimi məlumat göstərir.
//   Legend           → Rəng açıqlaması (dataset-in adını + rəngi göstərir).
//                      Biz bunu gizlədirik çünki yalnız 1 dataset var.
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODUL QEYDİYYATI — .register()
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// NİYƏ LAZIMDIR?
//   Chart.js v3+ modulyar arxitekturaya keçdi.
//   Hər modulun işləməsi üçün əvvəlcə "qeydiyyatdan keçirilməsi" lazımdır.
//   Bu addım olmasa Chart.js həmin funksiyaları tanımır və belə xəta verir:
//   "Error: ... is not a registered scale"
//
// NƏ EDIR?
//   Chart.js-in daxili reyestrinə bu modulları əlavə edir.
//   Bundan sonra hər hansı Bar/Line/Pie chart bu modullardan istifadə edə bilər.
//
// NİYƏ FAYLIN ÜST HİSSƏSİNDƏDİR (komponent dışında)?
//   .register() hər render-də yenidən çağırılmamalıdır — bir dəfə kifayətdir.
//   Komponent daxilindəki kod hər render-də icra edilir.
//   Xarici kod isə yalnız modul ilk dəfə import ediləndə bir dəfə icra edilir.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ChartComponent — ƏSAS KOMPONENTİN TƏRİFİ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// PROPS:
//   labels       → X oxundakı məhsul adları massivi.
//                  Misal: ["iPhone 15", "MacBook Pro", "iPad Air"]
//                  AdminProducts-dan: products.map(p => p.name)
//
//   dataPoints   → Hər məhsula uyğun satış sayı massivi.
//                  Misal: [42, 17, 8]
//                  labels[0] = "iPhone 15" → dataPoints[0] = 42 satış
//                  AdminProducts-dan: products.map(p => p.salesCount || 0)
//
//   gradientFrom → Sütunların yuxarı rəngi (gradient başlanğıcı).
//                  Default: "#E8192C" (qırmızı)
//                  Props göndərilməsə default dəyər işlənir.
//
//   gradientTo   → Sütunların aşağı rəngi (gradient sonu).
//                  Default: "#ff9ca5" (açıq çəhrayı)
//                  Props göndərilməsə default dəyər işlənir.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ChartComponent = ({
  labels,
  dataPoints,
  gradientFrom = "#E8192C",   // Default prop dəyəri — props gəlməsə bu istifadə olunur
  gradientTo   = "#ff9ca5",
}) => {

  // ════════════════════════════════════════
  // DATA OBYEKTİ — Chart.js-ə verilən məlumat
  // ════════════════════════════════════════
  //
  // Chart.js-in "data" obyekti iki hissədən ibarətdir:
  //   labels   → X oxu etiketləri
  //   datasets → Çəkiləcək məlumat dəstləri (biz yalnız 1 dataset istifadə edirik)
  //
  // Niyə "datasets" massivdir?
  //   Çünki bir qrafikdə birdən çox dataset ola bilər.
  //   Məsələn: "Bu il satış" + "Keçən il satış" — iki fərqli bar dəsti.
  //   Biz yalnız "Satışlar" dataset-ini istifadə edirik.
  const data = {
    labels, // Destructuring — props-dan birbaşa gəlir

    datasets: [
      {
        // Tooltip-də görünən dataset adı.
        // Hover zamanı: "Satışlar: 42" kimi göstərilir.
        // (Biz custom callback ilə bunu dəyişdiririk — aşağıda izah var)
        label: "Satışlar",

        // Hər sütunun hündürlüyünü müəyyən edən dəyərlər.
        // labels massivi ilə eyni uzunluqda olmalıdır:
        //   labels[0] = "iPhone" → data[0] = 42
        data: dataPoints,

        // ── DİNAMİK GRADİENT FONU ──
        // backgroundColor sahəsi sadəcə rəng deyil, funksiya da ola bilər.
        // Chart.js hər sütun üçün bu funksiyanı çağırır.
        //
        // "context" → Chart.js-in verdiyi kontekst obyekti:
        //   context.chart.ctx       → HTML Canvas 2D konteksti (rəsm APİ-si)
        //   context.chart.chartArea → Chart-ın faktiki çəkildiyi sahənin koordinatları
        //                            { top, bottom, left, right }
        backgroundColor: (context) => {
          const { ctx, chartArea } = context.chart;

          // Mühüm yoxlama: chartArea ilk render-də mövcud olmaya bilər.
          // Chart.js əvvəlcə render edir, sonra ölçüləri hesablayır.
          // chartArea olmadan koordinatlar bilinmir → null qaytarırıq.
          // Chart.js null aldıqda sütunu şəffaf çəkir, problem olmur.
          if (!chartArea) return null;

          // Canvas API-nin createLinearGradient funksiyası:
          //   (x0, y0, x1, y1) → başlanğıc nöqtəsindən son nöqtəyə qradient
          //
          //   x0 = 0, x1 = 0 → üfüqi dəyişmə yoxdur (yalnız şaquli gradient)
          //   y0 = chartArea.top    → gradient chart-ın yuxarısından başlayır
          //   y1 = chartArea.bottom → gradient chart-ın aşağısında bitir
          //
          // Nəticə: hər sütun yuxarıdan aşağıya rəng dəyişir.
          const gradient = ctx.createLinearGradient(
            0, chartArea.top,
            0, chartArea.bottom
          );

          // addColorStop(mövqe, rəng):
          //   0   → gradientin başlanğıcı (yuxarı) = gradientFrom rəngi
          //   1   → gradientin sonu (aşağı)         = gradientTo rəngi
          //   0.5 → orta nöqtə (istifadə etmirik, amma əlavə etmək olar)
          gradient.addColorStop(0, gradientFrom); // Yuxarı — qırmızı
          gradient.addColorStop(1, gradientTo);   // Aşağı  — açıq çəhrayı

          return gradient;
        },

        // Sütunların yuxarı künclərini yuvarlaqlaşdırır.
        // 0 → kəskin künclər
        // 8 → 8px radius — müasir, yumşaq görünüş
        borderRadius: 8,

        // Sütun genişliyinin nisbəti — 0 ilə 1 arasında.
        // 0.65 → mövcud boşluğun 65%-i qədər geniş sütun.
        // 1.0  → sütunlar bir-birinə yapışıq olardı.
        // 0.3  → çox dar, aralarında çox boşluq olardı.
        barPercentage: 0.65,

        // false → bütün 4 küncə borderRadius tətbiq edilir.
        // true  → alt kənara (yerə dayanan hissəyə) radius tətbiq edilmir.
        //         Bu default davranışdır — alt kənar düz qalır.
        // Biz false seçirik ki, sütun tamamilə yuvarlaq görünsün.
        borderSkipped: false,
      },
    ],
  };


  // ════════════════════════════════════════
  // OPTIONS OBYEKTİ — Chart.js parametrləri
  // ════════════════════════════════════════
  //
  // Chart.js-in davranışını, görünüşünü, oxları, tooltip-i
  // və digər xüsusiyyətlərini idarə edən konfiqurasiya obyekti.
  const options = {
    // true → chart konteyner elementi kiçilib-böyüdükdə özü də uyğunlaşır.
    // false etsəydik, chart daima sabit ölçüdə qalardı.
    responsive: true,

    // false → chart-ın hündürlüyü CSS-dəki height-a tabe olur.
    // true  → chart öz en/hündürlük nisbətini saxlayır, CSS height-ı nəzərə almır.
    // Biz false istifadə edirik ki, media query ilə hündürlüyü idarə edə bilək.
    maintainAspectRatio: false,

    // ── PLAGINLƏR ──
    // Chart.js-in əlavə funksiyaları (tooltip, legend, title) plaginlər vasitəsilə idarə olunur.
    plugins: {

      // Legend (rəng açıqlaması) — tamamilə gizlədilir.
      // Niyə? Yalnız 1 dataset var ("Satışlar").
      // Legend yalnız bir dəstdən ibarət olduqda artıqdır.
      legend: { display: false },

      // Tooltip — siçanı sütunun üzərinə apardıqda çıxan məlumat qutusu.
      tooltip: {
        enabled: true, // Tooltip aktiv edilir (default da true-dur, amma açıq yazırıq)

        // Tooltip-in görünüşü:
        backgroundColor: "#1a1a1a",     // Tünd (demək olar qara) fon
        titleColor: "#fff",             // Başlıq mətni — ağ (məhsulun adı)
        bodyColor: "#ffd0d5",           // Dəyər mətni — açıq çəhrayı (satış sayı)

        // Şrift parametrləri:
        titleFont: {
          size: 13,
          weight: "bold",
          family: "'DM Sans', sans-serif" // Saytın əsas şrifti ilə eyni
        },
        bodyFont: {
          size: 13,
          family: "'DM Sans', sans-serif"
        },

        padding: 12,              // Tooltip-in daxili boşluğu (px)
        borderColor: "#E8192C",   // Qırmızı kənar xətti — brend rəngi
        borderWidth: 1,           // Kənar xəttinin qalınlığı
        cornerRadius: 10,         // Tooltip-in yuvarlaq künclər radiusu

        // Callback-lər — tooltip mətnini fərdiləşdirmək üçün.
        callbacks: {
          // label → tooltip-in gövdəsindəki mətn.
          // Standart davranış: "Satışlar: 42" kimi göstərirdi.
          // Biz bunu dəyişdiririk: " 42 satış" formatına.
          //
          // ctx.parsed.y → sütunun Y oxu dəyəri (satış sayı rəqəmi).
          // ctx.parsed.x → sütunun X oxu indeksi (məhsulun sıra nömrəsi).
          label: (ctx) => ` ${ctx.parsed.y} satış`,
        },
      },
    },

    // ── OXLAR (SCALES) ──
    // X və Y oxlarının görünüşü və davranışı.
    scales: {

      // X OXU — Kateqoriya oxu (məhsul adları)
      x: {
        // Şaquli grid xətlərini (X oxuna paralel) gizlət.
        // Bu xətlər olduqda qrafik çox izdihamlı görünür.
        grid: { display: false },

        // X oxunun özünün xəttini gizlət (aşağıdakı sərhəd xətti).
        border: { display: false },

        // Etiketlər (tick) — X oxundakı mətn nişanları
        ticks: {
          color: "#bbb",  // Boz rəng — ox etiketləri arxa plana çəkilir

          font: {
            size: 11,
            weight: "600",
            family: "'DM Sans', sans-serif"
          },

          // maxRotation: etiketlər maksimum neçə dərəcə döndürülə bilər.
          // Uzun məhsul adları bir-birinə sığmadıqda Chart.js onları əyir.
          // 45° → "iPhone 15 Pro Max" kimi uzun adlar əyilmiş göstərilir.
          maxRotation: 45,

          // minRotation: etiketlər minimum neçə dərəcə döndürülsün.
          // 0 → mümkün olduqda düz saxla, lazım olduqda əy.
          minRotation: 0,

          // X oxunda göstəriləcək maksimum etiket sayı.
          // Məhsul çox olduqda hamısı sığmır → 8-dən artıq varsa bəziləri atlanır.
          maxTicksLimit: 8,

          // true → sığmayan etiketləri avtomatik atlayır.
          // false → hamısını göstərməyə çalışır, üst-üstə düşüb qarışıqlıq yaranır.
          autoSkip: true,
        },
      },

      // Y OXU — Rəqəmsal ox (satış sayları)
      y: {
        grid: {
          // Üfüqi grid xətləri — çox açıq rəngdə göstərilir.
          // "rgba(0,0,0,0.05)" → 5% qeyri-şəffaflıqda qara = demək olar şəffaf boz.
          // Bu xətlər oxumağa kömək edir amma diqqəti cəlb etmir.
          color: "rgba(0,0,0,0.05)",
          drawBorder: false, // Y oxunun kənar xəttini çəkmə
        },

        // Y oxunun özünün xəttini gizlət (soldakı şaquli xətt).
        border: { display: false },

        // Nişanlar (tick) — Y oxundakı rəqəm nişanları (0, 5, 10, 15...)
        ticks: {
          color: "#bbb",
          font: {
            size: 11,
            weight: "600",
            family: "'DM Sans', sans-serif"
          },

          // Y oxunda maksimum 6 rəqəm nişanı göstər.
          // Çox nişan olduqda ox qarışıq görünür.
          // Chart.js uyğun intervalı (1, 2, 5, 10...) avtomatik seçir.
          maxTicksLimit: 6,
        },
      },
    },
  };


  // ════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════
  return (
    // React.Fragment (<>) — əlavə DOM elementi yaratmadan
    // bir neçə elementı qruplaşdırmaq üçün.
    <>
      {/* ── Responsiv Hündürlük CSS-i ──
          maintainAspectRatio: false olduğu üçün chart-ın hündürlüyünü
          CSS ilə idarə edə bilirik.
          Konteyner div-in height-ı → chart-ın faktiki hündürlüyü.

          Niyə JavaScript state yox, CSS media query?
          CSS media query brauzerin özü tərəfindən emal edilir — daha sürətli.
          JavaScript ilə window.innerWidth yoxlamaq hər resize-da JS icra tələb edir.

          Breakpoint-lər AdminProducts-dakı breakpoint-lərlə uyğunlaşdırılıb:
            Desktop  → 320px  (ən böyük, tam məlumat görünür)
            Tablet   → 280px
            Mobil    → 240px
            Kiçik    → 200px
            Çox kiçik→ 170px  (minimum oxunaqlı ölçü)
      ── */}
      <style>{`
        .chart-container {
          position: relative; /* Bar komponentinin absolute yerləşməsi üçün */
          height: 320px;      /* Desktop: standart hündürlük */
          width: 100%;        /* Konteyner genişliyini tam doldur */
        }

        /* Tablet (≤ 1024px) */
        @media (max-width: 1024px) {
          .chart-container { height: 280px; }
        }

        /* Böyük mobil (≤ 768px) */
        @media (max-width: 768px) {
          .chart-container { height: 240px; }
        }

        /* Kiçik mobil (≤ 480px) */
        @media (max-width: 480px) {
          .chart-container { height: 200px; }
        }

        /* Çox kiçik ekranlar (≤ 360px) */
        @media (max-width: 360px) {
          .chart-container { height: 170px; }
        }
      `}</style>

      {/* Konteyner div — chart-ın hündürlüyünü CSS ilə idarə edir.
          Bar komponenti (react-chartjs-2) bu div-in içinə canvas elementi render edir.
          position: relative → canvas-ın absolute yerləşməsinə imkan verir. */}
      <div className="chart-container">
        {/* Bar — react-chartjs-2-nin sütun diaqramı komponenti.
            data    → məhsul adları + satış sayları
            options → görünüş + davranış parametrləri */}
        <Bar data={data} options={options} />
      </div>
    </>
  );
};

// Default export — başqa fayllarda belə import edilir:
// import ChartComponent from "./ChartComponent"
export default ChartComponent;