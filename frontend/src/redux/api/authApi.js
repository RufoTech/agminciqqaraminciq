import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setIsAuthenticated, setUser, logout } from "../features/userSlice.js";

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({ baseUrl: "https://amdulraxim-production.up.railway.app/commerce/mehsullar", credentials: "include" }),
    endpoints: (builder) => ({

        // ── Qeydiyyat ──
        register: builder.mutation({
            query(body) {
                return {
                    url: "/register",
                    method: "POST",
                    body,
                };
            },
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // data = { success, token, user: { name, email, role, sellerInfo... } }
                    // Navbar user?.user?.role oxuyur — ona görə { user: data.user } formatı
                    dispatch(setUser({ user: data.user }));
                    dispatch(setIsAuthenticated(true));
                } catch (err) {}
            },
        }),

        // ── Giriş ──
        login: builder.mutation({
            query(body) {
                return {
                    url: "/login",
                    method: "POST",
                    body,
                };
            },
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    // data = { success, token, user: { name, email, role, sellerInfo... } }
                    // Navbar user?.user?.role oxuyur — ona görə { user: data.user } formatı
                    dispatch(setUser({ user: data.user }));
                    dispatch(setIsAuthenticated(true));
                } catch (err) {}
            },
        }),

        // ── Çıxış ──
        logout: builder.query({
            query: () => "/logout",
        }),

        // ── Şifrəni sıfırla ──
        resetPassword: builder.mutation({
            query: ({ token, password, confirmPassword }) => ({
                url: `/password/reset/${token}`,
                method: "PUT",
                body: { password, confirmPassword },
            }),
        }),

        // ── Şifrəni unut ──
        forgotPassword: builder.mutation({
            query: (body) => {
                console.log("Sending forgot password request", body);
                return {
                    url: "/password/forgot",
                    method: "POST",
                    body,
                };
            },
            async onQueryStarted(arg, { queryFulfilled }) {
                try {
                    const result = await queryFulfilled;
                    console.log("Forgot password request successful", result);
                } catch (error) {
                    console.error("Forgot password request failed", error);
                }
            },
        }),

        // ════════════════════════════════════════════════════
        // ── MAĞAZA PROFİLİ — slug ilə ──
        // ════════════════════════════════════════════════════
        getStoreBySlug: builder.query({
            query: (slug) => `/store/${slug}`,
        }),

    }),
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useLazyLogoutQuery,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useGetStoreBySlugQuery,
} = authApi;