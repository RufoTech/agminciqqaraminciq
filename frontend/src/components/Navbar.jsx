import { useState, useEffect, useRef, useCallback } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { logout } from "../redux/features/userSlice"
import { useGetCartQuery, useGetFavoritesQuery } from "../redux/api/productsApi"
import { setLanguage } from "../slices/languageSlice"
import { useTranslation } from "react-i18next"
import {
  X, Home, User, Camera,
  MessageCircle, Search,
  ShoppingCart, Heart, ChevronDown,
  Monitor, Shirt, Flower2, Dumbbell, Car, Grid3X3,
  Sparkles, Baby, SlidersHorizontal, ArrowUpDown,
  Star, ChevronRight, Package, Bell,
  BookOpen, Cpu, Watch, Gamepad2,
  Sofa, Footprints, PawPrint,
} from "lucide-react"

import { fetchUnreadCount } from "../slices/notificationSlice"

/* ─────────────────────────────────────────────
   YENİ LOGO SVG — B hərfi + səbət ikonu
───────────────────────────────────────────── */
const BCartIcon = ({ size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "block", flexShrink: 0 }}
  >
    {/* B hərfi */}
    <path
      d="M6 6 L6 58 L34 58 Q52 58 52 46 Q52 38 42 35 Q50 31 50 22 Q50 6 32 6 Z
         M16 14 L30 14 Q40 14 40 22 Q40 30 30 30 L16 30 Z
         M16 38 L32 38 Q44 38 44 46 Q44 54 32 54 L16 54 Z"
      fill="#E8192C"
    />
    {/* Səbət gövdəsi */}
    <path d="M22 42 L24 28 L46 28 L42 42 Z" fill="white" opacity="0.9" />
    {/* Orta xətt */}
    <line x1="24" y1="35" x2="44" y2="35" stroke="#b8001e" strokeWidth="1.5" />
    {/* Sol təkər */}
    <circle cx="28" cy="46" r="3.5" fill="#b8001e" />
    <circle cx="28" cy="46" r="1.5" fill="white" />
    {/* Sağ təkər */}
    <circle cx="39" cy="46" r="3.5" fill="#b8001e" />
    <circle cx="39" cy="46" r="1.5" fill="white" />
  </svg>
)

const SidebarBCartIcon = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "block", flexShrink: 0 }}
  >
    {/* B hərfi — ağ */}
    <path
      d="M6 6 L6 58 L34 58 Q52 58 52 46 Q52 38 42 35 Q50 31 50 22 Q50 6 32 6 Z
         M16 14 L30 14 Q40 14 40 22 Q40 30 30 30 L16 30 Z
         M16 38 L32 38 Q44 38 44 46 Q44 54 32 54 L16 54 Z"
      fill="rgba(255,255,255,0.88)"
    />
    {/* Səbət gövdəsi */}
    <path d="M22 42 L24 28 L46 28 L42 42 Z" fill="rgba(232,25,44,0.85)" opacity="0.9" />
    {/* Orta xətt */}
    <line x1="24" y1="35" x2="44" y2="35" stroke="white" strokeWidth="1.5" opacity="0.7" />
    {/* Sol təkər */}
    <circle cx="28" cy="46" r="3.5" fill="#E8192C" />
    <circle cx="28" cy="46" r="1.5" fill="white" />
    {/* Sağ təkər */}
    <circle cx="39" cy="46" r="3.5" fill="#E8192C" />
    <circle cx="39" cy="46" r="1.5" fill="white" />
  </svg>
)

/* ─────────────────────────────────────────────
   LOGO KOMPONENTLƏRİ
───────────────────────────────────────────── */
const BrendexLogoFull = ({ iconSize = 36 }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
    <BCartIcon size={iconSize} />
    <span style={{
      fontFamily:"'Sora','Segoe UI',sans-serif", fontWeight:900,
      fontSize:Math.round(iconSize * 0.92), letterSpacing:"-0.03em",
      lineHeight:1, display:"flex", alignItems:"center",
    }}>
      <span style={{ color:"#E8192C" }}>REND</span>
      <span style={{ color:"#1a1a1a" }}>EX</span>
    </span>
  </div>
)

const MobileLogoFull = () => (
  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
    <BCartIcon size={32} />
    <span style={{
      fontFamily:"'Sora','Segoe UI',sans-serif", fontWeight:900,
      fontSize:17, letterSpacing:"-0.02em", lineHeight:1,
      display:"flex", alignItems:"center",
    }}>
      <span style={{ color:"#E8192C" }}>REND</span>
      <span style={{ color:"#1a1a1a" }}>EX</span>
    </span>
  </div>
)

const SidebarLogo = () => (
  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
    <SidebarBCartIcon size={32} />
    <div>
      <span style={{
        color:"white", fontWeight:900, fontSize:15,
        fontFamily:"'Sora',sans-serif", letterSpacing:"-0.02em",
        display:"block", lineHeight:1.1,
      }}>RENDEX</span>
      <span style={{
        color:"rgba(255,255,255,0.55)", fontSize:8,
        letterSpacing:"0.14em", textTransform:"uppercase",
        fontFamily:"'Sora',sans-serif", display:"block",
      }}>Online Store</span>
    </div>
  </div>
)

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const SLUG_TO_CATEGORIES = {
  electronics: ["Phones","Laptops","Cameras","Headphones","Console","SmartWatch","Accessories"],
  clothing:    ["WomenClothing","MenClothing","KidsClothing"],
  home:        ["HomeAppliances","HomeAndGarden","Furniture","Kitchen"],
  beauty:      ["Beauty","Skincare","Perfume"],
  kids:        ["KidsClothing","Toys","BabyProducts"],
  sport:       ["Sports","Outdoor","Cycling"],
  auto:        ["Automotive"],
  books:       ["Books","Education"],
  pets:        ["PetSupplies"],
  shoes:       ["Shoes","Bags"],
  jewelry:     ["Jewelry","Watches"],
}

