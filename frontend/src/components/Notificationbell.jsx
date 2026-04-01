// components/NotificationBell.jsx — Temu/Amazon stili
// Navbar-da istifadə et: <NotificationBell />  və ya  <NotificationBell isMobile={true} />

import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchNotifications,
    fetchUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
} from "../slices/Notificationslice";

/* ─── Tip konfiqurasiyası ─────────────────────────────────────── */
const TYPE_CFG = {
    order_status:      { emoji: "📦", bg: "#dbeafe", color: "#1d4ed8", label: "Sifariş",    category: "order" },
    order_delivered:   { emoji: "🎉", bg: "#d1fae5", color: "#065f46", label: "Çatdırıldı", category: "order" },
    new_order:         { emoji: "🛒", bg: "#fce7f3", color: "#9d174d", label: "Sifariş",    category: "order" },
    low_stock:         { emoji: "⚠️", bg: "#fef9c3", color: "#854d0e", label: "Stok",       category: "stock" },
    out_of_stock:      { emoji: "❌", bg: "#fee2e2", color: "#991b1b", label: "Stok",       category: "stock" },
    limited_stock:     { emoji: "⏳", bg: "#fef3c7", color: "#92400e", label: "Stok",       category: "stock" },
    back_in_stock:     { emoji: "✅", bg: "#d1fae5", color: "#065f46", label: "Stok",       category: "stock" },
    cart_added:        { emoji: "🛍️", bg: "#ede9fe", color: "#5b21b6", label: "Səbət",      category: "cart"  },
    favorite_price:    { emoji: "🎉", bg: "#fce7f3", color: "#be185d", label: "Endirim",   category: "promo" },
    flash_sale:        { emoji: "⚡", bg: "#fef3c7", color: "#b45309", label: "Flaş",       category: "promo" },
    price_drop:        { emoji: "📉", bg: "#e0f2fe", color: "#0369a1", label: "Qiymət",    category: "promo" },
    promo_code:        { emoji: "🎁", bg: "#f3e8ff", color: "#6d28d9", label: "Promo",      category: "promo" },
    bundle_deal:       { emoji: "🛒", bg: "#ecfdf5", color: "#065f46", label: "Paket",      category: "promo" },
    commission_earned: { emoji: "💵", bg: "#d1fae5", color: "#065f46", label: "Komissiya",  category: "money" },
    new_user:          { emoji: "👤", bg: "#f3f4f6", color: "#374151", label: "İstifadəçi", category: "info"  },
};

const TABS = [
    { key: "all",   label: "Hamısı" },
    { key: "promo", label: "🏷️ Endirimlər" },
    { key: "order", label: "📦 Sifarişlər" },
    { key: "stock", label: "⚠️ Stok" },
];

/* ─── Vaxt ────────────────────────────────────────────────────── */
const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1)  return "indi";
    if (m < 60) return `${m} dəq`;
    if (h < 24) return `${h} saat`;
    return `${d} gün`;
};

