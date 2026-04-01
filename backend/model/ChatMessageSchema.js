// mongoose — MongoDB ilə işləmək üçün kitabxana.
import mongoose from "mongoose";


// =====================================================================
// CHAT MESAJI SCHEMA-SI — ChatMessageSchema
// ---------------------------------------------------------------------
// Canlı dəstək söhbətindəki hər bir mesajı təmsil edir.
//
// Niyə ayrı kolleksiya?
//   Mesajlar zamanla çox sayda ola bilər (yüzlərlə, minlərlə).
//   Bunları User və ya Order modelinə daxil etsəydik —
//   həmin modellər şişərdi, sorğular yavaşlardı.
//   Ayrı "chatmessages" kolleksiyası bu yükü öz üzərinə götürür.
//
// Niyə timestamps: true əvəzinə createdAt əl ilə yazılıb?
//   timestamps: true həm createdAt, həm updatedAt əlavə edir.
//   Mesajlar dəyişdirilmir — updatedAt lazımsız olar.
//   Yalnız createdAt əl ilə yazılaraq lazımsız sahə əlavə edilmir.
// =====================================================================
const ChatMessageSchema = new mongoose.Schema({

    // ── GÖNDƏRƏN ROLU ────────────────────────────────────────────────
    // sender — mesajı kimin göndərdiyini bildirir.
    // Dəyərlər: "admin" (satıcı/dəstək) və ya "user" (müştəri)
    //
    // Niyə enum yoxdur?
    //   enum əlavə etmək daha güvənli olardı:
    //   enum: ["admin", "user"] — yanlış dəyər yazılmasın deyə.
    //   Hazırki kod bu yoxlamanı tətbiq etmir — inkişaf üçün qeyd.
    //
    // Frontend-də sender-ə görə mesaj balonu sağda/solda göstərilir:
    //   sender = "user"  → sol tərəf (müştəri)
    //   sender = "admin" → sağ tərəf (satıcı/dəstək)
    sender: {
        type:     String,
        required: true,
    },

    // ── İSTİFADƏÇİ ADI ───────────────────────────────────────────────
    // userName — mesajı göndərənin adı (görüntülənmək üçün).
    // Məsələn: "Murad İsmayılov" və ya "Dəstək"
    //
    // Niyə User-ə ref yoxdur?
    //   ref + populate() hər mesaj çəkiləndə əlavə sorğu demək olardı.
    //   Chat-da mesajlar çox tez-tez çəkilir (real-time) —
    //   performans üçün ad birbaşa saxlanılır (denormalization).
    //   Bu, sorğu sayını azaldır.
    userName: {
        type:     String,
        required: true,
    },

    // ── MESAJ MƏTNİ ──────────────────────────────────────────────────
    // text — mesajın əsl məzmunu.
    // Məsələn: "Salam, sifarişim harada?"
    text: {
        type:     String,
        required: true,
    },

    // ── YARANMA TARİXİ ───────────────────────────────────────────────
    // createdAt — mesajın göndərilmə vaxtı.
    //
    // default: Date.now — funksiya kimi verilir (Date.now() deyil!).
    //   Date.now()  → schema yaradılarkən BİR DƏFƏ çağırılır → bütün mesajlar
    //                 eyni vaxtı alır (yanlış).
    //   Date.now    → hər yeni sənəd yaradılarkən çağırılır → hər mesaj
    //                 öz yaranma vaxtını alır (düzgün).
    //
    // Bu sahə chat-da mesajları vaxt sırasına görə sıralamaq üçün istifadə olunur:
    //   ChatMessage.find({...}).sort({ createdAt: 1 }) → köhnədən yeniyə
    createdAt: {
        type:    Date,
        default: Date.now,
    },
});


// =====================================================================
// MODEL EXPORT
// ---------------------------------------------------------------------
// mongoose.model("ChatMessage", ChatMessageSchema):
//   "ChatMessage" → kolleksiya adı "chatmessages" olur (mongoose avtomatik çoxluq edir).
//
// Bu model vasitəsilə əməliyyatlar:
//   ChatMessage.create({ sender, userName, text }) → yeni mesaj yaz
//   ChatMessage.find({ roomId }).sort({ createdAt: 1 }) → söhbəti yüklə
// =====================================================================
const ChatMessage = mongoose.model("ChatMessage", ChatMessageSchema);

export default ChatMessage;