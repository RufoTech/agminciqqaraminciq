import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

/* ─── Brendex Logo (yeni B + araba logo) ─── */
const BrendexLogo = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="wlg1" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ff6b7a"/>
        <stop offset="100%" stopColor="#ff1f3a"/>
      </linearGradient>
    </defs>
    <path d="M6 6 L6 58 L34 58 Q52 58 52 46 Q52 38 42 35 Q50 31 50 22 Q50 6 32 6 Z
             M16 14 L30 14 Q40 14 40 22 Q40 30 30 30 L16 30 Z
             M16 38 L32 38 Q44 38 44 46 Q44 54 32 54 L16 54 Z"
      fill="url(#wlg1)"/>
    <path d="M22 42 L24 28 L46 28 L42 42 Z" fill="white" opacity="0.88"/>
    <line x1="24" y1="35" x2="44" y2="35" stroke="url(#wlg1)" strokeWidth="1.5"/>
    <circle cx="28" cy="46" r="3.5" fill="url(#wlg1)"/>
    <circle cx="28" cy="46" r="1.5" fill="white"/>
    <circle cx="39" cy="46" r="3.5" fill="url(#wlg1)"/>
    <circle cx="39" cy="46" r="1.5" fill="white"/>
  </svg>
)

/* ─── Sosial ikonlar ─── */
const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)
const AppleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
)
const GlobeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)

