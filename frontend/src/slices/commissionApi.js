import axios from "axios";

const BASE = "https://amdulraxim-production.up.railway.app/commerce/mehsullar/commission";

export const fetchSellerBalance = (sellerId) =>
  axios.get(`${BASE}/balance/${encodeURIComponent(sellerId)}`, {
    withCredentials: true,
  });

export const fetchMonthlyCommission = (sellerId, month, year) =>
  axios.get(
    `${BASE}/monthly/${encodeURIComponent(sellerId)}?month=${month}&year=${year}`,
    { withCredentials: true }
  );

export const fetchOrderCommission = (orderId) =>
  axios.get(`${BASE}/order/${orderId}`, { withCredentials: true });

export const transferCommission = (data) =>
  axios.post(`${BASE}/transfer`, data, { withCredentials: true });

export const withdrawBalance = (data) =>
  axios.post(`${BASE}/withdraw`, data, { withCredentials: true });