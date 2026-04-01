import { useEffect, useState } from "react"

/* ─── Yalnız BİR DƏFƏ göstər ─── */
const SHOWN_KEY = "brendex_onboarding_done"

/* ══════════════════════════════════════════════
   PHASE 1 — Splash (0-2s)
══════════════════════════════════════════════ */
function Phase1({ onDone }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 600)
    const t2 = setTimeout(() => setStep(2), 1200)
    const t3 = setTimeout(() => setStep(3), 1800)
    const t4 = setTimeout(() => onDone(),   2200)
    return () => [t1,t2,t3,t4].forEach(clearTimeout)
  }, [onDone])

  return (
    <div className={`ob-phase ob-p1 ${step === 3 ? "ob-exit" : "ob-enter"}`}>
      <div className="ob-p1-center">

        <div className={`ob-p1-ring ${step >= 1 ? "ob-p1-ring-on" : ""}`} />

        <div className={`ob-p1-icon ${step >= 0 ? "ob-p1-icon-show" : ""}`}>
          <svg width="60" height="60" viewBox="0 0 64 64" fill="none">
            <defs>
              <linearGradient id="p1g1" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ff3344"/>
                <stop offset="100%" stopColor="#9b0010"/>
              </linearGradient>
            </defs>
            <path d="M6 6 L6 58 L34 58 Q52 58 52 46 Q52 38 42 35 Q50 31 50 22 Q50 6 32 6 Z
                     M16 14 L30 14 Q40 14 40 22 Q40 30 30 30 L16 30 Z
                     M16 38 L32 38 Q44 38 44 46 Q44 54 32 54 L16 54 Z"
              fill="url(#p1g1)"/>
            <path d="M22 42 L24 28 L46 28 L42 42 Z" fill="white" opacity="0.9"/>
            <line x1="24" y1="35" x2="44" y2="35" stroke="url(#p1g1)" strokeWidth="1.5"/>
            <circle cx="28" cy="46" r="3.5" fill="url(#p1g1)"/>
            <circle cx="28" cy="46" r="1.5" fill="white"/>
            <circle cx="39" cy="46" r="3.5" fill="url(#p1g1)"/>
            <circle cx="39" cy="46" r="1.5" fill="white"/>
          </svg>
        </div>

        <div className={`ob-p1-brand ${step >= 1 ? "ob-show" : ""}`}>
          <span className="ob-p1-brend">BREND</span><span className="ob-p1-ex">EX</span>
        </div>

        <div className={`ob-p1-line ${step >= 1 ? "ob-p1-line-draw" : ""}`} />

        <p className={`ob-p1-sub ${step >= 2 ? "ob-show" : ""}`}>
          Alışın yeni ünvanı
        </p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   PHASE 2 — Dünya xəritəsi animasiyası (2-4s)
══════════════════════════════════════════════ */
const TURKIC_COUNTRIES = [
  { cx: 285, cy: 108, r: 8,  label: "AZ",  delay: 0 },
  { cx: 252, cy: 105, r: 6,  label: "TR",  delay: 0.15 },
  { cx: 330, cy: 100, r: 7,  label: "KZ",  delay: 0.3 },
  { cx: 315, cy: 112, r: 5,  label: "TM",  delay: 0.45 },
  { cx: 320, cy: 104, r: 5,  label: "UZ",  delay: 0.6 },
  { cx: 300, cy: 97,  r: 5,  label: "KG",  delay: 0.75 },
]

function Phase2({ onDone }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 400)
    const t2 = setTimeout(() => setStep(2), 1200)
    const t3 = setTimeout(() => setStep(3), 2000)
    const t4 = setTimeout(() => setStep(4), 2600)
    const t5 = setTimeout(() => onDone(),   3000)
    return () => [t1,t2,t3,t4,t5].forEach(clearTimeout)
  }, [onDone])

  return (
    <div className={`ob-phase ob-p2 ${step === 4 ? "ob-exit" : "ob-enter"}`}>

      <div className={`ob-p2-map-wrap ${step >= 3 ? "ob-p2-map-shrink" : ""}`}>
        <div className={`ob-p2-map ${step >= 0 ? "ob-show" : ""}`}>
          <svg viewBox="0 0 500 220" style={{ width:"100%", height:"100%" }}>
            <defs>
              <radialGradient id="dotglow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#E8192C" stopOpacity="1"/>
                <stop offset="100%" stopColor="#E8192C" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <rect width="500" height="220" fill="#e8f4fd" rx="16"/>
            <path d="M200 60 Q215 50 230 55 Q240 52 245 58 Q250 54 255 60 Q258 68 252 75 Q245 80 238 78 Q230 82 220 78 Q212 80 205 72 Z" fill="#c8dfc8" opacity="0.7"/>
            <path d="M245 55 Q280 45 330 48 Q380 50 410 60 Q430 70 425 90 Q420 110 400 115 Q370 120 340 115 Q310 118 290 112 Q265 108 255 95 Q245 82 248 68 Z" fill="#c8dfc8" opacity="0.7"/>
            <path d="M215 85 Q230 82 240 90 Q245 105 242 125 Q238 145 228 155 Q218 160 210 150 Q200 138 202 118 Q203 100 215 85 Z" fill="#c8dfc8" opacity="0.7"/>
            <path d="M80 55 Q100 48 115 58 Q125 70 120 90 Q118 110 108 120 Q95 128 85 118 Q72 105 75 85 Q75 68 80 55 Z" fill="#c8dfc8" opacity="0.7"/>
            <path d="M90 128 Q105 122 112 135 Q115 150 108 168 Q100 182 90 180 Q78 175 78 160 Q76 142 90 128 Z" fill="#c8dfc8" opacity="0.7"/>
            <path d="M370 140 Q390 135 405 142 Q415 152 410 165 Q402 175 388 172 Q374 168 370 157 Z" fill="#c8dfc8" opacity="0.7"/>

            {step >= 1 && TURKIC_COUNTRIES.map((c) => (
              <g key={c.label} style={{ animation: `ob-dot-pop 0.4s ease ${c.delay}s both` }}>
                <circle cx={c.cx} cy={c.cy} r={c.r * 2.5} fill="url(#dotglow)" opacity="0.3"
                  style={{ animation: `ob-pulse 2s ease-in-out ${c.delay}s infinite` }}/>
                <circle cx={c.cx} cy={c.cy} r={c.r} fill="#E8192C"/>
                <circle cx={c.cx} cy={c.cy} r={c.r * 0.45} fill="white"/>
                <text x={c.cx} y={c.cy - c.r - 4} textAnchor="middle"
                  fontSize="7" fontWeight="700" fill="#E8192C" fontFamily="Sora,sans-serif">
                  {c.label}
                </text>
              </g>
            ))}

            {step >= 1 && TURKIC_COUNTRIES.map((from, i) =>
              TURKIC_COUNTRIES.slice(i + 1, i + 2).map((to, j) => (
                <line key={`${i}-${j}`}
                  x1={from.cx} y1={from.cy} x2={to.cx} y2={to.cy}
                  stroke="#E8192C" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4"
                  style={{ animation: `ob-line-draw 0.6s ease ${from.delay + 0.3}s both` }}
                />
              ))
            )}

            {step >= 1 && [
              { fromX:285, fromY:108, toX:252, toY:105, delay:"0.5s" },
              { fromX:330, fromY:100, toX:285, toY:108, delay:"0.8s" },
            ].map((p, i) => (
              <g key={i} style={{ animation: `ob-move-pkg 1.5s ease ${p.delay} both` }}>
                <rect x={p.fromX - 5} y={p.fromY - 5} width="10" height="10" rx="2"
                  fill="#E8192C" opacity="0.85"/>
                <line x1={p.fromX - 3} y1={p.fromY} x2={p.fromX + 3} y2={p.fromY}
                  stroke="white" strokeWidth="1" strokeLinecap="round"/>
                <line x1={p.fromX} y1={p.fromY - 3} x2={p.fromX} y2={p.fromY + 1}
                  stroke="white" strokeWidth="1" strokeLinecap="round"/>
              </g>
            ))}
          </svg>
        </div>

        {step >= 3 && (
          <div className="ob-p2-logo-over">
            <svg width="70" height="70" viewBox="0 0 64 64" fill="none">
              <defs>
                <linearGradient id="p2g1" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ff3344"/>
                  <stop offset="100%" stopColor="#9b0010"/>
                </linearGradient>
              </defs>
              <path d="M6 6 L6 58 L34 58 Q52 58 52 46 Q52 38 42 35 Q50 31 50 22 Q50 6 32 6 Z
                       M16 14 L30 14 Q40 14 40 22 Q40 30 30 30 L16 30 Z
                       M16 38 L32 38 Q44 38 44 46 Q44 54 32 54 L16 54 Z"
                fill="url(#p2g1)"/>
              <path d="M22 42 L24 28 L46 28 L42 42 Z" fill="white" opacity="0.9"/>
              <line x1="24" y1="35" x2="44" y2="35" stroke="url(#p2g1)" strokeWidth="1.5"/>
              <circle cx="28" cy="46" r="3.5" fill="url(#p2g1)"/>
              <circle cx="28" cy="46" r="1.5" fill="white"/>
              <circle cx="39" cy="46" r="3.5" fill="url(#p2g1)"/>
              <circle cx="39" cy="46" r="1.5" fill="white"/>
            </svg>
          </div>
        )}
      </div>

      <p className={`ob-p2-text ${step >= 2 ? "ob-show" : ""}`}>
        Türk dünyasının yeni ticarət platforması
      </p>
    </div>
  )
}