/* ══════════════════════════════════════════════
   WELCOME COMPONENT
══════════════════════════════════════════════ */
const Welcome = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  // 0: gizli  1: logo pop  2: brand yazısı  3: xətt  4: subtitle  5: düymələr  6: sosial

  useEffect(() => {
    // Splash Phase1 ilə eyni zamanlama
    const t1 = setTimeout(() => setStep(1), 120)   // logo pop
    const t2 = setTimeout(() => setStep(2), 620)   // brand adı
    const t3 = setTimeout(() => setStep(3), 900)   // xətt
    const t4 = setTimeout(() => setStep(4), 1150)  // subtitle
    const t5 = setTimeout(() => setStep(5), 1450)  // düymələr
    const t6 = setTimeout(() => setStep(6), 1750)  // sosial
    return () => [t1,t2,t3,t4,t5,t6].forEach(clearTimeout)
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }

        /* ══ FON — splash Phase1 ilə eyni qırmızı rəng ══ */
        .wl-root {
          min-height: 100dvh;
          background:
            radial-gradient(circle at 18% 18%,  rgba(160,20,15,0.18) 0%, transparent 48%),
            radial-gradient(circle at 82% 88%,  rgba(40,0,5,0.85)    0%, transparent 52%),
            radial-gradient(ellipse at 50% 40%, #6b000d 0%, #280005 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          font-family: 'Sora', sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* Soft ambient glow — splash ilə eyni atmosfer */
        .wl-root::before {
          content:'';
          position: fixed; top:-100px; right:-80px;
          width: 340px; height: 340px; border-radius: 50%;
          background: radial-gradient(circle, rgba(180,40,30,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .wl-root::after {
          content:'';
          position: fixed; bottom:-80px; left:-60px;
          width: 260px; height: 260px; border-radius: 50%;
          background: radial-gradient(circle, rgba(150,0,20,0.28) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ══ TOP SPACER ══ */
        .wl-top { flex: 1; display:flex; align-items:flex-end; padding-bottom: 8px; }

        /* ══ LOGO BÖLMƏSI ══ */
        .wl-center {
          display: flex; flex-direction: column;
          align-items: center;
          flex: 1.6;
          justify-content: center;
          gap: 0;
          position: relative;
        }

        /* Glow ring — splash Phase1 ilə eyni */
        .wl-ring {
          width: 150px; height: 150px; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.12);
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -58%) scale(0.7);
          opacity: 0;
          transition: all 0.72s cubic-bezier(0.34,1.4,0.64,1);
          pointer-events: none;
        }
        .wl-ring.on {
          opacity: 1;
          transform: translate(-50%, -58%) scale(1);
        }

        /* Logo qutusu — splash ob-p1-icon ilə eyni */
        .wl-logo-box {
          width: 96px; height: 96px; border-radius: 27px;
          background: rgba(80,0,10,0.50);
          border: 1px solid rgba(255,255,255,0.18);
          display: flex; align-items:center; justify-content:center;
          margin-bottom: 26px;
          box-shadow:
            0 18px 52px rgba(0,0,0,0.40),
            0 0 0 1px rgba(255,255,255,0.06) inset;
          opacity: 0;
          transform: scale(0.48) translateY(14px);
          transition: opacity 0s, transform 0s;
          cursor: pointer;
        }
        .wl-logo-box.pop {
          animation: wlIconPop 0.62s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes wlIconPop {
          0%   { opacity:0; transform:scale(0.48) translateY(14px) }
          65%  { opacity:1; transform:scale(1.07) translateY(-5px) }
          100% { opacity:1; transform:scale(1)    translateY(0) }
        }
        .wl-logo-box:hover {
          filter: brightness(1.12);
          transform: scale(1.05) translateY(-3px) !important;
        }

        /* Brand adı */
        .wl-brand {
          opacity: 0; text-align: center; margin-bottom: 0;
        }
        .wl-brand.show {
          animation: wlRise 0.44s cubic-bezier(0.34,1.2,0.64,1) both;
        }
        @keyframes wlRise {
          from { opacity:0; transform:translateY(16px) }
          to   { opacity:1; transform:translateY(0) }
        }
        .wl-brand-name {
          font-size: 36px; font-weight: 900; color: white;
          letter-spacing: -1.4px; line-height: 1;
        }

        /* Animated underline — splash Phase1 ilə eyni */
        .wl-line {
          height: 3px; border-radius: 99px;
          background: linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.85));
          width: 0; margin: 12px auto 14px;
          transition: width 0.58s cubic-bezier(0.4,0,0.2,1);
        }
        .wl-line.draw { width: 110px; }

        /* Subtitle */
        .wl-sub {
          font-size: 14px; font-weight: 400;
          color: rgba(255,255,255,0.50);
          letter-spacing: 0.3px; opacity: 0;
        }
        .wl-sub.show {
          animation: wlRise 0.42s ease both;
        }

        /* ══ DÜYMƏLƏR ══ */
        .wl-bottom {
          width: 100%; max-width: 380px;
          display: flex; flex-direction: column;
          padding-bottom: max(28px, env(safe-area-inset-bottom, 28px));
          gap: 0;
          flex: 1.1; justify-content: flex-end;
        }

        .wl-btns {
          display: flex; flex-direction: column; gap: 12px;
          margin-bottom: 28px;
          opacity: 0;
        }
        .wl-btns.show {
          animation: wlRise 0.46s cubic-bezier(0.34,1.2,0.64,1) both;
        }

        .wl-btn-reg {
          width:100%; padding: 18px;
          border-radius: 99px; border: none;
          background: linear-gradient(135deg, #ff4f5e 0%, #e8182b 100%);
          color: white; font-size: 16px; font-weight: 700;
          font-family: 'Sora', sans-serif; cursor: pointer;
          letter-spacing: -0.2px;
          box-shadow: 0 10px 32px rgba(232,24,43,0.55);
          transition: transform 0.20s cubic-bezier(0.34,1.4,0.64,1),
                      box-shadow 0.20s ease;
        }
        .wl-btn-reg:hover  { transform:translateY(-3px) scale(1.01); box-shadow:0 16px 40px rgba(232,24,43,0.65); }
        .wl-btn-reg:active { transform:scale(0.97); }

        .wl-btn-login {
          width:100%; padding: 17px;
          border-radius: 99px;
          border: 1.5px solid rgba(255,255,255,0.28);
          background: rgba(255,255,255,0.08);
          color: white; font-size: 16px; font-weight: 600;
          font-family: 'Sora', sans-serif; cursor: pointer;
          backdrop-filter: blur(12px);
          transition: transform 0.20s cubic-bezier(0.34,1.4,0.64,1),
                      background 0.18s, border-color 0.18s;
        }
        .wl-btn-login:hover  { background:rgba(255,255,255,0.15); border-color:rgba(255,255,255,0.46); transform:translateY(-3px) scale(1.01); }
        .wl-btn-login:active { transform:scale(0.97); }

        /* ── Divider ── */
        .wl-divider {
          display:flex; align-items:center; gap:14px;
          margin-bottom: 18px;
          opacity: 0;
        }
        .wl-divider.show {
          animation: wlRise 0.44s ease both;
        }
        .wl-div-line { flex:1; height:1px; background:rgba(255,255,255,0.14); }
        .wl-div-txt  { font-size:11.5px; color:rgba(255,255,255,0.38); font-weight:500; white-space:nowrap; }

        /* ── Sosial düymələr ── */
        .wl-social {
          display:flex; justify-content:center; gap:14px;
          margin-bottom: 22px;
          opacity: 0;
        }
        .wl-social.show {
          animation: wlRise 0.44s ease both;
        }
        .wl-soc {
          width: 56px; height: 56px; border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.09);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; backdrop-filter:blur(10px);
          transition: transform 0.18s cubic-bezier(0.34,1.4,0.64,1),
                      background 0.18s, box-shadow 0.18s;
        }
        .wl-soc:hover {
          background:rgba(255,255,255,0.17);
          transform:translateY(-4px) scale(1.06);
          box-shadow: 0 10px 28px rgba(0,0,0,0.22);
        }
        .wl-soc:active { transform:scale(0.92); }

        /* ── Terms ── */
        .wl-terms {
          font-size: 11px; color:rgba(255,255,255,0.28);
          text-align: center; line-height: 1.7;
          opacity: 0;
        }
        .wl-terms.show { animation: wlRise 0.44s ease both; }
        .wl-terms a { color:rgba(255,255,255,0.50); text-decoration:underline; text-underline-offset:2px; }

        @media(max-width:380px) {
          .wl-brand-name { font-size:30px; }
          .wl-logo-box   { width:82px; height:82px; }
          .wl-btn-reg, .wl-btn-login { font-size:15px; padding:16px; }
        }
        @media(max-height:680px) {
          .wl-center { flex:1.2; }
          .wl-logo-box { width:80px; height:80px; }
          .wl-brand-name { font-size:30px; }
        }
      `}</style>

      <div className="wl-root">

        {/* ─── TOP (boş məkan) ─── */}
        <div className="wl-top" />

        {/* ─── LOGO + BRAND ─── */}
        <div className="wl-center">

          {/* Glow ring */}
          <div className={`wl-ring ${step >= 2 ? "on" : ""}`} />

          {/* Logo qutusu */}
          <div className={`wl-logo-box ${step >= 1 ? "pop" : ""}`}>
            <BrendexLogo size={58} />
          </div>

          {/* Brand adı */}
          <div className={`wl-brand ${step >= 2 ? "show" : ""}`}>
            <div className="wl-brand-name">Brendex</div>
          </div>

          {/* Animated underline */}
          <div className={`wl-line ${step >= 3 ? "draw" : ""}`} />

          {/* Subtitle */}
          <p className={`wl-sub ${step >= 4 ? "show" : ""}`}>
            Keyfiyyətli Alış-veriş
          </p>
        </div>

        {/* ─── ALT BÖLMƏ ─── */}
        <div className="wl-bottom">

          {/* Əsas düymələr */}
          <div className={`wl-btns ${step >= 5 ? "show" : ""}`}>
            <button className="wl-btn-reg"   onClick={() => navigate("/register")}>
              Qeydiyyat
            </button>
            <button className="wl-btn-login" onClick={() => navigate("/login")}>
              Daxil ol
            </button>
          </div>

          {/* Divider */}
          <div className={`wl-divider ${step >= 6 ? "show" : ""}`}>
            <div className="wl-div-line"/>
            <span className="wl-div-txt">Digər hesablarla davam et</span>
            <div className="wl-div-line"/>
          </div>

          {/* Sosial düymələr */}
          <div className={`wl-social ${step >= 6 ? "show" : ""}`}>
            <button className="wl-soc" title="Veb"><GlobeIcon /></button>
            <button className="wl-soc" title="Apple"><AppleIcon /></button>
            <button className="wl-soc" title="Google"><GoogleIcon /></button>
          </div>

          {/* Terms */}
          <p className={`wl-terms ${step >= 6 ? "show" : ""}`}>
            Davam etməklə Brendex-in{" "}
            <a href="#">Şərtlər və Qaydaları</a> ilə razılaşırsınız.
          </p>

        </div>
      </div>
    </>
  )
}

export default Welcome