// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Blog.jsx
// Bloq səhifəsi — məqalələri siyahı şəklində göstərən tam səhifə komponenti.
//
// STRUKTUR:
//   1. Hero bölməsi  → başlıq + breadcrumb naviqasiyası
//   2. Sol sütun     → bloq məqalə kartları + pagination
//   3. Sağ sütun (sidebar) → axtarış, son məqalələr, kateqoriyalar
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// React — JSX render üçün.
// useState — lokal state idarəetməsi üçün (axtarış fokus vəziyyəti).
import React, { useState } from 'react'

// Link → React Router-dən. Səhifəni yeniləmədən URL dəyişdirir (SPA naviqasiyası).
//   <a href="..."> istifadə etsəydik, hər kliklədə tam səhifə yenilənərdi.
import { Link } from 'react-router-dom'

// Lucide React ikonları:
//   Search    → Axtarış input-unun yanındakı böyüdücü şüşə ikonu
//   Calendar  → Bloq məqaləsinin tarix hissəsindəki ikon
//   User      → Bloq məqaləsinin müəllif hissəsindəki ikon
//   ArrowRight→ "Read More" linkinin yanındakı ox ikonu (hover-da irəli hərəkət edir)
//   Tag       → "Kateqoriyalar" sidebar başlığının yanındakı etiket ikonu
import { Search, Calendar, User, ArrowRight, Tag } from 'lucide-react'


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCK DATA — TEST VERİLƏNLƏRİ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// NİYƏ KOMPONENT XARİCİNDƏ?
//   Hər render-də yenidən yaradılmasın deyə.
//   Bu məlumatlar statikdir (dəyişmir) → bir dəfə yarat, daima istifadə et.
//   Real layihədə API-dən gəlməlidir (useEffect + fetch/RTK Query).
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Sağ sidebar-dakı "Son Məqalələr" bölməsi üçün kiçik kart məlumatları.
// imageUrl boşdur — RecentPostCard placehold.co ilə dinamik şəkil yaradır.
const recentPosts = [
  { id: 1, category: "JEAN",   title: "Fashion Trends In Summer 2024",                    imageUrl: "" },
  { id: 2, category: "FRUITS", title: "Organic Good For Health Trending in Winter 2024",  imageUrl: "" },
  { id: 3, category: "YOGA",   title: "Trending Exercise in Summer 2024",                 imageUrl: "" },
]

