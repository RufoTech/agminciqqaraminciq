import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://agminciqqaraminciq-production.up.railway.app/commerce/mehsullar", credentials: "include" }),
  tagTypes: ['Cart', 'Favorites', 'Products', 'Reviews'],
  endpoints: (builder) => ({

    getProducts: builder.query({
      query: () => "/products",
    }),

    getProductDetails: builder.query({
      query: (id) => `/products/${id}`,
    }),

    addProduct: builder.mutation({
      query: (productData) => ({
        url: "/admin/products",
        method: "POST",
        body: productData,
            credentials: 'include',  // ✅ bunu əlavə et
      }),
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: "DELETE",
      }),
    }),

    editProduct: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/admin/products/${id}`,
        method: "PUT",
        body: formData,
      }),
    }),

    getCart: builder.query({
      query: () => "/products/cart",
      providesTags: ['Cart'],
    }),

    addToCart: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: '/products/cart',
        method: 'POST',
        body: { productId, quantity },
        credentials: 'include',
      }),
      invalidatesTags: ['Cart'],
    }),

    updateCartQuantity: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: `/products/cart/update/${productId}`,
        method: 'PUT',
        body: { quantity },
        credentials: 'include',
      }),
      invalidatesTags: ['Cart'],
    }),

    removeFromCart: builder.mutation({
      query: (productId) => ({
        url: `/products/cart/${productId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['Cart'],
    }),

    getFavorites: builder.query({
      query: () => "/products/favorites",
      providesTags: ["Favorites"],
      transformResponse: (response) => ({
        favorites: response?.favorites || [],
      }),
    }),

    addToFavorites: builder.mutation({
      query: (productId) => ({
        url: "/products/favorites",
        method: "POST",
        body: { productId },
        credentials: "include",
      }),
      invalidatesTags: ["Favorites"],
    }),

    removeFromFavorites: builder.mutation({
      query: (productId) => ({
        url: `/products/favorites/${productId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["Favorites"],
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
          dispatch(
            productApi.util.updateQueryData("getFavorites", undefined, (draft) => {
              draft.favorites = draft.favorites.filter((favorite) => favorite._id !== productId)
            }),
          )
        } catch {
          // If the mutation fails, we don't need to do anything
        }
      },
    }),

    getFilteredProducts: builder.query({
      query: (filters) => ({
        url: "/products/filter",
        params: filters,
      }),
    }),

    searchProducts: builder.query({
      query: ({ query, page = 1, limit = 10 }) => ({
        url: "/products/search",
        params: { query, page, limit },
      }),
    }),
    createOrUpdateReview: builder.mutation({
      query: (reviewData) => ({
        url: "/products/review",
        method: "POST",
        body: reviewData,
      }),
      invalidatesTags: ["Products"],
    }),
        getProductReviews: builder.query({
          query: (id) => `/products/${id}/reviews`,
          providesTags: ["Reviews"],
        }),
  }),
});





export const { useGetProductDetailsQuery, useGetProductsQuery, useAddProductMutation, useDeleteProductMutation, useEditProductMutation, useGetCartQuery, useAddToCartMutation, useRemoveFromCartMutation, useUpdateCartQuantityMutation, useGetFavoritesQuery, useAddToFavoritesMutation, useRemoveFromFavoritesMutation , useSearchProductsQuery, useGetFilteredProductsQuery, useCreateOrUpdateReviewMutation, useGetProductReviewsQuery } = productApi;