// src/pages/NotificationsPage.jsx
// Navbardakı zəng ikonuna basanda açılan tam bildiriş səhifəsi.
// Bildirişlər bazadan çəkilir, tıklananda detal panel açılır — silinmir.

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../slices/notificationSlice"

/* ── Rəng sabitleri ───────────────────────────────────────────── */
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

/* ── Bildiriş növü konfiqurasiyası ───────────────────────────── */
const TYPE_CFG = {
  order_status:      { emoji:"📦", bg:"#e0f2fe", color:"#0369a1", label:"Sifariş Statusu"   },
  new_order:         { emoji:"🛒", bg:C.rose50,  color:C.primary,  label:"Yeni Sifariş"      },
  low_stock:         { emoji:"⚠️", bg:"#fef9c3", color:"#854d0e", label:"Az Stok"            },
  out_of_stock:      { emoji:"❌", bg:"#fee2e2", color:"#b91c1c", label:"Stok Bitti"         },
  cart_added:        { emoji:"🛍️", bg:"#d1fae5", color:"#065f46", label:"Səbətə Əlavə"      },
  favorite_price:    { emoji:"🎉", bg:C.rose50,  color:C.primary,  label:"Qiymət Dəyişdi"   },
  commission_earned: { emoji:"💵", bg:"#d1fae5", color:"#065f46", label:"Komissiya"          },
  new_user:          { emoji:"👤", bg:"#ede9fe", color:"#6d28d9", label:"Yeni İstifadəçi"    },
}

const TABS = [
  { key:"all",   label:"Hamısı"       },
  { key:"order", label:"📦 Sifarişlər" },
  { key:"promo", label:"🎉 Endirimlər" },
  { key:"stock", label:"⚠️ Stok"       },
  { key:"other", label:"Digər"        },
]

const TAB_TYPES = {
  order: ["order_status","new_order"],
  promo: ["favorite_price","cart_added"],
  stock: ["low_stock","out_of_stock"],
  other: ["commission_earned","new_user"],
}

/* ── Vaxt formatı ─────────────────────────────────────────────── */
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff/60000)
  const h = Math.floor(diff/3600000)
  const d = Math.floor(diff/86400000)
  if (m < 1)  return "İndi"
  if (m < 60) return `${m} dəqiqə əvvəl`
  if (h < 24) return `${h} saat əvvəl`
  if (d < 7)  return `${d} gün əvvəl`
  return new Date(dateStr).toLocaleDateString("az-AZ", { day:"numeric", month:"long", year:"numeric" })
}

/* ── STATUS BADGE ─────────────────────────────────────────────── */
const statusColors = {
  pending:    { bg:"#fef9c3", color:"#854d0e", label:"Gözlənilir" },
  processing: { bg:"#e0f2fe", color:"#0369a1", label:"Hazırlanır" },
  shipped:    { bg:"#ede9fe", color:"#6d28d9", label:"Göndərildi" },
  delivered:  { bg:"#d1fae5", color:"#065f46", label:"Çatdırıldı" },
}

