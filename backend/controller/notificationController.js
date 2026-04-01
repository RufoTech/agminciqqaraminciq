// catchAsyncErrors — async funksiyalardakı xətaları avtomatik tutur,
// hər controller-ə try/catch yazmaqdan xilas edir.
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";

// ErrorHandler — özəl xəta sinifi.
// new ErrorHandler("mesaj", statusKod) şəklində istifadə olunur.
import ErrorHandler from "../utils/errorHandler.js";

// Notification — bildiriş modeli.
// recipient (alan), type, message, isRead kimi sahələri saxlayır.
import Notification from "../model/Notification.js";


// =====================================================================
// ÖZ BİLDİRİŞLƏRİNİ GÖR — getMyNotifications
// ---------------------------------------------------------------------
// GET /notifications?page=1&limit=20&unreadOnly=true
//
// İstifadəçi bildiriş zənginə (🔔) basanda işləyir.
// Səhifələmə (pagination) dəstəklənir — bütün bildirişləri birdən
// yükləmək əvəzinə hissə-hissə gətirilir (performans üçün vacibdir).
// =====================================================================
export const getMyNotifications = catchAsyncErrors(async (req, res, next) => {

    // page   — neçənci səhifə (default: 1)
    // limit  — hər səhifədə neçə bildiriş (default: 20)
    // unreadOnly — yalnız oxunmamışları göstər ("true" / "false" string gəlir)
    const { page = 1, limit = 20, unreadOnly } = req.query;

    // ── FİLTER OBYEKTİ ──────────────────────────────────────────────
    // recipient: req.user.id — yalnız bu istifadəçiyə aid bildirişlər gəlsin.
    // Hər istifadəçi yalnız öz bildirişlərini görə bilər.
    const filter = { recipient: req.user.id };

    // unreadOnly=true göndərilibsə — yalnız isRead=false olanlar süzülür.
    // Bildiriş panelindəki "Yalnız oxunmamışlar" seçimi üçün.
    if (unreadOnly === "true") filter.isRead = false;

    // ── ÜMUMI SAY ───────────────────────────────────────────────────
    // countDocuments() — sorğuya uyğun sənədlərin sayını qaytarır.
    // Bütün sənədləri çəkmədən yalnız sayı bilmək üçündür — performanslıdır.
    // totalPages hesablamaq üçün lazımdır.
    const total = await Notification.countDocuments(filter);

    // ── SƏHİFƏLƏMƏ İLƏ BİLDİRİŞLƏR ─────────────────────────────────
    // .sort({ createdAt: -1 }) — ən yeni bildiriş ən üstdə
    //
    // .skip((page - 1) * limit) — neçə sənədi atlayacağımızı hesablayır:
    //   Səhifə 1: skip(0)  → 1-ci bildirişdən başla
    //   Səhifə 2: skip(20) → 21-ci bildirişdən başla
    //   Səhifə 3: skip(40) → 41-ci bildirişdən başla
    //
    // .limit(Number(limit)) — neçə sənəd gətirəcəyini məhdudlaşdırır.
    //   Number() — req.query-dən string gəlir, rəqəmə çevirmək lazımdır.
    const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    // ── OXUNMAMIŞ BİLDİRİŞ SAYI ────────────────────────────────────
    // Navbar-dakı bildiriş nişanı (badge) üçün — məsələn: 🔔 5
    // unreadOnly filterdən asılı olmayaraq həmişə tam sayı qaytarır.
    const unreadCount = await Notification.countDocuments({
        recipient: req.user.id,
        isRead: false,
    });

    res.status(200).json({
        success:     true,
        notifications,
        unreadCount,              // navbar badge üçün
        total,                    // ümumi bildiriş sayı
        totalPages: Math.ceil(total / limit), // neçə səhifə var
        currentPage: Number(page),            // hazırda neçənci səhifədəyik
    });
});


// =====================================================================
// TƏK BİLDİRİŞİ OXUNMUŞ İŞARƏLƏ — markAsRead
// ---------------------------------------------------------------------
// PUT /notifications/:id/read
//
// İstifadəçi bir bildirişə tıklayanda işləyir.
// =====================================================================
export const markAsRead = catchAsyncErrors(async (req, res, next) => {

    // findOneAndUpdate — tapmaq və yeniləmək əməliyyatını bir sorğuda birləşdirir.
    //
    // Şərtlər:
    //   _id: req.params.id     → URL-dən gələn bildiriş ID-si
    //   recipient: req.user.id → yalnız öz bildirişini dəyişdirə bilər
    //                            (başqasının bildirişini oxunmuş etməsin!)
    //
    // { isRead: true } — yalnız bu sahə yenilənir
    //
    // { new: true } — yenilənmiş sənədi qaytarır (köhnəni deyil).
    //   false olarsa — dəyişiklikdən əvvəlki hal qaytarılardı.
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: req.user.id },
        { isRead: true },
        { new: true }
    );

    // Bildiriş tapılmadısa — ya ID yanlışdır, ya da başqasının bildirişidir
    if (!notification) {
        return next(new ErrorHandler("Bildiriş tapılmadı", 404));
    }

    // Yenilənmiş bildiriş qaytarılır — frontend UI-ı anında yeniləsin deyə
    res.status(200).json({ success: true, notification });
});


