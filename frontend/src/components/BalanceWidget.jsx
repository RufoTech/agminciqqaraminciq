// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BalanceWidget.jsx
// Satıcının maliyyə balansını 4 kart şəklində göstərən komponent.
// Admin panelinin yuxarı hissəsində istifadə olunur.
//
// Göstərilən məlumatlar:
//   💳 Mövcud Balans     → hal-hazırda çəkilə bilən məbləğ
//   ⏳ Gözləyən Komisya  → ay sonu köçürüləcək məbləğ
//   📈 Ümumi Qazanc      → bütün vaxt ərzində qazanılan məbləğ
//   🏦 Çəkilən           → indiyə qədər çəkilmiş ümumi məbləğ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// useEffect → yan təsirlər üçün.
//   Burada: sellerId dəyişdikdə API sorğusunu yenidən göndərmək.
import { useEffect } from "react";

// useDispatch → Redux action-larını işə salmaq üçün.
//   dispatch(getSellerBalance(sellerId)) → API sorğusunu başladır.
// useSelector → Redux store-dan state oxumaq üçün.
//   balance → API-dən gələn balans məlumatı
//   loading → sorğu davam edirmi?
import { useDispatch, useSelector } from "react-redux";

// getSellerBalance → Redux Thunk action-u (async action).
//   Daxilində: GET /api/commission/balance/:sellerId sorğusu göndərir.
//   Nəticəni Redux store-dakı commissionSlice-a yazır.
import { getSellerBalance } from "../slices/commissionSlice";


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BalanceWidget — ANA KOMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// PROPS:
//   sellerId → cari satıcının MongoDB _id-si.
//              Bu prop ana komponentdən (məs. AdminDashboard) gəlir.
//              API sorğusunda istifadə olunur: GET /balance/:sellerId
//
// RENDER MƏNTİQİ:
//   loading === true  VƏ YA  balance === null → skeleton (yükləmə animasiyası)
//   balance mövcuddur → 4 balans kartı
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const BalanceWidget = ({ sellerId }) => {

  // dispatch → Redux action göndərmək üçün funksiya.
  // useDispatch hook-u hər çağırışda eyni funksiyayı qaytarır (stabil referans).
  const dispatch = useDispatch();

  // Redux store-dan commissionSlice-ın state-ini oxuyuruq.
  // balance → { availableBalance, pendingCommission, totalEarned, totalWithdrawn }
  //           API sorğusu tamamlanana qədər null-dur.
  // loading → sorğu göndərilib, cavab gözlənilir (true/false)
  const { balance, loading } = useSelector((state) => state.commission);


  // ════════════════════════════════════════
  // useEffect — API SORĞUSU
  // ════════════════════════════════════════
  //
  // NƏ EDİR:
  //   sellerId mövcuddursa balans məlumatını API-dən çəkir.
  //
  // NİYƏ sellerId YOXLANIR?
  //   sellerId props-dan gəlir — ilk render-də undefined ola bilər.
  //   undefined ilə dispatch etsəydik, API yanlış URL-ə sorğu göndərərdi.
  //   if (sellerId) → yalnız dəyər mövcud olduqda sorğu göndər.
  //
  // ASİLLİK MASSIVI [sellerId]:
  //   sellerId dəyişdikdə (məs. admin fərqli satıcıya keçdikdə)
  //   effect yenidən işləyir → yeni satıcının balansı çəkilir.
  //   [] boş massiv olsaydı — yalnız ilk render-də işləyərdi.
  useEffect(() => {
    if (sellerId) dispatch(getSellerBalance(sellerId));
  }, [sellerId]);


  // ════════════════════════════════════════
  // YÜKLƏMƏ VƏZİYYƏTİ — SKELETON
  // ════════════════════════════════════════
  //
  // NİYƏ SKELETON (spinner yox)?
  //   Skeleton → məzmunun yerini tutan animasiyalı "boş" kartlar.
  //   İstifadəçi məzmunun hansı formada gələcəyini görür — UX daha yaxşıdır.
  //   Spinner sadəcə "gözlə" deyir, skeleton isə "belə bir şey gəlir" deyir.
  //
  // loading || !balance:
  //   loading === true  → sorğu hələ davam edir
  //   !balance          → sorğu bitdi amma data hələ yoxdur (null)
  //   İkisi birlikdə → hər iki halda skeleton göstərilir
  //
  // [1, 2, 3, 4].map() → 4 skeleton kart render edir.
  //   Niyə massiv? map() üçün iterable lazımdır.
  //   Dəyərlərin (1,2,3,4) özü vacib deyil — yalnız key üçün istifadə olunur.
  if (loading || !balance) {
    return (
      <>
        {/* css → komponent xaricindəki string (aşağıda tərif edilib) */}
        <style>{css}</style>
        <div className="bw-wrapper">
          {[1, 2, 3, 4].map((i) => (
            // key={i} → React-ın DOM optimallaşdırması üçün unikal identifikator
            <div key={i} className="bw-skeleton">
              {/* 3 müxtəlif eni olan shimmer xətləri:
                  short  → başlıq yerinə (55% en)
                  long   → məbləğ yerinə (100% en, daha hündür)
                  medium → alt mətn yerinə (65% en) */}
              <div className="bw-skeleton-line bw-skeleton-short" />
              <div className="bw-skeleton-line bw-skeleton-long" />
              <div className="bw-skeleton-line bw-skeleton-medium" />
            </div>
          ))}
        </div>
      </>
    );
  }


  // ════════════════════════════════════════
  // KART MƏLUMATLARİ — cards massivi
  // ════════════════════════════════════════
  //
  // NİYƏ MASSIV?
  //   4 kartın strukturu eynidir (label, amount, sub, icon, cls).
  //   Massiv + .map() ilə kod təkrarından qaçırıq.
  //   Yeni kart əlavə etmək üçün yalnız bu massivə yeni obyekt əlavə etmək kifayətdir.
  //
  // .toFixed(2) → rəqəmi 2 onluq yerə yuvarlaqlayır.
  //   12.3 → "12.30"
  //   null?.toFixed(2) → optional chaining: balance.availableBalance null/undefined
  //   olarsa xəta atmır, undefined qaytarır.
  //
  // cls → CSS class adı. Hər kartın öz rəng sxemi var (aşağıdakı CSS-də tərif edilib).
  const cards = [
    {
      label:  "Mövcud Balans",
      amount: balance.availableBalance?.toFixed(2),  // Null-safe
      sub:    "Çəkə bilərsən",
      icon:   "💳",
      cls:    "bw-card-main",      // Parlaq qırmızı gradient
    },
    {
      label:  "Gözləyən Komisya",
      amount: balance.pendingCommission?.toFixed(2),
      sub:    "Ay sonu köçürüləcək",
      icon:   "⏳",
      cls:    "bw-card-pending",   // Tünd qırmızı gradient
    },
    {
      label:  "Ümumi Qazanc",
      amount: balance.totalEarned?.toFixed(2),
      sub:    "Bütün vaxt ərzində",
      icon:   "📈",
      cls:    "bw-card-earned",    // Narıncı-qırmızı gradient
    },
    {
      label:  "Çəkilən",
      amount: balance.totalWithdrawn?.toFixed(2),
      sub:    "Ümumi çəkiş",
      icon:   "🏦",
      cls:    "bw-card-withdrawn", // Ağ fon, qırmızı mətn
    },
  ];


  // ════════════════════════════════════════
  // RENDER — 4 BALANS KARTI
  // ════════════════════════════════════════
  return (
    <>
      <style>{css}</style>
      <div className="bw-wrapper">
        {cards.map((card, i) => (
          // animationDelay → hər kart bir-birindən 0.08s sonra görünür.
          // i=0 → 0s, i=1 → 0.08s, i=2 → 0.16s, i=3 → 0.24s
          // Bu "staggered animation" (dəlmə animasiyası) adlanır — estetik bir effektdir.
          // Template literal: `${i * 0.08}s` → "0s", "0.08s", "0.16s", "0.24s"
          <div
            key={i}
            className={`bw-card ${card.cls}`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            {/* KART YUXARISI: İkon + Başlıq */}
            <div className="bw-card-top">
              {/* Emoji ikon — şrift ölçüsü ilə render edilir, SVG yox */}
              <span className="bw-icon">{card.icon}</span>
              <span className="bw-label">{card.label}</span>
            </div>

            {/* MƏBLƏĞ: böyük rəqəm + "AZN" valyuta işarəsi */}
            <p className="bw-amount">
              {card.amount}
              {/* bw-currency → "AZN" daha kiçik və az nəzərəçarpan göstərilir */}
              <span className="bw-currency"> AZN</span>
            </p>

            {/* KART ALTI: Nöqtə + Alt mətn */}
            <div className="bw-footer">
              {/* Dekorativ nöqtə — vizual ayırıcı */}
              <span className="bw-dot" />
              <p className="bw-sub">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CSS — KOMPONENTİN STİLLƏRİ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// NİYƏ KOMPONENT XARİCİNDƏ AYRICA DƏYİŞKƏN?
//   Komponent funksiyası hər render-də yenidən icra edilir.
//   Əgər css string komponent içindədirsə — hər render-də yenidən yaradılır.
//   Xaricdə olduqda yalnız bir dəfə yaradılır → performans yaxşılaşır.
//   Bundan əlavə, uzun CSS kodu komponentin oxunuşunu çətinləşdirirdi.
//
// NİYƏ <style>{css}</style> (CSS fayl yox)?
//   CSS Modules və ya styled-components istifadə edilmədikdə,
//   komponentin öz stilini birlikdə gəzdirməsi üçün bu üsul istifadə olunur.
//   Komponent bir faylda tam özünütamamlayan (self-contained) olur.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const css = `
  /* Google Fonts-dan Nunito şrifti yüklənir.
     Brauzer bu URL-ə sorğu göndərir, şrift faylını cache-ləyir.
     display=swap → şrift yüklənənə qədər sistem şrifti göstərilir (FOUT). */
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

  /* Bütün elementlər üçün box-sizing: border-box.
     Padding eni artırmır — width: 100% dəqiq işləsin. */
  *, *::before, *::after { box-sizing: border-box; }

  /* WRAPPER — 4 sütunlu grid konteyner.
     Desktop-da 4 kart yan-yana düzülür.
     Responsive breakpoint-lərdə 2 sütuna, sonra 1 sütuna düşür. */
  .bw-wrapper {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* 4 bərabər sütun */
    gap: 14px;
    margin-bottom: 28px;
    width: 100%;
    font-family: 'Nunito', sans-serif;
  }

  /* BASE KART STİLİ — bütün kartlara tətbiq olunur.
     Kateqoriyaya görə rəng fərqləri ayrıca class-larla verilir (aşağıda). */
  .bw-card {
    position: relative; /* ::before pseudo-elementinin yerləşməsi üçün */
    border-radius: 20px;
    padding: 20px 18px 16px;
    overflow: hidden;   /* ::before dairəsi kartın kənarından çıxmasın */
    cursor: default;    /* siçanı götürəndə text seçmə kursoru çıxmasın */

    /* bwFadeUp animasiyası — kart aşağıdan yuxarıya çıxır.
       cubic-bezier(.22,1,.36,1) → "spring" kimi sıçrayıcı effekt.
       both → animasiya başlamadan əvvəl opacity:0 saxlayır. */
    animation: bwFadeUp 0.45s cubic-bezier(.22,1,.36,1) both;

    /* Hover keçid animasiyası:
       cubic-bezier(.34,1.56,.64,1) → yuxarı qalxanda yüngül sıçrayma effekti */
    transition: transform 0.25s cubic-bezier(.34,1.56,.64,1),
                box-shadow 0.25s ease;
  }

  /* Dekorativ dairə — kartın sağ yuxarısındakı yarı şəffaf effekt.
     ::before pseudo-element → əlavə HTML elementi olmadan CSS ilə çəkilir.
     pointer-events: none → siçan tıklamalarına mane olmur. */
  .bw-card::before {
    content: '';          /* pseudo-element üçün məzmun (boş da olsa lazımdır) */
    position: absolute;
    top: -30px; right: -30px; /* Kartın kənarından kənara çıxır */
    width: 110px; height: 110px;
    border-radius: 50%;   /* Dairə forması */
    opacity: 0.12;        /* 12% şəffaflıq — incə effekt */
    background: #fff;
    pointer-events: none;
  }

  /* Hover effekti: kart yuxarı qalxır + böyüyür.
     translateY(-5px) → 5px yuxarı
     scale(1.015)     → 1.5% böyümə */
  .bw-card:hover {
    transform: translateY(-5px) scale(1.015);
  }

  /* ─── KART RƏNG VARİANTLARI ───
     Hər kartın öz gradient rəngi və kölgəsi var. */

  /* Mövcud Balans — parlaq qırmızı gradient */
  .bw-card-main {
    background: linear-gradient(145deg, #E8192C 0%, #ff5a68 100%);
    box-shadow: 0 6px 24px rgba(232,25,44,0.28);
    color: #fff;
  }
  .bw-card-main:hover { box-shadow: 0 14px 34px rgba(232,25,44,0.38); }

  /* Gözləyən Komisya — tünd qırmızı gradient */
  .bw-card-pending {
    background: linear-gradient(145deg, #b91c2c 0%, #e03347 100%);
    box-shadow: 0 6px 24px rgba(185,28,44,0.22);
    color: #fff;
  }
  .bw-card-pending:hover { box-shadow: 0 14px 34px rgba(185,28,44,0.32); }

  /* Ümumi Qazanc — narıncı-qırmızı gradient (coral) */
  .bw-card-earned {
    background: linear-gradient(145deg, #ff6b6b 0%, #ffa07a 100%);
    box-shadow: 0 6px 24px rgba(255,107,107,0.22);
    color: #fff;
  }
  .bw-card-earned:hover { box-shadow: 0 14px 34px rgba(255,107,107,0.32); }

  /* Çəkilən — ağ fon, qırmızı mətn (digər kartlardan vizual fərq üçün).
     Niyə ağ? 4 eyni rəngli kart monoton görünər, ağ kart nəfəs verir. */
  .bw-card-withdrawn {
    background: #fff;
    border: 1.5px solid #ffe0e3;
    box-shadow: 0 4px 18px rgba(232,25,44,0.08);
    color: #c0392b;   /* Tünd qırmızı mətn */
  }
  .bw-card-withdrawn:hover { box-shadow: 0 10px 30px rgba(232,25,44,0.14); }
  /* Ağ kart üçün alt mətn və nöqtə rəngi override edilir:
     !important → əvvəlki .bw-sub və .bw-dot stillərini üzərinə yazır */
  .bw-card-withdrawn .bw-sub { color: #e8a09a !important; }
  .bw-card-withdrawn .bw-dot { background: #E8192C !important; }
  .bw-card-withdrawn .bw-icon { filter: none; } /* Emoji filtrsiz göstərilsin */

  /* ─── KART DAXİLİ ELEMENTLƏR ─── */

  /* İkon + başlıq cərgəsi */
  .bw-card-top {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 12px;
  }

  /* Emoji ikon:
     drop-shadow filtri → emoji-nin altında yüngül kölgə (3D effekt) */
  .bw-icon {
    font-size: 16px;
    line-height: 1;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));
  }

  /* Kart başlığı — "Mövcud Balans", "Çəkilən" və s. */
  .bw-label {
    font-size: 12.5px;
    font-weight: 700;
    opacity: 0.92;         /* Tam ağ deyil — yüngül şəffaflıq */
    letter-spacing: 0.2px;
    white-space: nowrap;   /* Sətir bölünməsin */
  }

  /* Məbləğ rəqəmi — ən böyük element */
  .bw-amount {
    font-size: 26px;
    font-weight: 900;      /* Ən qalın — nəzəri cəlb edir */
    margin: 0 0 10px;
    letter-spacing: -1px;  /* Sıx hərflər — rəqəmlər daha kütləvi görünür */
    line-height: 1.1;
  }

  /* "AZN" valyuta işarəsi — məbləğdən kiçik */
  .bw-currency {
    font-size: 13px;
    font-weight: 700;
    opacity: 0.8;          /* Bir az solğun — məbləğ önplanda qalsın */
    letter-spacing: 0.5px;
  }

  /* Alt hissə: nöqtə + alt mətn */
  .bw-footer {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* Dekorativ nöqtə — vizual ayırıcı elementi */
  .bw-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.7); /* Ağ, 70% şəffaf */
    flex-shrink: 0; /* Flex konteynerdə kiçilməsin */
  }

  /* Alt izah mətni — "Çəkə bilərsən", "Ay sonu köçürüləcək" və s. */
  .bw-sub {
    font-size: 11.5px;
    font-weight: 600;
    opacity: 0.78;
    margin: 0;
    white-space: nowrap;
  }

  /* ─── SKELETON (YÜKLƏMƏ ANİMASİYASI) ───
     Məlumat gəlməzdən əvvəl kartların yerini tutan animasiyalı bloklar. */

  /* Skeleton kart konteyneri */
  .bw-skeleton {
    border-radius: 20px;
    padding: 20px 18px;
    background: #fff5f5;        /* Çox açıq çəhrayı */
    border: 1.5px solid #ffe0e3;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Skeleton xətti — animasiyalı shimmer effekti.
     background-size: 200% 100% → gradient tam genişlikdən 2x geniş.
     bwShimmer animasiyası background-position-u hərəkət etdirir →
     soldan sağa keçən parıltı effekti yaranır. */
  .bw-skeleton-line {
    border-radius: 8px;
    background: linear-gradient(
      90deg,
      #fddde0 25%,   /* Solğun çəhrayı */
      #ffe9eb 50%,   /* Açıq parıltı */
      #fddde0 75%    /* Yenidən solğun */
    );
    background-size: 200% 100%; /* Gradient 2x geniş → hərəkət üçün yer */
    animation: bwShimmer 1.4s infinite; /* Sonsuz shimmer */
    height: 12px;
  }

  /* Müxtəlif ölçülü skeleton xətləri — real məzmunu simulyasiya edir */
  .bw-skeleton-short  { width: 55%;  height: 11px; }  /* Başlıq yeri */
  .bw-skeleton-long   { width: 100%; height: 28px; border-radius: 10px; } /* Məbləğ yeri */
  .bw-skeleton-medium { width: 65%;  height: 10px; }  /* Alt mətn yeri */

  /* ─── ANİMASİYALAR ─── */

  /* Kartların görünmə animasiyası — aşağıdan yuxarıya çıxır.
     from: görünməz (opacity:0) + 18px aşağıda
     to:   tam görünür + öz yerinde */
  @keyframes bwFadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Skeleton shimmer animasiyası — soldan sağa parıltı.
     background-position 200% → -200% hərəkəti:
       Gradient başlanğıcda sağdadır (200%), sona doğru sola keçir (-200%).
       Bu hərəkət soldan sağa parıltı kimi görünür. */
  @keyframes bwShimmer {
    0%   { background-position:  200% 0; } /* Gradient sağda */
    100% { background-position: -200% 0; } /* Gradient sola keçdi */
  }

  /* ─── RESPONSİV BREAKPOINT-LƏR ─── */

  /* TABLET (≤ 1024px): 4 sütun → 2 sütun */
  @media (max-width: 1024px) {
    .bw-wrapper { grid-template-columns: repeat(2, 1fr); }
  }

  /* BÖYÜK MOBİL (≤ 768px): 2 sütun qalır, padding + şrift kiçilir */
  @media (max-width: 768px) {
    .bw-wrapper { grid-template-columns: repeat(2, 1fr); gap: 11px; margin-bottom: 20px; }
    .bw-card    { padding: 16px 14px 13px; border-radius: 16px; }
    .bw-amount  { font-size: 21px; }
    .bw-label   { font-size: 11.5px; }
  }

  /* KİÇİK MOBİL (≤ 480px): 2 sütun, daha kiçik şriftlər */
  @media (max-width: 480px) {
    .bw-wrapper { grid-template-columns: 1fr 1fr; gap: 9px; }
    .bw-card    { padding: 14px 12px 11px; border-radius: 14px; }
    .bw-amount  { font-size: 18px; letter-spacing: -0.5px; }
    .bw-label   { font-size: 10.5px; }
    .bw-sub     { font-size: 10px; }
  }

  /* ÇOX KİÇİK TELEFON (≤ 360px): 2 sütun → 1 sütun.
     Çox dar ekranda 2 kart yan-yana sığmır. */
  @media (max-width: 360px) {
    .bw-wrapper { grid-template-columns: 1fr; }
  }
`;

// Default export — başqa fayllarda belə import edilir:
// import BalanceWidget from "./BalanceWidget"
// İstifadəsi: <BalanceWidget sellerId={user._id} />
export default BalanceWidget;