// Əsas məzmun sahəsindəki bloq məqalələri.
// Hər məqalənin:
//   id         → unikal identifikator (Link URL-ə yazılır: /blog/101)
//   categories → bir məqalənin birdən çox kateqoriyası ola bilər (şəklin üstündəki badge-lər)
//   title      → məqalənin başlığı
//   author     → müəllifin adı
//   date       → yayımlanma tarixi (string formatında saxlanılır)
//   excerpt    → qısa xülasə (tam mətn deyil)
//   imageUrl   → Cloudinary-dəki şəkil URL-i
const mockBlogPosts = [
  {
    id: 101,
    categories: ["JEAN", "SHOES"],
    title: "How To Build A Sustainable And Stylish Wardrobe",
    author: "Alex Balde",
    date: "Dec 21, 2023",
    excerpt: "Build a versatile and timeless wardrobe with our list of must-have fashion staples. From the classic little black dress to the perfect pair of jeans.",
    imageUrl: "https://res.cloudinary.com/derzgbs7x/image/upload/v1740132581/products/xmpyisulgltsv4k6ypfs.png"
  },
  {
    id: 102,
    categories: ["BEAUTY"],
    title: "The Ultimate Guide to Winter Skincare Routines",
    author: "Emily Clark",
    date: "Jan 15, 2024",
    excerpt: "Keep your skin hydrated and glowing all winter long with these expert tips and product recommendations for cold weather.",
    imageUrl: "https://res.cloudinary.com/derzgbs7x/image/upload/v1740132581/products/xmpyisulgltsv4k6ypfs.png"
  },
]


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RecentPostCard — SON MƏQALƏ KARTI (SIDEBAR)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// NƏ EDİR:
//   Sidebar-dakı "Son Məqalələr" bölməsindəki kiçik kartları render edir.
//   Şəkil + kateqoriya + başlıq — üfüqi düzülüş.
//
// NİYƒ AYRICA KOMPONENTDİR?
//   Sidebar-da 3 kart var. Hər birini ayrıca yazmaq kod təkrarıdır.
//   map() + bu komponent → daha təmiz kod.
//
// PROPS:
//   post → { id, category, title, imageUrl }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const RecentPostCard = ({ post }) => (
  // Link → /blog/:id-yə kliklənəndə yönləndirir.
  // group → Tailwind-in "group hover" sistemi.
  //   Parent-a "group" verilir, uşaqda "group-hover:..." yazılır.
  //   Nəticə: parent hover olduqda uşaq stilləri aktivləşir.
  <Link to={`/blog/${post.id}`} className="flex items-center gap-3 group">

    {/* Kiçik kvadrat şəkil — 60x60px, overflow:hidden ilə kənarlar yuvarlaq */}
    <div className="w-[60px] h-[60px] flex-shrink-0 rounded-xl overflow-hidden relative">
      {/* placehold.co → dinamik placeholder şəkil xidməti.
          post.category[0] → kateqoriyanın ilk hərfi (məs. "J", "F", "Y")
          URL formatı: /genişlik x hündürlük / fon rəngi / mətn rəngi ? text=...
          Hover-da scale(110%) ilə zoom effekti — transition ilə hamar */}
      <img
        src={`https://placehold.co/60x60/fde8ea/E8192C?text=${post.category[0]}`}
        alt={post.title}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
    </div>

    {/* Mətn hissəsi: flex:1 → qalan boşluğu doldurur, min-w-0 → overflow işləsin */}
    <div className="flex-1 min-w-0">
      {/* Kateqoriya etiketi — kiçik, böyük hərflə, qırmızı */}
      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#E8192C' }}>
        {post.category}
      </span>
      {/* Məqalə başlığı:
          line-clamp-2 → 2 sətirdən artıq olsa "..." ilə kəsilir (CSS overflow).
          group-hover:text-[#E8192C] → parent hover olduqda qırmızıya çevrilir */}
      <h4 className="text-sm font-semibold leading-snug mt-0.5 line-clamp-2 transition-colors group-hover:text-[#E8192C]" style={{ color: '#222' }}>
        {post.title}
      </h4>
    </div>
  </Link>
)


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BlogPostCard — ƏSAS BLOQ MƏQALƏ KARTI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// NƏ EDİR:
//   Bloq siyahısındakı böyük məqalə kartlarını render edir.
//   Şəkil + kateqoriya badge-ləri + müəllif/tarix + başlıq + xülasə + "Read More"
//
// NİYƏ <article> ELEMENTI?
//   HTML5 semantik elementi — axtarış motorlarına (SEO) bu blokun
//   müstəqil məzmun parçası olduğunu bildirir.
//   <div> istifadə etsəydik, semantik dəyər olmazdı.
//
// PROPS:
//   post → { id, categories, title, author, date, excerpt, imageUrl }
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const BlogPostCard = ({ post }) => (
  // hover:-translate-y-1 → hover-da 4px yuxarı qalxır (Tailwind)
  <article
    className="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
    style={{ border: '1.5px solid #fde8ea', boxShadow: '0 4px 20px rgba(232,25,44,0.07)' }}
  >
    {/* ŞƏKİL BÖLMƏSİ — overflow:hidden ilə zoom effektini karta sıxışdırır */}
    <div className="overflow-hidden relative">
      <Link to={`/blog/${post.id}`}>
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full object-cover transition-transform duration-500 hover:scale-105 blog-post-img"
          style={{ height: 300 }}
          // onError → şəkil yüklənmədikdə (404, şəbəkə xətası):
          //   e.target.onerror = null → sonsuz xəta döngüsünü önləyir
          //   e.target.src = ... → ehtiyat placeholder şəkilinə keçir
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/800x400/fde8ea/E8192C?text=Brendex+Blog"
          }}
        />
      </Link>

      {/* Kateqoriya badge-ləri — şəklin üstündə absolute yerləşir.
          position: absolute → şəkil axınından çıxır, şəkilin üzərinə qoyulur.
          flex-wrap → birdən çox kateqoriya varsa alta düşür */}
      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
        {/* post.categories massivi üzərindən keçir — hər kateqoriya üçün badge */}
        {post.categories.map((cat, i) => (
          <span
            key={i}
            className="text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-md"
            style={{ background: '#E8192C', letterSpacing: '0.5px' }}
          >
            {cat}
          </span>
        ))}
      </div>
    </div>

    {/* MƏTN BÖLMƏSİ */}
    <div className="p-6 sm:p-8 space-y-4">

      {/* Meta məlumatlar: müəllif + tarix */}
      <div className="flex items-center gap-5 text-xs font-semibold" style={{ color: '#aaa' }}>
        {/* Müəllif */}
        <span className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" style={{ color: '#E8192C' }} />
          {post.author}
        </span>
        {/* Ayırıcı xətt — "|" simvolu */}
        <span style={{ color: '#eee' }}>|</span>
        {/* Tarix */}
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" style={{ color: '#E8192C' }} />
          {post.date}
        </span>
      </div>

      {/* Başlıq — hover-da qırmızıya çevrilir */}
      <h2
        className="text-xl sm:text-2xl font-bold leading-snug transition-colors hover:text-[#E8192C]"
        style={{ color: '#1a1a1a' }}
      >
        <Link to={`/blog/${post.id}`}>{post.title}</Link>
      </h2>

      {/* Dekorativ ayırıcı xətt — başlıq ilə xülasə arasında */}
      <div className="h-px w-12 rounded-full" style={{ background: '#fde8ea' }} />

      {/* Xülasə mətni */}
      <p className="text-sm leading-relaxed" style={{ color: '#777' }}>
        {post.excerpt}
      </p>

      {/* "Read More" linki:
          group → ArrowRight ikonuna hover effekti ötürmək üçün.
          group-hover:translate-x-1 → hover-da ox 4px sağa sürüşür. */}
      <Link
        to={`/blog/${post.id}`}
        className="inline-flex items-center gap-2 text-sm font-bold transition-all group"
        style={{ color: '#E8192C' }}
      >
        Read More
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  </article>
)


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Blog — ANA KOMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Tam bloq səhifəsini render edir:
//   1. Hero bölməsi (başlıq + breadcrumb)
//   2. 2/3 + 1/3 sütunlu layout (məqalələr + sidebar)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Blog = () => {
  // searchFocused → axtarış input-unun fokus vəziyyəti.
  // Hazırda yalnız CSS class-la (blog-search-input:focus) idarə olunur.
  // Bu state gələcəkdə fokus zamanı əlavə UI effektlər üçün istifadə oluna bilər.
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    // React.Fragment (<>) → əlavə DOM elementi yaratmadan iki elementi qruplaşdırır.
    <>
      {/* ─── CSS STİLLƏRİ ───
          Tailwind-lə ifadə edilə bilməyən media query-lər və
          pseudo-class-lar burada yazılır. */}
      <style>{`
        /* Google Fonts — Nunito şrifti */
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');

        /* Şrifti bütün bloq komponentinə tətbiq et */
        .blog-root { font-family: 'Nunito', sans-serif; }

        /* HERO FON:
           linear-gradient → üç rəng arası çəhrayı keçid.
           ::before → iki "spotligt" effekti (radial gradient).
           ::after  → sağ yuxarıda böyük şəffaf dairə (dekor).
           Bunlar Tailwind sinifləri ilə yazıla bilmir (mürəkkəb pseudo-elementlər). */
        .blog-hero-grain {
          background: linear-gradient(135deg, #fff8f8 0%, #fde8ea 60%, #fff0f0 100%);
          position: relative;
          overflow: hidden; /* Dairə kartın kənarından çıxmasın */
        }
        /* İki spotlight: sol aşağı + sağ yuxarı */
        .blog-hero-grain::before {
          content: '';
          position: absolute;
          inset: 0; /* top/right/bottom/left hamısı 0 — tam örtür */
          background-image:
            radial-gradient(circle at 20% 50%, rgba(232,25,44,0.06) 0%, transparent 60%),
            radial-gradient(circle at 80% 20%, rgba(232,25,44,0.04) 0%, transparent 50%);
          pointer-events: none;
        }
        /* Sağ yuxarıdakı böyük dairə dekor */
        .blog-hero-grain::after {
          content: '';
          position: absolute;
          top: -60px; right: -60px; /* Kənara çıxır — yarı görünür */
          width: 280px; height: 280px;
          border-radius: 50%;
          background: rgba(232,25,44,0.05);
          pointer-events: none;
        }

        /* Kartların görünmə animasiyası — aşağıdan yuxarıya */
        .blog-fade-in {
          animation: blogFadeUp 0.5s cubic-bezier(.22,1,.36,1) both;
        }
        /* İkinci kartın 0.1s gecikmə ilə gəlməsi — staggered effekt */
        .blog-fade-in:nth-child(2) { animation-delay: 0.1s; }

        @keyframes blogFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Axtarış input-unun fokus stili:
           :focus pseudo-class → Tailwind JIT olmadan işləmir,
           buna görə burada əl ilə yazılır. */
        .blog-search-input:focus {
          border-color: #E8192C !important;
          box-shadow: 0 0 0 3px rgba(232,25,44,0.08); /* Fokus halqası */
        }

        /* Kateqoriya linklərinin hover effekti:
           padding-left artaraq "sürüşmə" hissi yaradır.
           transition ilə hamar keçid. */
        .cat-link { transition: color 0.2s, padding-left 0.2s; }
        .cat-link:hover { color: #E8192C !important; padding-left: 6px; }

        /* MOBİL BREAKPOINT-LƏR */
        @media (max-width: 767px) {
          .blog-hero-grain { padding-top: 2.5rem !important; padding-bottom: 2.5rem !important; }
          .blog-hero-grain h1 { font-size: 1.875rem !important; }  /* 30px */
          .blog-content-wrap { padding: 1.5rem 1rem !important; }
          .blog-post-img { height: 200px !important; }   /* Kart şəkilləri kiçilir */
        }
        @media (max-width: 400px) {
          .blog-hero-grain h1 { font-size: 1.5rem !important; }    /* 24px */
          .blog-post-img { height: 160px !important; }
        }
      `}</style>

      <div className="blog-root">

        {/* ════════════════════════════════════════
            HERO BÖLMƏSİ — Başlıq + Breadcrumb
            Sabit ölçülü fon — məzmun üzərindədir (z-index: 1).
        ════════════════════════════════════════ */}
        <section
          className="blog-hero-grain py-20"
          style={{ borderBottom: '1.5px solid #fddde0' }}
        >
          {/* position: relative + zIndex: 1 → ::before/::after pseudo-elementlərinin
              üstündə göstərilsin. Pseudo-elementlər z-index olmadan məzmunu örtə bilər. */}
          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
            style={{ position: 'relative', zIndex: 1 }}
          >
            {/* Brendex "B" badge-i — gradient dairə içindəki ağ hərflə logo */}
            <div
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-5 shadow-md"
              style={{ background: 'linear-gradient(135deg, #E8192C, #ff5a68)' }}
            >
              <span className="text-white font-black text-lg">B</span>
            </div>

            {/* Səhifə başlığı */}
            <h1
              className="text-4xl sm:text-5xl font-black mb-4 tracking-tight"
              style={{ color: '#1a1a1a' }}
            >
              Blog
            </h1>

            {/* Breadcrumb naviqasiyası — hansı səhifədə olduğunu göstərir.
                <nav> + <ol> → HTML5 semantik breadcrumb strukturu (SEO üçün vacib).
                axtarış motorları bu elementi "breadcrumb" kimi tanıyır. */}
            <nav className="text-sm font-semibold">
              <ol className="flex justify-center items-center gap-2" style={{ color: '#999' }}>
                <li>
                  {/* Ana səhifəyə link — hover-da qırmızıya çevrilir */}
                  <Link to="/" className="transition-colors hover:text-[#E8192C]">Homepage</Link>
                </li>
                {/* Ayırıcı "/" — qırmızı */}
                <li style={{ color: '#E8192C' }}>/</li>
                {/* Cari səhifə — link deyil (artıq burdayıq) */}
                <li style={{ color: '#E8192C' }}>Blog Default</li>
              </ol>
            </nav>
          </div>
        </section>


        {/* ════════════════════════════════════════
            ƏSAS MƏZMUN — 2 sütunlu layout
            Sol: məqalələr (lg:col-span-2 → 2/3 en)
            Sağ: sidebar  (lg:col-span-1 → 1/3 en)
            Mobil: tək sütun (grid-cols-1)
        ════════════════════════════════════════ */}
        <div className="blog-content-wrap max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          {/* grid-cols-1 → mobil: tək sütun
              lg:grid-cols-3 → masaüstü: 3 sütunlu grid (2+1 bölünür) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* ── SOL SÜTUN: MƏQALƏLƏR (2/3 eni tutur) ── */}
            <div className="lg:col-span-2 space-y-10">
              {mockBlogPosts.map((post, i) => (
                // blog-fade-in → hər kart ardıcıl olaraq aşağıdan yuxarıya çıxır.
                // animationDelay → staggered effekt: i=0 → 0s, i=1 → 0.12s
                <div
                  key={post.id}
                  className="blog-fade-in"
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  <BlogPostCard post={post} />
                </div>
              ))}

              {/* PAGİNASİYA — səhifə keçid düymələri
                  Hazırda dekorativdir (real router/state əlavə edilməyib).
                  Real layihədə currentPage state-i + onClick handler əlavə edilməlidir. */}
              <div className="flex justify-center pt-6">
                <nav
                  className="inline-flex items-center gap-1 rounded-2xl p-1.5"
                  style={{
                    border: '1.5px solid #fde8ea',
                    background: '#fff',
                    boxShadow: '0 2px 12px rgba(232,25,44,0.06)'
                  }}
                >
                  {/* ['←', '1', '2', '3', '→'] → 5 düymə render edilir.
                      '1' aktiv səhifədir — qırmızı fon ilə fərqlənir.
                      '←' və '→' ox düymələridir — qırmızı mətn.
                      Qalan rəqəmlər — boz mətn. */}
                  {['←', '1', '2', '3', '→'].map((item, i) => (
                    <button
                      key={i}
                      className="w-9 h-9 rounded-xl text-sm font-bold transition-all"
                      style={item === '1'
                        // Aktiv səhifə stili
                        ? { background: '#E8192C', color: '#fff', boxShadow: '0 3px 10px rgba(232,25,44,0.3)' }
                        // Digər düymələr stili
                        : { color: item === '←' || item === '→' ? '#E8192C' : '#666', background: 'transparent' }
                      }
                      // onMouseEnter/Leave → hover-da açıq çəhrayı fon.
                      // Aktiv səhifəyə (item === '1') hover effekti tətbiq edilmir.
                      onMouseEnter={e => { if (item !== '1') e.currentTarget.style.background = '#fff5f5' }}
                      onMouseLeave={e => { if (item !== '1') e.currentTarget.style.background = 'transparent' }}
                    >
                      {item}
                    </button>
                  ))}
                </nav>
              </div>
            </div>


            {/* ── SAĞ SÜTUN: SIDEBAR (1/3 eni tutur) ──
                <aside> → HTML5 semantik elementi.
                Axtarış motorlarına bu blokun əsas məzmunla bilavasitə əlaqəli
                olmayan əlavə məlumat olduğunu bildirir. */}
            <aside className="lg:col-span-1 space-y-8">

              {/* AXTARIŞ QUTUSU */}
              <div
                className="rounded-2xl p-5"
                style={{
                  border: '1.5px solid #fde8ea',
                  background: '#fff',
                  boxShadow: '0 2px 14px rgba(232,25,44,0.05)'
                }}
              >
                <h3 className="text-base font-black mb-4" style={{ color: '#1a1a1a' }}>Axtar</h3>
                {/* position: relative → axtarış ikonu absolute yerləşsin */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Məqalə axtar..."
                    className="blog-search-input w-full pl-4 pr-11 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{
                      border: '1.5px solid #fde8ea',
                      background: '#fff9f9',
                      color: '#333',
                      fontFamily: 'Nunito, sans-serif'
                    }}
                  />
                  {/* Axtarış ikonu — input-un sağ tərəfindədir.
                      absolute + right-3 + top-1/2 + -translate-y-1/2 →
                      şaquli mərkəzdə, 12px sağdan → input-un içinə yerləşdirilir.
                      hover:scale-110 → üzərinə gəldikdə böyüyür. */}
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-transform hover:scale-110"
                    style={{ color: '#E8192C' }}
                  >
                    <Search className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>


              {/* SON MƏQALƏLƏR */}
              <div
                className="rounded-2xl p-5"
                style={{
                  border: '1.5px solid #fde8ea',
                  background: '#fff',
                  boxShadow: '0 2px 14px rgba(232,25,44,0.05)'
                }}
              >
                <h3
                  className="text-base font-black mb-5 pb-3"
                  style={{ color: '#1a1a1a', borderBottom: '2px solid #fde8ea' }}
                >
                  Son Məqalələr
                </h3>
                {/* space-y-5 → hər kart arasında 20px boşluq */}
                <div className="space-y-5">
                  {/* recentPosts massivi üzərindən keçir — hər biri üçün RecentPostCard */}
                  {recentPosts.map(post => <RecentPostCard key={post.id} post={post} />)}
                </div>
              </div>


              {/* KATEQORİYALAR */}
              <div
                className="rounded-2xl p-5"
                style={{
                  border: '1.5px solid #fde8ea',
                  background: '#fff',
                  boxShadow: '0 2px 14px rgba(232,25,44,0.05)'
                }}
              >
                {/* Başlıqda Tag ikonu + "Kateqoriyalar" */}
                <h3
                  className="text-base font-black mb-5 pb-3 flex items-center gap-2"
                  style={{ color: '#1a1a1a', borderBottom: '2px solid #fde8ea' }}
                >
                  <Tag className="w-4 h-4" style={{ color: '#E8192C' }} />
                  Kateqoriyalar
                </h3>

                {/* Kateqoriya siyahısı — <ul>/<li> semantik siyahı elementi */}
                <ul className="space-y-1">
                  {[
                    { name: 'Fashion',    count: 12 },
                    { name: 'Life Style', count: 8  },
                    { name: 'Technology', count: 5  },
                    { name: 'Food',       count: 10 },
                    { name: 'Travel',     count: 3  },
                  ].map((cat, i) => (
                    <li key={i}>
                      {/* cat-link → hover-da soldan sağa sürüşmə + rəng dəyişimi.
                          URL yaratma: "Life Style" → "life-style"
                            .toLowerCase() → "life style"
                            .replace(' ', '-') → "life-style"
                          Qeyd: replace(' ', '-') yalnız ilk boşluğu əvəzləyir.
                          Birdən çox boşluq üçün replaceAll(' ', '-') lazım olar. */}
                      <Link
                        to={`/category/${cat.name.toLowerCase().replace(' ', '-')}`}
                        className="cat-link flex justify-between items-center py-2.5 px-1 text-sm font-semibold"
                        style={{ color: '#555', borderBottom: '1px solid #fff5f5' }}
                      >
                        {/* Kateqoriya adı — sol tərəf */}
                        <span>{cat.name}</span>
                        {/* Məqalə sayı badge-i — sağ tərəf */}
                        <span
                          className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                          style={{ background: '#fff0f1', color: '#E8192C' }}
                        >
                          {cat.count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

            </aside>
          </div>
        </div>
      </div>
    </>
  )
}

// Default export — başqa fayllarda belə import edilir:
// import Blog from "./Blog"
export default Blog