// =====================================================================
// BÜTÜN BİLDİRİŞLƏRİ OXUNMUŞ İŞARƏLƏ — markAllAsRead
// ---------------------------------------------------------------------
// PUT /notifications/read-all
//
// "Hamısını oxunmuş et" düyməsi üçün.
// =====================================================================
export const markAllAsRead = catchAsyncErrors(async (req, res, next) => {

    // updateMany — şərtə uyan bütün sənədləri bir əməliyyatla yeniləyir.
    //
    // Şərtlər:
    //   recipient: req.user.id → yalnız bu istifadəçinin bildirişləri
    //   isRead: false          → yalnız hələ oxunmamışlar (artıq oxunmuşlara toxunmur)
    //
    // Niyə isRead: false şərti var?
    //   Artıq oxunmuş olanları yenidən yazmaq lazımsız verilənlər bazası yüküdür.
    //   Bu şərt sayəsində yalnız lazımlı sənədlər yenilənir.
    await Notification.updateMany(
        { recipient: req.user.id, isRead: false },
        { isRead: true }
    );

    res.status(200).json({
        success: true,
        message: "Bütün bildirişlər oxunmuş işarələndi",
    });
});


// =====================================================================
// TƏK BİLDİRİŞİ SİL — deleteNotification
// ---------------------------------------------------------------------
// DELETE /notifications/:id
//
// İstifadəçi bildirişin yanındakı "×" düyməsinə basanda işləyir.
// =====================================================================
export const deleteNotification = catchAsyncErrors(async (req, res, next) => {

    // findOneAndDelete — tapmaq və silmək əməliyyatını bir sorğuda birləşdirir.
    //
    // Niyə yalnız _id ilə deyil, recipient şərti də var?
    //   Təhlükəsizlik üçün: istifadəçi başqasının bildirişinin ID-sini
    //   bilsə belə, onu silə bilməsin.
    //   recipient şərti olmasa — hər kəs hər kəsin bildirişini silə bilərdi.
    const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        recipient: req.user.id,
    });

    if (!notification) {
        return next(new ErrorHandler("Bildiriş tapılmadı", 404));
    }

    res.status(200).json({ success: true, message: "Bildiriş silindi" });
});


// =====================================================================
// BÜTÜN BİLDİRİŞLƏRİ SİL — deleteAllNotifications
// ---------------------------------------------------------------------
// DELETE /notifications
//
// "Hamısını təmizlə" düyməsi üçün.
// =====================================================================
export const deleteAllNotifications = catchAsyncErrors(async (req, res, next) => {

    // deleteMany — şərtə uyan bütün sənədləri bir əməliyyatla silir.
    // Yalnız bu istifadəçinin bildirişləri silinir — digərlərinə toxunulmur.
    await Notification.deleteMany({ recipient: req.user.id });

    res.status(200).json({
        success: true,
        message: "Bütün bildirişlər silindi",
    });
});


// =====================================================================
// OXUNMAMIŞ BİLDİRİŞ SAYI — getUnreadCount
// ---------------------------------------------------------------------
// GET /notifications/unread-count
//
// Navbar-dakı bildiriş nişanı (badge) üçün — məsələn: 🔔 3
//
// Niyə ayrıca endpoint var, getMyNotifications yetərli deyilmi?
//   getMyNotifications bütün bildirişləri + sayı qaytarır — ağır sorğudur.
//   Bu endpoint yalnız bir rəqəm qaytarır — çox sürətlidir.
//   Səhifə yüklənəndə yalnız sayı bilmək üçün bu endpoint çağırılır,
//   istifadəçi zəngə bassanda isə getMyNotifications çağırılır.
// =====================================================================
export const getUnreadCount = catchAsyncErrors(async (req, res, next) => {

    // countDocuments() — sənədlər çəkilmədən yalnız sayı qaytarır.
    // Bütün bildirişləri yükləyib .length almaqdan çox daha performanslıdır.
    const count = await Notification.countDocuments({
        recipient: req.user.id,
        isRead: false,
    });

    res.status(200).json({ success: true, unreadCount: count });
});