"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import {
  useGetProductDetailsQuery,
  useAddToCartMutation,
  useAddToFavoritesMutation,
  useCreateOrUpdateReviewMutation,
  useGetProductReviewsQuery,
} from "../redux/api/productsApi"

import {
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Star,
  User,
  CheckCircle,
  AlertCircle,
  Zap,
  Store,
  Minus,
  Plus,
  ChevronDown,
  Share2,
  ArrowLeft,
  Shield,
  Truck,
  RotateCcw,
  ThumbsUp,
  BadgeCheck,
  Clock,
  Package,
} from "lucide-react"

import { toast, Toaster } from "react-hot-toast"
import StarRatings from "react-star-ratings"

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS — Qırmızı + Ağ palitra
   Yaşıl yalnız stok / uğur bildirişləri üçün
═══════════════════════════════════════════════════════════════ */
const t = {
  /* Qırmızı */
  red:         "#E8192C",
  redDark:     "#C0001A",
  redLight:    "#FFF5F5",
  redMid:      "#FFE0E3",
  redBorder:   "#FCCDD1",

  /* Yaşıl — yalnız stok/uğur */
  green:       "#00A650",
  greenLight:  "#F0FDF4",
  greenBorder: "#BBF7D0",

  /* Ağ / Neytral */
  white:       "#FFFFFF",
  bg:          "#F5F5F5",
  border:      "#E8E8E8",
  borderMid:   "#D1D1D1",

  /* Mətn */
  textDark:    "#0F1111",
  textMid:     "#565959",
  textLight:   "#767676",

  /* Qiymət */
  priceRed:    "#B12704",

  /* Ulduz */
  star:        "#FFA41C",

  /* Kölgə */
  shadow:      "0 2px 8px rgba(0,0,0,0.10)",
  shadowCard:  "0 1px 3px rgba(0,0,0,0.08)",
}

/* ── Helpers ── */
const Divider = () => (
  <div style={{ height:1, background:t.border, margin:"14px 0" }}/>
)

const GreenBadge = ({ children }) => (
  <span style={{
    display:"inline-flex", alignItems:"center", gap:3,
    background:t.greenLight, color:t.green,
    border:`1px solid ${t.greenBorder}`,
    fontSize:11, fontWeight:700, padding:"2px 7px", borderRadius:4,
  }}>{children}</span>
)

const TrustItem = ({ icon, label, sub }) => (
  <div style={{
    display:"flex", alignItems:"center", gap:9,
    flex:1, minWidth:130,
    padding:"9px 12px", background:t.white,
    border:`1px solid ${t.border}`, borderRadius:8,
  }}>
    <div style={{ color:t.red, flexShrink:0 }}>{icon}</div>
    <div>
      <div style={{ fontSize:12, fontWeight:700, color:t.textDark }}>{label}</div>
      <div style={{ fontSize:11, color:t.textLight }}>{sub}</div>
    </div>
  </div>
)

const RatingBar = ({ value, count, total }) => {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:5 }}>
      <span style={{ fontSize:12, color:t.textMid, width:12, textAlign:"right", flexShrink:0 }}>{value}</span>
      <Star size={11} fill={t.star} color={t.star} style={{ flexShrink:0 }}/>
      <div style={{ flex:1, height:8, background:t.border, borderRadius:4, overflow:"hidden" }}>
        <div style={{
          width:`${pct}%`, height:"100%",
          background:`linear-gradient(90deg,${t.red},${t.redDark})`,
          borderRadius:4, transition:"width 0.6s",
        }}/>
      </div>
      <span style={{ fontSize:11, color:t.textLight, width:24, textAlign:"right", flexShrink:0 }}>{count}</span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ANA KOMPONENT
