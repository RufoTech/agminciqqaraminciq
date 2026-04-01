// src/components/PaymentComponent.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createPaymentIntent, resetPaymentState } from "../slices/paymentSlice";
import { createOrder } from "../slices/orderSlice";
import { useGetCartQuery } from "../redux/api/productsApi";
import {
    CreditCard, ShieldCheck, Lock, AlertCircle,
    CheckCircle, Loader2, ShoppingBag, ArrowRight,
} from "lucide-react";

const SuccessReceiptCard = ({ total, currency, cartItems, onComplete }) => {
    const [countdown, setCountdown] = useState(5);

    // ✅ onComplete-i sabitlə
    const stableOnComplete = useCallback(() => {
        onComplete();
    }, [onComplete]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // ✅ render zamanı yox, setTimeout ilə çağır
                    setTimeout(() => stableOnComplete(), 0);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [stableOnComplete]);

    return (
        <div className="rounded-2xl bg-white shadow-2xl p-5 sm:p-8 border-2 border-green-500">
            <div className="text-center mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <CheckCircle className="w-9 h-9 sm:w-12 sm:h-12 text-green-600" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Ödəniş Uğurlu!</h3>
                <p className="text-gray-600 text-sm sm:text-base">Sifarişiniz qəbul edildi və tezliklə hazırlanacaq</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-5 sm:mb-6">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Sifariş Edilən Məhsullar</h4>
                <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
                    {cartItems.map((item) => (
                        <div key={item.product._id} className="flex justify-between items-center bg-white p-2.5 sm:p-3 rounded-lg gap-2">
                            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                    <img
                                        src={item.product.images?.[0]?.url || "/placeholder.svg"}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{item.product.name}</p>
                                    <p className="text-xs text-gray-500">Say: {item.quantity}</p>
                                </div>
                            </div>
                            <p className="font-semibold text-gray-900 text-sm flex-shrink-0">
                                {(item.product.price * item.quantity).toFixed(2)} ₼
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 sm:p-6 mb-5 sm:mb-6">
                <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-semibold text-gray-700">Ödənilmiş Məbləğ</span>
                    <span className="text-2xl sm:text-3xl font-bold text-green-600">
                        {total.toFixed(2)} {currency.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="text-center py-3 sm:py-4 bg-blue-50 rounded-lg mb-4">
                <p className="text-xs sm:text-sm text-gray-600">
                    Sifarişlərim səhifəsinə yönləndirilib... <span className="font-bold">{countdown} saniyə</span>
                </p>
            </div>

            <button
                onClick={stableOnComplete}
                className="w-full flex justify-center items-center py-3.5 sm:py-4 px-6 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
            >
                Sifarişlərimə Get
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </button>
        </div>
    );
};

const PaymentComponent = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, clientSecret, error } = useSelector((state) => state.payment);
    const { data: cartData, isLoading: isCartLoading } = useGetCartQuery();

    const [currency, setCurrency] = useState("azn");
    const orderCreatedRef = useRef(false);

    const calculateTotal = () => {
        if (!cartData?.cart) return 0;
        return cartData.cart.reduce(
            (total, item) => total + item.product.price * item.quantity, 0
        );
    };

    const totalAmount = calculateTotal();
    const finalTotal  = totalAmount;

    useEffect(() => {
        if (clientSecret && !orderCreatedRef.current) {
            orderCreatedRef.current = true;
            const paymentIntentId = clientSecret.split("_secret_")[0];
            setTimeout(() => {
                dispatch(createOrder({ stripePaymentIntentId: paymentIntentId, currency }));
            }, 0);
        }
    }, [clientSecret, currency, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (finalTotal <= 0) return;
        dispatch(createPaymentIntent({ amount: finalTotal, currency }));
    };

    const handleReset = () => {
        dispatch(resetPaymentState());
        orderCreatedRef.current = false;
        setCurrency("azn");
    };

    // ✅ useCallback ilə sabitlə — SuccessReceiptCard-da render xətası verməsin
    const handlePaymentComplete = useCallback(() => {
        dispatch(resetPaymentState());
        orderCreatedRef.current = false;
        navigate("/my-orders");
    }, [dispatch, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
            <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">

                <div className="text-center mb-6 sm:mb-10">
                    <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 flex items-center justify-center gap-2 sm:gap-3">
                        <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-900" />
                        Təhlükəsiz Ödəniş
                    </h1>
                    <p className="mt-2 text-sm sm:text-lg text-gray-600">
                        Sifarişinizi tamamlamaq üçün məlumatları daxil edin
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">

                    {/* Sifariş xülasəsi */}
                    <div className="lg:col-span-5 order-1 lg:order-2">
                        <div className="bg-white shadow-lg rounded-2xl border border-gray-200 lg:sticky lg:top-6">
                            <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200 rounded-t-2xl">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                                    Sifariş Xülasəsi
                                </h3>
                            </div>

                            <div className="p-4 sm:p-6">
                                {isCartLoading ? (
                                    <div className="flex justify-center py-8 sm:py-10">
                                        <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-gray-900" />
                                    </div>
                                ) : cartData && cartData.cart.length > 0 ? (
                                    <>
                                        <ul className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-52 sm:max-h-none overflow-y-auto">
                                            {cartData.cart.map((item) => (
                                                <li key={item.product._id} className="flex gap-3 sm:gap-4">
                                                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={item.product.images?.[0]?.url || "/placeholder.svg"}
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-gray-900 text-xs sm:text-sm truncate">{item.product.name}</h4>
                                                        <p className="text-xs text-gray-500">Say: {item.quantity}</p>
                                                        <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-0.5">
                                                            {(item.product.price * item.quantity).toFixed(2)} ₼
                                                        </p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="border-t pt-3 sm:pt-4 space-y-1.5 sm:space-y-2">
                                            <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                                                <span>Məhsul Dəyəri</span>
                                                <span>{totalAmount.toFixed(2)} ₼</span>
                                            </div>
                                            <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                                                <span>Çatdırılma</span>
                                                <span>Pulsuz</span>
                                            </div>
                                            <div className="border-t pt-3 sm:pt-4 flex justify-between">
                                                <span className="text-base sm:text-lg font-bold text-gray-900">Cəmi</span>
                                                <span className="text-lg sm:text-xl font-bold text-gray-900">
                                                    {finalTotal.toFixed(2)} ₼
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8 sm:py-10">
                                        <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 text-sm">Səbətiniz boşdur</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Ödəniş formu */}
                    <div className="lg:col-span-7 order-2 lg:order-1">
                        {clientSecret ? (
                            <SuccessReceiptCard
                                total={finalTotal}
                                currency={currency}
                                cartItems={cartData?.cart || []}
                                onComplete={handlePaymentComplete}
                            />
                        ) : (
                            <div className="bg-white shadow-lg rounded-2xl p-5 sm:p-8 border border-gray-200">
                                <div className="flex items-center justify-between mb-5 sm:mb-6">
                                    <h3 className="text-base sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                                        Ödəniş Məlumatları
                                    </h3>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                            Ödəniş Valyutası
                                        </label>
                                        <select
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                                            style={{ fontSize: "max(16px, 14px)" }}
                                        >
                                            <option value="azn">AZN - Azərbaycan Manatı (₼)</option>
                                            <option value="usd">USD - ABŞ Dolları ($)</option>
                                            <option value="eur">EUR - Avro (€)</option>
                                            <option value="try">TRY - Türk Lirəsi (₺)</option>
                                        </select>
                                    </div>

                                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded">
                                        <div className="flex">
                                            <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                            <p className="ml-3 text-xs sm:text-sm text-blue-700">
                                                Ödənişiniz SSL şifrələməsi ilə qorunur
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                        <button
                                            type="submit"
                                            disabled={loading || finalTotal <= 0}
                                            className="flex-1 flex justify-center items-center py-3.5 sm:py-4 px-6 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors text-sm sm:text-base"
                                            style={{ minHeight: 50 }}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="animate-spin mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                                                    Emal edilir...
                                                </>
                                            ) : (
                                                `Ödə (${finalTotal.toFixed(2)} ${currency.toUpperCase()})`
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleReset}
                                            className="sm:px-6 py-3.5 sm:py-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                                            style={{ minHeight: 50 }}
                                        >
                                            Sıfırla
                                        </button>
                                    </div>
                                </form>

                                {error && (
                                    <div className="mt-5 sm:mt-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                                        <div className="flex">
                                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                            <div className="ml-3">
                                                <h3 className="text-xs sm:text-sm font-medium text-red-800">Xəta</h3>
                                                <p className="mt-1 text-xs sm:text-sm text-red-700">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentComponent;