import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "./commissionApi";

export const getSellerBalance = createAsyncThunk(
  "commission/getBalance",
  async (sellerId, { rejectWithValue }) => {
    try {
      const { data } = await api.fetchSellerBalance(sellerId);
      return data.balance;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Xəta baş verdi");
    }
  }
);

export const getMonthlyCommission = createAsyncThunk(
  "commission/getMonthly",
  async ({ sellerId, month, year }, { rejectWithValue }) => {
    try {
      const { data } = await api.fetchMonthlyCommission(sellerId, month, year);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Xəta baş verdi");
    }
  }
);

export const doTransferCommission = createAsyncThunk(
  "commission/transfer",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.transferCommission(payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Xəta baş verdi");
    }
  }
);

export const doWithdrawBalance = createAsyncThunk(
  "commission/withdraw",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.withdrawBalance(payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Xəta baş verdi");
    }
  }
);

const commissionSlice = createSlice({
  name: "commission",
  initialState: {
    balance: null,
    monthly: null,
    transferResult: null,
    withdrawResult: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCommissionState: (state) => {
      state.error = null;
      state.transferResult = null;
      state.withdrawResult = null;
    },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(getSellerBalance.pending, pending)
      .addCase(getSellerBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(getSellerBalance.rejected, rejected)

      .addCase(getMonthlyCommission.pending, pending)
      .addCase(getMonthlyCommission.fulfilled, (state, action) => {
        state.loading = false;
        state.monthly = action.payload;
      })
      .addCase(getMonthlyCommission.rejected, rejected)

      .addCase(doTransferCommission.pending, pending)
      .addCase(doTransferCommission.fulfilled, (state, action) => {
        state.loading = false;
        state.transferResult = action.payload;
        if (action.payload?.success && state.balance) {
          state.balance.pendingCommission = Math.max(
            0,
            (state.balance.pendingCommission || 0) - (action.payload.totalCommission || 0)
          );
          state.balance.totalCommissionPaid =
            (state.balance.totalCommissionPaid || 0) + (action.payload.totalCommission || 0);
        }
      })
      .addCase(doTransferCommission.rejected, rejected)

      .addCase(doWithdrawBalance.pending, pending)
      .addCase(doWithdrawBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.withdrawResult = action.payload;
        if (action.payload?.success && state.balance) {
          state.balance.availableBalance =
            action.payload.remainingBalance ?? state.balance.availableBalance;
        }
      })
      .addCase(doWithdrawBalance.rejected, rejected);
  },
});

export const { clearCommissionState } = commissionSlice.actions;
export default commissionSlice.reducer;