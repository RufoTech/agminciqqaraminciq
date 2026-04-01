// src/pages/AdminOrders.jsx

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAdminOrders, updateOrderStatus } from "../slices/orderSlice";
import {
    ShoppingBag, Loader2, PackageCheck,
    Truck, Clock, CheckCircle2, ChevronDown,
    Store, RefreshCw,
} from "lucide-react";

// ── STATUS KONFİQURASİYASI ────────────────────────────────────────────────
// Hər 5 status üçün label, rəng və ikon təyin edilir.
// "delivered" → "Çatdırıldı", "completed" → isCompleted=true olan sifarişlər.
const STATUS_CONFIG = {
    pending:    { label: "Gözlənilir",  color: "bg-yellow-100 text-yellow-700 border-yellow-200", Icon: Clock },
    processing: { label: "Hazırlanır",  color: "bg-blue-100 text-blue-700 border-blue-200",       Icon: PackageCheck },
    shipped:    { label: "Göndərildi",  color: "bg-purple-100 text-purple-700 border-purple-200", Icon: Truck },
    delivered:  { label: "Çatdırıldı", color: "bg-green-100 text-green-700 border-green-200",    Icon: CheckCircle2 },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
            <cfg.Icon className="w-3.5 h-3.5" />
            {cfg.label}
        </span>
    );
};

// ── TAMAMLANDI BANNERİ ────────────────────────────────────────────────────
// isCompleted === true olduqda sifariş kartının üstündə göstərilir.
const CompletedBanner = () => (
    <div className="flex items-center gap-2 px-6 py-2.5 bg-green-50 border-b border-green-100">
        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
        <span className="text-xs font-semibold text-green-700">Sifariş tamamlandı</span>
    </div>
);

