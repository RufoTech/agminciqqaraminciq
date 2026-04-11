export const getResetPasswordText = (istifadeciAdi, sifirlamaLinki) => `Brendex Group | Sifre sifirlama isteyi

Salam ${istifadeciAdi || "istifadeci"},

Brendex hesabiniz ucun real sifre sifirlama isteyi qebul edildi.

Yeni sifre teyin etmek ucun bu linke daxil olun:
${sifirlamaLinki}

Bu link 30 deqiqe aktiv olacaq.

Eger bu sorgunu siz gondermemisinizse, bu mesaji nezere almayin. Movcud sifreniz deyisdirilmeyecek.

Hormatle,
Brendex Group`;

export const getResetPasswordTemplate = (istifadeciAdi, sifirlamaLinki) => `<!DOCTYPE html>
<html lang="az">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>Brendex - Şifrə sıfırlama</title>
  </head>
  <body style="margin:0;padding:0;background:#f4efe7;font-family:Arial,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4efe7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fffdf8;border-radius:28px;overflow:hidden;border:1px solid #eadfce;">
            <tr>
              <td style="padding:32px 36px;background:linear-gradient(135deg,#20130a 0%,#5f3a21 100%);color:#fff7ed;">
                <div style="font-size:12px;letter-spacing:0.28em;text-transform:uppercase;opacity:0.72;">Brendex Group Security</div>
                <h1 style="margin:14px 0 10px;font-size:32px;line-height:1.2;color:#ffffff;">Real şifrə sıfırlama istəyi</h1>
                <p style="margin:0;font-size:15px;line-height:1.7;color:#f6e7d7;">
                  Hesabınız üçün yeni şifrə təyin etmək istəyirsinizsə, aşağıdakı düymədən davam edin.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:36px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#374151;">
                  Salam ${istifadeciAdi || "istifadəçi"},
                </p>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#4b5563;">
                  Brendex Group tərəfindən hesabınız üçün şifrə sıfırlama istəyi qəbul edildi. Bu sorğu sizə məxsusdursa, aşağıdakı düyməyə klik edib yeni şifrə təyin edin.
                </p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#4b5563;">
                  Təhlükəsizlik üçün bu link yalnız <strong>30 dəqiqə</strong> aktiv qalır.
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                  <tr>
                    <td>
                      <a
                        href="${sifirlamaLinki}"
                        target="_blank"
                        style="display:inline-block;padding:14px 24px;border-radius:999px;background:#c67c2f;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;"
                      >
                        Şifrəni yenilə
                      </a>
                    </td>
                  </tr>
                </table>
                <div style="padding:18px 20px;border-radius:20px;background:#f8f3eb;border:1px solid #eadfce;margin-bottom:24px;">
                  <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#8b5e34;">
                    Düymə işləmirsə
                  </p>
                  <p style="margin:0;font-size:14px;line-height:1.7;color:#5b6472;word-break:break-word;">
                    <a href="${sifirlamaLinki}" style="color:#9a5b1d;text-decoration:none;">${sifirlamaLinki}</a>
                  </p>
                </div>
                <p style="margin:0 0 12px;font-size:15px;line-height:1.8;color:#4b5563;">
                  Bu sorğunu siz etməmisinizsə, emaili nəzərə almayın. Mövcud şifrəniz dəyişdirilməyəcək.
                </p>
                <p style="margin:0;font-size:15px;line-height:1.8;color:#374151;">
                  Hörmətlə,<br />
                  Brendex Group
                </p>
              </td>
            </tr>
          </table>
          <p style="max-width:640px;margin:18px auto 0;font-size:12px;line-height:1.7;color:#7b7280;text-align:center;">
            Bu təhlükəsizlik emaili Brendex Group tərəfindən hesabınız üçün avtomatik göndərilib.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