/* ══════════════════════════════════════════════
   PHASE 3 — Onboarding Slider (4-10s)
══════════════════════════════════════════════ */
const SLIDES = [
  {
    icon: (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
        <rect width="72" height="72" rx="20" fill="#fff0f1"/>
        <rect x="18" y="22" width="36" height="28" rx="4" fill="#E8192C" opacity="0.15"/>
        <rect x="22" y="26" width="28" height="20" rx="3" fill="#E8192C" opacity="0.25"/>
        <rect x="26" y="30" width="20" height="12" rx="2" fill="#E8192C"/>
        <line x1="26" y1="36" x2="46" y2="36" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="26" y1="39" x2="38" y2="39" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="52" cy="22" r="8" fill="#E8192C"/>
        <text x="52" y="26" textAnchor="middle" fontSize="9" fontWeight="800" fill="white" fontFamily="Sora,sans-serif">∞</text>
      </svg>
    ),
    title: "Minlərlə məhsul",
    sub: "Elektronika, moda, ev əşyaları və daha çox",
    color: "#E8192C",
    bg: "linear-gradient(160deg, #fff5f5 0%, #fff0f2 100%)",
  },
  {
    icon: (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
        <rect width="72" height="72" rx="20" fill="#f0f7ff"/>
        <circle cx="36" cy="32" r="14" fill="#185FA5" opacity="0.15"/>
        <circle cx="36" cy="32" r="9" fill="#185FA5" opacity="0.3"/>
        <path d="M30 32 L34 36 L42 28" stroke="#185FA5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="20" y="49" width="32" height="6" rx="3" fill="#185FA5" opacity="0.15"/>
        <rect x="24" y="51" width="12" height="2" rx="1" fill="#185FA5" opacity="0.5"/>
        <rect x="38" y="51" width="10" height="2" rx="1" fill="#185FA5" opacity="0.3"/>
      </svg>
    ),
    title: "Etibarlı satıcılar",
    sub: "Yoxlanılmış mağazalar və təhlükəsiz alış",
    color: "#185FA5",
    bg: "linear-gradient(160deg, #f0f7ff 0%, #e8f2fd 100%)",
  },
  {
    icon: (
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
        <rect width="72" height="72" rx="20" fill="#f0faf5"/>
        <path d="M22 50 L36 24 L50 50 Z" fill="#0F6E56" opacity="0.15"/>
        <circle cx="36" cy="38" r="10" fill="#0F6E56" opacity="0.2"/>
        <path d="M29 38 L34 43 L44 33" stroke="#0F6E56" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="36" cy="22" r="4" fill="#0F6E56" opacity="0.5"/>
        <path d="M33 22 L36 19 L39 22" fill="#0F6E56" opacity="0.7"/>
      </svg>
    ),
    title: "Sürətli alış",
    sub: "Bir neçə kliklə sifariş",
    color: "#0F6E56",
    bg: "linear-gradient(160deg, #f0faf5 0%, #e6f7ef 100%)",
  },
]