// ── STATUS DROPDOWN ───────────────────────────────────────────────────────
// Satıcı bu dropdown vasitəsilə sifarişin statusunu dəyişdirir.
// "delivered" seçildikdə sifariş bağlanır: isCompleted = true olur.
// isCompleted === true olduqda dropdown yerinə statik "Tamamlandı" badge-i göstərilir.
const StatusDropdown = ({ orderId, currentStatus, isCompleted, onUpdate, updating }) => {
    const [open, setOpen] = useState(false);

    const statuses = [
        { value: "pending",    label: "Gözlənilir", Icon: Clock,        note: null },
        { value: "processing", label: "Hazırlanır", Icon: PackageCheck, note: null },
        { value: "shipped",    label: "Göndərildi", Icon: Truck,        note: null },
        {
            value: "delivered",
            label: "Çatdırıldı",
            Icon: CheckCircle2,
            note: "Sifariş tamamlanır — geri qaytarıla bilməz",
        },
    ];

    const handleSelect = (status) => {
        if (status === currentStatus) { setOpen(false); return; }
        onUpdate(orderId, status);
        setOpen(false);
    };

    useEffect(() => {
        if (!open) return;
        const handler = () => setOpen(false);
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, [open]);

    // Tamamlanmış sifarişdə dropdown göstərilmir — dəyişdirilə bilməz
    if (isCompleted) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
                Tamamlandı
            </div>
        );
    }

    return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
                onClick={() => setOpen((prev) => !prev)}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
                {updating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Yenilənir...</>
                ) : (
                    <>Statusu dəyiş <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} /></>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                    {statuses.map(({ value, label, Icon, note }) => {
                        const isActive    = value === currentStatus;
                        const isDelivered = value === "delivered";
                        return (
                            <button
                                key={value}
                                onClick={() => handleSelect(value)}
                                className={`w-full flex items-start gap-3 px-4 py-3 text-sm text-left transition-colors
                                    ${isActive    ? "bg-gray-100 font-semibold" : ""}
                                    ${isDelivered && !isActive ? "hover:bg-green-50" : "hover:bg-gray-50"}
                                `}
                            >
                                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDelivered ? "text-green-600" : "text-gray-500"}`} />
                                <span className="flex flex-col">
                                    <span className={isDelivered ? "text-green-700 font-semibold" : ""}>{label}</span>
                                    {note && (
                                        <span className="text-xs text-orange-500 mt-0.5 font-normal">{note}</span>
                                    )}
                                </span>
                                {isActive && <span className="ml-auto text-xs text-gray-400 mt-0.5">Cari</span>}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};


// ── ANA KOMPONENTİ ────────────────────────────────────────────────────────
const AdminOrders = () => {
    const dispatch = useDispatch();
    const { adminOrders, loading, error } = useSelector((state) => state.order);
    const { user } = useSelector((state) => state.userSlice);
    const [updatingId, setUpdatingId]   = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        dispatch(getAdminOrders());
    }, [dispatch]);

    const handleStatusUpdate = async (orderId, status) => {
        setUpdatingId(orderId);
        await dispatch(updateOrderStatus({ orderId, status }));
        setUpdatingId(null);
        // "delivered" seçildikdə slice artıq isCompleted-i yeniləyir —
        // getAdminOrders yenidən çağırmağa ehtiyac yoxdur.
        // Amma digər hallarda da sinxron qalmaq üçün yenidən yükləyirik.
        dispatch(getAdminOrders());
    };

    // ── FİLTR MƏNTİQİ ────────────────────────────────────────────────
    // "completed" → isCompleted === true olan bütün sifarişlər
    // "delivered" → orderStatus === "delivered" (isCompleted ilə eyni ola bilər)
    // digər statuslar → orderStatus ilə uyğunlaşdırılır
    const filteredOrders = (() => {
        if (filterStatus === "all")       return adminOrders;
        if (filterStatus === "completed") return adminOrders.filter((o) => o.isCompleted);
        return adminOrders.filter((o) => o.orderStatus === filterStatus);
    })();

    // ── STATİSTİKA ────────────────────────────────────────────────────
    const stats = {
        all:        adminOrders.length,
        pending:    adminOrders.filter((o) => o.orderStatus === "pending").length,
        processing: adminOrders.filter((o) => o.orderStatus === "processing").length,
        shipped:    adminOrders.filter((o) => o.orderStatus === "shipped").length,
        delivered:  adminOrders.filter((o) => o.orderStatus === "delivered").length,
        completed:  adminOrders.filter((o) => o.isCompleted).length,
    };

    // ── FİLTR DÜYMƏLƏRİ ──────────────────────────────────────────────
    // 6 düymə: Hamısı, Gözlənilir, Hazırlanır, Göndərildi, Çatdırıldı, Tamamlandı
    const filterButtons = [
        { key: "all",        label: "Hamısı",     color: "bg-gray-900 text-white" },
        { key: "pending",    label: "Gözlənilir", color: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
        { key: "processing", label: "Hazırlanır", color: "bg-blue-50 text-blue-700 border border-blue-200" },
        { key: "shipped",    label: "Göndərildi", color: "bg-purple-50 text-purple-700 border border-purple-200" },
        { key: "delivered",  label: "Çatdırıldı", color: "bg-green-50 text-green-700 border border-green-200" },
        { key: "completed",  label: "Tamamlandı", color: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    ];

    if (loading && adminOrders.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-gray-700" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-6xl mx-auto px-4">

                {/* ── BAŞLIQ ─────────────────────────────────────────── */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Store className="w-7 h-7 text-gray-800" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Mağaza Sifarişləri</h1>
                            <p className="text-sm text-gray-500 mt-0.5">{user?.sellerInfo?.storeName || "Mağazanız"}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => dispatch(getAdminOrders())}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Yenilə
                    </button>
                </div>

                {/* ── STATİSTİKA KARTLARI ────────────────────────────── */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
                    {filterButtons.map(({ key, label, color }) => (
                        <button
                            key={key}
                            onClick={() => setFilterStatus(key)}
                            className={`rounded-xl p-4 text-center transition-all ${color}
                                ${filterStatus === key
                                    ? "ring-2 ring-offset-1 ring-gray-400 shadow-md scale-105"
                                    : "hover:opacity-80 hover:scale-102"
                                }`}
                        >
                            <p className="text-2xl font-bold">{stats[key]}</p>
                            <p className="text-xs mt-1 font-medium">{label}</p>
                        </button>
                    ))}
                </div>

                {/* ── XƏTA ───────────────────────────────────────────── */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
                        {error}
                    </div>
                )}

                {/* ── BOŞ VƏZİYYƏT ───────────────────────────────────── */}
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Bu statusda sifariş yoxdur</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {filteredOrders.map((order) => {
                            const orderId = order.id || order._id;
                            return (
                                <div
                                    key={orderId}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                                >
                                    {/* Tamamlanmış sifarişdə yaşıl banner */}
                                    {order.isCompleted && <CompletedBanner />}

                                    {/* ── SİFARİŞ BAŞLIĞI ─────────────────────────── */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
                                        <div className="flex items-center gap-6">
                                            <div>
                                                <p className="text-xs text-gray-400 mb-0.5">Sifariş tarixi</p>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {new Date(order.createdAt).toLocaleDateString("az-AZ", {
                                                        day: "2-digit", month: "long", year: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 mb-0.5">Ümumi məbləğ</p>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {order.totalAmount?.toFixed(2)} ₼
                                                </p>
                                            </div>
                                            <StatusBadge status={order.orderStatus} />
                                        </div>

                                        {/* Status dəyişdirmə düyməsi */}
                                        <StatusDropdown
                                            orderId={orderId}
                                            currentStatus={order.orderStatus}
                                            isCompleted={order.isCompleted}
                                            onUpdate={handleStatusUpdate}
                                            updating={updatingId === orderId}
                                        />
                                    </div>

                                    {/* ── MƏHSULLAR ───────────────────────────────── */}
                                    <div className="px-6 py-4 space-y-3">
                                        {order.orderItems?.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={item.image || "/placeholder.svg"}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = "/placeholder.svg"; }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                                                    <p className="text-xs text-gray-500">Say: {item.quantity}</p>
                                                </div>
                                                <p className="font-semibold text-gray-800 text-sm whitespace-nowrap">
                                                    {(item.price * item.quantity).toFixed(2)} ₼
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* ── ALT HİSSƏ — SİFARİŞ ID ─────────────────── */}
                                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                                        <p className="text-xs text-gray-400">
                                            Sifariş № <span className="font-mono">{orderId}</span>
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;