export default function NotificationsPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { items, unreadCount, loading } = useSelector(s => s.notifications)

  const [activeTab,    setActiveTab]    = useState("all")
  const [selectedNotif, setSelectedNotif] = useState(null)  // detal panel üçün
  const [deleteConfirm, setDeleteConfirm] = useState(null)  // silmə təsdiqi üçün

  // Səhifə yüklənəndə bildirişləri bazadan çək
  useEffect(() => {
    dispatch(fetchNotifications())
    window.scrollTo(0, 0)
  }, [dispatch])

  // Tab filtri
  const filtered = activeTab === "all"
    ? items
    : items.filter(n => (TAB_TYPES[activeTab] || []).includes(n.type))

  const tabCount = (tab) => tab === "all"
    ? items.filter(n => !n.isRead).length
    : items.filter(n => !n.isRead && (TAB_TYPES[tab] || []).includes(n.type)).length

  // Bildirişə bas → oxunmuş et + detal aç (silmə!)
  const handleItemClick = (n) => {
    if (!n.isRead) dispatch(markNotificationRead(n._id))
    setSelectedNotif(n)
  }

  const handleDelete = (id) => {
    dispatch(deleteNotification(id))
    if (selectedNotif?._id === id) setSelectedNotif(null)
    setDeleteConfirm(null)
  }

  const handleDeleteAll = () => {
    dispatch(deleteAllNotifications())
    setSelectedNotif(null)
    setDeleteConfirm(null)
  }

  const cfg = (type) => TYPE_CFG[type] || { emoji:"🔔", bg:"#f3f4f6", color:C.mid, label:"Bildiriş" }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing:border-box; }

        .np-root {
          min-height:100vh;
          background:#f8f9fa;
          font-family:'Sora',sans-serif;
          padding-bottom:60px;
        }

        /* ── Header ── */
        .np-header {
          background:#fff;
          border-bottom:1px solid #f3f4f6;
          position:sticky;
          top:0;
          z-index:50;
          box-shadow:0 2px 16px rgba(0,0,0,0.05);
        }
        .np-header-inner {
          max-width:1100px;
          margin:0 auto;
          padding:0 24px;
          height:64px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:16px;
        }
        .np-back {
          width:38px;height:38px;border-radius:12px;
          border:none;background:#f3f4f6;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;transition:all .15s;flex-shrink:0;
        }
        .np-back:hover { background:${C.rose100};color:${C.primary}; }
        .np-header-title {
          font-size:17px;font-weight:900;color:${C.dark};
          display:flex;align-items:center;gap:10px;
        }
        .np-unread-badge {
          background:${C.primary};color:#fff;
          font-size:10px;font-weight:800;
          padding:2px 9px;border-radius:99px;
        }
        .np-header-actions {
          display:flex;align-items:center;gap:8px;
        }
        .np-btn-ghost {
          font-size:12px;font-weight:700;
          color:${C.primary};background:none;
          border:1.5px solid ${C.rose100};
          cursor:pointer;font-family:'Sora',sans-serif;
          padding:7px 14px;border-radius:10px;
          transition:all .15s;
        }
        .np-btn-ghost:hover { background:${C.rose50}; }
        .np-btn-danger {
          font-size:12px;font-weight:700;
          color:#ef4444;background:none;
          border:1.5px solid #fecaca;
          cursor:pointer;font-family:'Sora',sans-serif;
          padding:7px 14px;border-radius:10px;
          transition:all .15s;
        }
        .np-btn-danger:hover { background:#fee2e2; }

        /* ── Tabs ── */
        .np-tabs {
          display:flex;gap:0;
          overflow-x:auto;
          scrollbar-width:none;
          padding:0 24px;
          border-bottom:1px solid #f3f4f6;
          background:#fff;
        }
        .np-tabs::-webkit-scrollbar { display:none; }
        .np-tab {
          flex-shrink:0;padding:12px 16px;
          font-size:13px;font-weight:600;
          color:${C.mid};background:none;border:none;
          cursor:pointer;border-bottom:2.5px solid transparent;
          transition:all .15s;font-family:'Sora',sans-serif;
          display:flex;align-items:center;gap:6px;
          white-space:nowrap;
        }
        .np-tab.on { color:${C.primary};border-bottom-color:${C.primary}; }
        .np-tab-count {
          min-width:18px;height:18px;
          border-radius:99px;
          background:${C.primary};color:#fff;
          font-size:9px;font-weight:800;
          display:flex;align-items:center;justify-content:center;
          padding:0 4px;
        }

        /* ── Body layout ── */
        .np-body {
          max-width:1100px;
          margin:0 auto;
          padding:24px;
          display:grid;
          grid-template-columns:1fr 400px;
          gap:20px;
          align-items:start;
        }
        @media(max-width:860px) {
          .np-body { grid-template-columns:1fr; }
          .np-detail { display:none; }
          .np-detail.show { display:flex !important; position:fixed;inset:0;z-index:200;overflow-y:auto; }
        }

        /* ── Bildiriş siyahısı ── */
        .np-list {
          background:#fff;
          border-radius:18px;
          border:1.5px solid #f3f4f6;
          overflow:hidden;
          box-shadow:0 2px 12px rgba(0,0,0,0.04);
        }
        .np-item {
          display:flex;align-items:flex-start;gap:12px;
          padding:14px 18px;cursor:pointer;
          transition:background .12s;
          border-bottom:1px solid #f9fafb;
          border-left:3px solid transparent;
          position:relative;
        }
        .np-item:last-child { border-bottom:none; }
        .np-item:hover { background:#fafafa; }
        .np-item.unread {
          background:${C.rose50};
          border-left-color:${C.primary};
        }
        .np-item.selected {
          background:#fff0f1;
          border-left-color:${C.primary};
        }
        .np-item-icon {
          width:48px;height:48px;border-radius:13px;
          display:flex;align-items:center;justify-content:center;
          font-size:20px;flex-shrink:0;
        }
        .np-item-img {
          width:48px;height:48px;border-radius:13px;
          object-fit:cover;flex-shrink:0;
          border:1.5px solid #f3f4f6;
        }
        .np-item-body { flex:1;min-width:0; }
        .np-item-title {
          font-size:13px;font-weight:700;color:${C.dark};
          margin:0 0 3px;line-height:1.4;
          overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        }
        .np-item-title.read { font-weight:500; }
        .np-item-msg {
          font-size:12px;color:${C.mid};
          margin:0 0 5px;line-height:1.45;
          display:-webkit-box;-webkit-line-clamp:2;
          -webkit-box-orient:vertical;overflow:hidden;
        }
        .np-item-time { font-size:10px;color:${C.light}; }
        .np-item-right {
          display:flex;flex-direction:column;
          align-items:flex-end;gap:5px;flex-shrink:0;
        }
        .np-item-dot {
          width:8px;height:8px;border-radius:50%;
          background:${C.primary};
        }
        .np-item-del {
          width:26px;height:26px;border-radius:7px;
          border:none;background:none;cursor:pointer;
          color:${C.light};font-size:12px;
          display:flex;align-items:center;justify-content:center;
          transition:all .12s;opacity:0;
        }
        .np-item:hover .np-item-del { opacity:1; }
        .np-item-del:hover { color:${C.primary};background:${C.rose50}; }

        /* ── Boş hal ── */
        .np-empty {
          display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          padding:60px 20px;gap:12px;
        }
        .np-empty-emoji { font-size:52px;opacity:.3; }
        .np-empty-txt { font-size:15px;color:${C.mid};font-weight:600; }

        /* ── Loading ── */
        .np-loading {
          display:flex;align-items:center;justify-content:center;
          padding:60px;
        }
        @keyframes np-spin { to{transform:rotate(360deg)} }
        .np-spinner {
          width:32px;height:32px;
          border:3px solid ${C.rose200};
          border-top-color:${C.primary};
          border-radius:50%;
          animation:np-spin .7s linear infinite;
        }

        /* ── Detal panel ── */
        .np-detail {
          background:#fff;border-radius:18px;
          border:1.5px solid #f3f4f6;
          box-shadow:0 2px 12px rgba(0,0,0,0.04);
          position:sticky;top:90px;
          display:flex;flex-direction:column;
          overflow:hidden;
          max-height:calc(100vh - 110px);
        }
        .np-detail-empty {
          display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          height:320px;gap:14px;
          color:${C.light};
        }
        .np-detail-empty-emoji { font-size:44px;opacity:.3; }
        .np-detail-empty-txt { font-size:14px;font-weight:600; }

        .np-detail-head {
          padding:20px 22px 16px;
          border-bottom:1px solid #f3f4f6;
          flex-shrink:0;
          background:linear-gradient(135deg,${C.rose50} 0%,#fff 100%);
        }
        .np-detail-type {
          display:inline-flex;align-items:center;gap:6px;
          font-size:11px;font-weight:700;
          padding:3px 10px;border-radius:99px;
          margin-bottom:10px;
        }
        .np-detail-title {
          font-size:17px;font-weight:900;color:${C.dark};
          margin:0 0 6px;line-height:1.35;
        }
        .np-detail-time {
          font-size:11px;color:${C.light};
        }

        .np-detail-body {
          flex:1;overflow-y:auto;padding:20px 22px;
        }
        .np-detail-body::-webkit-scrollbar { width:3px; }
        .np-detail-body::-webkit-scrollbar-thumb { background:${C.rose200};border-radius:4px; }

        .np-detail-img {
          width:100%;height:200px;object-fit:cover;
          border-radius:14px;margin-bottom:18px;
          border:1.5px solid #f3f4f6;
        }
        .np-detail-msg {
          font-size:14px;color:${C.dark};line-height:1.7;
          margin:0 0 20px;
        }

        /* Məlumat sətirləri */
        .np-info-row {
          display:flex;align-items:center;justify-content:space-between;
          padding:11px 14px;border-radius:12px;
          background:#f9fafb;margin-bottom:8px;
          font-family:'Sora',sans-serif;
        }
        .np-info-label {
          font-size:11px;font-weight:700;color:${C.light};
          text-transform:uppercase;letter-spacing:0.6px;
        }
        .np-info-value {
          font-size:13px;font-weight:700;color:${C.dark};
        }
        .np-price-new {
          font-size:16px;font-weight:900;color:${C.primary};
        }
        .np-price-old {
          font-size:12px;color:${C.light};
          text-decoration:line-through;
          margin-left:6px;
        }

        /* CTA düymələri */
        .np-detail-foot {
          padding:14px 22px;border-top:1px solid #f3f4f6;
          display:flex;align-items:center;gap:10px;
          flex-shrink:0;
        }
        .np-btn-primary {
          flex:1;padding:11px;border-radius:12px;
          border:none;
          background:linear-gradient(135deg,${C.primarySoft},${C.primary});
          color:#fff;font-size:13px;font-weight:700;
          cursor:pointer;font-family:'Sora',sans-serif;
          transition:all .15s;
          box-shadow:0 4px 14px rgba(232,25,44,0.25);
        }
        .np-btn-primary:hover {
          transform:translateY(-1px);
          box-shadow:0 6px 20px rgba(232,25,44,0.32);
        }
        .np-btn-outline-del {
          padding:11px 14px;border-radius:12px;
          border:1.5px solid #fecaca;
          background:none;color:#ef4444;
          font-size:12px;font-weight:700;
          cursor:pointer;font-family:'Sora',sans-serif;
          transition:all .15s;
        }
        .np-btn-outline-del:hover { background:#fee2e2; }

        /* Mobil detal bağla düyməsi */
        .np-detail-close-mob {
          display:none;
          position:absolute;top:14px;right:14px;
          width:34px;height:34px;border-radius:10px;
          border:none;background:#f3f4f6;
          align-items:center;justify-content:center;
          cursor:pointer;font-size:16px;
          transition:background .12s;
        }
        @media(max-width:860px) {
          .np-detail.show .np-detail-close-mob { display:flex; }
        }

        /* Silmə təsdiq dialogu */
        .np-confirm-overlay {
          position:fixed;inset:0;
          background:rgba(0,0,0,0.45);
          backdrop-filter:blur(4px);
          z-index:300;
          display:flex;align-items:center;justify-content:center;
          animation:np-fd .15s ease;
        }
        @keyframes np-fd { from{opacity:0} to{opacity:1} }
        .np-confirm-box {
          background:#fff;border-radius:20px;
          padding:28px 28px 22px;
          max-width:340px;width:90%;
          box-shadow:0 20px 60px rgba(0,0,0,0.18);
          animation:np-pop .2s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes np-pop {
          from{transform:scale(.88);opacity:0}
          to{transform:scale(1);opacity:1}
        }
        .np-confirm-title {
          font-size:16px;font-weight:900;color:${C.dark};
          margin:0 0 8px;font-family:'Sora',sans-serif;
        }
        .np-confirm-txt {
          font-size:13px;color:${C.mid};
          margin:0 0 20px;line-height:1.5;
          font-family:'Sora',sans-serif;
        }
        .np-confirm-btns {
          display:flex;gap:10px;
        }
        .np-confirm-cancel {
          flex:1;padding:11px;border-radius:12px;
          border:1.5px solid #e5e7eb;background:#fff;
          color:${C.mid};font-size:13px;font-weight:700;
          cursor:pointer;font-family:'Sora',sans-serif;
          transition:background .12s;
        }
        .np-confirm-cancel:hover { background:#f9fafb; }
        .np-confirm-del {
          flex:1;padding:11px;border-radius:12px;
          border:none;background:#ef4444;
          color:#fff;font-size:13px;font-weight:700;
          cursor:pointer;font-family:'Sora',sans-serif;
          transition:all .15s;
        }
        .np-confirm-del:hover { background:#dc2626; }
      `}</style>

      <div className="np-root">

        {/* ══ HEADER ══ */}
        <div className="np-header">
          <div className="np-header-inner">
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <button className="np-back" onClick={() => navigate(-1)} title="Geri">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>
                </svg>
              </button>
              <div className="np-header-title">
                🔔 Bildirişlər
                {unreadCount > 0 && (
                  <span className="np-unread-badge">{unreadCount} yeni</span>
                )}
              </div>
            </div>

            <div className="np-header-actions">
              {unreadCount > 0 && (
                <button className="np-btn-ghost" onClick={() => dispatch(markAllNotificationsRead())}>
                  ✓ Hamısını oxu
                </button>
              )}
              {items.length > 0 && (
                <button className="np-btn-danger" onClick={() => setDeleteConfirm("all")}>
                  🗑 Hamısını sil
                </button>
              )}
            </div>
          </div>

          {/* Tablar */}
          <div className="np-tabs">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`np-tab ${activeTab === tab.key ? "on" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                {tabCount(tab.key) > 0 && (
                  <span className="np-tab-count">{tabCount(tab.key)}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ══ BODY ══ */}
        <div className="np-body">

          {/* ── SOL: Bildiriş siyahısı ── */}
          <div className="np-list">
            {loading && items.length === 0 ? (
              <div className="np-loading">
                <div className="np-spinner" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="np-empty">
                <span className="np-empty-emoji">🔔</span>
                <span className="np-empty-txt">Bu kateqoriyada bildiriş yoxdur</span>
              </div>
            ) : (
              filtered.map(n => {
                const c         = cfg(n.type)
                const productImg = n.data?.productImage || null
                const isSelected = selectedNotif?._id === n._id

                return (
                  <div
                    key={n._id}
                    className={`np-item ${!n.isRead ? "unread" : ""} ${isSelected ? "selected" : ""}`}
                    onClick={() => handleItemClick(n)}
                  >
                    {/* İkon / şəkil */}
                    {productImg ? (
                      <img src={productImg} alt="" className="np-item-img" />
                    ) : (
                      <div className="np-item-icon" style={{ background:c.bg }}>
                        {c.emoji}
                      </div>
                    )}

                    {/* Mətn */}
                    <div className="np-item-body">
                      <p className={`np-item-title ${n.isRead ? "read" : ""}`}>{n.title}</p>
                      <p className="np-item-msg">{n.message}</p>
                      {/* Qiymət varsa göstər */}
                      {n.data?.newPrice && n.data?.oldPrice && (
                        <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:4 }}>
                          <span style={{ fontSize:13, fontWeight:800, color:C.primary, fontFamily:"'Sora',sans-serif" }}>
                            {n.data.newPrice} AZN
                          </span>
                          <span style={{ fontSize:11, color:C.light, textDecoration:"line-through", fontFamily:"'Sora',sans-serif" }}>
                            {n.data.oldPrice} AZN
                          </span>
                        </div>
                      )}
                      <p className="np-item-time">{timeAgo(n.createdAt)}</p>
                    </div>

                    {/* Sağ tərəf */}
                    <div className="np-item-right">
                      <button
                        className="np-item-del"
                        onClick={e => { e.stopPropagation(); setDeleteConfirm(n._id) }}
                        title="Sil"
                      >✕</button>
                      {!n.isRead && <div className="np-item-dot" />}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* ── SAĞ: Detal panel ── */}
          <div className={`np-detail ${selectedNotif ? "show" : ""}`}>
            {!selectedNotif ? (
              <div className="np-detail-empty">
                <span className="np-detail-empty-emoji">👆</span>
                <span className="np-detail-empty-txt">Bildirişə bas, detalları gör</span>
              </div>
            ) : (() => {
              const n  = selectedNotif
              const c  = cfg(n.type)
              const st = n.data?.status ? (statusColors[n.data.status] || null) : null

              return (
                <>
                  {/* Mobil bağla */}
                  <button
                    className="np-detail-close-mob"
                    onClick={() => setSelectedNotif(null)}
                  >✕</button>

                  {/* Header */}
                  <div className="np-detail-head">
                    <div
                      className="np-detail-type"
                      style={{ background:c.bg, color:c.color }}
                    >
                      {c.emoji} {c.label}
                    </div>
                    <h2 className="np-detail-title">{n.title}</h2>
                    <p className="np-detail-time">🕐 {timeAgo(n.createdAt)}</p>
                  </div>

                  {/* Body */}
                  <div className="np-detail-body">
                    {/* Məhsul şəkli */}
                    {n.data?.productImage && (
                      <img src={n.data.productImage} alt="" className="np-detail-img" />
                    )}

                    {/* Tam mətn */}
                    <p className="np-detail-msg">{n.message}</p>

                    {/* ── Məlumat sətirləri ── */}

                    {/* Sifariş ID */}
                    {n.data?.orderId && (
                      <div className="np-info-row">
                        <span className="np-info-label">Sifariş №</span>
                        <span className="np-info-value" style={{ fontSize:11, fontFamily:"monospace" }}>
                          #{String(n.data.orderId).slice(-8).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Məhsul ID */}
                    {n.data?.productId && (
                      <div className="np-info-row">
                        <span className="np-info-label">Məhsul №</span>
                        <span className="np-info-value" style={{ fontSize:11, fontFamily:"monospace" }}>
                          #{String(n.data.productId).slice(-8).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Status */}
                    {st && (
                      <div className="np-info-row">
                        <span className="np-info-label">Status</span>
                        <span
                          style={{
                            background:st.bg, color:st.color,
                            padding:"3px 12px", borderRadius:99,
                            fontSize:12, fontWeight:700,
                            fontFamily:"'Sora',sans-serif",
                          }}
                        >
                          {st.label}
                        </span>
                      </div>
                    )}

                    {/* Qiymət dəyişikliyi */}
                    {n.data?.newPrice && (
                      <div className="np-info-row">
                        <span className="np-info-label">Qiymət</span>
                        <div>
                          <span className="np-price-new">{n.data.newPrice} AZN</span>
                          {n.data.oldPrice && (
                            <span className="np-price-old">{n.data.oldPrice} AZN</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Məbləğ (sifariş cəmi, komissiya) */}
                    {n.data?.amount && !n.data?.newPrice && (
                      <div className="np-info-row">
                        <span className="np-info-label">Məbləğ</span>
                        <span className="np-price-new">{Number(n.data.amount).toFixed(2)} AZN</span>
                      </div>
                    )}

                    {/* Stok sayı */}
                    {n.data?.stock !== undefined && n.data?.stock !== null && (
                      <div className="np-info-row">
                        <span className="np-info-label">Qalan Stok</span>
                        <span
                          style={{
                            fontWeight:800, fontSize:14,
                            color: n.data.stock === 0 ? "#ef4444" : "#854d0e",
                            fontFamily:"'Sora',sans-serif",
                          }}
                        >
                          {n.data.stock === 0 ? "Bitib" : `${n.data.stock} ədəd`}
                        </span>
                      </div>
                    )}

                    {/* Tarix */}
                    <div className="np-info-row">
                      <span className="np-info-label">Tarix</span>
                      <span className="np-info-value">
                        {new Date(n.createdAt).toLocaleString("az-AZ", {
                          day:"numeric", month:"long", year:"numeric",
                          hour:"2-digit", minute:"2-digit",
                        })}
                      </span>
                    </div>

                    {/* Oxunma vəziyyəti */}
                    <div className="np-info-row">
                      <span className="np-info-label">Vəziyyət</span>
                      <span style={{
                        background: n.isRead ? "#d1fae5" : C.rose50,
                        color:      n.isRead ? "#065f46" : C.primary,
                        padding:"3px 12px", borderRadius:99,
                        fontSize:12, fontWeight:700,
                        fontFamily:"'Sora',sans-serif",
                      }}>
                        {n.isRead ? "✓ Oxunub" : "● Oxunmamış"}
                      </span>
                    </div>
                  </div>

                  {/* Footer — keç + sil */}
                  <div className="np-detail-foot">
                    {/* Əlaqəli səhifəyə keç */}
                    {n.data?.orderId && (
                      <button
                        className="np-btn-primary"
                        onClick={() => navigate(`/my-orders`)}
                      >
                        📦 Sifarişə Bax
                      </button>
                    )}
                    {n.data?.productId && !n.data?.orderId && (
                      <button
                        className="np-btn-primary"
                        onClick={() => navigate(`/product/${n.data.productId}`)}
                      >
                        🛍️ Məhsula Bax
                      </button>
                    )}

                    {/* Sil düyməsi */}
                    <button
                      className="np-btn-outline-del"
                      onClick={() => setDeleteConfirm(n._id)}
                    >
                      🗑
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      </div>

      {/* ══ SİLMƏ TƏSDİQ DIALOGU ══ */}
      {deleteConfirm && (
        <div className="np-confirm-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="np-confirm-box" onClick={e => e.stopPropagation()}>
            <p className="np-confirm-title">
              {deleteConfirm === "all" ? "Hamısını sil?" : "Bildirişi sil?"}
            </p>
            <p className="np-confirm-txt">
              {deleteConfirm === "all"
                ? "Bütün bildirişlər silinəcək. Bu əməliyyat geri alına bilməz."
                : "Bu bildiriş silinəcək. Bu əməliyyat geri alına bilməz."}
            </p>
            <div className="np-confirm-btns">
              <button className="np-confirm-cancel" onClick={() => setDeleteConfirm(null)}>
                Ləğv et
              </button>
              <button
                className="np-confirm-del"
                onClick={() =>
                  deleteConfirm === "all" ? handleDeleteAll() : handleDelete(deleteConfirm)
                }
              >
                {deleteConfirm === "all" ? "Hamısını Sil" : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}