const LOCAL_PRODUCTS = [
  { _id:"p1",  name:"Apple iPhone 13 128GB",        price:334.99, ratings:4.7, category:"Phones",        seller:"Apple",        numOfReviews:89,  images:[{url:"https://res.cloudinary.com/dwdvr0oxa/image/upload/v1739452191/1_org_zoom_oorv7q.webp"}] },
  { _id:"p2",  name:"4K Gaming Monitor 27-inch",     price:449.99, ratings:4.2, category:"Laptops",       seller:"DisplayTech",  numOfReviews:89,  images:[{url:"https://res.cloudinary.com/dwdvr0oxa/image/upload/v1739378739/1_org_zoom_6_dii1wp.webp"}] },
  { _id:"p3",  name:"DSLR Camera Lens 18-55mm",      price:299.99, ratings:4.2, category:"Cameras",       seller:"CameraWorld",  numOfReviews:28,  images:[{url:"https://res.cloudinary.com/dwdvr0oxa/image/upload/v1739372538/1_org_zoom_7_yfrron.webp"}] },
  { _id:"p4",  name:"Pro Gaming Headset X1",         price:599.99, ratings:4.4, category:"Headphones",    seller:"TechGear",     numOfReviews:32,  images:[{url:"https://res.cloudinary.com/dwdvr0oxa/image/upload/v1739371207/Gaming_Heatds_zu8u8z.webp"}] },
  { _id:"p5",  name:"Wireless Gaming Mouse RGB",     price:259.99, ratings:4.0, category:"Headphones",    seller:"GameTech",     numOfReviews:156, images:[{url:"https://res.cloudinary.com/dwdvr0oxa/image/upload/v1739376838/1_org_zoom_5_clq4li.webp"}] },
  { _id:"p6",  name:"Gaming Controller",             price:699.99, ratings:5.0, category:"Console",       seller:"DisplayTech",  numOfReviews:89,  images:[{url:"https://res.cloudinary.com/dwdvr0oxa/image/upload/v1739434190/1_org_zoom_hr08ir.webp"}] },
  { _id:"p7",  name:"Qadın Yay Fənəri",              price:49.99,  ratings:4.3, category:"WomenClothing", seller:"FashionStore", numOfReviews:14,  images:[{url:null}] },
  { _id:"p8",  name:"Kişi Klassik Köynəyi",          price:59.99,  ratings:4.5, category:"MenClothing",   seller:"MenStyle",     numOfReviews:22,  images:[{url:null}] },
  { _id:"p9",  name:"Uşaq Cins Şalvarı",             price:29.99,  ratings:4.1, category:"KidsClothing",  seller:"KidsFashion",  numOfReviews:9,   images:[{url:null}] },
  { _id:"p10", name:"Robot Tozsoran",                price:349.99, ratings:4.6, category:"HomeAppliances",seller:"HomeTech",     numOfReviews:41,  images:[{url:null}] },
  { _id:"p11", name:"Bağ Dəsti (Stol + 4 Stul)",     price:599.99, ratings:4.4, category:"HomeAndGarden", seller:"GardenPlus",  numOfReviews:7,   images:[{url:null}] },
  { _id:"p12", name:"Üz Nəmləndirici Krem",          price:39.99,  ratings:4.7, category:"Beauty",        seller:"BeautyWorld",  numOfReviews:63,  images:[{url:null}] },
  { _id:"p13", name:"Fitness Dumbbell Dəsti 20kg",   price:129.99, ratings:4.5, category:"Sports",        seller:"SportZone",   numOfReviews:18,  images:[{url:null}] },
  { _id:"p14", name:"Avtomobil Oturacaq Örtüyü",     price:89.99,  ratings:4.3, category:"Automotive",    seller:"AutoShop",    numOfReviews:27,  images:[{url:null}] },
  { _id:"p15", name:"Samsung Galaxy Watch 6",        price:289.99, ratings:4.5, category:"SmartWatch",    seller:"Samsung",     numOfReviews:54,  images:[{url:null}] },
  { _id:"p16", name:"Python Proqramlaşdırma Kitabı", price:24.99,  ratings:4.8, category:"Books",         seller:"BookStore",   numOfReviews:112, images:[{url:null}] },
  { _id:"p17", name:"Dağ Velosipedi 26-duym",        price:449.99, ratings:4.6, category:"Cycling",       seller:"BikeZone",    numOfReviews:31,  images:[{url:null}] },
  { _id:"p18", name:"Qızıl Boyunbağı Dəsti",         price:199.99, ratings:4.9, category:"Jewelry",       seller:"LuxJewels",   numOfReviews:22,  images:[{url:null}] },
  { _id:"p19", name:"İt Yemi Premium 10kg",          price:54.99,  ratings:4.7, category:"PetSupplies",   seller:"PetWorld",    numOfReviews:88,  images:[{url:null}] },
  { _id:"p20", name:"Dəri Kişi Ayaqqabısı",          price:119.99, ratings:4.4, category:"Shoes",         seller:"ShoeHub",     numOfReviews:47,  images:[{url:null}] },
]

const languages = [
  { code:"az", label:"Azərbaycan", flag:"🇦🇿", short:"AZ"  },
  { code:"en", label:"English",    flag:"🇬🇧", short:"ENG" },
  { code:"ru", label:"Русский",    flag:"🇷🇺", short:"RUS" },
  { code:"tr", label:"Türkçe",     flag:"🇹🇷", short:"TR"  },
]

const C = {
  primary:     "#E8192C",
  primarySoft: "#ff4d5e",
  rose50:      "#fff5f5",
  rose100:     "#ffe4e6",
  rose200:     "#fecdd3",
  dark:        "#1c1c1e",
  mid:         "#6b7280",
  light:       "#d1d5db",
}

