// src/slices/paymentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ===================== PAYMENT INTENT YARAT =====================
// Backend: POST /commerce/mehsullar/products/create-payment-intent
// Backend cavabı: { success: true, clientSecret: '...' }
export const createPaymentIntent = createAsyncThunk(
    'payment/createPaymentIntent',
    async ({ amount, currency }, thunkAPI) => {
        try {
            const response = await axios.post(
                'https://agminciqqaraminciq-production.up.railway.app/commerce/mehsullar/products/create-payment-intent',
                { amount, currency },
                { withCredentials: true } // Cookie-dəki token backend-ə göndərilir (isAuthenticatedUser üçün)
            );
            // Backend: { success: true, clientSecret: '...' }
            return response.data;
        } catch (error) {
            // Xəta mesajı backend-dən gəlirsə onu göstər, gəlmirsə ümumi mesaj
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Ödəniş xətası baş verdi';
            return thunkAPI.rejectWithValue(message);
        }
    }
);

const paymentSlice = createSlice({
    name: 'payment',
    initialState: {
        loading:      false,
        clientSecret: null,
        error:        null,
    },
    reducers: {
        resetPaymentState: (state) => {
            state.loading      = false;
            state.clientSecret = null;
            state.error        = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createPaymentIntent.pending, (state) => {
                state.loading      = true;
                state.error        = null;
                state.clientSecret = null;
            })
            .addCase(createPaymentIntent.fulfilled, (state, action) => {
                state.loading      = false;
                // Backend { success: true, clientSecret } qaytarır
                state.clientSecret = action.payload.clientSecret;
            })
            .addCase(createPaymentIntent.rejected, (state, action) => {
                state.loading = false;
                state.error   = action.payload;
            });
    },
});

export const { resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;