═══════════════════════════════════════════════════════════════ */
const ProductDetail = () => {
  const params = useParams()

  const { data, isLoading, error } = useGetProductDetailsQuery(params?.id, {
    refetchOnMountOrArgChange: true,
  })
  const product = data?.product

  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError } =
    useGetProductReviewsQuery(params?.id, { refetchOnMountOrArgChange: true })

  const [addToCart]            = useAddToCartMutation()
  const [addToFavorites]       = useAddToFavoritesMutation()
  const [createOrUpdateReview] = useCreateOrUpdateReviewMutation()

  const [currentImg,    setCurrentImg]    = useState(0)
  const [reviewRating,  setReviewRating]  = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [quantity,      setQuantity]      = useState(1)
  const [descExpanded,  setDescExpanded]  = useState(false)
  const [isFaved,       setIsFaved]       = useState(false)
  const [addedToCart,   setAddedToCart]   = useState(false)

  /* Countdown */
  const [timeLeft, setTimeLeft] = useState(2*3600 + 30*60 + 45)
  useEffect(() => {
    if (timeLeft <= 0) return
    const iv = setInterval(() => setTimeLeft(p => p > 0 ? p-1 : 0), 1000)
    return () => clearInterval(iv)
  }, [timeLeft])
  const fmt = s => {
    const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), sec=s%60
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`
  }

  const imgs   = product?.images || []
  const imgUrl = imgs.length > 0
    ? imgs[currentImg].url
    : "https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front-dark.svg"

  /* seller — bazada string kimi saxlanılır */
  const sellerName =
    (typeof product?.seller === "string" && product.seller) ||
    product?.seller?.storeName ||
    product?.seller?.name ||
    "Satıcı"

  const reviews    = reviewsData?.reviews || []
  const totalRev   = reviews.length
  const ratingDist = [5,4,3,2,1].map(v => ({
    v, count: reviews.filter(r => Math.round(r.rating) === v).length
  }))

  const navImg = dir =>
    setCurrentImg(p =>
      dir === "prev"
        ? (p === 0 ? imgs.length-1 : p-1)
        : (p === imgs.length-1 ? 0 : p+1)
    )

  const handleAddToCart = async e => {
    e.preventDefault()
    try {
      await addToCart({ productId:product._id, quantity }).unwrap()
      setAddedToCart(true)
      toast.success("Məhsul səbətə əlavə edildi")
      setTimeout(() => setAddedToCart(false), 2500)
    } catch { toast.error("Xəta baş verdi") }
  }

  const handleFav = async e => {
    e.preventDefault()
    try {
      const r = await addToFavorites(product._id).unwrap()
      if (r.success) { setIsFaved(true); toast.success("Favorilərə əlavə edildi") }
    } catch (err) {
      const msg = err.data?.message || "Xəta baş verdi"
      if (msg.toLowerCase().includes("already")) {
        setIsFaved(true); toast("Artıq favorilərdədir", { icon:"ℹ️" })
      } else toast.error(msg)
    }
  }

  /* Specs */
  const getSpecs = () => {
    if (!product) return []
    const p = product
    const map = {
      Phones:        [["Ekran","screenSize"],["Yaddaş","storage"],["RAM","ram"],["Ön Kamera","frontCamera"],["Arxa Kamera","backCamera"],["Batareya","battery"],["Prosessor","processor"],["OS","operatingSystem"]],
      Laptops:       [["Ekran","screenSize"],["Yaddaş","storage"],["RAM","ram"],["GPU","gpu"],["Kamera","camera"],["Prosessor","processor"],["Batareya Ömrü","batteryLife"],["OS","operatingSystem"]],
      Cameras:       [["Həlledicilik","resolution"],["Optik Zoom","opticalZoom"],["Sensor","sensorType"],["Sabitləşdirmə","imageStabilization"]],
      Headphones:    [["Bağlantı","connectivity"],["Batareya","batteryLife"],["Səs İzolyasiyası","noiseCancellation"]],
      Console:       [["CPU","cpu"],["GPU","gpu"],["Yaddaş","storage"],["RAM","memory"],["Həlledicilik","supportedResolution"],["Bağlantı","connectivity"]],
      iPad:          [["Ekran","screenSize"],["Yaddaş","storage"],["RAM","ram"],["Prosessor","processor"],["Batareya","battery"],["OS","operatingSystem"],["Kamera","camera"]],
      WomenClothing: [["Ölçü","size"],["Rəng","color"],["Material","material"],["Brend","brand"],["Mövsüm","season"]],
      MenClothing:   [["Ölçü","size"],["Rəng","color"],["Material","material"],["Brend","brand"],["Mövsüm","season"]],
      KidsClothing:  [["Ölçü","size"],["Rəng","color"],["Material","material"],["Brend","brand"],["Yaş","ageRange"],["Cins","gender"]],
      HomeAppliances:[["Brend","brand"],["Güc","powerConsumption"],["Zəmanət","warranty"],["Ölçülər","dimensions"],["Rəng","color"]],
      HomeAndGarden: [["Material","material"],["Ölçülər","dimensions"],["Rəng","color"],["Brend","brand"],["İstifadə","indoorOutdoor"]],
      Beauty:        [["Brend","brand"],["Dəri Tipi","skinType"],["Həcm","volume"],["Tərkib","ingredients"],["Son Tarix","expiryDate"]],
      Sports:        [["Brend","brand"],["Material","material"],["Çəki","weight"],["Uyğundur","suitableFor"],["Rəng","color"]],
      Automotive:    [["Brend","brand"],["Uyğun Modellər","compatibleModels"],["Material","material"],["Zəmanət","warranty"],["Rəng","color"]],
    }
    const rows  = map[p.category] || []
    const extra = []
    if (p.category === "Console" && p.controllerIncluded) extra.push(["Controller","Daxildir"])
    if (p.category === "iPad"    && p.cellular)           extra.push(["Cellular","Bəli"])
    return [...rows.map(([l,k]) => p[k] ? [l,p[k]] : null).filter(Boolean), ...extra]
  }

  const handleReviewSubmit = async e => {
    e.preventDefault()
    if (!reviewRating) { toast.error("Zəhmət olmasa ulduz seçin"); return }
    try {
      const res = await createOrUpdateReview({
        productId:product._id, rating:reviewRating, comment:reviewComment,
      }).unwrap()
      toast.success(res.message || "Rəy göndərildi")
      setReviewRating(0); setReviewComment("")
    } catch (err) { toast.error(err.data?.message || "Xəta baş verdi") }
  }

  /* Loading / Error */
  if (isLoading)
    return (
      <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", background:t.bg }}>
        <div style={{
          width:44, height:44, borderRadius:"50%",
          border:`4px solid ${t.redMid}`, borderTopColor:t.red,
          animation:"_spin 0.75s linear infinite",
        }}/>
        <style>{`@keyframes _spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )

  if (error)
    return (
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",gap:12,color:t.red }}>
        <AlertCircle size={48}/>
        <p style={{ fontSize:18,fontWeight:600 }}>Xəta: {error.message}</p>
      </div>
    )

  const origPrice = product?.originalPrice || Math.round((product?.price||0)*1.25)
  const discount  = product?.discount || 25
  const inStock   = product?.stock > 0
  const lowStock  = inStock && product.stock <= 10
  const specs     = getSpecs()

  return (
    <div style={{ background:t.bg, minHeight:"100vh", fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <Toaster position="top-center" toastOptions={{ style:{ fontSize:13, borderRadius:8 }}}/>

      {/* ── Üst bar ── */}
      <div style={{ background:t.white, borderBottom:`1px solid ${t.border}`, padding:"10px 20px" }}>
        <button
          onClick={()=>window.history.back()}
          style={{
            display:"flex", alignItems:"center", gap:6,
            background:"none", border:"none", cursor:"pointer",
            fontSize:13, color:t.red, fontWeight:600,
          }}
        >
          <ArrowLeft size={15}/> Geri
        </button>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"16px 16px 48px" }}>

        {/* ── Əsas məhsul kartı ── */}
        <div style={{
          background:t.white, borderRadius:12,
          border:`1px solid ${t.border}`,
          boxShadow:t.shadowCard, overflow:"hidden",
        }}>
          <div className="pd-grid" style={{
            display:"grid",
            gridTemplateColumns:"minmax(280px,2fr) minmax(320px,3fr)",
            gap:0,
          }}>

            {/* ════ SOL — Şəkillər ════ */}
            <div style={{
              padding:"24px 20px",
              borderRight:`1px solid ${t.border}`,
              position:"sticky", top:0, height:"fit-content",
            }}>

              {/* Əsas şəkil */}
              <div style={{
                position:"relative", background:"#FAFAFA",
                border:`1px solid ${t.border}`, borderRadius:10,
                aspectRatio:"1/1", overflow:"hidden",
              }}>
                {/* Endirim badge */}
                <div style={{
                  position:"absolute", top:12, left:12, zIndex:2,
                  background:t.red, color:"#fff",
                  fontSize:12, fontWeight:800, padding:"3px 9px",
                  borderRadius:5, letterSpacing:0.3,
                }}>
                  -{discount}%
                </div>

                {/* Favori */}
                <button onClick={handleFav} style={{
                  position:"absolute", top:12, right:12, zIndex:2,
                  width:36, height:36, borderRadius:"50%",
                  background:isFaved ? t.redLight : t.white,
                  border:`1.5px solid ${isFaved ? t.red : t.border}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  cursor:"pointer", boxShadow:t.shadow, transition:"all 0.18s",
                }}>
                  <Heart size={17} fill={isFaved?t.red:"none"} color={isFaved?t.red:t.textMid}/>
                </button>

                <img
                  src={imgUrl} alt={product?.name}
                  style={{
                    width:"100%", height:"100%", objectFit:"contain",
                    padding:20, transition:"transform 0.3s",
                  }}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                />

                {/* Naviqasiya oxları */}
                {imgs.length > 1 && ["prev","next"].map(dir=>(
                  <button key={dir} onClick={()=>navImg(dir)} style={{
                    position:"absolute", top:"50%",
                    [dir==="prev"?"left":"right"]:10,
                    transform:"translateY(-50%)",
                    width:32, height:32, borderRadius:"50%",
                    background:"rgba(255,255,255,0.93)",
                    border:`1px solid ${t.border}`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    cursor:"pointer", boxShadow:t.shadow,
                  }}>
                    {dir==="prev"
                      ? <ChevronLeft  size={16} color={t.textDark}/>
                      : <ChevronRight size={16} color={t.textDark}/>}
                  </button>
                ))}
              </div>

              {/* Thumbnail-lər */}
              {imgs.length > 1 && (
                <div style={{ display:"flex", gap:7, marginTop:10, overflowX:"auto", paddingBottom:4 }}>
                  {imgs.map((img,i)=>(
                    <button key={i} onClick={()=>setCurrentImg(i)} style={{
                      width:58, height:58, borderRadius:7, overflow:"hidden",
                      border:`2px solid ${i===currentImg ? t.red : t.border}`,
                      cursor:"pointer", background:t.white, padding:4, flexShrink:0,
                      boxShadow:i===currentImg ? `0 0 0 2px ${t.redBorder}` : "none",
                      transition:"all 0.15s",
                    }}>
                      <img src={img.url} alt="" style={{ width:"100%",height:"100%",objectFit:"contain" }}/>
                    </button>
                  ))}
                </div>
              )}

              {/* Paylaş */}
              <button style={{
                display:"flex", alignItems:"center", gap:5, marginTop:14,
                background:"none", border:"none", cursor:"pointer",
                fontSize:12, color:t.textLight,
              }}>
                <Share2 size={13}/> Paylaş
              </button>
            </div>

            {/* ════ SAĞ — Məlumatlar ════ */}
            <div style={{ padding:"24px 28px" }}>

              {/* Başlıq */}
              <h1 style={{
                fontSize:20, fontWeight:600, color:t.textDark,
                lineHeight:1.45, margin:"0 0 10px",
              }}>
                {product?.name}
              </h1>

              {/* Reytinq */}
              <div style={{
                display:"flex", alignItems:"center", gap:8,
                margin:"0 0 14px", flexWrap:"wrap",
              }}>
                <div style={{ display:"flex", gap:1 }}>
                  {[1,2,3,4,5].map(i=>(
                    <Star key={i} size={14}
                      fill={i<=Math.round(product?.ratings||0)?t.star:"#DDD"}
                      color={i<=Math.round(product?.ratings||0)?t.star:"#DDD"}
                    />
                  ))}
                </div>
                <span style={{ fontSize:14, color:t.red, fontWeight:600 }}>
                  {product?.ratings?.toFixed(1)||"0.0"}
                </span>
                <span style={{ fontSize:13, color:t.textLight }}>({totalRev} rəy)</span>
                <span style={{ width:1, height:14, background:t.borderMid }}/>
                <GreenBadge><BadgeCheck size={10}/> Doğrulanmış Satıcı</GreenBadge>
              </div>

              <Divider/>

              {/* Qiymət bloku */}
              <div style={{
                background:t.redLight, border:`1px solid ${t.redBorder}`,
                borderRadius:10, padding:"14px 16px", marginBottom:14,
              }}>
                {/* Flash sale sayacı */}
                <div style={{
                  display:"flex", alignItems:"center", gap:8, marginBottom:12,
                  background:t.red, borderRadius:6, padding:"6px 10px",
                }}>
                  <Zap size={13} fill="white" color="white"/>
                  <span style={{ color:"#fff", fontSize:11, fontWeight:800, letterSpacing:0.8 }}>
                    FLASH SALE
                  </span>
                  <div style={{
                    marginLeft:"auto",
                    background:"rgba(0,0,0,0.22)",
                    borderRadius:4, padding:"2px 8px",
                    display:"flex", alignItems:"center", gap:5,
                  }}>
                    <Clock size={11} color="white"/>
                    <span style={{ color:"#fff", fontFamily:"monospace", fontSize:13, fontWeight:700 }}>
                      {fmt(timeLeft)}
                    </span>
                  </div>
                </div>

                {/* Qiymət */}
                <div style={{ display:"flex", alignItems:"flex-end", gap:10, flexWrap:"wrap" }}>
                  <span style={{ fontSize:34, fontWeight:700, color:t.priceRed, lineHeight:1 }}>
                    ₼{product?.price}
                  </span>
                  <div style={{ marginBottom:4 }}>
                    <span style={{ fontSize:15, color:t.textLight, textDecoration:"line-through" }}>
                      ₼{origPrice}
                    </span>
                    <span style={{
                      marginLeft:7, fontSize:12, fontWeight:700, color:t.white,
                      background:t.red, padding:"2px 7px", borderRadius:4,
                    }}>
                      ₼{(origPrice-(product?.price||0)).toFixed(2)} qənaət
                    </span>
                  </div>
                </div>
                <div style={{ fontSize:11, color:t.textLight, marginTop:5 }}>
                  Vergi daxil • Çatdırılma pulsuz
                </div>
              </div>

              {/* Stok — yaşıl / qırmızı */}
              <div style={{
                display:"flex", alignItems:"center", gap:8,
                padding:"9px 14px", borderRadius:8, marginBottom:14,
                background:inStock ? t.greenLight : t.redLight,
                border:`1px solid ${inStock ? t.greenBorder : t.redBorder}`,
              }}>
                {inStock
                  ? <>
                      <CheckCircle size={16} color={t.green}/>
                      <span style={{ fontSize:14, fontWeight:600, color:t.green }}>Stokda var</span>
                      {lowStock && (
                        <span style={{ fontSize:12, color:t.red, fontWeight:500 }}>
                          — yalnız {product.stock} ədəd qalıb!
                        </span>
                      )}
                    </>
                  : <>
                      <AlertCircle size={16} color={t.red}/>
                      <span style={{ fontSize:14, fontWeight:600, color:t.red }}>Stokda yoxdur</span>
                    </>
                }
              </div>

              {/* Satıcı */}
              <div style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"12px 14px", background:t.white,
                border:`1px solid ${t.border}`, borderRadius:10, marginBottom:14,
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{
                    width:40, height:40, borderRadius:9,
                    background:`linear-gradient(135deg,${t.red} 0%,${t.redDark} 100%)`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <Store size={19} color="white"/>
                  </div>
                  <div>
                    <div style={{ fontSize:11, color:t.textLight, marginBottom:1 }}>Satıcı</div>
                    {/* sellerName — bazadan gələn string: product.seller */}
                    <div style={{ fontSize:15, fontWeight:700, color:t.textDark }}>{sellerName}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:2, marginTop:2 }}>
                      {[1,2,3,4,5].map(i=>(
                        <Star key={i} size={10} fill={t.star} color={t.star}/>
                      ))}
                      <span style={{ fontSize:11, color:t.textLight, marginLeft:3 }}>4.8</span>
                    </div>
                  </div>
                </div>
                <button
                  style={{
                    fontSize:12, fontWeight:600, color:t.red,
                    border:`1.5px solid ${t.red}`, borderRadius:7,
                    padding:"7px 12px", background:t.redLight,
                    cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap",
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.background=t.red; e.currentTarget.style.color="#fff"}}
                  onMouseLeave={e=>{e.currentTarget.style.background=t.redLight; e.currentTarget.style.color=t.red}}
                >
                  Mağazaya bax
                </button>
              </div>

              {/* Miqdar + Səbətə əlavə et */}
              <div style={{ display:"flex", gap:10, marginBottom:10, flexWrap:"wrap" }}>

                {/* Miqdar seçici */}
                <div style={{
                  display:"flex", alignItems:"center",
                  border:`1.5px solid ${t.border}`, borderRadius:8,
                  background:t.white, overflow:"hidden",
                }}>
                  <button
                    onClick={()=>setQuantity(q=>Math.max(1,q-1))}
                    style={{
                      width:38, height:46,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      background:"none", border:"none", cursor:"pointer",
                      color:quantity<=1?t.textLight:t.red,
                      borderRight:`1px solid ${t.border}`,
                    }}
                  ><Minus size={14}/></button>
                  <span style={{ width:46, textAlign:"center", fontSize:15, fontWeight:700, color:t.textDark }}>
                    {quantity}
                  </span>
                  <button
                    onClick={()=>setQuantity(q=>q+1)}
                    style={{
                      width:38, height:46,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      background:"none", border:"none", cursor:"pointer",
                      color:t.red, borderLeft:`1px solid ${t.border}`,
                    }}
                  ><Plus size={14}/></button>
                </div>

                {/* Səbət — qırmızı əsas düymə */}
                <button
                  onClick={handleAddToCart}
                  style={{
                    flex:1, minWidth:160, height:46,
                    background: addedToCart
                      ? `linear-gradient(180deg,${t.green},#028040)`
                      : `linear-gradient(180deg,${t.red} 0%,${t.redDark} 100%)`,
                    border:`1px solid ${addedToCart ? "#028040" : t.redDark}`,
                    borderRadius:8, cursor:"pointer",
                    fontSize:14, fontWeight:700, color:"#fff",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                    boxShadow:`0 2px 8px rgba(232,25,44,0.25)`,
                    transition:"all 0.25s",
                  }}
                  onMouseEnter={e=>!addedToCart&&(e.currentTarget.style.filter="brightness(1.08)")}
                  onMouseLeave={e=>e.currentTarget.style.filter="brightness(1)"}
                >
                  {addedToCart
                    ? <><CheckCircle size={16}/> Əlavə edildi</>
                    : <><ShoppingCart size={17}/> Səbətə əlavə et</>
                  }
                </button>
              </div>

              {/* İndi al — ağ/qırmızı outlined düymə */}
              <button style={{
                width:"100%", height:46,
                background:t.white,
                border:`2px solid ${t.red}`,
                borderRadius:8, cursor:"pointer",
                fontSize:14, fontWeight:700, color:t.red,
                display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                marginBottom:16,
                transition:"all 0.18s",
              }}
                onMouseEnter={e=>{e.currentTarget.style.background=t.red; e.currentTarget.style.color="#fff"}}
                onMouseLeave={e=>{e.currentTarget.style.background=t.white; e.currentTarget.style.color=t.red}}
              >
                İndi Al
              </button>

              {/* Güvən ikonlar */}
              <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
                <TrustItem icon={<Truck     size={18}/>} label="Pulsuz Çatdırılma" sub="24–48 saat"/>
                <TrustItem icon={<RotateCcw size={18}/>} label="30 Gün İadə"       sub="Problemsiz"/>
                <TrustItem icon={<Shield    size={18}/>} label="Rəsmi Zəmanət"     sub="Orijinal məhsul"/>
              </div>

              <Divider/>

              {/* Açıqlama */}
              <div style={{ marginBottom:16 }}>
                <h3 style={{ fontSize:15, fontWeight:700, color:t.textDark, marginBottom:8 }}>
                  Məhsul Haqqında
                </h3>
                <div style={{
                  fontSize:14, color:t.textMid, lineHeight:1.72,
                  overflow:"hidden",
                  display:"-webkit-box",
                  WebkitLineClamp:descExpanded?"unset":4,
                  WebkitBoxOrient:"vertical",
                }}>
                  {product?.description || "Məhsul haqqında məlumat yoxdur."}
                </div>
                <button
                  onClick={()=>setDescExpanded(v=>!v)}
                  style={{
                    display:"flex", alignItems:"center", gap:4, marginTop:7,
                    background:"none", border:"none", cursor:"pointer",
                    fontSize:13, fontWeight:600, color:t.red,
                  }}
                >
                  {descExpanded?"Daha az":"Daha çox oxu"}
                  <ChevronDown size={13} style={{
                    transform:descExpanded?"rotate(180deg)":"rotate(0)",
                    transition:"0.2s",
                  }}/>
                </button>
              </div>

              {/* Texniki göstəricilər */}
              {specs.length > 0 && (
                <div>
                  <h3 style={{ fontSize:15, fontWeight:700, color:t.textDark, marginBottom:10 }}>
                    Texniki Göstəricilər
                  </h3>
                  <table style={{
                    width:"100%", borderCollapse:"collapse",
                    fontSize:13, borderRadius:8, overflow:"hidden",
                  }}>
                    <tbody>
                      {specs.map(([label,val],i)=>(
                        <tr key={i} style={{ background:i%2===0?"#FFF5F5":t.white }}>
                          <td style={{
                            padding:"9px 14px", color:t.textMid, fontWeight:500,
                            width:"42%", borderBottom:`1px solid ${t.border}`,
                          }}>
                            {label}
                          </td>
                          <td style={{
                            padding:"9px 14px", color:t.textDark, fontWeight:600,
                            borderBottom:`1px solid ${t.border}`,
                          }}>
                            {val}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════ Rəylər kartı ════ */}
        <div style={{
          background:t.white, borderRadius:12, border:`1px solid ${t.border}`,
          boxShadow:t.shadowCard, padding:"28px 32px", marginTop:16,
        }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:t.textDark, marginBottom:22 }}>
            Müştəri Rəyləri
          </h2>

          {/* Statistika + Form */}
          <div style={{ display:"flex", gap:32, flexWrap:"wrap", marginBottom:24 }}>

            {/* Ümumi reytinq */}
            <div style={{ textAlign:"center", minWidth:90 }}>
              <div style={{ fontSize:54, fontWeight:800, color:t.red, lineHeight:1 }}>
                {product?.ratings?.toFixed(1)||"0.0"}
              </div>
              <div style={{ display:"flex", justifyContent:"center", gap:2, margin:"6px 0" }}>
                {[1,2,3,4,5].map(i=>(
                  <Star key={i} size={15}
                    fill={i<=Math.round(product?.ratings||0)?t.star:"#DDD"}
                    color={i<=Math.round(product?.ratings||0)?t.star:"#DDD"}
                  />
                ))}
              </div>
              <div style={{ fontSize:12, color:t.textLight }}>{totalRev} rəy</div>
            </div>

            {/* Bar chart */}
            <div style={{ flex:1, minWidth:160, paddingTop:4 }}>
              {ratingDist.map(({v,count})=>(
                <RatingBar key={v} value={v} count={count} total={totalRev}/>
              ))}
            </div>

            {/* Rəy formu */}
            <div style={{
              flex:1, minWidth:230,
              background:t.redLight, border:`1px solid ${t.redBorder}`,
              borderRadius:10, padding:16,
            }}>
              <h4 style={{ fontSize:14, fontWeight:700, color:t.textDark, marginBottom:12 }}>
                Rəy Bildirin
              </h4>
              <form onSubmit={handleReviewSubmit}>
                <div style={{ marginBottom:10 }}>
                  <StarRatings
                    rating={reviewRating}
                    changeRating={setReviewRating}
                    numberOfStars={5}
                    starRatedColor={t.star}
                    starHoverColor={t.star}
                    starDimension="24px"
                    starSpacing="2px"
                  />
                </div>
                <textarea
                  value={reviewComment}
                  onChange={e=>setReviewComment(e.target.value)}
                  placeholder="Məhsul haqqında fikirləriniz..."
                  style={{
                    width:"100%", height:88, padding:"8px 10px",
                    border:`1px solid ${t.redBorder}`, borderRadius:8,
                    fontSize:13, color:t.textDark, resize:"none",
                    outline:"none", background:t.white,
                    boxSizing:"border-box", fontFamily:"inherit",
                    transition:"border-color 0.15s",
                  }}
                  onFocus={e=>e.target.style.borderColor=t.red}
                  onBlur={e=>e.target.style.borderColor=t.redBorder}
                />
                <button type="submit" style={{
                  marginTop:8, width:"100%", padding:"9px 0",
                  background:`linear-gradient(180deg,${t.red} 0%,${t.redDark} 100%)`,
                  border:`1px solid ${t.redDark}`,
                  borderRadius:8, fontSize:13, fontWeight:700,
                  color:"#fff", cursor:"pointer",
                  transition:"filter 0.15s",
                  boxShadow:`0 2px 8px rgba(232,25,44,0.20)`,
                }}
                  onMouseEnter={e=>e.currentTarget.style.filter="brightness(1.08)"}
                  onMouseLeave={e=>e.currentTarget.style.filter="brightness(1)"}
                >
                  Rəyi Göndər
                </button>
              </form>
            </div>
          </div>

          <Divider/>

          {/* Rəy siyahısı */}
          {reviewsLoading ? (
            <div style={{ textAlign:"center", padding:"30px 0", color:t.textLight, fontSize:14 }}>
              Yüklənir...
            </div>
          ) : reviewsError ? (
            <div style={{ color:t.red, fontSize:14 }}>Rəyləri gətirmək mümkün olmadı.</div>
          ) : reviews.length > 0 ? (
            <div>
              {reviews.map((review,idx)=>(
                <div key={idx} style={{
                  padding:"18px 0",
                  borderBottom:idx < reviews.length-1 ? `1px solid ${t.border}` : "none",
                }}>
                  <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                    <div style={{
                      width:40, height:40, borderRadius:"50%", flexShrink:0,
                      background:t.redMid,
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>
                      <User size={18} color={t.red}/>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:5 }}>
                        {/* review.name — controller: name: req.user.name */}
                        <span style={{ fontSize:14, fontWeight:700, color:t.textDark }}>
                          {review.name || "İstifadəçi"}
                        </span>
                        <GreenBadge><CheckCircle size={10}/> Doğrulanmış alış</GreenBadge>
                      </div>
                      <div style={{ display:"flex", gap:2, marginBottom:7 }}>
                        {[1,2,3,4,5].map(i=>(
                          <Star key={i} size={13}
                            fill={i<=review.rating?t.star:"#DDD"}
                            color={i<=review.rating?t.star:"#DDD"}
                          />
                        ))}
                      </div>
                      <p style={{ fontSize:14, color:t.textMid, lineHeight:1.65, margin:0 }}>
                        {review.comment}
                      </p>
                      <button style={{
                        display:"flex", alignItems:"center", gap:5, marginTop:8,
                        background:"none", border:`1px solid ${t.border}`,
                        borderRadius:6, padding:"4px 10px",
                        cursor:"pointer", fontSize:12, color:t.textLight,
                        transition:"all 0.15s",
                      }}
                        onMouseEnter={e=>e.currentTarget.style.borderColor=t.borderMid}
                        onMouseLeave={e=>e.currentTarget.style.borderColor=t.border}
                      >
                        <ThumbsUp size={12}/> Faydalıdır
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign:"center", padding:"36px 0",
              border:`1.5px dashed ${t.redBorder}`, borderRadius:10,
              background:t.redLight,
            }}>
              <Package size={34} color={t.redBorder} style={{ marginBottom:10 }}/>
              <p style={{ fontSize:14, color:t.textLight, margin:0 }}>
                Bu məhsul üçün hələ heç kim rəy yazmayıb. İlk siz olun!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          .pd-grid {
            grid-template-columns: 1fr !important;
          }
          .pd-grid > *:first-child {
            border-right: none !important;
            border-bottom: 1px solid #E8E8E8 !important;
            position: static !important;
          }
        }
      `}</style>
    </div>
  )
}

export default ProductDetail