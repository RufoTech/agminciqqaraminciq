// ============================================================
// Footer.jsx
// Bu komponent saytın alt hissəsini (footer) təşkil edir.
// Desktop üçün 5 sütunlu grid layout, mobil üçün akkordeon
// (açılıb-bağlanan) bölmələr istifadə edilir.
// Modal sistemi ilə müqavilə və məlumat panelləri açılır.
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Sosial media və UI ikonları
import { Facebook, Twitter, Instagram, Youtube, X, ChevronRight, Shield, Store, Users, FileText, Scale, Handshake, HelpCircle, Truck, RotateCcw, MessageSquare, ChevronDown } from 'lucide-react';

// =====================================================================
// Modal Komponenti
// Müqavilə və məlumat panellərini ekranda göstərən overlay komponenti.
// Props:
//   title   — modalın başlığı
//   icon    — başlıqdakı ikon (Lucide komponenti)
//   content — { title, text } massivi — hər element bir bölmədir
//   onClose — modali bağlayan funksiya
// =====================================================================
const Modal = ({ title, icon: Icon, content, onClose }) => (
  // Tam ekranı örən qaranlıq overlay
  // onClick={onClose} — overlay-ə tıklandıqda modal bağlanır
  <div style={{
    position: "fixed", inset: 0, zIndex: 1000,
    background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
    display: "flex", alignItems: "flex-end", justifyContent: "center",
    padding: "0", animation: "fdIn 0.2s",
  }} onClick={onClose}>
    <style>{`
      /* Overlay solğunlaşma animasiyası */
      @keyframes fdIn{from{opacity:0}to{opacity:1}}
      /* Məzmun yuxarı sürüşmə animasiyası */
      @keyframes slUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      /* Bottom sheet (aşağıdan yuxarıya) animasiyası */
      @keyframes sheetUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
      /* SM+ ekranlarda modal mərkəzdə, dairəvi, maksimum genişlikli görünür */
      @media(min-width:640px){
        .modal-sheet{border-radius:20px!important;max-width:640px!important;width:100%!important;margin:auto!important;max-height:82vh!important}
        .modal-wrap{align-items:center!important;padding:20px!important}
      }
    `}</style>

    {/* e.stopPropagation() — panel içinə tıklandıqda overlay-in onClick-ini bloklayır,
        yəni məzmuna tıklamaq modali bağlamır */}
    <div onClick={e => e.stopPropagation()} className="modal-sheet" style={{
      background: "#fff",
      borderRadius: "20px 20px 0 0",   // yalnız yuxarı küncləri dairəvi (mobil bottom sheet görünüşü)
      width: "100%",
      maxHeight: "90vh",               // ekranın 90%-dən çox tutmur
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
      animation: "sheetUp 0.28s cubic-bezier(0.34,1.20,0.64,1)",
    }}>
      {/* Mobil handle bar — vizual tutma nöqtəsi, sürüşdürmə əlaməti */}
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 4 }}>
        <div style={{ width: 40, height: 5, background: "#e0e0e0", borderRadius: 3 }} />
      </div>

      {/* Modal başlığı — ikon + ad + bağlama düyməsi */}
      <div style={{
        padding: "12px 20px 14px", borderBottom: "1px solid #f0f0f0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "linear-gradient(135deg,#fff0f1,#fff)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Qırmızı ikonlu dairə */}
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#E8192C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={17} color="white" />
          </div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#1a1a1a", fontFamily: "'Sora',sans-serif" }}>{title}</h3>
        </div>
        {/* X (bağlama) düyməsi */}
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, border: "1.5px solid #f0f0f0", background: "#f9f9f9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <X size={14} color="#888" />
        </button>
      </div>

      {/* Modalın scroll olunan məzmun hissəsi */}
      <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
        {/* content massivinin hər elementi bir bölmə kimi render edilir */}
        {content.map((section, i) => (
          <div key={i} style={{ marginBottom: 22 }}>
            {/* Bölmə başlığı — qırmızı, böyük hərflərlə */}
            <h4 style={{ fontSize: 12, fontWeight: 800, color: "#E8192C", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7, fontFamily: "'Sora',sans-serif" }}>
              {section.title}
            </h4>
            {/* Bölmə mətni */}
            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.8, margin: 0, fontFamily: "'Sora',sans-serif" }}>
              {section.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// =====================================================================
// CONTRACTS — Bütün modal məzmunları bir yerdə saxlayan obyekt
// Hər açar (magaza, musteri, ...) bir modalın bütün məlumatlarını saxlayır.
// Bu yanaşma ilə kod dublikatı azalır — modal açmaq üçün yalnız açar lazımdır.
// =====================================================================
const CONTRACTS = {
  magaza: {
    title: "Mağaza Hüquqları",
    icon: Store,
    content: [
      { title: "1. Mağaza Açma Hüququ", text: "Brendex platformasında mağaza açmaq üçün satıcı vergi nömrəsi, VÖN nömrəsi və mağaza ünvanı təqdim etməlidir. Qeydiyyat prosesi tamamlandıqdan sonra mağazanıza unikal URL linki verilir." },
      { title: "2. Məhsul Yerləşdirmə", text: "Satıcılar yalnız qanuni məhsullar yerləşdirə bilər. Qadağan olunmuş, saxta, və ya zərərli məhsulların yerləşdirilməsi hesabın bağlanması ilə nəticələnəcəkdir. Bütün məhsullar Brendex moderasiya prosesinə tabedir." },
      { title: "3. Komissiya və Ödənişlər", text: "Brendex hər uğurlu sifariş üçün 5-10% komissiya alır. Ödənişlər hər ayın 1-i və 15-inde satıcının bank hesabına köçürülür. Minimum ödəniş məbləği 50 AZN-dir." },
      { title: "4. Sifariş İdarəetmə", text: "Satıcı sifariş daxil olduqdan 24 saat ərzində sifarişi qəbul etməli və 3 iş günü ərzində göndərməlidir. Gecikmiş sifarişlər penalti ilə nəticələnə bilər." },
      { title: "5. İadə Siyasəti", text: "Müştərinin iadə sorğusuna satıcı 48 saat ərzində cavab verməlidir. Məhsul qüsurlu olarsa, geri qaytarma xərcləri satıcı tərəfindən ödənilir." },
      { title: "6. Hesab Bloklanması", text: "Şikayət nisbəti 5%-dən yuxarı olan mağazalar xəbərdarlıq alarlar. Şikayət nisbəti 10%-i keçərsə hesab müvəqqəti, 15%-i keçərsə daimi bağlanır." },
    ],
  },
  musteri: {
    title: "Müştəri Müqaviləsi",
    icon: Users,
    content: [
      { title: "1. Hesab Yaratma", text: "Brendex-də alış-veriş etmək üçün etibarlı e-poçt ünvanı ilə qeydiyyatdan keçməlisiniz. Hesabınızın təhlükəsizliyi sizin məsuliyyətinizdədir. Şübhəli fəaliyyət aşkar etdikdə dərhal bildirin." },
      { title: "2. Sifariş və Ödəniş", text: "Sifarişinizi tamamladıqdan sonra ödəniş SSL şifrələməsi ilə qorunur. Kart məlumatlarınız serverimizdə saxlanılmır. Stripe ödəniş sistemi vasitəsilə təhlükəsiz əməliyyat həyata keçirilir." },
      { title: "3. Çatdırılma", text: "Çatdırılma müddəti satıcıya görə dəyişir (1-7 iş günü). Sifariş statusunu 'Sifarişlərim' bölməsindən izləyə bilərsiniz. Çatdırılma problemi yarandıqda müştəri xidmətinə müraciət edin." },
      { title: "4. İadə və Geri Ödəmə", text: "Qüsurlu məhsullar 14 gün ərzində iadə edilə bilər. Geri ödəmə 5-10 iş günü ərzində həyata keçirilir. İadə prosesi üçün foto sübutu tələb oluna bilər." },
      { title: "5. Gizlilik", text: "Şəxsi məlumatlarınız üçüncü şəxslərə satılmır. Yalnız sifarişin yerinə yetirilməsi üçün lazımi məlumatlar satıcı ilə paylaşılır. Kart nömrəsi, şifrə kimi həssas məlumatlar heç vaxt açıqlanmır." },
      { title: "6. Mübahisə Həlli", text: "Satıcı ilə mübahisə yarandıqda Brendex vasitəçi kimi çıxış edir. Brendex müştərinin haqlı olduğunu müəyyən edərsə, geri ödəmə avtomatik həyata keçirilir." },
    ],
  },
  gizlilik: {
    title: "Gizlilik Siyasəti",
    icon: Shield,
    content: [
      { title: "1. Toplanılan Məlumatlar", text: "Ad, e-poçt, ünvan, telefon nömrəsi və sifariş tarixi. Ödəniş məlumatları yalnız Stripe tərəfindən idarə edilir, bizim serverlərimizdə saxlanılmır." },
      { title: "2. Məlumatların İstifadəsi", text: "Məlumatlarınız sifarişlərin işlənməsi, müştəri xidməti, xəbər bültenləri (razılığınızla) və platformanın təkmilləşdirilməsi üçün istifadə olunur." },
      { title: "3. Cookie Siyasəti", text: "Saytımız sessiya cookie-ləri, analitik cookie-lər (Google Analytics) və tərcih cookie-ləri istifadə edir. Brauzer parametrlərindən cookie-ləri idarə edə bilərsiniz." },
      { title: "4. Məlumat Təhlükəsizliyi", text: "SSL/TLS şifrələməsi, bcrypt şifrə hash-ləməsi, httpOnly JWT cookie-ləri ilə məlumatlarınız qorunur. Mütəmadi təhlükəsizlik yoxlamaları aparılır." },
    ],
  },
  sertler: {
    title: "İstifadə Şərtləri",
    icon: FileText,
    content: [
      { title: "1. Qəbul Edilən İstifadə", text: "Brendex-i yalnız qanuni məqsədlər üçün istifadə edə bilərsiniz. Saxtakarlıq, spam, virusların yayılması, başqasının hesabına icazəsiz giriş qadağandır." },
      { title: "2. İntellektual Mülkiyyət", text: "Brendex loqosu, dizaynı və məzmunu müəlliflik hüququ ilə qorunur. İcazəsiz kopyalama, dağıtma və kommersiya istifadəsi qadağandır." },
      { title: "3. Məsuliyyətin Məhdudlaşdırılması", text: "Brendex üçüncü tərəf satıcıların məhsulları üçün məsuliyyət daşımır. Məhsul keyfiyyəti birbaşa satıcının məsuliyyətidir." },
      { title: "4. Şərtlərin Dəyişdirilməsi", text: "Brendex bu şərtləri 30 günlük xəbərdarlıqla dəyişdirə bilər. Dəyişiklikdən sonra platformadan istifadə yeni şərtləri qəbul etmək deməkdir." },
    ],
  },
  faq: {
    title: "Tez-tez Verilən Suallar",
    icon: HelpCircle,
    content: [
      { title: "Sifariş necə verirəm?", text: "Məhsulu seçin, 'Səbətə əlavə et' düyməsinə basın, sonra ödəniş səhifəsinə keçin. Ödənişi Stripe vasitəsilə kart ilə həyata keçirin. Sifariş avtomatik yaranır." },
      { title: "Sifarişimi necə izləyə bilərəm?", text: "'Sifarişlərim' səhifəsindən sifariş statusunu görə bilərsiniz: Gözlənilir → Hazırlanır → Göndərildi → Çatdırıldı." },
      { title: "Ödəniş təhlükəsizliyi necə təmin edilir?", text: "Bütün ödənişlər SSL şifrələməsi ilə qorunur. Kart məlumatlarınız heç vaxt serverlərimizdə saxlanılmır — Stripe PCI-DSS standartlarına uyğun ödəniş sistemidir." },
      { title: "Hesabımı silə bilərəmmi?", text: "Hesabınızı silmək üçün info@brendex.az ünvanına e-poçt göndərin. Silinmə 5 iş günü ərzində həyata keçirilir. Aktiv sifarişlər tamamlanmadan hesab silinmir." },
      { title: "Şifrəmi unutmusam, nə etməliyəm?", text: "Login səhifəsindəki 'Şifrəni Unutdum' düyməsinə basın. E-poçtunuza sıfırlama linki göndəriləcək. Link 1 saat ərzində etibarlıdır." },
    ],
  },
  catdirilma: {
    title: "Çatdırılma Məlumatı",
    icon: Truck,
    content: [
      { title: "Çatdırılma müddəti", text: "Bakı daxili: 1-3 iş günü. Regionlar: 3-7 iş günü. Çatdırılma müddəti satıcıya və məhsulun stok vəziyyətinə görə dəyişə bilər." },
      { title: "Çatdırılma haqqı", text: "50 AZN-dən yuxarı sifarişlər üçün çatdırılma pulsuzdur. 50 AZN-dən aşağı sifarişlər üçün 5 AZN çatdırılma haqqı tətbiq edilir." },
      { title: "Çatdırılma zamanı problem", text: "Məhsul çatdırılmadıqda və ya gecikdikdə müştəri xidmətimizə müraciət edin: info@brendex.az və ya +994 12 345 67 89." },
      { title: "Çatdırılma ünvanı dəyişikliyi", text: "Sifariş 'Gözlənilir' statusundadırsa, müştəri xidməti vasitəsilə çatdırılma ünvanını dəyişdirə bilərsiniz. 'Göndərildi' statusundan sonra ünvan dəyişdirilmir." },
    ],
  },
  iade: {
    title: "İadə & Geri Ödəmə",
    icon: RotateCcw,
    content: [
      { title: "İadə şərtləri", text: "Məhsul çatdırıldıqdan 14 gün ərzində iadə tələbi göndərilə bilər. Məhsul orijinal qablaşdırmada, istifadə edilməmiş vəziyyətdə olmalıdır." },
      { title: "İadə prosesi", text: "Sifarişlərim → Sifariş detalı → 'İadə tələbi' düyməsinə basın. Məhsulun şəklini əlavə edin. Satıcı 48 saat ərzində cavab verməlidir." },
      { title: "Geri ödəmə müddəti", text: "İadə qəbul edildikdən sonra 5-10 iş günü ərzində kart hesabınıza geri ödəmə həyata keçirilir. Stripe vasitəsilə edilən ödənişlər bank müddətinə görə dəyişə bilər." },
      { title: "Qüsurlu məhsul", text: "Məhsul qüsurlu gəldisə, foto sübutla birlikdə müraciət edin. Bu halda çatdırılma xərcləri satıcı tərəfindən qarşılanır və tam geri ödəmə həyata keçirilir." },
    ],
  },
  elaqe: {
    title: "Bizimlə Əlaqə",
    icon: MessageSquare,
    content: [
      { title: "E-poçt", text: "Ümumi sorğular: info@brendex.az\nMüştəri xidməti: support@brendex.az\nSatıcı dəstəyi: seller@brendex.az\nCavab müddəti: 24 saat ərzində." },
      { title: "Telefon", text: "+994 12 345 67 89 — İş saatları: Həftəiçi 09:00-18:00\n+994 50 123 45 67 — WhatsApp dəstəyi (24/7)" },
      { title: "Ünvan", text: "Brendex MMC\nAzərbaycan, Bakı şəhəri,\nNizami küçəsi 65, AZ1000" },
      { title: "Sosial Media", text: "Facebook, Instagram, Twitter hesablarımızda @brendex.az adı ilə bizi tapın. Birbaşa mesaj göndərərək sürətli dəstək ala bilərsiniz." },
    ],
  },
};

// =====================================================================
// Footer — Əsas Footer Komponenti
// =====================================================================
const Footer = () => {
  // Xəbər bülteni email input-unun state-i
  const [email, setEmail] = useState('');

  // Hansı modalın açıq olduğunu saxlayır
  // null — heç bir modal açıq deyil
  // "magaza", "musteri", ... — həmin açara uyğun modal açılır
  const [activeModal, setActiveModal] = useState(null);

  // React Router ilə proqramatik naviqasiya üçün
  const navigate = useNavigate();

  // ── MOBİL AKKORDEON STATE-İ ──
  // Mobil görünüşdə hansı footer bölməsinin açıq olduğunu saxlayır
  // null — hamısı bağlı
  const [mobileExpanded, setMobileExpanded] = useState(null);

  // Tıklanan bölmə artıq açıqdırsa bağlayır, bağlıdırsa açır (toggle)
  const toggleMobile = (key) => setMobileExpanded(prev => prev === key ? null : key);

  // ── KATEQORİYALAR ──
  // label: görünən mətn, slug: URL-də keçiləcək kateqoriya dəyəri
  const realCategories = [
    { label: "Telefonlar",    slug: "electronics" },
    { label: "Laptoplar",     slug: "electronics" },
    { label: "Kameralar",     slug: "electronics" },
    { label: "Qulaqcıqlar",   slug: "electronics" },
    { label: "Qadın Geyimi",  slug: "clothing"    },
    { label: "Kişi Geyimi",   slug: "clothing"    },
    { label: "Ev Məhsulları", slug: "home"        },
    { label: "Kosmetika",     slug: "beauty"      },
    { label: "İdman",         slug: "sport"       },
    { label: "Avtomobil",     slug: "auto"        },
  ];

  // ── HÜQUQİ LİNKLƏR ──
  // key: CONTRACTS obyektindəki açar — modal açmaq üçün istifadə olunur
  const legalLinks = [
    { label: "Mağaza Hüquqları",   key: "magaza",   icon: Store     },
    { label: "Müştəri Müqaviləsi", key: "musteri",  icon: Handshake },
    { label: "Gizlilik Siyasəti",  key: "gizlilik", icon: Shield    },
    { label: "İstifadə Şərtləri",  key: "sertler",  icon: Scale     },
  ];

  // ── MÜŞTƏRİ XİDMƏTİ LİNKLƏRİ ──
  const serviceLinks = [
    { label: "FAQ",              key: "faq",         icon: HelpCircle  },
    { label: "Çatdırılma",       key: "catdirilma",  icon: Truck       },
    { label: "İadə & Geri Ödəmə", key: "iade",       icon: RotateCcw   },
    { label: "Bizimlə Əlaqə",   key: "elaqe",       icon: MessageSquare },
  ];

  // ── SOSİAL MEDIA LİNKLƏRİ ──
  // color: hover zamanı arxa fon rəngi kimi istifadə olunur
  const socials = [
    { icon: Facebook,  label: "Facebook",  color: "#1877f2" },
    { icon: Instagram, label: "Instagram", color: "#e1306c" },
    { icon: Twitter,   label: "Twitter",   color: "#1da1f2" },
    { icon: Youtube,   label: "Youtube",   color: "#ff0000" },
  ];

  // ── ÖDƏNİŞ SİSTEMLƏRİ ──
  // bg: hər ödəniş sistemi ikonunun arxa fon rəngi
  const payments = [
    { label: "VISA", bg: "#1a1f71" },
    { label: "MC",   bg: "#eb001b" },
    { label: "AMEX", bg: "#007bc1" },
    { label: "PP",   bg: "#003087" },
    { label: "DISC", bg: "#ff6600" },
  ];

  return (
    <>
      <style>{`
        /* Google Fonts — Sora şrifti */
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');

        /* .flink — footer link düymələri üçün ortaq stil */
        .flink{font-size:12.5px;color:#888;text-decoration:none;transition:color 0.15s;font-weight:500;display:flex;align-items:center;gap:6px;font-family:'Sora',sans-serif;background:none;border:none;cursor:pointer;padding:0;text-align:left}
        /* Hover: mətn qırmızı olur, ox ikonu sağa sürüşür */
        .flink:hover{color:#E8192C}
        .flink:hover .fchev{opacity:1;transform:translateX(3px)}
        /* .fchev — link yanındakı gizli ox ikonu, hover-da görünür */
        .fchev{opacity:0;transition:all 0.18s;color:#E8192C;flex-shrink:0}

        /* ── RESPONSIV GÖRÜNÜŞ ── */
        /* 767px-dən kiçik ekranlarda desktop grid gizlənir, mobil layout göstərilir */
        @media (max-width: 767px) {
          .footer-desktop-grid { display: none !important; }
          .footer-mobile { display: block !important; }
        }
        /* 768px-dən böyük ekranlarda mobil layout gizlənir, desktop grid göstərilir */
        @media (min-width: 768px) {
          .footer-mobile { display: none !important; }
          .footer-desktop-grid { display: grid !important; }
        }

        /* Mobil akkordeon başlığı */
        .mob-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 13px;
          color: #1a1a1a;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          background: none;
          border-left: none;
          border-right: none;
          border-top: none;
          width: 100%;
          text-align: left;
        }
        /* Akkordeon məzmun sahəsi */
        .mob-section-body {
          padding: 10px 0 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        /* Akkordeon ox ikonu — açıq olduqda 180° dönür */
        .mob-chevron {
          transition: transform 0.22s ease;
          color: #E8192C;
        }
        .mob-chevron.open {
          transform: rotate(180deg);
        }
      `}</style>

      {/* Aktif modal varsa Modal komponentini render edirik */}
      {/* activeModal null deyilsə, CONTRACTS obyektindən həmin açarın məlumatlarını ötürürük */}
      {activeModal && (
        <Modal
          title={CONTRACTS[activeModal].title}
          icon={CONTRACTS[activeModal].icon}
          content={CONTRACTS[activeModal].content}
          onClose={() => setActiveModal(null)}   // bağlandıqda activeModal null olur
        />
      )}

      <footer style={{ background: "#fff", borderTop: "1px solid #f0f0f0", fontFamily: "'Sora',sans-serif" }}>

        {/* ── ÜST QIRMIZI ŞERİT ── */}
        {/* Logo + naviqasiya linklərini ehtiva edir */}
        <div style={{ background: "#E8192C", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Ağ fon üzərində qırmızı "B" hərfi — mini loqo */}
            <div style={{ width: 26, height: 26, background: "white", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#E8192C", fontWeight: 900, fontSize: 14 }}>B</span>
            </div>
            <span style={{ color: "white", fontWeight: 900, fontSize: 14, letterSpacing: "-0.01em" }}>BRENDEX</span>
          </div>
          {/* Üst şerit naviqasiya linkləri */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {["Haqqımızda", "Kampaniyalar", "Mağazalar", "Korporativ"].map(link => (
              <a key={link} href="#" style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 600, textDecoration: "none" }}
                onMouseEnter={e => e.target.style.color = "white"}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.85)"}>
                {link}
              </a>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════
            DESKTOP LAYOUT (768px+)
            5 sütunlu grid: Logo | Kateqoriya | Hüquqi | Xidmət | Newsletter
        ════════════════════════════════════════ */}
        <div className="footer-desktop-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 32px", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.4fr", gap: 36, marginBottom: 40 }}>

          {/* ── SÜTUN 1: Logo + Kontakt + Sosial media ── */}
          <div>
            {/* Böyük loqo */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <div style={{ width: 36, height: 36, background: "#E8192C", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontWeight: 900, fontSize: 18 }}>B</span>
              </div>
              <span style={{ fontWeight: 900, fontSize: 20, color: "#1a1a1a", letterSpacing: "-0.02em" }}>BRENDEX</span>
            </div>
            <p style={{ color: "#888", fontSize: 12, lineHeight: 1.7, marginBottom: 16, maxWidth: 210 }}>
              Azərbaycanın ən böyük elektron ticarət platforması. Keyfiyyətli məhsullar, sürətli çatdırılma.
            </p>

            {/* Kontakt məlumatları — label: dəyər cütləri şəklində */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
              {[
                { label: "Email",   val: "info@brendex.az"    },
                { label: "Telefon", val: "+994 12 345 67 89"  },
                { label: "Ünvan",   val: "Bakı, Azərbaycan"   },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: "flex", gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#E8192C", textTransform: "uppercase", letterSpacing: "0.04em", minWidth: 52 }}>{label}:</span>
                  <span style={{ fontSize: 12, color: "#666" }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Sosial media ikonları — hover-da hər platformanın öz rəngi istifadə olunur */}
            <div style={{ display: "flex", gap: 8 }}>
              {socials.map(({ icon: Icon, label, color }) => (
                <a key={label} href="#" title={label}
                  style={{ width: 34, height: 34, borderRadius: 9, border: "1.5px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb", textDecoration: "none", transition: "all 0.18s", background: "white" }}
                  onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.borderColor = color; e.currentTarget.style.color = "white"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#f0f0f0"; e.currentTarget.style.color = "#bbb"; }}>
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* ── SÜTUN 2: Kateqoriyalar ── */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#1a1a1a", marginBottom: 16 }}>Kateqoriyalar</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 9 }}>
              {realCategories.map(({ label, slug }) => (
                <li key={label}>
                  {/* navigate() ilə /shop?category=slug URL-inə keçir */}
                  <button onClick={() => navigate(`/shop?category=${slug}`)} className="flink">
                    <ChevronRight size={11} className="fchev" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ── SÜTUN 3: Hüquqi Məlumat ── */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#1a1a1a", marginBottom: 16 }}>Hüquqi Məlumat</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 9 }}>
              {legalLinks.map(({ label, key, icon: Icon }) => (
                <li key={key}>
                  {/* setActiveModal(key) — CONTRACTS[key] modalını açır */}
                  <button onClick={() => setActiveModal(key)} className="flink">
                    <Icon size={12} style={{ color: "#E8192C", flexShrink: 0 }} />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ── SÜTUN 4: Müştəri Xidməti ── */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#1a1a1a", marginBottom: 16 }}>Müştəri Xidməti</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 9 }}>
              {serviceLinks.map(({ label, key, icon: Icon }) => (
                <li key={key}>
                  <button onClick={() => setActiveModal(key)} className="flink">
                    <Icon size={12} style={{ color: "#E8192C", flexShrink: 0 }} />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* ── SÜTUN 5: Xəbər Bülteni + Müqavilə Xülasəsi ── */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "#1a1a1a", marginBottom: 16 }}>Xəbər Bülteni</p>
            <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6, marginBottom: 14 }}>
              Abunə olun, ilk sifarişinizdə <strong style={{ color: "#E8192C" }}>10% endirim</strong> qazanın.
            </p>

            {/* Email input + göndər düyməsi */}
            <div style={{ display: "flex", border: "1.5px solid #f0f0f0", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="E-poçtunuzu daxil edin"
                style={{ flex: 1, padding: "10px 12px", border: "none", outline: "none", fontSize: 12, color: "#1a1a1a", background: "white", fontFamily: "'Sora',sans-serif" }}
              />
              {/* Email boş deyilsə abunəlik uğurlu bildirişi göstərir */}
              <button
                onClick={() => { if (email) { alert("Abunəlik uğurlu!"); setEmail(''); } }}
                style={{ padding: "10px 14px", background: "#E8192C", border: "none", cursor: "pointer", color: "white", fontWeight: 800, fontSize: 14 }}>
                →
              </button>
            </div>

            {/* Müqavilə xülasəsi qutusu — istifadəçini əsas müqavilələrə yönləndirir */}
            <div style={{ background: "#fff8f8", border: "1.5px solid #ffe0e0", borderRadius: 12, padding: "12px 14px" }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: "#E8192C", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>Müqavilələr</p>
              <p style={{ fontSize: 11, color: "#888", margin: "0 0 8px", lineHeight: 1.5 }}>
                Platformamızı istifadə edərək aşağıdakı müqavilələri qəbul etmiş olursunuz:
              </p>
              {/* Hər müqavilə linki — tıklandıqda həmin modalı açır */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {legalLinks.map(({ label, key }) => (
                  <button key={key} onClick={() => setActiveModal(key)}
                    style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", fontSize: 11, color: "#E8192C", fontWeight: 600, padding: "2px 0", fontFamily: "'Sora',sans-serif", textDecoration: "underline" }}>
                    → {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            MOBİL LAYOUT (767px və aşağı)
            Logo → Newsletter → Akkordeon bölmələr
        ════════════════════════════════════════ */}
        <div className="footer-mobile" style={{ padding: "20px 16px 0" }}>

          {/* Mobil loqo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 34, height: 34, background: "#E8192C", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: 900, fontSize: 17 }}>B</span>
            </div>
            <span style={{ fontWeight: 900, fontSize: 18, color: "#1a1a1a", letterSpacing: "-0.02em" }}>BRENDEX</span>
          </div>
          <p style={{ color: "#888", fontSize: 12, lineHeight: 1.7, marginBottom: 14 }}>
            Azərbaycanın ən böyük elektron ticarət platforması.
          </p>

          {/* Sosial ikonlar — mobil versiya */}
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {socials.map(({ icon: Icon, label, color }) => (
              <a key={label} href="#" title={label}
                style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb", textDecoration: "none", background: "white" }}
                onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.borderColor = color; e.currentTarget.style.color = "white"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#f0f0f0"; e.currentTarget.style.color = "#bbb"; }}>
                <Icon size={16} />
              </a>
            ))}
          </div>

          {/* Newsletter — mobil versiya */}
          <div style={{ marginBottom: 6 }}>
            <p style={{ fontSize: 12, color: "#888", lineHeight: 1.6, marginBottom: 10 }}>
              Abunə olun, <strong style={{ color: "#E8192C" }}>10% endirim</strong> qazanın.
            </p>
            <div style={{ display: "flex", border: "1.5px solid #f0f0f0", borderRadius: 10, overflow: "hidden" }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="E-poçtunuzu daxil edin"
                style={{ flex: 1, padding: "11px 13px", border: "none", outline: "none", fontSize: 13, color: "#1a1a1a", background: "white", fontFamily: "'Sora',sans-serif" }}
              />
              <button
                onClick={() => { if (email) { alert("Abunəlik uğurlu!"); setEmail(''); } }}
                style={{ padding: "11px 16px", background: "#E8192C", border: "none", cursor: "pointer", color: "white", fontWeight: 800, fontSize: 15 }}>
                →
              </button>
            </div>
          </div>

          {/* ── MOBİL AKKORDEON BÖLMƏLƏR ── */}
          {/* Massiv şəklində 3 bölmə: kateqoriyalar, hüquqi, müştəri xidməti */}
          {[
            {
              key: "categories", label: "Kateqoriyalar",
              children: (
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {realCategories.map(({ label, slug }) => (
                    <button key={label} onClick={() => navigate(`/shop?category=${slug}`)} className="flink">
                      <ChevronRight size={11} className="fchev" />
                      {label}
                    </button>
                  ))}
                </div>
              )
            },
            {
              key: "legal", label: "Hüquqi Məlumat",
              children: (
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {legalLinks.map(({ label, key, icon: Icon }) => (
                    <button key={key} onClick={() => setActiveModal(key)} className="flink">
                      <Icon size={12} style={{ color: "#E8192C" }} />
                      {label}
                    </button>
                  ))}
                </div>
              )
            },
            {
              key: "service", label: "Müştəri Xidməti",
              children: (
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {serviceLinks.map(({ label, key, icon: Icon }) => (
                    <button key={key} onClick={() => setActiveModal(key)} className="flink">
                      <Icon size={12} style={{ color: "#E8192C" }} />
                      {label}
                    </button>
                  ))}
                </div>
              )
            },
          ].map(({ key, label, children }) => (
            <div key={key}>
              {/* Akkordeon başlığı — tıklandıqda toggleMobile() çağırılır */}
              <button className="mob-section-header" onClick={() => toggleMobile(key)}>
                {label}
                {/* Ox ikonu: açıq olduqda "open" class-ı əlavə olunur → 180° dönür */}
                <ChevronDown size={16} className={`mob-chevron ${mobileExpanded === key ? "open" : ""}`} />
              </button>
              {/* Yalnız aktiv bölmənin məzmunu render edilir */}
              {mobileExpanded === key && (
                <div className="mob-section-body">{children}</div>
              )}
            </div>
          ))}
        </div>

        {/* ── ALT ÇUBUQ — DESKTOP ── */}
        {/* Müəllif hüququ + qısa linklər + ödəniş ikonları */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 24px" }}>
          <div style={{ paddingTop: 24, borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <p style={{ fontSize: 11, color: "#bbb", margin: 0 }}>© 2025 Brendex. Bütün hüquqlar qorunur.</p>
              {/* Bütün hüquqi + xidmət linklərini bir sırada göstərir */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[...legalLinks, ...serviceLinks].map(({ label, key }) => (
                  <button key={key} onClick={() => setActiveModal(key)}
                    style={{ fontSize: 11, color: "#ccc", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "'Sora',sans-serif", transition: "color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#E8192C"}
                    onMouseLeave={e => e.currentTarget.style.color = "#ccc"}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {/* Ödəniş sistemi loqoları — rəngli kiçik düzbucaqlılar */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 4 }}>Ödəniş:</span>
              {payments.map(({ label, bg }) => (
                <div key={label} style={{ width: 36, height: 22, borderRadius: 5, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "white", fontSize: 7, fontWeight: 900, letterSpacing: "0.04em" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ALT BAR — MOBİL ── */}
        {/* Müəllif hüququ + ödəniş ikonları (mobil versiyası) */}
        <div className="footer-mobile" style={{ padding: "12px 16px 20px", borderTop: "1px solid #f0f0f0", marginTop: 4 }}>
          <p style={{ fontSize: 11, color: "#bbb", margin: "0 0 10px" }}>© 2025 Brendex. Bütün hüquqlar qorunur.</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.06em" }}>Ödəniş:</span>
            {payments.map(({ label, bg }) => (
              <div key={label} style={{ width: 36, height: 22, borderRadius: 5, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontSize: 7, fontWeight: 900 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;