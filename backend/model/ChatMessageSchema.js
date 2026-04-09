import mongoose from "mongoose";

// =====================================================================
// CHAT MESAJI SCHEMA-SI
// Alıcı ↔ Brendex dəstək söhbəti üçün.
// roomId = "user_<userId>" → hər istifadəçinin ayrı söhbəti.
// =====================================================================
const ChatMessageSchema = new mongoose.Schema({
    // Söhbətin unikal ID-si: "user_<userId>"
    roomId: {
        type:     String,
        required: true,
        index:    true,
    },
    // Mesajı göndərən: "user" | "support"
    sender: {
        type:     String,
        required: true,
        enum:     ["user", "support"],
    },
    // Göndərənin adı (denormalize — populate-dən qaçmaq üçün)
    userName: {
        type:     String,
        required: true,
    },
    // Mesajın mətni
    text: {
        type:     String,
        required: true,
        maxlength: 2000,
    },
    createdAt: {
        type:    Date,
        default: Date.now,
        index:   true,
    },
});

const ChatMessage = mongoose.model("ChatMessage", ChatMessageSchema);
export default ChatMessage;
