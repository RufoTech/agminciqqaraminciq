// =====================================================================
// CHAT SOCKET.IO — Real-time Alıcı ↔ Brendex Dəstək Söhbəti
// =====================================================================
import ChatMessage from "../model/ChatMessageSchema.js";

export const setupChatSocket = (io) => {

    io.on("connection", (socket) => {

        // ── OTAĞa QOŞUL ────────────────────────────────────────────────
        // Client: socket.emit("chat:join", { roomId: "user_<userId>" })
        socket.on("chat:join", ({ roomId }) => {
            if (!roomId) return;
            socket.join(roomId);
        });

        // ── TALİX GÖNDƏRİLMƏSİ ────────────────────────────────────────
        // Client: socket.emit("chat:history", { roomId }, callback)
        socket.on("chat:history", async ({ roomId }, cb) => {
            try {
                const msgs = await ChatMessage.find({ roomId })
                    .sort({ createdAt: 1 })
                    .limit(100)
                    .lean();
                if (typeof cb === "function") cb({ success: true, messages: msgs });
            } catch (err) {
                if (typeof cb === "function") cb({ success: false, messages: [] });
            }
        });

        // ── MESAJ GÖNDƏR ────────────────────────────────────────────────
        // Client: socket.emit("chat:send", { roomId, sender, userName, text })
        socket.on("chat:send", async (data) => {
            const { roomId, sender, userName, text } = data;
            if (!roomId || !sender || !text?.trim()) return;

            try {
                const msg = await ChatMessage.create({
                    roomId,
                    sender:   ["user", "support"].includes(sender) ? sender : "user",
                    userName: userName || "İstifadəçi",
                    text:     text.trim(),
                });
                // Otaqdakı hər kəsə (alıcı + dəstək) göndər
                io.to(roomId).emit("chat:message", msg);
            } catch (err) {
                console.error("[Chat] Mesaj saxlama xətası:", err.message);
            }
        });

        // ── BÜTÜN OTAQLAR (Dəstək paneli üçün) ─────────────────────────
        // Admin/support paneli bütün aktiv söhbətləri görmək üçün çağırır.
        socket.on("chat:all-rooms", async (_, cb) => {
            try {
                // Hər roomId üçün son mesajı tap
                const rooms = await ChatMessage.aggregate([
                    { $sort:  { createdAt: -1 } },
                    { $group: { _id: "$roomId", lastMsg: { $first: "$$ROOT" } } },
                    { $sort:  { "lastMsg.createdAt": -1 } },
                    { $limit: 100 },
                ]);
                if (typeof cb === "function") cb({ success: true, rooms });
            } catch (err) {
                if (typeof cb === "function") cb({ success: false, rooms: [] });
            }
        });

        socket.on("disconnect", () => {});
    });
};