function Phase3({ onDone }) {
  const [slide, setSlide] = useState(0)
  const [animDir, setAnimDir] = useState("right")
  const [isExiting, setIsExiting] = useState(false)

  const goTo = (i) => {
    if (i === slide) return
    setAnimDir(i > slide ? "right" : "left")
    setSlide(i)
  }

  const handleStart = () => {
    setIsExiting(true)
    setTimeout(() => onDone(), 500)
  }

  const s = SLIDES[slide]

  return (
    <div className={`ob-phase ob-p3 ${isExiting ? "ob-exit" : "ob-enter"}`} style={{ background: s.bg, transition: "background 0.6s ease" }}>

      <div className="ob-p3-content" key={slide} style={{ animation: `ob-slide-in-${animDir} 0.4s cubic-bezier(0.34,1.2,0.64,1) both` }}>
        <div className="ob-p3-icon-wrap">
          {s.icon}
        </div>
        <h2 className="ob-p3-title" style={{ color: s.color }}>
          {s.title}
        </h2>
        <p className="ob-p3-sub">
          {s.sub}
        </p>
      </div>

      <div className="ob-p3-dots">
        {SLIDES.map((_, i) => (
          <button key={i} className={`ob-p3-dot ${i === slide ? "active" : ""}`}
            style={{ background: i === slide ? s.color : "rgba(0,0,0,0.12)" }}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      <div className="ob-p3-nav">
        {slide < SLIDES.length - 1 ? (
          <>
            <button className="ob-p3-skip" onClick={handleStart}>Keç</button>
            <button className="ob-p3-next" style={{ background: s.color }} onClick={() => goTo(slide + 1)}>
              İrəli
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M9 4L13 8L9 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        ) : (
          <button className="ob-p3-start" style={{ background: s.color }} onClick={handleStart}>
            Başla
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 9H14M10 5L14 9L10 13" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   ANA KOMPONENT — SplashScreen
══════════════════════════════════════════════ */
const SplashScreen = ({ onFinish }) => {
  const isFirst = !localStorage.getItem(SHOWN_KEY)
  const [phase, setPhase] = useState(1) // 1 | 2 | 3 | "done"
  const [showSlider] = useState(isFirst)

  // ✅ DÜZƏLİŞ 1: render zamanı deyil, useEffect ilə çağırılır
  // Əvvəlki: {phase === "done" && finish()} — render zamanı setState çağırırdı → XƏTA
  // İndi: useEffect phase dəyişəndə işləyir — render bitdikdən sonra
  useEffect(() => {
    if (phase === "done") {
      localStorage.setItem(SHOWN_KEY, "1")
      // ✅ DÜZƏLİŞ 2: onFinish null/undefined yoxlaması
      // user null olduqda onFinish içindəki kod xəta verə bilər
      // onFinish?.() — optional chaining ilə təhlükəsiz çağırış
      if (typeof onFinish === "function") {
        onFinish()
      }
    }
  }, [phase, onFinish])

  const finish = () => setPhase("done")

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }

        .ob-phase {
          position: fixed; inset: 0; z-index: 9999;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif;
          overflow: hidden;
        }
        .ob-enter { animation: ob-fade-in 0.4s ease both; }
        .ob-exit  { animation: ob-fade-out 0.4s ease both; pointer-events: none; }

        @keyframes ob-fade-in  { from{opacity:0} to{opacity:1} }
        @keyframes ob-fade-out { from{opacity:1} to{opacity:0} }
        .ob-show { animation: ob-rise 0.45s cubic-bezier(0.34,1.2,0.64,1) both; }
        @keyframes ob-rise { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

        /* PHASE 1 */
        .ob-p1 { background: #fdf2f4; }
        .ob-p1-center {
          display: flex; flex-direction: column;
          align-items: center; gap: 0;
          position: relative; z-index: 1;
        }
        .ob-p1-ring {
          width: 140px; height: 140px; border-radius: 50%;
          border: 1.5px solid rgba(232,25,44,0.15);
          position: absolute; top: -18px;
          opacity: 0; transform: scale(0.7);
          transition: all 0.7s cubic-bezier(0.34,1.4,0.64,1);
        }
        .ob-p1-ring-on { opacity: 1; transform: scale(1); }
        .ob-p1-icon {
          width: 96px; height: 96px; border-radius: 26px;
          background: white;
          box-shadow: 0 16px 48px rgba(232,25,44,0.18), 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid rgba(232,25,44,0.12);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px;
          animation: ob-icon-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes ob-icon-pop {
          0%   { opacity:0; transform:scale(0.5) }
          70%  { opacity:1; transform:scale(1.07) }
          100% { opacity:1; transform:scale(1) }
        }
        .ob-p1-brand {
          font-size: 32px; font-weight: 900; letter-spacing: -1px;
          margin-bottom: 10px; opacity: 0;
        }
        .ob-p1-brand.ob-show { animation: ob-rise 0.4s ease 0.1s both; }
        .ob-p1-brend { color: #E8192C; }
        .ob-p1-ex    { color: #1a1a1a; }
        .ob-p1-line {
          height: 3px; border-radius: 99px;
          background: linear-gradient(90deg, #E8192C, #ff5263);
          width: 0; margin-bottom: 14px;
          transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
        }
        .ob-p1-line-draw { width: 120px; }
        .ob-p1-sub {
          font-size: 14px; font-weight: 500;
          color: #9b4458; letter-spacing: 0.5px;
          margin: 0; opacity: 0;
        }
        .ob-p1-sub.ob-show { animation: ob-rise 0.4s ease 0.2s both; }
        .ob-p1::before {
          content:''; position:absolute; inset:0; z-index:0;
          background:
            radial-gradient(circle at 15% 20%, rgba(232,25,44,0.08) 0%, transparent 50%),
            radial-gradient(circle at 85% 80%, rgba(200,0,26,0.07) 0%, transparent 50%);
        }

        /* PHASE 2 */
        .ob-p2 {
          background: linear-gradient(160deg, #f8fbff 0%, #edf5ff 100%);
          gap: 24px; padding: 32px;
        }
        .ob-p2-map-wrap {
          width: 100%; max-width: 500px;
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          position: relative;
          transition: all 0.5s cubic-bezier(0.34,1.2,0.64,1);
        }
        .ob-p2-map-shrink { transform: scale(0.3); opacity: 0; }
        .ob-p2-map { width: 100%; opacity: 0; transition: opacity 0.5s ease; }
        .ob-p2-map.ob-show { opacity: 1; }
        .ob-p2-logo-over {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          animation: ob-icon-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .ob-p2-text {
          font-size: 16px; font-weight: 700; color: #1a3a5c;
          text-align: center; max-width: 320px;
          margin: 0; opacity: 0; line-height: 1.5;
        }
        .ob-p2-text.ob-show { animation: ob-rise 0.5s ease both; }
        @keyframes ob-dot-pop {
          from { opacity:0; transform:scale(0) }
          to   { opacity:1; transform:scale(1) }
        }
        @keyframes ob-pulse {
          0%,100% { transform:scale(1);   opacity:0.3 }
          50%     { transform:scale(1.5); opacity:0.1 }
        }
        @keyframes ob-line-draw {
          from { opacity:0; stroke-dashoffset: 100 }
          to   { opacity:0.4; stroke-dashoffset: 0 }
        }
        @keyframes ob-move-pkg {
          0%   { opacity:0; transform:translate(0,0) }
          20%  { opacity:1 }
          80%  { opacity:1 }
          100% { opacity:0; transform:translate(-30px, -3px) }
        }

        /* PHASE 3 */
        .ob-p3 { padding: 48px 32px 40px; justify-content: space-between; }
        .ob-p3-content {
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
          flex: 1; justify-content: center; gap: 20px;
        }
        .ob-p3-icon-wrap {
          width: 120px; height: 120px; border-radius: 32px;
          background: white;
          box-shadow: 0 16px 48px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 8px;
        }
        .ob-p3-title {
          font-size: 26px; font-weight: 800; margin: 0;
          letter-spacing: -0.5px; line-height: 1.2;
        }
        .ob-p3-sub {
          font-size: 15px; font-weight: 400; color: #6b7280;
          margin: 0; line-height: 1.6; max-width: 280px;
        }
        @keyframes ob-slide-in-right {
          from { opacity:0; transform:translateX(40px) }
          to   { opacity:1; transform:translateX(0) }
        }
        @keyframes ob-slide-in-left {
          from { opacity:0; transform:translateX(-40px) }
          to   { opacity:1; transform:translateX(0) }
        }
        .ob-p3-dots { display: flex; gap: 8px; align-items: center; margin-bottom: 32px; }
        .ob-p3-dot {
          border: none; cursor: pointer; padding: 0;
          border-radius: 99px;
          transition: all 0.3s cubic-bezier(0.34,1.4,0.64,1);
          width: 8px; height: 8px;
        }
        .ob-p3-dot.active { width: 28px; height: 8px; }
        .ob-p3-nav {
          width: 100%; display: flex;
          justify-content: space-between; align-items: center; gap: 12px;
        }
        .ob-p3-skip {
          border: none; background: transparent; cursor: pointer;
          font-family: 'Sora',sans-serif; font-size: 14px;
          font-weight: 600; color: #9ca3af;
          padding: 14px 20px; border-radius: 14px; transition: color 0.15s;
        }
        .ob-p3-skip:hover { color: #6b7280; }
        .ob-p3-next {
          border: none; cursor: pointer;
          font-family: 'Sora',sans-serif; font-size: 15px;
          font-weight: 700; color: white;
          padding: 14px 28px; border-radius: 16px;
          display: flex; align-items: center; gap: 8px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.18);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .ob-p3-next:active { transform: scale(0.96); }
        .ob-p3-start {
          border: none; cursor: pointer;
          font-family: 'Sora',sans-serif; font-size: 16px;
          font-weight: 700; color: white;
          padding: 16px 0; border-radius: 18px;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%;
          box-shadow: 0 8px 24px rgba(0,0,0,0.20);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .ob-p3-start:active { transform: scale(0.97); }
      `}</style>

      {phase === 1 && <Phase1 onDone={() => setPhase(2)} />}
      {phase === 2 && <Phase2 onDone={() => setPhase(showSlider ? 3 : "done")} />}
      {phase === 3 && <Phase3 onDone={finish} />}
      {/* ✅ DÜZƏLİŞ 3: {phase === "done" && finish()} silindi
          Bu render zamanı finish() çağırırdı → App-ın state-ini render zamanı
          dəyişdirirdi → "Cannot update a component while rendering" xətası
          İndi yuxarıdakı useEffect idarə edir */}
    </>
  )
}

export default SplashScreen