/* ─── Ana komponent ───────────────────────────────────────────── */
export default function NotificationBell({ isMobile = false }) {
    const dispatch = useDispatch();
    const { items, unreadCount, loading } = useSelector((s) => s.notifications);

    const [open, setOpen]     = useState(false);
    const [shake, setShake]   = useState(false);
    const [activeTab, setTab] = useState("all");
    const ref                 = useRef(null);
    const prevCount           = useRef(unreadCount);

    // İlk yükləmə
    useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);

    // 30 saniyədə bir unread count yenilə
    useEffect(() => {
        const id = setInterval(() => dispatch(fetchUnreadCount()), 30000);
        return () => clearInterval(id);
    }, [dispatch]);

    // Yeni bildiriş → titrə
    useEffect(() => {
        if (unreadCount > prevCount.current) {
            setShake(true);
            setTimeout(() => setShake(false), 700);
        }
        prevCount.current = unreadCount;
    }, [unreadCount]);

    // Xaricdən klik → bağla
    useEffect(() => {
        const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", fn);
        return () => document.removeEventListener("mousedown", fn);
    }, []);

    const handleToggle  = useCallback(() => { setOpen(v => { if (!v) dispatch(fetchNotifications()); return !v; }); }, [dispatch]);
    const handleRead    = useCallback((e, id) => { e.stopPropagation(); dispatch(markNotificationRead(id)); }, [dispatch]);
    const handleDelete  = useCallback((e, id) => { e.stopPropagation(); dispatch(deleteNotification(id)); }, [dispatch]);
    const handleAllRead = useCallback(() => dispatch(markAllNotificationsRead()), [dispatch]);

    // Tab filtri
    const filtered = activeTab === "all"
        ? items
        : items.filter(n => TYPE_CFG[n.type]?.category === activeTab);

    const tabUnread = (tab) => tab === "all"
        ? items.filter(n => !n.isRead).length
        : items.filter(n => !n.isRead && TYPE_CFG[n.type]?.category === tab).length;

    return (
        <>
            <style>{`
                .ntf-btn {
                    position:relative;width:40px;height:40px;border-radius:13px;
                    border:none;background:transparent;display:flex;align-items:center;
                    justify-content:center;cursor:pointer;color:#6b7280;
                    transition:all .2s ease;outline:none;
                }
                .ntf-btn:hover { background:#fff5f5;color:#E8192C;transform:translateY(-1px); }
                .ntf-btn.mob   { width:38px;height:38px;border-radius:11px; }

                @keyframes ntf-shake {
                    0%,100%{transform:rotate(0)}
                    20%{transform:rotate(-16deg)}
                    40%{transform:rotate(16deg)}
                    60%{transform:rotate(-10deg)}
                    80%{transform:rotate(9deg)}
                }
                .ntf-shake { animation:ntf-shake .65s ease; }

                .ntf-badge {
                    position:absolute;top:-3px;right:-3px;
                    min-width:17px;height:17px;padding:0 4px;
                    border-radius:99px;background:#E8192C;color:#fff;
                    font-size:9px;font-weight:800;display:flex;align-items:center;
                    justify-content:center;border:2px solid #fff;
                    font-family:'Sora',sans-serif;
                    animation:ntf-pop .3s cubic-bezier(.34,1.56,.64,1);
                }
                @keyframes ntf-pop { from{transform:scale(0)} to{transform:scale(1)} }

                /* Panel */
                .ntf-panel {
                    position:absolute;top:calc(100% + 10px);
                    right:0;width:360px;
                    background:#fff;border-radius:20px;
                    box-shadow:0 20px 60px rgba(0,0,0,0.14),0 4px 16px rgba(0,0,0,0.06);
                    border:1.5px solid #f3f4f6;
                    display:flex;flex-direction:column;overflow:hidden;
                    z-index:9999;max-height:520px;
                    animation:ntf-open .2s cubic-bezier(.16,1,.3,1);
                    font-family:'Sora',sans-serif;
                }
                .ntf-panel.mob-panel { right:-56px; width:calc(100vw - 24px); }
                @keyframes ntf-open {
                    from{opacity:0;transform:scale(.94) translateY(-8px)}
                    to{opacity:1;transform:scale(1) translateY(0)}
                }

                /* Header */
                .ntf-head {
                    padding:14px 16px 0;
                    border-bottom:1px solid #f3f4f6;
                    flex-shrink:0;
                }
                .ntf-head-top {
                    display:flex;align-items:center;
                    justify-content:space-between;margin-bottom:12px;
                }
                .ntf-head-title {
                    font-size:15px;font-weight:800;color:#1c1c1e;margin:0;
                }
                .ntf-new-pill {
                    background:#E8192C;color:#fff;font-size:10px;font-weight:700;
                    padding:2px 8px;border-radius:99px;margin-left:7px;
                }
                .ntf-readall {
                    font-size:12px;color:#E8192C;font-weight:600;
                    background:none;border:none;cursor:pointer;
                    padding:4px 8px;border-radius:7px;
                    transition:background .12s;font-family:'Sora',sans-serif;
                }
                .ntf-readall:hover { background:#fff5f5; }
                .ntf-readall:disabled { opacity:.38;cursor:not-allowed; }

                /* Tabs */
                .ntf-tabs {
                    display:flex;gap:0;overflow-x:auto;
                    scrollbar-width:none;padding-bottom:0;
                }
                .ntf-tabs::-webkit-scrollbar { display:none; }
                .ntf-tab {
                    flex-shrink:0;padding:8px 12px;font-size:12px;font-weight:600;
                    color:#6b7280;background:none;border:none;cursor:pointer;
                    border-bottom:2.5px solid transparent;transition:all .15s;
                    font-family:'Sora',sans-serif;position:relative;
                    white-space:nowrap;
                }
                .ntf-tab.on { color:#E8192C;border-bottom-color:#E8192C; }
                .ntf-tab-dot {
                    display:inline-flex;align-items:center;justify-content:center;
                    width:16px;height:16px;border-radius:99px;
                    background:#E8192C;color:#fff;font-size:8px;font-weight:800;
                    margin-left:4px;vertical-align:middle;
                }

                /* List */
                .ntf-list {
                    flex:1;overflow-y:auto;padding:6px 0;
                    scrollbar-width:thin;scrollbar-color:#fecdd3 transparent;
                }
                .ntf-list::-webkit-scrollbar { width:3px; }
                .ntf-list::-webkit-scrollbar-thumb { background:#fecdd3;border-radius:2px; }

                /* Item */
                .ntf-item {
                    display:flex;align-items:flex-start;gap:10px;
                    padding:11px 14px;cursor:pointer;
                    transition:background .12s;position:relative;
                    border-left:3px solid transparent;
                }
                .ntf-item:hover { background:#fafafa; }
                .ntf-item.unread {
                    background:#fff8f8;
                    border-left-color:#E8192C;
                }
                .ntf-item.urgent { background:#fff3f3; }

                /* Məhsul şəkli (Temu stili) */
                .ntf-prod-img {
                    width:46px;height:46px;border-radius:10px;
                    object-fit:cover;flex-shrink:0;
                    border:1.5px solid #f3f4f6;
                }
                .ntf-prod-placeholder {
                    width:46px;height:46px;border-radius:10px;
                    display:flex;align-items:center;justify-content:center;
                    font-size:20px;flex-shrink:0;
                }

                /* Endirim badge */
                .ntf-discount {
                    display:inline-block;padding:1px 5px;border-radius:5px;
                    background:#E8192C;color:#fff;font-size:9px;font-weight:800;
                    margin-left:5px;
                }

                /* Qiymət */
                .ntf-price-row {
                    display:flex;align-items:center;gap:6px;margin-top:2px;
                }
                .ntf-price-new {
                    font-size:13px;font-weight:800;color:#E8192C;
                }
                .ntf-price-old {
                    font-size:11px;color:#9ca3af;text-decoration:line-through;
                }

                /* Mətn */
                .ntf-body { flex:1;min-width:0; }
                .ntf-title {
                    font-size:12.5px;font-weight:700;color:#1c1c1e;
                    margin:0 0 2px;line-height:1.35;
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
                }
                .ntf-msg {
                    font-size:11.5px;color:#6b7280;margin:0;line-height:1.4;
                    display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
                }
                .ntf-time { font-size:10px;color:#d1d5db;margin-top:3px; }

                /* Sağ */
                .ntf-right {
                    display:flex;flex-direction:column;align-items:flex-end;
                    gap:4px;flex-shrink:0;
                }
                .ntf-del {
                    background:none;border:none;cursor:pointer;
                    color:#e5e7eb;font-size:13px;padding:2px 4px;
                    border-radius:5px;opacity:0;transition:all .12s;
                    font-family:'Sora',sans-serif;
                }
                .ntf-item:hover .ntf-del { opacity:1; }
                .ntf-del:hover { color:#E8192C;background:#fff5f5; }
                .ntf-dot {
                    width:7px;height:7px;border-radius:50%;background:#E8192C;
                }

                /* Boş */
                .ntf-empty {
                    display:flex;flex-direction:column;align-items:center;
                    justify-content:center;padding:40px 20px;gap:8px;
                }
                .ntf-empty-emoji { font-size:32px;opacity:.45; }
                .ntf-empty-txt { font-size:13px;color:#9ca3af; }

                /* Loading */
                .ntf-loading { display:flex;align-items:center;justify-content:center;padding:36px; }
                @keyframes ntf-spin { to{transform:rotate(360deg)} }
                .ntf-spin {
                    width:22px;height:22px;
                    border:2.5px solid #fecdd3;border-top-color:#E8192C;
                    border-radius:50%;animation:ntf-spin .7s linear infinite;
                }

                /* Footer */
                .ntf-foot {
                    padding:9px 16px;border-top:1px solid #f3f4f6;flex-shrink:0;
                    display:flex;align-items:center;justify-content:space-between;
                }
                .ntf-foot-txt { font-size:11px;color:#d1d5db; }
            `}</style>

            <div ref={ref} style={{ position: "relative" }}>
                {/* Zəng düyməsi */}
                <button
                    className={`ntf-btn ${isMobile ? "mob" : ""} ${shake ? "ntf-shake" : ""}`}
                    onClick={handleToggle}
                    title="Bildirişlər"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    {unreadCount > 0 && (
                        <span className="ntf-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
                    )}
                </button>

                {open && (
                    <div className={`ntf-panel ${isMobile ? "mob-panel" : ""}`}>
                        {/* Header */}
                        <div className="ntf-head">
                            <div className="ntf-head-top">
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <h3 className="ntf-head-title">Bildirişlər</h3>
                                    {unreadCount > 0 && (
                                        <span className="ntf-new-pill">{unreadCount} yeni</span>
                                    )}
                                </div>
                                <button
                                    className="ntf-readall"
                                    onClick={handleAllRead}
                                    disabled={unreadCount === 0}
                                >
                                    Hamısını oxu
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="ntf-tabs">
                                {TABS.map(tab => (
                                    <button
                                        key={tab.key}
                                        className={`ntf-tab ${activeTab === tab.key ? "on" : ""}`}
                                        onClick={() => setTab(tab.key)}
                                    >
                                        {tab.label}
                                        {tabUnread(tab.key) > 0 && (
                                            <span className="ntf-tab-dot">{tabUnread(tab.key)}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Siyahı */}
                        <div className="ntf-list">
                            {loading && items.length === 0 ? (
                                <div className="ntf-loading"><div className="ntf-spin" /></div>
                            ) : filtered.length === 0 ? (
                                <div className="ntf-empty">
                                    <span className="ntf-empty-emoji">
                                        {activeTab === "promo" ? "🏷️" : activeTab === "order" ? "📦" : activeTab === "stock" ? "📦" : "🔔"}
                                    </span>
                                    <span className="ntf-empty-txt">Bu kateqoriyada bildiriş yoxdur</span>
                                </div>
                            ) : (
                                filtered.map((n) => {
                                    const cfg = TYPE_CFG[n.type] || { emoji: "🔔", bg: "#f3f4f6", color: "#6b7280", category: "info" };
                                    const hasImg     = n.data?.productImage;
                                    const hasDiscount = n.data?.discountPct;
                                    const isUrgent   = n.priority === "urgent";

                                    return (
                                        <div
                                            key={n._id}
                                            className={`ntf-item ${!n.isRead ? "unread" : ""} ${isUrgent ? "urgent" : ""}`}
                                            onClick={(e) => !n.isRead && handleRead(e, n._id)}
                                        >
                                            {/* Sol — məhsul şəkli VƏ ya emoji */}
                                            {hasImg ? (
                                                <img src={n.data.productImage} alt="" className="ntf-prod-img" />
                                            ) : (
                                                <div className="ntf-prod-placeholder" style={{ background: cfg.bg }}>
                                                    {cfg.emoji}
                                                </div>
                                            )}

                                            {/* Mətn */}
                                            <div className="ntf-body">
                                                <p className="ntf-title">
                                                    {n.title}
                                                    {hasDiscount && (
                                                        <span className="ntf-discount">-{n.data.discountPct}%</span>
                                                    )}
                                                </p>
                                                <p className="ntf-msg">{n.message}</p>

                                                {/* Qiymət sırası — varsa göstər (Temu stili) */}
                                                {n.data?.newPrice && n.data?.oldPrice && (
                                                    <div className="ntf-price-row">
                                                        <span className="ntf-price-new">{n.data.newPrice} AZN</span>
                                                        <span className="ntf-price-old">{n.data.oldPrice} AZN</span>
                                                    </div>
                                                )}

                                                {/* Promo kod */}
                                                {n.data?.promoCode && (
                                                    <div style={{ marginTop: 3 }}>
                                                        <span style={{ fontFamily: "monospace", fontSize: 11, background: "#fff5f5", color: "#E8192C", padding: "2px 6px", borderRadius: 5, border: "1px dashed #fecdd3", fontWeight: 700 }}>
                                                            {n.data.promoCode}
                                                        </span>
                                                    </div>
                                                )}

                                                <p className="ntf-time">{timeAgo(n.createdAt)}</p>
                                            </div>

                                            {/* Sağ */}
                                            <div className="ntf-right">
                                                <button
                                                    className="ntf-del"
                                                    onClick={(e) => handleDelete(e, n._id)}
                                                    title="Sil"
                                                >✕</button>
                                                {!n.isRead && <div className="ntf-dot" />}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="ntf-foot">
                            <span className="ntf-foot-txt">Cəmi {items.length} bildiriş</span>
                            {items.length > 0 && (
                                <button
                                    onClick={handleAllRead}
                                    style={{ fontSize: 11, color: "#d1d5db", background: "none", border: "none", cursor: "pointer", fontFamily: "'Sora',sans-serif" }}
                                >
                                    Hamısını sil
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}