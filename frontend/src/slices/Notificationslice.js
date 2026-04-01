// store/slices/notificationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE = "https://amdulraxim-production.up.railway.app/commerce/mehsullar/notifications";

const apiFetch = (url, options = {}) =>
    fetch(url, { credentials: "include", ...options }).then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.message || "Xəta baş verdi");
        return data;
    });

// ── Thunks ────────────────────────────────────────────────────────
export const fetchNotifications = createAsyncThunk(
    "notifications/fetchAll",
    async ({ page = 1, unreadOnly = false } = {}, { rejectWithValue }) => {
        try { return await apiFetch(`${BASE}?page=${page}&unreadOnly=${unreadOnly}`); }
        catch (e) { return rejectWithValue(e.message); }
    }
);

export const fetchUnreadCount = createAsyncThunk(
    "notifications/fetchUnreadCount",
    async (_, { rejectWithValue }) => {
        try { return await apiFetch(`${BASE}/unread-count`); }
        catch (e) { return rejectWithValue(e.message); }
    }
);

export const markNotificationRead = createAsyncThunk(
    "notifications/markRead",
    async (id, { rejectWithValue }) => {
        try { return await apiFetch(`${BASE}/${id}/read`, { method: "PUT" }); }
        catch (e) { return rejectWithValue(e.message); }
    }
);

export const markAllNotificationsRead = createAsyncThunk(
    "notifications/markAllRead",
    async (_, { rejectWithValue }) => {
        try { return await apiFetch(`${BASE}/read-all`, { method: "PUT" }); }
        catch (e) { return rejectWithValue(e.message); }
    }
);

export const deleteNotification = createAsyncThunk(
    "notifications/deleteOne",
    async (id, { rejectWithValue }) => {
        try { await apiFetch(`${BASE}/${id}`, { method: "DELETE" }); return id; }
        catch (e) { return rejectWithValue(e.message); }
    }
);

export const deleteAllNotifications = createAsyncThunk(
    "notifications/deleteAll",
    async (_, { rejectWithValue }) => {
        try { return await apiFetch(BASE, { method: "DELETE" }); }
        catch (e) { return rejectWithValue(e.message); }
    }
);

// ── Slice ─────────────────────────────────────────────────────────
const notificationSlice = createSlice({
    name: "notifications",
    initialState: {
        items:       [],
        unreadCount: 0,
        total:       0,
        totalPages:  1,
        currentPage: 1,
        loading:     false,
        error:       null,
    },
    reducers: {
        clearError: (s) => { s.error = null; },
    },
    extraReducers: (builder) => {
        builder
            // fetchNotifications
            .addCase(fetchNotifications.pending,   (s) => { s.loading = true; s.error = null; })
            .addCase(fetchNotifications.fulfilled, (s, { payload: p }) => {
                s.loading     = false;
                s.items       = p.notifications;
                s.unreadCount = p.unreadCount;
                s.total       = p.total;
                s.totalPages  = p.totalPages;
                s.currentPage = p.currentPage;
            })
            .addCase(fetchNotifications.rejected,  (s, { payload }) => { s.loading = false; s.error = payload; })

            // fetchUnreadCount
            .addCase(fetchUnreadCount.fulfilled, (s, { payload: p }) => { s.unreadCount = p.unreadCount; })

            // markNotificationRead
            .addCase(markNotificationRead.fulfilled, (s, { payload: p }) => {
                const n = s.items.find(i => i._id === p.notification._id);
                if (n && !n.isRead) { n.isRead = true; s.unreadCount = Math.max(0, s.unreadCount - 1); }
            })

            // markAllNotificationsRead
            .addCase(markAllNotificationsRead.fulfilled, (s) => {
                s.items.forEach(n => { n.isRead = true; });
                s.unreadCount = 0;
            })

            // deleteNotification
            .addCase(deleteNotification.fulfilled, (s, { payload: id }) => {
                const idx = s.items.findIndex(i => i._id === id);
                if (idx !== -1) {
                    if (!s.items[idx].isRead) s.unreadCount = Math.max(0, s.unreadCount - 1);
                    s.items.splice(idx, 1);
                    s.total = Math.max(0, s.total - 1);
                }
            })

            // deleteAllNotifications
            .addCase(deleteAllNotifications.fulfilled, (s) => {
                s.items = []; s.unreadCount = 0; s.total = 0;
            });
    },
});

export const { clearError } = notificationSlice.actions;
export default notificationSlice.reducer;