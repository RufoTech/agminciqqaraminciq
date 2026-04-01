import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLoginMutation } from '../redux/api/authApi'
import { useSelector } from 'react-redux'
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, User, Store,
  CheckCircle, Copy, ExternalLink, LayoutDashboard, Package,
  ShoppingBag, Settings, TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user',
  })
  const [showPassword, setShowPassword] = useState(false)
  // Admin login-dən sonra göstəriləcək mağaza məlumatları
  const [adminData, setAdminData] = useState(null)

  const navigate = useNavigate()
  const [login, { isLoading }] = useLoginMutation()
  const { isAuthenticated } = useSelector((state) => state.userSlice)

  useEffect(() => {
    if (isAuthenticated && !adminData) navigate('/home')
  }, [isAuthenticated, navigate, adminData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (role) => {
    setFormData(prev => ({ ...prev, role }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
        role: formData.role
      }).unwrap()

      toast.success('Xoş gəldiniz! Giriş uğurludur.')

      // Admin ise mağaza ekranı göstər, deyilse /home-a yönləndir
      if (formData.role === 'admin') {
        const storeSlug = result?.storeSlug || result?.store?.slug || result?.user?.storeSlug
        const storeName = result?.storeName || result?.store?.name || result?.user?.storeName || 'Mağazanız'
        setAdminData({
          storeName,
          storeLink: storeSlug
            ? `${window.location.origin}/store/${storeSlug}`
            : null,
          storeSlug,
        })
      } else {
        navigate('/home')
      }
    } catch (err) {
      toast.error(err?.data?.message || 'E-poçt və ya şifrə yanlışdır')
    }
  }

  const isAdmin = formData.role === 'admin'

  // ══════════════════════════════════════════════
  // ── ADMİN GİRİŞ SONRASI EKRAN ──
  // ══════════════════════════════════════════════
  if (adminData) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
          .ap-page {
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
            background: #fff; font-family: 'DM Sans', sans-serif; padding: 24px;
          }
          .ap-card {
            background: #fff; border-radius: 24px; padding: 44px 40px;
            max-width: 580px; width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.08);
            border: 1.5px solid #f0f0f0;
          }
          .ap-header { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
          .ap-icon-wrap {
            width: 64px; height: 64px; background: #fff0f1; border-radius: 18px;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          }
          .ap-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #111; margin: 0 0 4px; }
          .ap-sub { font-size: 13px; color: #888; margin: 0; }

          .ap-link-box {
            background: #fafafa; border: 1.5px solid #eee; border-radius: 14px;
            padding: 14px 18px; display: flex; align-items: center;
            justify-content: space-between; gap: 12px; margin-bottom: 20px;
          }
          .ap-link-url { font-size: 13px; color: #E8192C; font-weight: 600; word-break: break-all; flex: 1; }
          .ap-copy-btn {
            background: #E8192C; border: none; border-radius: 9px;
            width: 36px; height: 36px; display: flex; align-items: center;
            justify-content: center; cursor: pointer; flex-shrink: 0; transition: background 0.2s;
          }
          .ap-copy-btn:hover { background: #c8111f; }

          .ap-divider { height: 1px; background: #f0f0f0; margin: 20px 0; }
          .ap-section-title { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: #bbb; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }

          .ap-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
          @media (max-width: 480px) { .ap-actions { grid-template-columns: 1fr; } }

          .ap-action-btn {
            background: #fafafa; border: 1.5px solid #eee; border-radius: 14px;
            padding: 16px 18px; cursor: pointer; text-align: left; transition: all 0.2s;
            display: flex; align-items: center; gap: 12px; text-decoration: none; color: inherit;
          }
          .ap-action-btn:hover { border-color: #E8192C; background: #fff8f8; transform: translateY(-1px); }
          .ap-action-icon {
            width: 38px; height: 38px; background: #fff0f1; border-radius: 10px;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          }
          .ap-action-label { font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700; color: #111; margin-bottom: 2px; }
          .ap-action-desc { font-size: 11px; color: #999; }

          .ap-open-btn {
            width: 100%; padding: 14px; background: #E8192C; color: #fff;
            border: none; border-radius: 13px; font-family: 'Syne', sans-serif;
            font-size: 15px; font-weight: 700; cursor: pointer;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            margin-bottom: 10px; transition: background 0.2s, transform 0.15s;
            box-shadow: 0 4px 16px rgba(232,25,44,0.25); text-decoration: none;
          }
          .ap-open-btn:hover { background: #c8111f; transform: translateY(-1px); }

          .ap-secondary-btn {
            width: 100%; padding: 13px; background: transparent; color: #555;
            border: 1.5px solid #eee; border-radius: 13px; font-family: 'Syne', sans-serif;
            font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;
            display: flex; align-items: center; justify-content: center; gap: 8px;
          }
          .ap-secondary-btn:hover { border-color: #E8192C; color: #E8192C; }

          .ap-note { font-size: 11.5px; color: #bbb; margin-top: 16px; line-height: 1.6; text-align: center; }
        `}</style>

        <div className="ap-page">
          <div className="ap-card">
            {/* Header */}
            <div className="ap-header">
              <div className="ap-icon-wrap">
                <Store size={30} color="#E8192C" />
              </div>
              <div>
                <h2 className="ap-title">Xoş gəldiniz, {adminData.storeName}! 🎉</h2>
                <p className="ap-sub">Admin panelinizə uğurla daxil oldunuz</p>
              </div>
            </div>

            {/* Mağaza linki */}
            {adminData.storeLink && (
              <>
                <p className="ap-section-title">Mağaza Linkiniz</p>
                <div className="ap-link-box">
                  <span className="ap-link-url">{adminData.storeLink}</span>
                  <button
                    className="ap-copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(adminData.storeLink)
                      toast.success('Link kopyalandı!')
                    }}
                    title="Kopyala"
                  >
                    <Copy size={14} color="#fff" />
                  </button>
                </div>
              </>
            )}

            <div className="ap-divider" />

            {/* Admin funksiyaları */}
            <p className="ap-section-title">Admin Funksiyaları</p>
            <div className="ap-actions">
              <Link to="/admin/dashboard" className="ap-action-btn">
                <div className="ap-action-icon"><LayoutDashboard size={18} color="#E8192C" /></div>
                <div>
                  <div className="ap-action-label">Dashboard</div>
                  <div className="ap-action-desc">Ümumi statistika</div>
                </div>
              </Link>
              <Link to="/admin/products" className="ap-action-btn">
                <div className="ap-action-icon"><Package size={18} color="#E8192C" /></div>
                <div>
                  <div className="ap-action-label">Məhsullar</div>
                  <div className="ap-action-desc">Məhsul idarəetməsi</div>
                </div>
              </Link>
              <Link to="/admin/orders" className="ap-action-btn">
                <div className="ap-action-icon"><ShoppingBag size={18} color="#E8192C" /></div>
                <div>
                  <div className="ap-action-label">Sifarişlər</div>
                  <div className="ap-action-desc">Sifariş izləmə</div>
                </div>
              </Link>
              <Link to="/admin/settings" className="ap-action-btn">
                <div className="ap-action-icon"><Settings size={18} color="#E8192C" /></div>
                <div>
                  <div className="ap-action-label">Parametrlər</div>
                  <div className="ap-action-desc">Mağaza tənzimləmələri</div>
                </div>
              </Link>
            </div>

            {/* Butmalar */}
            {adminData.storeLink && (
              <a href={adminData.storeLink} target="_blank" rel="noreferrer" className="ap-open-btn">
                <ExternalLink size={15} /> Mağazamı Aç
              </a>
            )}

            <button
              className="ap-secondary-btn"
              onClick={() => navigate('/admin/dashboard')}
            >
              <LayoutDashboard size={16} /> Admin Panelinə Keç
            </button>

            {adminData.storeLink && (
              <p className="ap-note">
                ⚠️ Mağaza linkinizi yadda saxlayın:<br />
                <strong style={{ color: '#E8192C' }}>{adminData.storeLink}</strong>
              </p>
            )}
          </div>
        </div>
      </>
    )
  }

  // ══════════════════════════════════════════════
  // ── GİRİŞ FORMU ──
  // ══════════════════════════════════════════════
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .auth-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #fff;
        }

        .auth-left {
          flex: 0 0 520px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 52px;
          background: #fff;
          z-index: 2;
        }

        @media (max-width: 640px) {
          .auth-left {
            flex: 1;
            padding: 32px 20px 40px;
            justify-content: flex-start;
            padding-top: 40px;
          }
          .auth-root { flex-direction: column; }
        }

        @media (min-width: 641px) and (max-width: 1023px) {
          .auth-left { flex: 1; padding: 40px 40px; }
        }

        .auth-logo {
          display: inline-flex; align-items: center; gap: 10px;
          margin-bottom: 32px; text-decoration: none;
        }
        .auth-logo-icon {
          width: 42px; height: 42px; background: #E8192C; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: #fff;
          box-shadow: 0 4px 14px rgba(232,25,44,0.3);
        }
        .auth-logo-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: #111; }
        .auth-logo-name span { color: #E8192C; }

        .auth-heading { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; color: #111; margin-bottom: 8px; }
        @media (max-width: 640px) { .auth-heading { font-size: 22px; } }
        .auth-sub { font-size: 14px; color: #888; margin-bottom: 28px; }

        .role-toggle { display: flex; background: #f4f4f4; border-radius: 12px; padding: 4px; margin-bottom: 24px; gap: 4px; }
        .role-btn {
          flex: 1; padding: 11px; border: none; border-radius: 9px;
          font-family: 'Syne', sans-serif; font-size: 13px; font-weight: 700;
          cursor: pointer; background: transparent; color: #888;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all 0.25s ease;
        }
        .role-btn.active { background: #fff; color: #E8192C; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }

        .auth-form { display: flex; flex-direction: column; gap: 18px; }
        .auth-label { font-size: 13px; font-weight: 600; color: #444; margin-bottom: 6px; display: block; }

        .auth-input-wrap { position: relative; }
        .auth-input-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: #bbb; width: 18px; height: 18px; pointer-events: none;
        }
        .auth-input {
          width: 100%; padding: 14px 14px 14px 44px;
          border: 1.5px solid #eee; border-radius: 14px;
          background: #fafafa; font-size: max(16px, 14px); outline: none; transition: 0.2s;
          box-sizing: border-box;
        }
        .auth-input:focus { border-color: #E8192C; background: #fff; box-shadow: 0 0 0 4px rgba(232,25,44,0.05); }

        .auth-eye-btn {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #bbb; padding: 8px;
        }

        .forgot-link { text-align: right; margin-top: -10px; }
        .forgot-link a { font-size: 13px; color: #888; text-decoration: none; font-weight: 500; }
        .forgot-link a:hover { color: #E8192C; }

        /* Admin seçiləndə kiçik info banner */
        .admin-info-banner {
          background: #fff8f8; border: 1.5px dashed #f0c0c5; border-radius: 12px;
          padding: 12px 16px; display: flex; align-items: center; gap: 10px;
          font-size: 13px; color: #c0343f; animation: fadeInBanner 0.3s ease;
        }
        @keyframes fadeInBanner { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

        .auth-btn {
          width: 100%; padding: 15px; background: #E8192C; color: #fff;
          border: none; border-radius: 14px; font-family: 'Syne', sans-serif;
          font-size: 16px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 4px 16px rgba(232,25,44,0.2); transition: 0.2s;
          min-height: 52px;
        }
        .auth-btn:hover:not(:disabled) { background: #c8111f; transform: translateY(-1px); }
        .auth-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .auth-right { flex: 1; position: relative; overflow: hidden; background: #0f0606; display: none; }
        @media (min-width: 1024px) { .auth-right { display: block; } }
        .auth-right-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, #E8192C 0%, #7a0010 60%, #1a0003 100%);
          opacity: 0.92; z-index: 1;
        }
        .auth-right-content {
          position: absolute; inset: 0; z-index: 2;
          display: flex; flex-direction: column; justify-content: center;
          padding: 80px; color: #fff;
        }
        .auth-right-title { font-family: 'Syne', sans-serif; font-size: 42px; font-weight: 800; line-height: 1.1; margin-bottom: 24px; }

        .auth-right-features { display: flex; flex-direction: column; gap: 14px; margin-top: 8px; }
        .auth-right-feature { display: flex; align-items: center; gap: 12px; color: rgba(255,255,255,0.9); font-size: 15px; }

        .auth-footer-link { text-align: center; margin-top: 20px; font-size: 14px; color: #888; }
      `}</style>

      <div className="auth-root">
        {/* LEFT PANEL */}
        <div className="auth-left">
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon">B</div>
            <span className="auth-logo-name">Brend<span>ex</span></span>
          </Link>

          <h2 className="auth-heading">Xoş gəldiniz! 👋</h2>
          <p className="auth-sub">Davam etmək üçün hesabınıza daxil olun.</p>

          {/* Role Toggle */}
          <div className="role-toggle">
            <button type="button" className={`role-btn ${!isAdmin ? 'active' : ''}`} onClick={() => handleRoleChange('user')}>
              <User size={16} /> Alıcı
            </button>
            <button type="button" className={`role-btn ${isAdmin ? 'active' : ''}`} onClick={() => handleRoleChange('admin')}>
              <Store size={16} /> Satıcı
            </button>
          </div>

          {/* Admin seçiləndə kiçik info banner */}
          {isAdmin && (
            <div className="admin-info-banner" style={{ marginBottom: '18px' }}>
              <Store size={16} color="#E8192C" style={{ flexShrink: 0 }} />
              <span>Satıcı hesabına daxil olursunuz. Giriş etdikdən sonra mağaza panelinizə yönləndiriləcəksiniz.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <label className="auth-label">E-poçt ünvanı</label>
              <div className="auth-input-wrap">
                <Mail className="auth-input-icon" />
                <input
                  type="email" name="email" value={formData.email}
                  onChange={handleChange} required className="auth-input"
                  placeholder="nümunə@mail.com" autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="auth-label">Şifrə</label>
              <div className="auth-input-wrap">
                <Lock className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange} required
                  className="auth-input" placeholder="••••••••" autoComplete="current-password"
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="forgot-link">
              <Link to="/forgot-password">Şifrənizi unutmusunuz?</Link>
            </div>

            <button type="submit" disabled={isLoading} className="auth-btn">
              {isLoading ? (
                <><Loader2 size={20} className="animate-spin" /> Daxil olunur...</>
              ) : (
                <>{isAdmin ? 'Admin Girişi' : 'Daxil Ol'} <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="auth-footer-link">
            Hesabınız yoxdur?{' '}
            <Link to="/register" style={{ color: '#E8192C', fontWeight: '700', textDecoration: 'none' }}>
              Qeydiyyatdan keçin
            </Link>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="auth-right">
          <div className="auth-right-overlay" />
          <div className="auth-right-content">
            <p style={{ textTransform: 'uppercase', letterSpacing: '3px', fontSize: '12px', opacity: 0.7, marginBottom: '20px' }}>
              Brendex Ecosystem
            </p>
            <h3 className="auth-right-title">
              {isAdmin ? 'Mağazanızı idarə etməyə hazır olun.' : 'Alış-verişin ən kəşf olunmamış yolu.'}
            </h3>
            <div style={{ width: '50px', height: '4px', background: '#fff', borderRadius: '2px', marginBottom: '32px' }} />
            <div className="auth-right-features">
              {isAdmin ? (
                <>
                  <div className="auth-right-feature"><CheckCircle size={18} /><span>Mağazanızı real vaxtda idarə edin</span></div>
                  <div className="auth-right-feature"><CheckCircle size={18} /><span>Satış statistikasını izləyin</span></div>
                  <div className="auth-right-feature"><CheckCircle size={18} /><span>Sifarişləri asanlıqla emal edin</span></div>
                </>
              ) : (
                <>
                  <div className="auth-right-feature"><CheckCircle size={18} /><span>Təhlükəsiz giriş sistemi</span></div>
                  <div className="auth-right-feature"><CheckCircle size={18} /><span>Fərdi təkliflər və kampaniyalar</span></div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login