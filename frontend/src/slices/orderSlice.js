// src/slices/orderSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "https://agminciqqaraminciq-production.up.railway.app/commerce/mehsullar";


// ===================== SİFARİŞ YARAT =====================
export const createOrder = createAsyncThunk(
    "order/createOrder",
    async ({ stripePaymentIntentId, currency }, thunkAPI) => {
        try {
            const response = await axios.post(
                `${BASE_URL}/orders/create`,
                { stripePaymentIntentId, currency },
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Sifariş yaradılarkən xəta baş verdi"
            );
        }
    }
);


// ===================== ÖZ SİFARİŞLƏRİNİ GƏTİR =====================
export const getMyOrders = createAsyncThunk(
    "order/getMyOrders",
    async (_, thunkAPI) => {
        try {
            const response = await axios.get(
                `${BASE_URL}/orders/my`,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Sifarişlər yüklənmədi"
            );
        }
    }
);


// ===================== ADMİN — MAĞAZANIN SİFARİŞLƏRİ =====================
export const getAdminOrders = createAsyncThunk(
    "order/getAdminOrders",
    async (_, thunkAPI) => {
        try {
            const response = await axios.get(
                `${BASE_URL}/admin/orders`,
                { withCredentials: true }
            );
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Admin sifarişləri yüklənmədi"
            );
        }
    }
);


// ===================== ADMİN — STATUS YENİLƏ =====================
export const updateOrderStatus = createAsyncThunk(
    "order/updateOrderStatus",
    async ({ orderId, status }, thunkAPI) => {
        try {
            const response = await axios.put(
                `${BASE_URL}/admin/orders/${orderId}`,
                { status },
                { withCredentials: true }
            );
            // orderId-ni də qaytarırıq ki, slice-da tapaq
            return { ...response.data, orderId };
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Status yenilənmədi"
            );
        }
    }
);


// ===================== SLICE =====================
const orderSlice = createSlice({
    name: "order",
    initialState: {
        loading:        false,
        myOrders:       [],   // İstifadəçinin öz sifarişləri
        adminOrders:    [],   // Admin mağazasının sifarişləri
        currentOrder:   null,
        error:          null,
    },
    reducers: {
        clearOrderError: (state) => {
            state.error = null;
        },
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
    },
    extraReducers: (builder) => {

        // ── createOrder ──────────────────────────────────────────
        builder
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error   = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading      = false;
                state.currentOrder = action.payload.order;
                // Yeni sifarişi myOrders-ə əlavə et (API yenidən çağırmadan görünsün)
                if (action.payload.order) {
                    state.myOrders = [action.payload.order, ...state.myOrders];
                }
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error   = action.payload;
            });

        // ── getMyOrders ──────────────────────────────────────────
        builder
            .addCase(getMyOrders.pending, (state) => {
                state.loading = true;
                state.error   = null;
            })
            .addCase(getMyOrders.fulfilled, (state, action) => {
                state.loading   = false;
                state.myOrders  = action.payload.orders;
            })
            .addCase(getMyOrders.rejected, (state, action) => {
                state.loading = false;
                state.error   = action.payload;
            });

        // ── getAdminOrders ───────────────────────────────────────
        builder
            .addCase(getAdminOrders.pending, (state) => {
                state.loading = true;
                state.error   = null;
            })
            .addCase(getAdminOrders.fulfilled, (state, action) => {
                state.loading      = false;
                state.adminOrders  = action.payload.orders;
            })
            .addCase(getAdminOrders.rejected, (state, action) => {
                state.loading = false;
                state.error   = action.payload;
            });

        // ── updateOrderStatus ────────────────────────────────────
        builder
            .addCase(updateOrderStatus.pending, (state) => {
                state.error = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                const { orderId, orderStatus } = action.payload;
                // adminOrders siyahısında statusu yenilə
                state.adminOrders = state.adminOrders.map((order) =>
                    (order.id || order._id)?.toString() === orderId?.toString()
                        ? { ...order, orderStatus }
                        : order
                );
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearOrderError, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;