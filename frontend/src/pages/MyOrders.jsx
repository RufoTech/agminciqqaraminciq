// src/pages/MyOrders.jsx
// İstifadəçinin öz sifarişlərini gördüyü səhifə

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyOrders } from "../slices/orderSlice";
import { ShoppingBag, Loader2, PackageCheck, Truck, Clock, CheckCircle2 } from "lucide-react";

const STATUS_CONFIG = {
    pending:    { label: "Gözlənilir", color: "bg-yellow-100 text-yellow-700", Icon: Clock },
    processing: { label: "Hazırlanır", color: "bg-blue-100 text-blue-700",    Icon: PackageCheck },
    shipped:    { label: "Göndərildi", color: "bg-purple-100 text-purple-700", Icon: Truck },
    delivered:  { label: "Çatdırıldı", color: "bg-green-100 text-green-700",  Icon: CheckCircle2 },
};

const StatusBadge = ({ status }) => {
    const { label, color, Icon } = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
};

// ── TAMAMLANDI BADGEİ ─────────────────────────────────────────────────
// isCompleted === true olduqda — yəni status "delivered" olduqda —
// sifarişin üstündə yaşıl "Sifariş tamamlandı" banneri göstərilir.
const CompletedBanner = () => (
    <div className="flex items-center gap-2 px-6 py-2.5 bg-green-50 border-b border-green-100">
        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
        <span className="text-xs font-semibold text-green-700">Sifariş tamamlandı</span>
    </div>
);

const MyOrders = () => {
    const dispatch = useDispatch();
    // ✅ myOrders state-indən oxu (adminOrders ilə qarışmasın)
    const { myOrders, loading, error } = useSelector((state) => state.order);

    useEffect(() => {
        dispatch(getMyOrders());
    }, [dispatch]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-gray-700" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-4xl mx-auto px-4">

                <div className="flex items-center gap-3 mb-8">
                    <ShoppingBag className="w-7 h-7 text-gray-800" />
                    <h1 className="text-2xl font-bold text-gray-900">Sifarişlərim</h1>
                    {myOrders.length > 0 && (
                        <span className="ml-2 bg-gray-900 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            {myOrders.length}
                        </span>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
                        {error}
                    </div>
                )}

                {myOrders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">Hələ heç bir sifarişiniz yoxdur</p>
                        <p className="text-gray-400 text-sm mt-2">Alış-veriş etdikdən sonra sifarişləriniz burada görünəcək</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {myOrders.map((order) => (
                            <div
                                key={order._id || order.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                            >
                                {/* ── TAMAMLANDI BANNERİ ──────────────────────────────────────
                                    isCompleted backend-dən gəlir — status "delivered" olduqda
                                    backend order.isCompleted = true edir.
                                    Bu banner yalnız tam çatdırılmış sifarişlərdə görünür. */}
                                {order.isCompleted && <CompletedBanner />}

                                {/* Sifariş başlığı */}
                                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-gray-50 border-b border-gray-200">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Sifariş tarixi</p>
                                        <p className="text-sm font-medium text-gray-800">
                                            {new Date(order.createdAt).toLocaleDateString("az-AZ", {
                                                day: "2-digit", month: "long", year: "numeric"
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 mb-1">Ümumi məbləğ</p>
                                        <p className="text-lg font-bold text-gray-900">
                                            {order.totalAmount?.toFixed(2)} ₼
                                        </p>
                                    </div>
                                    <StatusBadge status={order.orderStatus} />
                                </div>

                                {/* Məhsullar */}
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
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                                                <p className="text-xs text-gray-500">Say: {item.quantity}</p>
                                                {item.seller && (
                                                    <p className="text-xs text-gray-400 mt-0.5">Satıcı: {item.seller}</p>
                                                )}
                                            </div>
                                            <p className="font-semibold text-gray-800 text-sm whitespace-nowrap">
                                                {(item.price * item.quantity).toFixed(2)} ₼
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Alt hissə — sifariş ID */}
                                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                                    <p className="text-xs text-gray-400">
                                        Sifariş № <span className="font-mono">{order._id || order.id}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;