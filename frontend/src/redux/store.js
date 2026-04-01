import { configureStore } from "@reduxjs/toolkit";
import { productApi } from "./api/productsApi";
import { authApi } from "./api/authApi";
import paymentReducer from '../slices/paymentSlice';
import userSlice from "./features/userSlice";
import orderReducer from '../slices/orderSlice';
import commissionReducer from '../slices/commissionSlice';
import languageReducer from '../slices/languageSlice';
import notificationReducer from '../slices/Notificationslice'; // ✅ YENİ

export const store = configureStore({
  reducer: {
    [productApi.reducerPath]: productApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    payment: paymentReducer,
    userSlice: userSlice,
    order: orderReducer,
    commission: commissionReducer,
    language: languageReducer,
    notifications: notificationReducer, // ✅ YENİ
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([productApi.middleware, authApi.middleware]),
});