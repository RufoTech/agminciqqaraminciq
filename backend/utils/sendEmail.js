// Resend — müasir email göndərmə servisi.
// API key ilə işləyir, SMTP konfiqurasiyası lazım deyil.
// Pulsuz plan: 3000 email/ay, 100 email/gün.
// Qeydiyyat: https://resend.com
import { Resend } from "resend";

// =====================================================================
// EMAİL GÖNDƏR — sendEmail
// ---------------------------------------------------------------------
// Çağırıldığı yerlər:
//   authController.js        → forgotPassword()
//   superAdminController.js  → superAdminForgotPassword()
//   bonusController.js       → requestPhoneOtp()
//
// Parametr — options obyekti:
//   options.email   → alıcının email ünvanı
//   options.subject → emailin başlığı
//   options.message → emailin HTML məzmunu
// =====================================================================
export const sendEmail = async (options) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const senderName = process.env.SMTP_FROM_NAME || "Brendex Group";
    const senderEmail =
        process.env.SMTP_FROM_EMAIL ||
        process.env.RESEND_FROM_EMAIL ||
        "onboarding@resend.dev";

    await resend.emails.send({
        from:    `${senderName} <${senderEmail}>`,
        to:      options.email,
        subject: options.subject,
        html:    options.message,
        text:    options.text,
        replyTo: process.env.SMTP_REPLY_TO || senderEmail,
    });
};