/* ─────────────────────────────────────────────
   LANGUAGE SWITCHER
───────────────────────────────────────────── */
function LanguageSwitcher() {
  const dispatch    = useDispatch()
  const currentLang = useSelector((s) => s.language.currentLang)
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false) }
    document.addEventListener("mousedown", fn)
    return () => document.removeEventListener("mousedown", fn)
  }, [])

  const active = languages.find(l => l.code === currentLang) || languages[0]

  return (
    <div ref={ref} style={{ position:"relative", display:"inline-block" }}>
      <button onClick={() => setIsOpen(!isOpen)} style={{
        height:36, padding:"0 12px", borderRadius:99,
        border:`1.5px solid ${isOpen ? C.rose200 : "#e5e7eb"}`,
        background: isOpen ? C.rose50 : "#fff",
        cursor:"pointer", display:"flex", alignItems:"center", gap:6,
        transition:"all .18s", fontFamily:"'Sora',sans-serif",
        fontSize:12, fontWeight:700,
        color: isOpen ? C.primary : C.mid,
        boxShadow: isOpen ? `0 0 0 3px ${C.rose100}` : "none",
      }}>
        <span style={{ fontSize:16 }}>{active.flag}</span>
        <span>{active.short}</span>
        <ChevronDown size={11} style={{ transition:"transform .2s", transform: isOpen ? "rotate(180deg)":"rotate(0)" }} />
      </button>
      {isOpen && (
        <ul style={{
          position:"absolute", top:"calc(100% + 8px)", right:0,
          background:"#fff", border:"1.5px solid #f3f4f6",
          borderRadius:16, listStyle:"none", margin:0,
          padding:"6px", minWidth:140,
          boxShadow:"0 12px 40px rgba(0,0,0,0.10)", zIndex:1000,
          animation:"nbLangDrop .18s ease",
        }}>
          {languages.map((lang) => {
            const isAct = currentLang === lang.code
            return (
              <li key={lang.code} onClick={() => { dispatch(setLanguage(lang.code)); setIsOpen(false) }} style={{
                display:"flex", alignItems:"center", gap:9,
                padding:"8px 12px", cursor:"pointer", borderRadius:10,
                fontFamily:"'Sora',sans-serif", fontSize:13,
                fontWeight: isAct ? 700 : 500,
                color: isAct ? C.primary : C.dark,
                background: isAct ? C.rose50 : "transparent",
                transition:"background .12s",
              }}
                onMouseEnter={e => { if (!isAct) e.currentTarget.style.background="#f9fafb" }}
                onMouseLeave={e => { if (!isAct) e.currentTarget.style.background="transparent" }}
              >
                <span style={{ fontSize:18 }}>{lang.flag}</span>
                <span>{lang.short}</span>
                {isAct && <span style={{ marginLeft:"auto", width:6, height:6, borderRadius:"50%", background:C.primary }} />}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   NOTIFICATION BELL
───────────────────────────────────────────── */
function NotificationBell({ isMobile = false }) {
  const { t }           = useTranslation()
  const dispatch        = useDispatch()
  const navigate        = useNavigate()
  const { isAuthenticated } = useSelector((s) => s.userSlice)
  const { unreadCount } = useSelector((s) => s.notifications)
  const [shake, setShake] = useState(false)
  const prevCount         = useRef(unreadCount)

  useEffect(() => { if (isAuthenticated) dispatch(fetchUnreadCount()) }, [dispatch, isAuthenticated])
  useEffect(() => {
    if (!isAuthenticated) return
    const id = setInterval(() => dispatch(fetchUnreadCount()), 30000)
    return () => clearInterval(id)
  }, [dispatch, isAuthenticated])
  useEffect(() => {
    if (unreadCount > prevCount.current) { setShake(true); setTimeout(() => setShake(false), 600) }
    prevCount.current = unreadCount
  }, [unreadCount])

  return (
    <button
      className={`${isMobile ? "" : "bib"} ${shake ? "nb-shake" : ""}`}
      style={isMobile
        ? { position:"relative", display:"flex", alignItems:"center", justifyContent:"center", width:40, height:40, borderRadius:13, border:"none", background:"transparent", cursor:"pointer", color:"#6b7280" }
        : { position:"relative", width:40, height:40, borderRadius:13, border:"none", background:"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#6b7280", transition:"all .2s ease" }
      }
      onClick={() => navigate("/notifications")}
      title={t("navbar.notifications") || "Bildirişlər"}
    >
      <Bell size={18} />
      {unreadCount > 0 && (
        <span className="bbd nb-badge-anim" style={{ top:2, right:2 }}>
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  )
}

/* ─────────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────────── */
function ProductCard({ product, onClose }) {
  const navigate = useNavigate()
  const { t }    = useTranslation()
  const [hovered, setHovered] = useState(false)
  const hasImg = product.images?.[0]?.url

  return (
    <div
      onClick={() => { navigate(`/product/${product._id}`); onClose() }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:"#fff", borderRadius:16, overflow:"hidden", cursor:"pointer",
        border:`1.5px solid ${hovered ? C.rose200 : "#f3f4f6"}`,
        transition:"all .22s ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? `0 12px 32px rgba(232,25,44,0.10),0 2px 8px rgba(0,0,0,0.04)` : "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ position:"relative", paddingTop:"75%", background:C.rose50 }}>
        {hasImg
          ? <img src={product.images[0].url} alt={product.name} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
          : <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:`linear-gradient(135deg,${C.rose50},${C.rose100})` }}><Camera size={26} color={C.rose200} /></div>
        }
        <div style={{ position:"absolute", top:8, right:8, background:"rgba(255,255,255,0.88)", backdropFilter:"blur(8px)", fontSize:9, fontWeight:700, color:C.mid, padding:"3px 8px", borderRadius:20, fontFamily:"'Sora',sans-serif", border:"1px solid rgba(255,255,255,0.6)" }}>
          {product.category}
        </div>
      </div>
      <div style={{ padding:"11px 13px 13px" }}>
        <p style={{ margin:0, fontSize:12, fontWeight:600, color:C.dark, lineHeight:1.45, overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", fontFamily:"'Sora',sans-serif" }}>{product.name}</p>
        {product.ratings > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:2, marginTop:6 }}>
            {[1,2,3,4,5].map(s => <Star key={s} size={10} fill={s<=Math.round(product.ratings)?"#f59e0b":"none"} color={s<=Math.round(product.ratings)?"#f59e0b":"#e5e7eb"} />)}
            <span style={{ fontSize:10, color:C.light, marginLeft:3, fontFamily:"'Sora',sans-serif" }}>({product.numOfReviews})</span>
          </div>
        )}
        <span style={{ display:"block", marginTop:7, fontSize:14, fontWeight:800, color:C.primary, fontFamily:"'Sora',sans-serif" }}>
          {product.price?.toLocaleString("az-AZ",{minimumFractionDigits:2})} {t("common.currency")}
        </span>
        <p style={{ margin:"3px 0 0", fontSize:10, color:C.light, fontFamily:"'Sora',sans-serif" }}>{product.seller}</p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   CATEGORY PRODUCT PANEL
───────────────────────────────────────────── */
function CategoryProductPanel({ cat, onClose, onCategoryNavigate }) {
  const { t } = useTranslation()
  const [sortBy, setSortBy]         = useState("default")
  const [priceRange, setPriceRange] = useState(null)
  const [minRating, setMinRating]   = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const slugCats = SLUG_TO_CATEGORIES[cat.slug] ?? []
  const baseProd = cat.slug ? LOCAL_PRODUCTS.filter(p => slugCats.includes(p.category)) : LOCAL_PRODUCTS
  const maxPrice = baseProd.length > 0 ? Math.ceil(Math.max(...baseProd.map(p=>p.price??0))/50)*50 : 1000

  useEffect(() => { setPriceRange(maxPrice) }, [maxPrice])

  const displayed = (() => {
    let l = [...baseProd]
    if (sortBy==="price_asc")  l.sort((a,b)=>a.price-b.price)
    if (sortBy==="price_desc") l.sort((a,b)=>b.price-a.price)
    if (sortBy==="rating")     l.sort((a,b)=>(b.ratings??0)-(a.ratings??0))
    if (sortBy==="reviews")    l.sort((a,b)=>(b.numOfReviews??0)-(a.numOfReviews??0))
    if (priceRange!==null)     l=l.filter(p=>(p.price??0)<=priceRange)
    if (minRating>0)           l=l.filter(p=>(p.ratings??0)>=minRating)
    return l
  })()

  const pct  = priceRange!==null ? Math.round((priceRange/maxPrice)*100) : 100
  const Icon = cat.icon

  const SORT_OPTIONS = [
    { value:"default",    label:t("sort.default")   },
    { value:"price_asc",  label:t("sort.priceAsc")  },
    { value:"price_desc", label:t("sort.priceDesc") },
    { value:"rating",     label:t("sort.rating")    },
    { value:"reviews",    label:t("sort.reviews")   },
  ]

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex" }}>
      <style>{`
        @keyframes cpFd    { from{opacity:0} to{opacity:1} }
        @keyframes cpSl    { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes cpSlMob { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        .cps::-webkit-scrollbar{width:3px}
        .cps::-webkit-scrollbar-thumb{background:${C.rose200};border-radius:4px}
        .cpr{-webkit-appearance:none;width:100%;height:4px;border:none;outline:none;border-radius:99px;cursor:pointer;background:linear-gradient(90deg,${C.primary} 0%,${C.primary} var(--p),#f3f4f6 var(--p),#f3f4f6 100%);}
        .cpr::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,${C.primarySoft},${C.primary});cursor:pointer;border:3px solid #fff;box-shadow:0 2px 8px rgba(232,25,44,0.35);transition:transform .15s;}
        .cpr::-webkit-slider-thumb:hover{transform:scale(1.15)}
        .cpch{display:flex;align-items:center;gap:3px;padding:5px 10px;border-radius:99px;cursor:pointer;font-size:11px;font-weight:700;transition:all .15s;font-family:'Sora',sans-serif}
        .cat-panel{position:relative;margin-left:auto;width:min(840px,96vw);height:100%;background:#fff;display:flex;flex-direction:column;animation:cpSl 0.3s cubic-bezier(0.4,0,0.2,1);box-shadow:-16px 0 60px rgba(0,0,0,0.10);font-family:'Sora',sans-serif;border-radius:24px 0 0 24px;}
        @media(max-width:768px){.cat-panel{margin-left:0;margin-top:auto;width:100%;height:88vh;border-radius:24px 24px 0 0;animation:cpSlMob 0.3s cubic-bezier(0.34,1.10,0.64,1);box-shadow:0 -12px 60px rgba(0,0,0,0.12);}}
        .cat-filters-row{display:flex;flex-wrap:wrap;gap:16px;padding:14px 18px;border-bottom:1px solid #f3f4f6;background:${C.rose50};flex-shrink:0}
        .cat-prod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px;}
        @media(max-width:640px){.cat-prod-grid{grid-template-columns:repeat(2,1fr)!important;gap:10px!important}}
      `}</style>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(15,10,10,0.40)", backdropFilter:"blur(6px)", animation:"cpFd 0.2s" }} />
      <div className="cat-panel">
        <div style={{ display:"flex", justifyContent:"center", paddingTop:10, paddingBottom:2 }}>
          <div style={{ width:44, height:5, background:C.rose200, borderRadius:3 }} />
        </div>
        <div style={{ padding:"14px 20px", borderBottom:`1px solid #f3f4f6`, display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          <div style={{ width:44, height:44, borderRadius:14, background:cat.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 4px 14px ${cat.color}22` }}>
            <Icon size={20} color={cat.color} />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <h2 style={{ margin:0, fontSize:16, fontWeight:800, color:C.dark }}>{cat.label}</h2>
            <p style={{ margin:0, fontSize:11, color:C.mid }}>
              {displayed.length} {t("product.inStock")}
              {baseProd.length!==displayed.length && <span style={{ color:C.primary }}> ({t("search.filters")})</span>}
            </p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:7, flexShrink:0 }}>
            <div style={{ position:"relative" }}>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ appearance:"none", padding:"7px 30px 7px 12px", borderRadius:12, border:`1.5px solid #e5e7eb`, background:"#fff", fontSize:12, fontWeight:600, color:C.mid, cursor:"pointer", fontFamily:"'Sora',sans-serif", outline:"none" }}>
                {SORT_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ArrowUpDown size={11} color={C.light} style={{ position:"absolute", right:9, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
            </div>
            <button onClick={()=>setShowFilters(p=>!p)} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 13px", borderRadius:12, border:`1.5px solid ${showFilters?C.primary:"#e5e7eb"}`, background:showFilters?C.rose50:"#fff", color:showFilters?C.primary:C.mid, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all .15s" }}>
              <SlidersHorizontal size={13}/> {t("search.filters")}
            </button>
            <button onClick={onClose} style={{ width:36, height:36, borderRadius:11, border:"none", background:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <X size={15} color={C.mid}/>
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="cat-filters-row">
            <div style={{ flex:1, minWidth:160 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:10, fontWeight:700, color:C.mid, textTransform:"uppercase", letterSpacing:0.8 }}>{t("search.priceRange")}</span>
                <span style={{ fontSize:12, fontWeight:700, color:C.primary }}>0 – {priceRange} {t("common.currency")}</span>
              </div>
              <input type="range" className="cpr" min={0} max={maxPrice} value={priceRange??maxPrice} onChange={e=>setPriceRange(Number(e.target.value))} style={{ "--p":`${pct}%` }} />
            </div>
            <div style={{ minWidth:160 }}>
              <p style={{ margin:"0 0 8px", fontSize:10, fontWeight:700, color:C.mid, textTransform:"uppercase", letterSpacing:0.8 }}>{t("search.minRating")}</p>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {[0,3,3.5,4,4.5].map(r=>(
                  <button key={r} onClick={()=>setMinRating(r)} className="cpch" style={{ border:`1.5px solid ${minRating===r?C.primary:"#e5e7eb"}`, background:minRating===r?C.rose50:"#fff", color:minRating===r?C.primary:C.mid }}>
                    {r===0?t("search.all"):<><Star size={9} fill="#f59e0b" color="#f59e0b"/>{r}+</>}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"flex-end" }}>
              <button onClick={()=>{setPriceRange(maxPrice);setMinRating(0);setSortBy("default")}} style={{ padding:"7px 16px", borderRadius:12, border:"1.5px solid #e5e7eb", background:"#fff", color:C.mid, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                {t("search.reset")}
              </button>
            </div>
          </div>
        )}
        {slugCats.length>1 && (
          <div style={{ padding:"10px 20px 0", display:"flex", gap:7, flexWrap:"wrap", flexShrink:0 }}>
            {slugCats.map(sc=>{
              const n=baseProd.filter(p=>p.category===sc).length
              if(!n) return null
              return <span key={sc} style={{ padding:"4px 13px", borderRadius:99, background:C.rose50, color:C.primary, fontSize:11, fontWeight:700, border:`1px solid ${C.rose100}` }}>{sc} · {n}</span>
            })}
          </div>
        )}
        <div className="cps" style={{ flex:1, overflowY:"auto", padding:"16px 18px 20px" }}>
          {displayed.length===0 ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:260, gap:12 }}>
              <span style={{ fontSize:40 }}>🔍</span>
              <p style={{ color:C.mid, fontSize:14, fontFamily:"'Sora',sans-serif" }}>{t("search.noResults")}</p>
              <button onClick={()=>{setPriceRange(maxPrice);setMinRating(0)}} style={{ padding:"10px 22px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${C.primarySoft},${C.primary})`, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                {t("search.reset")}
              </button>
            </div>
          ) : (
            <div className="cat-prod-grid">
              {displayed.map(p=><ProductCard key={p._id} product={p} onClose={onClose}/>)}
            </div>
          )}
        </div>
        <div style={{ padding:"14px 18px", borderTop:"1px solid #f3f4f6", flexShrink:0 }}>
          <button onClick={()=>onCategoryNavigate(cat)}
            style={{ width:"100%", padding:"14px", borderRadius:16, border:"none", background:`linear-gradient(135deg,${C.primarySoft},${C.primary})`, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7, boxShadow:`0 6px 20px rgba(232,25,44,0.28)`, transition:"all 0.2s" }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 10px 28px rgba(232,25,44,0.36)`}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=`0 6px 20px rgba(232,25,44,0.28)`}}
          >
            {t("home.seeAll")} {cat.label} <ChevronRight size={15}/>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   CATEGORY DROPDOWN
───────────────────────────────────────────── */
function CategoryDropdown({ onCategorySelect, categories }) {
  const { t } = useTranslation()
  return (
    <div style={{ position:"absolute", top:"calc(100% + 12px)", left:"50%", transform:"translateX(-50%)", background:"#fff", borderRadius:24, boxShadow:"0 20px 60px rgba(0,0,0,0.10),0 2px 8px rgba(0,0,0,0.04)", padding:"18px", width:640, zIndex:100, border:"1.5px solid #f3f4f6", animation:"nbCatDrop 0.22s cubic-bezier(0.34,1.56,0.64,1)" }}>
      <p style={{ fontSize:10, fontWeight:700, color:C.light, letterSpacing:1.6, marginBottom:14, textTransform:"uppercase", fontFamily:"'Sora',sans-serif" }}>{t("categories.allCategories")}</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
        {categories.map(cat=>{
          const Icon=cat.icon
          return (
            <div key={cat.label} onClick={()=>onCategorySelect(cat)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:14, background:"#fafafa", transition:"all .18s", cursor:"pointer", border:"1.5px solid transparent" }}
              onMouseEnter={e=>{e.currentTarget.style.background=cat.bg;e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.borderColor=cat.color+"33";e.currentTarget.style.boxShadow=`0 6px 18px ${cat.color}18`}}
              onMouseLeave={e=>{e.currentTarget.style.background="#fafafa";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor="transparent";e.currentTarget.style.boxShadow="none"}}
            >
              <div style={{ width:36, height:36, borderRadius:11, background:cat.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:`0 3px 10px ${cat.color}22` }}>
                <Icon size={16} color={cat.color}/>
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C.dark, fontFamily:"'Sora',sans-serif", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{cat.label}</div>
                <div style={{ fontSize:10, color:C.mid, marginTop:1, fontFamily:"'Sora',sans-serif" }}>{cat.sub}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN NAVBAR
───────────────────────────────────────────── */
const Navbar = () => {
  const { t } = useTranslation()
  const { isAuthenticated, user } = useSelector(s=>s.userSlice)
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [searchQuery,    setSearchQuery]    = useState("")
  const [showSearch,     setShowSearch]     = useState(false)
  const [isMenuOpen,     setIsMenuOpen]     = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [scrolled,       setScrolled]       = useState(false)
  const [activeCatPanel, setActiveCatPanel] = useState(null)

  const catRef  = useRef(null)
  const userRef = useRef(null)

  const categories = [
    { label:t("categories.electronics"),   sub:"12k+ məhsul",                icon:Monitor,    slug:"electronics", color:"#E8192C", bg:C.rose50    },
    { label:t("categories.clothing"),      sub:t("categories.newCollection"), icon:Shirt,      slug:"clothing",    color:"#c0112a", bg:"#fce4e4"   },
    { label:t("categories.homeAndGarden"), sub:t("categories.decor"),         icon:Flower2,    slug:"home",        color:"#2e7d32", bg:"#e8f5e9"   },
    { label:t("categories.beauty"),        sub:t("categories.cosmetics"),     icon:Sparkles,   slug:"beauty",      color:"#db2777", bg:"#fdf2f8"   },
    { label:t("categories.kids"),          sub:t("categories.toys"),          icon:Baby,       slug:"kids",        color:"#f57c00", bg:"#fff3e0"   },
    { label:t("categories.sport"),         sub:t("categories.fitness"),       icon:Dumbbell,   slug:"sport",       color:"#E8192C", bg:C.rose50    },
    { label:t("categories.automotive"),    sub:t("categories.accessories"),   icon:Car,        slug:"auto",        color:"#c0112a", bg:"#fce4e4"   },
    { label:"Kitablar",                    sub:"Təhsil & inkişaf",            icon:BookOpen,   slug:"books",       color:"#7c3aed", bg:"#f5f3ff"   },
    { label:"Texnologiya",                 sub:"Kompüter & aksesuarlar",      icon:Cpu,        slug:"electronics", color:"#0369a1", bg:"#e0f2fe"   },
    { label:"Saatlar & Zərgərlik",         sub:"Premium seçimlər",            icon:Watch,      slug:"jewelry",     color:"#b45309", bg:"#fef3c7"   },
    { label:"Oyunlar & Konsol",            sub:"Gaming dünyası",              icon:Gamepad2,   slug:"electronics", color:"#6d28d9", bg:"#ede9fe"   },
    { label:"Mebel",                       sub:"Ev dizaynı",                  icon:Sofa,       slug:"home",        color:"#0f766e", bg:"#ccfbf1"   },
    { label:"Ayaqqabı & Çantalar",         sub:"Moda & stil",                 icon:Footprints, slug:"shoes",       color:"#be185d", bg:"#fce7f3"   },
    { label:"Ev Heyvanları",               sub:"Heyvan malları",              icon:PawPrint,   slug:"pets",        color:"#15803d", bg:"#dcfce7"   },
    { label:t("categories.other"),         sub:t("categories.allCategories"), icon:Grid3X3,    slug:null,          color:"#6b7280", bg:"#f9fafb"   },
  ]

  const isAdmin = user?.user?.role === "admin"

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => {
    const fn = e => {
      if (catRef.current  && !catRef.current.contains(e.target))  setIsCategoryOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setIsUserMenuOpen(false)
    }
    document.addEventListener("mousedown", fn)
    return () => document.removeEventListener("mousedown", fn)
  }, [])

  useEffect(() => {
    document.body.style.overflow = (isMenuOpen || activeCatPanel) ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isMenuOpen, activeCatPanel])

  const hoverTimeout = useRef(null)
  const handleCatMouseEnter = useCallback(() => { clearTimeout(hoverTimeout.current); setIsCategoryOpen(true)  }, [])
  const handleCatMouseLeave = useCallback(() => { hoverTimeout.current = setTimeout(() => setIsCategoryOpen(false), 200) }, [])

  const handleLogout           = () => { dispatch(logout()); navigate("/login") }
  const handleSearch           = e  => { e.preventDefault(); if (searchQuery.trim()) navigate(`/search-results?query=${encodeURIComponent(searchQuery)}`); setShowSearch(false); setSearchQuery("") }
  const handleCategorySelect   = cat => { setIsCategoryOpen(false); setIsMenuOpen(false); cat.slug ? setActiveCatPanel(cat) : navigate("/shop") }
  const handleCategoryNavigate = cat => { setActiveCatPanel(null); navigate(cat.slug ? `/shop?category=${cat.slug}` : "/shop") }

  const { data:cartData,     isLoading:cartLd, error:cartErr } = useGetCartQuery(undefined, { skip: !isAuthenticated })
  const { data:favoriteData, isLoading:favLd,  error:favErr  } = useGetFavoritesQuery(undefined, { skip: !isAuthenticated })
  const cartCount = (!cartErr && !cartLd && cartData?.cart)          ? cartData.cart.length          : 0
  const favCount  = (!favErr  && !favLd  && favoriteData?.favorites) ? favoriteData.favorites.length : 0

  const isAct = p => location.pathname === p

  const dropLink = {
    display:"block", padding:"8px 12px", borderRadius:10,
    fontSize:13, color:C.dark, textDecoration:"none",
    fontFamily:"'Sora',sans-serif", background:"transparent", transition:"background .12s",
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }

        @keyframes nbSlideDown   { from{transform:translateY(-100%);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes nbLogoPop     { 0%{opacity:0;transform:scale(0.6)} 70%{opacity:1;transform:scale(1.07)} 100%{opacity:1;transform:scale(1)} }
        @keyframes nbLinkFade    { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes nbActionSlide { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
        @keyframes nbBadgePop    { from{transform:scale(0)} to{transform:scale(1)} }
        @keyframes nbLangDrop    { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes nbCatDrop     { from{opacity:0;transform:translateX(-50%) translateY(-12px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes nbSearchDrop  { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes nbUserDrop    { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes nbMobRise     { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes nbCartBounce  { 0%{transform:scale(0.5) translateY(20px);opacity:0} 70%{transform:scale(1.08) translateY(-4px);opacity:1} 100%{transform:scale(1) translateY(0);opacity:1} }
        @keyframes nbFd          { from{opacity:0} to{opacity:1} }
        @keyframes nbBd          { from{transform:scale(0)} to{transform:scale(1)} }
        @keyframes nbMobTopSlide { from{transform:translateY(-100%);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes nb-shake      { 0%,100%{transform:rotate(0deg)} 20%{transform:rotate(-15deg)} 40%{transform:rotate(15deg)} 60%{transform:rotate(-10deg)} 80%{transform:rotate(8deg)} }

        .nb-nav-wrap     { animation: nbSlideDown 0.55s cubic-bezier(0.34,1.10,0.64,1) both; }
        .nb-logo-anim    { animation: nbLogoPop 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.25s both; }
        .nb-link-anim-1  { animation: nbLinkFade 0.45s ease 0.35s both; }
        .nb-link-anim-2  { animation: nbLinkFade 0.45s ease 0.45s both; }
        .nb-link-anim-3  { animation: nbLinkFade 0.45s ease 0.55s both; }
        .nb-actions-anim { animation: nbActionSlide 0.45s ease 0.50s both; }
        .nb-mob-anim     { animation: nbMobRise 0.55s cubic-bezier(0.34,1.10,0.64,1) 0.40s both; }
        .nb-mob-top-anim { animation: nbMobTopSlide 0.45s cubic-bezier(0.34,1.10,0.64,1) 0.20s both; }
        .nb-cart-bounce-anim { animation: nbCartBounce 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.80s both; }
        .nb-badge-anim   { animation: nbBadgePop 0.35s cubic-bezier(0.34,1.56,0.64,1) 1.0s both; }
        .nb-shake        { animation: nb-shake 0.6s ease; }

        .nb-logo-link { transition: transform 0.2s ease; display:inline-flex; align-items:center; text-decoration:none; }
        .nb-logo-link:hover { transform: translateY(-1px); }

        .bnl { position:relative;font-size:14px;font-weight:600;color:#374151;text-decoration:none;padding:6px 2px;transition:color 0.2s;font-family:'Sora',sans-serif;background:none;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:5px;letter-spacing:-0.01em; }
        .bnl::after { content:'';position:absolute;bottom:-4px;left:0;width:0;height:2.5px;background:linear-gradient(90deg,${C.primarySoft},${C.primary});border-radius:2px;transition:width 0.28s cubic-bezier(0.34,1.56,0.64,1); }
        .bnl:hover::after,.bnl.on::after { width:100% }
        .bnl:hover,.bnl.on { color:${C.primary} }

        .bib { position:relative;width:40px;height:40px;border-radius:13px;border:none;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#6b7280;transition:all .2s ease;text-decoration:none; }
        .bib:hover { background:${C.rose50};color:${C.primary};transform:translateY(-1px); }

        .bbd { position:absolute;top:2px;right:2px;min-width:16px;height:16px;background:linear-gradient(135deg,${C.primarySoft},${C.primary});color:#fff;font-size:8px;font-weight:800;border-radius:99px;display:flex;align-items:center;justify-content:center;padding:0 3px;border:2px solid #fff;animation:nbBd 0.3s cubic-bezier(0.34,1.56,0.64,1); }

        .bmt { display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:3px;padding:5px 2px;border:none;background:transparent;cursor:pointer;color:#9ca3af;transition:color 0.2s;font-family:'Sora',sans-serif;font-size:9.5px;font-weight:600;text-decoration:none;-webkit-tap-highlight-color:transparent;white-space:nowrap;min-width:0; }
        .bmt.on { color:${C.primary}; }
        .bmt.on svg { filter:drop-shadow(0 2px 6px rgba(232,25,44,0.38)); }

        @media(max-width:390px){.bmt{font-size:8px;gap:2px}.bmt svg{width:17px!important;height:17px!important}.nb-cart-box{width:40px!important;height:40px!important;margin-top:-10px!important}.nb-cart-lbl{font-size:8px!important}}
        @media(min-width:390px){.bmt{font-size:10px;gap:5px}.bmt svg{width:22px!important;height:22px!important}.nb-cart-box{width:52px!important;height:52px!important;margin-top:-20px!important;border-radius:18px!important}.nb-cart-lbl{font-size:10px!important}}
        @media(max-height:500px) and (orientation:landscape){.bmt span,.nb-cart-lbl{display:none!important}.bmt{gap:0!important}.nb-cart-box{margin-top:-4px!important;width:38px!important;height:38px!important}}

        .bsi { display:flex;align-items:center;gap:12px;padding:11px 14px;color:#374151;font-size:14px;font-weight:600;text-decoration:none;border-radius:14px;margin:2px 8px;transition:all .15s;cursor:pointer;border:none;background:transparent;width:calc(100% - 16px);font-family:'Sora',sans-serif; }
        .bsi:hover { background:${C.rose50};color:${C.primary}; }
        .bsi.red { color:${C.primary}; }

        .bso { position:fixed;inset:0;background:rgba(15,5,5,0.45);backdrop-filter:blur(8px);z-index:200;display:flex;align-items:flex-start;justify-content:center;padding-top:72px;animation:nbFd 0.18s; }
        .bsbx { background:#fff;border-radius:22px;width:100%;max-width:580px;margin:0 16px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.18);animation:nbSearchDrop 0.24s cubic-bezier(0.34,1.56,0.64,1);border:1.5px solid #f3f4f6; }

        .bms { position:fixed;top:0;left:0;height:100%;width:308px;background:#fff;z-index:150;transform:translateX(-100%);transition:transform 0.32s cubic-bezier(0.4,0,0.2,1);overflow-y:auto;display:flex;flex-direction:column;box-shadow:8px 0 40px rgba(0,0,0,0.10);border-right:1.5px solid #f3f4f6; }
        .bms.open { transform:translateX(0); }

        @media(max-width:768px)  { .nb-nav-wrap{display:none!important} .mBN{display:flex!important} .mObTopBar{display:flex!important} }
        @media(min-width:769px)  { .nb-nav-wrap{display:block!important} .mBN{display:none!important} .mObTopBar{display:none!important} }
        @media(max-width:640px)  { .bso{padding-top:0!important;align-items:flex-end!important} .bsbx{border-radius:22px 22px 0 0!important;margin:0!important;max-width:100%!important} }
        .mob-bottom-nav { padding-bottom:env(safe-area-inset-bottom,0px); }
        .notif-list::-webkit-scrollbar{width:3px}
        .notif-list::-webkit-scrollbar-thumb{background:${C.rose200};border-radius:4px}
      `}</style>

      {activeCatPanel && (
        <CategoryProductPanel cat={activeCatPanel} onClose={()=>setActiveCatPanel(null)} onCategoryNavigate={handleCategoryNavigate}/>
      )}

      {/* ══ AXTARIŞ MODALİ ══ */}
      {showSearch && (
        <div className="bso" onClick={()=>setShowSearch(false)}>
          <div className="bsbx" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"center", padding:"8px 0 3px" }}>
              <div style={{ width:40, height:4, background:C.rose100, borderRadius:3 }} />
            </div>
            <form onSubmit={handleSearch} style={{ display:"flex", alignItems:"center", padding:"4px 18px" }}>
              <Search size={18} color={C.primary} style={{ flexShrink:0 }}/>
              <input autoFocus type="text" placeholder={t("search.placeholder")} value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                style={{ flex:1, border:"none", outline:"none", padding:"14px 13px", fontSize:15, fontFamily:"'Sora',sans-serif", color:C.dark, background:"transparent" }}/>
              <button type="button" onClick={()=>setShowSearch(false)} style={{ border:"none", background:"none", cursor:"pointer", color:C.light, padding:8 }}>
                <X size={18}/>
              </button>
            </form>
            <div style={{ padding:"0 20px 22px", borderTop:`1px solid #f3f4f6` }}>
              <p style={{ fontSize:10, fontWeight:700, color:C.light, letterSpacing:1.5, margin:"14px 0 10px", textTransform:"uppercase", fontFamily:"'Sora',sans-serif" }}>{t("search.popular")}</p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {["iPhone","Nike","Samsung","Laptop","Geyim"].map(q=>(
                  <button key={q} onClick={()=>{setSearchQuery(q);navigate(`/search-results?query=${q}`);setShowSearch(false)}}
                    style={{ padding:"7px 16px", borderRadius:99, border:`1.5px solid #e5e7eb`, background:"#fafafa", color:C.mid, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Sora',sans-serif", transition:"all .15s" }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=C.rose200;e.currentTarget.style.color=C.primary;e.currentTarget.style.background=C.rose50}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="#e5e7eb";e.currentTarget.style.color=C.mid;e.currentTarget.style.background="#fafafa"}}
                  >{q}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MOBİL ÜST BAR ══ */}
      <div className="mObTopBar nb-mob-top-anim"
        style={{ display:"none", position:"sticky", top:0, zIndex:91, background: scrolled ? "rgba(255,255,255,0.97)" : "#fff", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom:"1px solid #f3f4f6", boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.06)" : "none", transition:"all 0.3s ease", padding:"0 16px", height:56, alignItems:"center", justifyContent:"space-between", gap:8 }}
      >
        <Link to="/" className="nb-logo-link">
          <MobileLogoFull />
        </Link>
        <div style={{ display:"flex", alignItems:"center", gap:2 }}>
          <button className="bib" onClick={()=>setShowSearch(true)} style={{ width:38, height:38, borderRadius:11 }}><Search size={17}/></button>
          <NotificationBell isMobile={true}/>
          {isAuthenticated ? (
            <Link to="/profile" style={{ textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center", width:38, height:38 }}>
              {user?.user?.avatar?.url
                ? <img src={user.user.avatar.url} alt="" style={{ width:30, height:30, borderRadius:"50%", objectFit:"cover", border:`2px solid ${C.rose200}` }}/>
                : <div style={{ width:30, height:30, borderRadius:"50%", background:`linear-gradient(135deg,${C.primarySoft},${C.primary})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:800 }}>{user?.user?.name?.charAt(0).toUpperCase()}</div>}
            </Link>
          ) : (
            <Link to="/login" className="bib" style={{ textDecoration:"none", width:38, height:38 }}><User size={17}/></Link>
          )}
          <button className="bib" onClick={()=>setIsMenuOpen(true)} style={{ width:38, height:38 }}>
            <svg width="18" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="0" y1="1"  x2="18" y2="1"/>
              <line x1="0" y1="7"  x2="18" y2="7"/>
              <line x1="0" y1="13" x2="18" y2="13"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ══ DESKTOP NAVBAR ══ */}
      <nav
        className="nb-nav-wrap"
        style={{
          position:"sticky", top:0, zIndex:90,
          background: scrolled ? "rgba(255,255,255,0.96)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid #f3f4f6" : "1px solid #f9fafb",
          boxShadow: scrolled ? "0 4px 28px rgba(0,0,0,0.06)" : "none",
          transition:"all 0.3s ease",
        }}
      >
        <div style={{ maxWidth:1320, margin:"0 auto", padding:"0 24px", height:66, display:"flex", alignItems:"center", justifyContent:"space-between", gap:20 }}>

          <Link to="/" className="nb-logo-anim nb-logo-link">
            <BrendexLogoFull iconSize={36} />
          </Link>

          <div style={{ display:"flex", alignItems:"center", gap:40, flex:1, justifyContent:"center" }}>
            <span className="nb-link-anim-1">
              <Link to="/home" className={`bnl ${isAct("/home")?"on":""}`}>{t("navbar.home")}</Link>
            </span>
            <span className="nb-link-anim-2" style={{ position:"relative" }} ref={catRef} onMouseEnter={handleCatMouseEnter} onMouseLeave={handleCatMouseLeave}>
              <button onClick={()=>setIsCategoryOpen(p=>!p)} className={`bnl ${isCategoryOpen?"on":""}`}>
                {t("navbar.category")}
                <ChevronDown size={14} style={{ transition:"transform 0.2s", transform: isCategoryOpen?"rotate(180deg)":"rotate(0)" }}/>
              </button>
              {isCategoryOpen && (
                <div onMouseEnter={handleCatMouseEnter} onMouseLeave={handleCatMouseLeave}>
                  <CategoryDropdown onCategorySelect={handleCategorySelect} categories={categories}/>
                </div>
              )}
            </span>
            <span className="nb-link-anim-3">
              <Link to="/contact" className={`bnl ${isAct("/contact")?"on":""}`}>{t("navbar.contact")}</Link>
            </span>
          </div>

          <div className="nb-actions-anim" style={{ display:"flex", alignItems:"center", gap:2, flexShrink:0 }}>
            <div style={{ marginRight:4 }}><LanguageSwitcher/></div>
            <button className="bib" onClick={()=>setShowSearch(true)} title={t("navbar.search")}><Search size={18}/></button>
            <NotificationBell/>
            <div ref={userRef} style={{ position:"relative" }}>
              {isAuthenticated ? (
                <>
                  <button className="bib" onClick={()=>setIsUserMenuOpen(p=>!p)}>
                    {user?.user?.avatar?.url
                      ? <img src={user.user.avatar.url} alt="" style={{ width:28, height:28, borderRadius:"50%", objectFit:"cover", border:`2px solid ${C.rose200}` }}/>
                      : <div style={{ width:30, height:30, borderRadius:"50%", background:`linear-gradient(135deg,${C.primarySoft},${C.primary})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:800, boxShadow:`0 2px 8px rgba(232,25,44,0.28)` }}>{user?.user?.name?.charAt(0).toUpperCase()}</div>}
                  </button>
                  {isUserMenuOpen && (
                    <div style={{ position:"absolute", right:0, top:"calc(100% + 8px)", background:"#fff", borderRadius:18, boxShadow:"0 16px 52px rgba(0,0,0,0.11)", border:"1.5px solid #f3f4f6", minWidth:230, padding:"10px 7px", zIndex:100, animation:"nbUserDrop 0.18s ease" }}>
                      <div style={{ padding:"8px 12px 11px" }}>
                        <p style={{ fontSize:13, fontWeight:700, color:C.dark, margin:0, fontFamily:"'Sora',sans-serif" }}>{user?.user?.name}</p>
                        <p style={{ fontSize:11, color:C.mid, margin:"2px 0 0", fontFamily:"'Sora',sans-serif" }}>{user?.user?.email}</p>
                      </div>
                      <div style={{ borderTop:"1px solid #f3f4f6", paddingTop:5 }}>
                        {isAdmin && (
                          <>
                            <Link to="/admin/products" onClick={()=>setIsUserMenuOpen(false)} style={dropLink} onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{t("navbar.adminProducts")}</Link>
                            <Link to="/admin/product"  onClick={()=>setIsUserMenuOpen(false)} style={dropLink} onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{t("navbar.addProduct")}</Link>
                            <Link to="/admin/orders"   onClick={()=>setIsUserMenuOpen(false)} style={dropLink} onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>🏪 {t("navbar.storeOrders")}</Link>
                            <Link to="/seller/commission" onClick={()=>setIsUserMenuOpen(false)} style={{...dropLink,color:C.primary,fontWeight:700}} onMouseEnter={e=>e.currentTarget.style.background=C.rose50} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>💰 {t("navbar.commissionPanel")}</Link>
                          </>
                        )}
                        <Link to="/my-orders" onClick={()=>setIsUserMenuOpen(false)} style={dropLink} onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>📦 {t("navbar.myOrders")}</Link>
                        <button onClick={handleLogout} style={{ display:"block", width:"100%", textAlign:"left", padding:"8px 12px", borderRadius:10, fontSize:13, color:C.primary, background:"none", border:"none", cursor:"pointer", fontFamily:"'Sora',sans-serif", transition:"background .12s" }} onMouseEnter={e=>e.currentTarget.style.background=C.rose50} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{t("navbar.logout")}</button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/login" className="bib" style={{ textDecoration:"none" }}><User size={18}/></Link>
              )}
            </div>
            <Link to="/favori" className="bib" style={{ textDecoration:"none" }} title={t("navbar.favorites")}>
              <Heart size={18}/>
              {favCount>0 && <span className="bbd nb-badge-anim">{favCount}</span>}
            </Link>
            <Link to="/cart" className="bib" style={{ textDecoration:"none" }} title={t("navbar.cart")}>
              <ShoppingCart size={18}/>
              {cartCount>0 && <span className="bbd nb-badge-anim">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </nav>

      {/* ══ MOBİL SİDEBAR ══ */}
      {isMenuOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,5,5,0.42)", backdropFilter:"blur(5px)", zIndex:140, animation:"nbFd 0.2s" }} onClick={()=>setIsMenuOpen(false)}/>
      )}

      <div className={`bms ${isMenuOpen?"open":""}`}>
        <div style={{ background:`linear-gradient(135deg,${C.primarySoft},${C.primary})`, padding:"22px 18px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <SidebarLogo />
          <button onClick={()=>setIsMenuOpen(false)} style={{ border:"none", background:"rgba(255,255,255,0.16)", borderRadius:11, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <X size={16} color="white"/>
          </button>
        </div>

        <div style={{ padding:"14px 14px 12px", borderBottom:"1px solid #f3f4f6" }}>
          {isAuthenticated && user ? (
            <div style={{ display:"flex", alignItems:"center", gap:11 }}>
              {user?.user?.avatar?.url
                ? <img src={user.user.avatar.url} alt="" style={{ width:44, height:44, borderRadius:"50%", objectFit:"cover", border:`2px solid ${C.rose200}` }}/>
                : <div style={{ width:44, height:44, borderRadius:"50%", background:`linear-gradient(135deg,${C.primarySoft},${C.primary})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:17, fontWeight:800, boxShadow:`0 4px 14px rgba(232,25,44,0.28)` }}>{user?.user?.name?.charAt(0).toUpperCase()}</div>}
              <div>
                <p style={{ margin:0, fontSize:14, fontWeight:700, color:C.dark, fontFamily:"'Sora',sans-serif" }}>{user?.user?.name}</p>
                <p style={{ margin:"2px 0 0", fontSize:11, color:C.mid, fontFamily:"'Sora',sans-serif" }}>{user?.user?.email}</p>
              </div>
            </div>
          ) : (
            <Link to="/login" onClick={()=>setIsMenuOpen(false)} style={{ display:"flex", alignItems:"center", gap:9, textDecoration:"none", padding:"12px 16px", borderRadius:14, background:`linear-gradient(135deg,${C.primarySoft},${C.primary})`, color:"#fff", fontSize:14, fontWeight:700, fontFamily:"'Sora',sans-serif", boxShadow:`0 4px 14px rgba(232,25,44,0.28)` }}>
              <User size={15}/> {t("navbar.loginRegister")}
            </Link>
          )}
        </div>

        <div style={{ padding:"12px 16px", borderBottom:"1px solid #f3f4f6" }}>
          <p style={{ fontSize:10, fontWeight:700, color:C.light, letterSpacing:1.2, textTransform:"uppercase", margin:"0 0 9px", fontFamily:"'Sora',sans-serif" }}>{t("language.select")}</p>
          <LanguageSwitcher/>
        </div>

        <div style={{ padding:"12px 12px 6px" }}>
          <button onClick={()=>{setShowSearch(true);setIsMenuOpen(false)}}
            style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"11px 14px", borderRadius:13, background:"#f9fafb", border:"1.5px solid #f3f4f6", cursor:"pointer", fontFamily:"'Sora',sans-serif", fontSize:13, color:C.light, fontWeight:500, transition:"all .15s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=C.rose200;e.currentTarget.style.color=C.primary;e.currentTarget.style.background=C.rose50}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#f3f4f6";e.currentTarget.style.color=C.light;e.currentTarget.style.background="#f9fafb"}}
          >
            <Search size={15} color={C.rose200}/> {t("navbar.search")}
          </button>
        </div>

        <nav style={{ padding:"6px 6px", flex:1 }}>
          <Link to="/home" className="bsi" onClick={()=>setIsMenuOpen(false)}><Home size={17} color={C.primary}/> {t("navbar.home")}</Link>
          <div>
            <button className="bsi" onClick={()=>setIsCategoryOpen(p=>!p)} style={{ justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}><Grid3X3 size={17} color={C.primary}/> {t("navbar.category")}</div>
              <ChevronDown size={14} color={C.light} style={{ transition:"transform 0.2s", transform: isCategoryOpen?"rotate(180deg)":"rotate(0)" }}/>
            </button>
            {isCategoryOpen && (
              <div style={{ paddingLeft:14 }}>
                {categories.map(cat=>{
                  const Icon=cat.icon
                  return (
                    <div key={cat.label} onClick={()=>handleCategorySelect(cat)} className="bsi" style={{ padding:"10px 12px", fontSize:13 }}>
                      <div style={{ width:30, height:30, borderRadius:9, background:cat.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <Icon size={14} color={cat.color}/>
                      </div>
                      <div>
                        <div style={{ fontWeight:600, color:C.dark }}>{cat.label}</div>
                        <div style={{ fontSize:10, color:C.mid }}>{cat.sub}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <Link to="/contact" className="bsi" onClick={()=>setIsMenuOpen(false)}><MessageCircle size={17} color={C.primary}/> {t("navbar.contact")}</Link>
        </nav>

        {isAuthenticated && (
          <div style={{ padding:"10px 6px 80px", borderTop:"1px solid #f3f4f6" }}>
            {isAdmin && (
              <>
                <Link to="/admin/products" className="bsi" onClick={()=>setIsMenuOpen(false)}>{t("navbar.adminProducts")}</Link>
                <Link to="/admin/product"  className="bsi" onClick={()=>setIsMenuOpen(false)}>{t("navbar.addProduct")}</Link>
                <Link to="/admin/orders"   className="bsi" onClick={()=>setIsMenuOpen(false)}>🏪 {t("navbar.storeOrders")}</Link>
                <Link to="/seller/commission" className="bsi" onClick={()=>setIsMenuOpen(false)} style={{ color:C.primary, fontWeight:700 }}>💰 {t("navbar.commissionPanel")}</Link>
              </>
            )}
            <Link to="/my-orders" className="bsi" onClick={()=>setIsMenuOpen(false)}><Package size={17} color={C.primary}/> {t("navbar.myOrders")}</Link>
            <button className="bsi red" onClick={()=>{handleLogout();setIsMenuOpen(false)}}>{t("navbar.logout")}</button>
          </div>
        )}
      </div>

      {/* ══ MOBİL ALT NAVİQASİYA ══ */}
      <div className="mBN mob-bottom-nav nb-mob-anim"
        style={{ display:"none", position:"fixed", bottom:0, left:0, right:0, zIndex:80, background:"rgba(255,255,255,0.97)", backdropFilter:"blur(16px)", borderTop:"1px solid #f3f4f6", boxShadow:"0 -4px 24px rgba(0,0,0,0.07)" }}
      >
        <div style={{ display:"flex", flexDirection:"row", alignItems:"stretch", width:"100%", height:62, minHeight:54, maxHeight:70 }}>
          <Link to="/home"  className={`bmt ${isAct("/home")?"on":""}`}><Home size={21}/><span>{t("navbar.home")}</span></Link>
          <Link to="/shop"  className={`bmt ${isAct("/shop")?"on":""}`}><Grid3X3 size={21}/><span>{t("navbar.category")}</span></Link>
          <Link to="/cart" style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textDecoration:"none", WebkitTapHighlightColor:"transparent" }}>
            <div className="nb-cart-box nb-cart-bounce-anim"
              style={{ width:48, height:48, background:`linear-gradient(135deg,${C.primarySoft},${C.primary})`, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 6px 20px rgba(232,25,44,0.40)`, marginTop:-16, border:"3px solid #fff", position:"relative", flexShrink:0, transition:"transform .12s ease" }}
              onTouchStart={e=>e.currentTarget.style.transform="scale(0.91)"}
              onTouchEnd={e=>e.currentTarget.style.transform="scale(1)"}
              onTouchCancel={e=>e.currentTarget.style.transform="scale(1)"}
            >
              <ShoppingCart size={21} color="#fff"/>
              {cartCount>0 && (
                <span style={{ position:"absolute", top:-5, right:-5, minWidth:16, height:16, background:"#fff", color:C.primary, fontSize:8, fontWeight:800, lineHeight:1, borderRadius:99, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px", border:`1.5px solid ${C.rose100}`, fontFamily:"'Sora',sans-serif" }}>
                  {cartCount>9?"9+":cartCount}
                </span>
              )}
            </div>
            <span className="nb-cart-lbl" style={{ fontSize:9, fontWeight:700, color:C.primary, marginTop:4, fontFamily:"'Sora',sans-serif", lineHeight:1 }}>{t("navbar.cart")}</span>
          </Link>
          <Link to="/favori" className={`bmt ${isAct("/favori")?"on":""}`} style={{ position:"relative" }}>
            <div style={{ position:"relative" }}>
              <Heart size={21}/>
              {favCount>0 && <span className="bbd" style={{ top:-5, right:-7 }}>{favCount>9?"9+":favCount}</span>}
            </div>
            <span>{t("navbar.favorites")}</span>
          </Link>
          {isAuthenticated ? (
            <Link to="/my-orders" className={`bmt ${isAct("/my-orders")?"on":""}`}><Package size={21}/><span>{t("navbar.orders")}</span></Link>
          ) : (
            <Link to="/login" className={`bmt ${isAct("/login")?"on":""}`}><User size={21}/><span>{t("navbar.profile")}</span></Link>
          )}
        </div>
      </div>
    </>
  )
}

export default Navbar