// nodemailer — Node.js-də email göndərmək üçün ən populyar kitabxana.
// SMTP protokolu vasitəsilə email serverinə qoşulur və məktubu göndərir.
import nodemailer from "nodemailer";


// =====================================================================
// EMAİL GÖNDƏR — sendEmail
// ---------------------------------------------------------------------
// Çağırıldığı yerlər:
//   authController.js     → forgotPassword()        (şifrə sıfırlama)
//   superAdminController  → superAdminForgotPassword()
//
// Parametr — options obyekti:
//   options.email   → alıcının email ünvanı
//   options.subject → emailin başlığı
//   options.message → emailin HTML məzmunu (emailTemplates.js-dən gəlir)
//
// SMTP nədir?
//   Simple Mail Transfer Protocol — email göndərmək üçün standart protokol.
//   Standart portlar:
//     25   → köhnə, adətən bloklanır
//     587  → müasir, şifrələnmiş (STARTTLS)
//     465  → SSL/TLS
//   Bu proyektdə Mailtrap (test servisi) istifadə edilir — port 2525.
// =====================================================================
export const sendEmail = async (options) => {

    // ── TRANSPORT YARAT ─────────────────────────────────────────────
    // Transport — email serverinə bağlantı konfiqurasiyasıdır.
    // Hər email göndərilişdə yeni transport yaradılır.
    // (Performans üçün bir dəfə yaradıb saxlamaq da mümkündür,
    //  amma şifrə sıfırlama nadir hadisədir — burada fərq etmir.)
    //
    // createTransport() parametrləri:
    //   host → SMTP server ünvanı: "sandbox.smtp.mailtrap.io"
    //   port → bağlantı portu: 2525 (Mailtrap), 587 (Gmail)
    //   auth → istifadəçi adı + şifrə ilə server girişi
    //
    // Niyə .env-dən oxunur?
    //   SMTP_PASSWORD koda yazılsaydı → GitHub-a düşərdi → email hesabı oğurlana bilərdi.
    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,      // məs: "sandbox.smtp.mailtrap.io"
        port: process.env.SMTP_PORT,      // məs: 2525
        auth: {
            user: process.env.SMTP_EMAIL,     // SMTP istifadəçi adı
            pass: process.env.SMTP_PASSWORD,  // SMTP şifrəsi
        },
    });


    // ── EMAİL MƏZMUNUNu HAZIRLA ─────────────────────────────────────
    // from — göndərənin görünüşü.
    //
    // DƏYİŞİKLİK: Əvvəlki kod yanlış idi:
    //   Köhnə: `${process.env.SMTP_FROM_EMAIL} <${process.env.SMTP_FROM_NAME}>`
    //          → "noreply@murad.com <Ecommerce>" formatı standart deyil.
    //            Email client-lər bunu düzgün parse edə bilmir:
    //            bəzən spam qovluğuna düşür, bəzən "göndərən" adı əvəzinə
    //            email ünvanı göstərilir. Bəzi SMTP serverlər isə
    //            yanlış format üzündən emaili ümumiyyətlə göndərmir —
    //            bu da "şifrəni unutdum" bölməsinin 404/500 xətası verməsinə
    //            səbəb olurdu.
    //
    //   Yeni: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`
    //         → "Ecommerce <noreply@murad.com>" — standart RFC 5322 formatı.
    //           Email client-lər "Ecommerce" adını göstərir.
    //           Bütün SMTP serverlər bu formatı qəbul edir.
    //
    // to      → alıcının email ünvanı (istifadəçinin email-i)
    // subject → emailin başlığı: "Şifrənin sıfırlanması mərhələsi"
    // html    → emailin tam HTML məzmunu (emailTemplates.js-dən gəlir)
    //           Düz mətn (text) deyil, HTML — şəkilli, düyməli email
    const message = {
        from:    `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to:      options.email,
        subject: options.subject,
        html:    options.message,
    };


    // ── EMAİLİ GÖNDƏR ───────────────────────────────────────────────
    // transport.sendMail() — emaili SMTP serverinə göndərir.
    // await — göndərmə tamamlanana qədər gözlə.
    //
    // Niyə await lazımdır?
    //   sendMail() asinxron əməliyyatdır — network sorğusudur.
    //   await olmasa — email göndərilmədən "uğurlu" cavab qaytarılar.
    //   await ilə email göndərilməsə xəta atılır → catch blokuna düşür →
    //   token bazadan silinir (forgotPassword-da).
    await transport.sendMail(message);
};