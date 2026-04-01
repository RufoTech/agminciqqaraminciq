// ============================================================
// ForgotPassword.jsx
// Bu komponent istifadəçinin şifrəsini sıfırlamaq üçün
// e-poçt ünvanını daxil etdiyi formu göstərir.
// RTK Query mutation hook-u ilə API-yə sorğu göndərilir.
// ============================================================

import { useState } from "react"
// useForgotPasswordMutation — şifrə sıfırlama sorğusu göndərən RTK Query mutation hook-u
import { useForgotPasswordMutation } from "../redux/api/authApi"
// Toast bildirişlər üçün kitabxana
import { toast, ToastContainer } from "react-toastify"
// Toast üçün lazımi CSS stillər
import "react-toastify/dist/ReactToastify.css"

const ForgotPassword = () => {
  // İstifadəçinin daxil etdiyi email ünvanını saxlayan state
  const [email, setEmail] = useState("")

  // RTK Query mutation hook-u
  // forgotPassword — API-yə sorğu göndərən funksiya
  // isLoading      — sorğu davam edərkən true olur (düyməni deaktiv etmək üçün)
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  // Form submit olduqda işə düşən funksiya
  const submitHandler = async (e) => {
    // Formanın default davranışını (səhifəni yeniləməyi) bloklayır
    e.preventDefault()
    try {
      // API-yə email göndəririk, .unwrap() xətanı catch-ə ötürür
      const result = await forgotPassword({ email }).unwrap()
      // Uğurlu sorğu — istifadəçiyə bildiriş göstəririk
      toast.success("Şifrə sıfırlama linki emailinizə göndərildi!")
      console.log("Forgot password request successful", result)
    } catch (err) {
      // API xətası — backendden gələn xəta mesajı göstərilir,
      // məlumat yoxdursa ehtiyat mesajı istifadə olunur
      toast.error(err.data?.message || "Bir hata oluştu. Lütfen tekrar deneyin.")
      console.error("Forgot password request failed", err)
    }
  }

  return (
    <>
      {/* ── KOMPONENTƏ ÖZƏL CSS STİLLƏR ── */}
      <style>{`
        /* Tam ekran mərkəzləşdirilmiş arxa fon */
        .forgot-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(to bottom right, #f9f9f9, #fff);
          padding: 24px 16px;
        }

        /* Şüşəvari effektli kart — backdrop-filter ilə bulanıq arxa fon */
        .forgot-card {
          width: 100%;
          max-width: 440px;
          padding: 40px 40px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(24px);        /* şüşə effekti */
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          border: 1px solid rgba(255,255,255,0.4);
          transition: transform 0.4s ease;
        }
        /* Hover-da kartı cüzi böyüdür — hover effekti */
        .forgot-card:hover { transform: scale(1.02); }

        /* Mobil üçün tənzimləmələr */
        @media (max-width: 480px) {
          .forgot-card { padding: 28px 20px; border-radius: 16px; }
          /* Mobilə hover effektini söndürürük (barmaq ilə hover olmur) */
          .forgot-card:hover { transform: none; }
          .forgot-title { font-size: 26px !important; }
          .forgot-desc { font-size: 14px !important; }
        }

        /* Başlıq stili */
        .forgot-title {
          margin-bottom: 16px; font-size: 32px; font-weight: 800;
          text-align: center; color: #111;
        }
        /* Təsvir mətni */
        .forgot-desc {
          margin-bottom: 28px; text-align: center;
          font-size: 15px; color: #666; line-height: 1.6;
        }
        /* Input etiketi */
        .forgot-label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 600; color: #444; }

        /* Email input sahəsi */
        .forgot-input {
          margin-top: 6px; width: 100%; padding: 13px 16px;
          border-radius: 50px;                    /* tam dairəvi uclar */
          background: rgba(255,255,255,0.7);
          border: 1.5px solid rgba(0,0,0,0.1);
          font-size: max(16px, 14px);             /* iOS-da auto zoom-u önləmək üçün min 16px */
          outline: none;
          transition: 0.2s; box-sizing: border-box;
        }
        /* Focus vəziyyəti — mor rəngdə halqa */
        .forgot-input:focus { box-shadow: 0 0 0 4px rgba(99,102,241,0.15); border-color: #6366f1; }

        /* Submit düyməsi */
        .forgot-btn {
          width: 100%; padding: 14px; border-radius: 50px;
          background: #4f46e5; color: #fff; font-size: 15px; font-weight: 700;
          border: none; cursor: pointer; margin-top: 20px;
          transition: background 0.2s; box-shadow: 0 4px 16px rgba(79,70,229,0.25);
          min-height: 50px;                       /* toxunma hədəfi üçün kifayət qədər böyük */
        }
        /* Hover — tünd mor rəngə keçir (:disabled-də işləmir) */
        .forgot-btn:hover:not(:disabled) { background: #4338ca; }
        /* Deaktiv (yüklənir) vəziyyəti — solğun görünür, kursor dəyişir */
        .forgot-btn:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>

      <section className="forgot-section">
        <div className="forgot-card">
          {/* Başlıq */}
          <h1 className="forgot-title">Forgot your password?</h1>
          {/* Təsvir mətni */}
          <p className="forgot-desc">
            Don't fret! Just type in your email and we will send you a code to reset your password!
          </p>

          {/* ── ŞIFRƏ SIFIRLAMA FORMU ── */}
          {/* onSubmit={submitHandler} — form submit olduqda API-yə sorğu göndərilir */}
          <form onSubmit={submitHandler}>
            <div>
              {/* htmlFor="email" — label-ı input-a bağlayır (accessibility üçün vacibdir) */}
              <label htmlFor="email" className="forgot-label">Your email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}                          // state ilə idarə olunan input
                onChange={(e) => setEmail(e.target.value)}  // hər dəyişiklikdə state yenilənir
                placeholder="name@company.com"
                required                               // boş göndərilməsinin qarşısını alır
                className="forgot-input"
                autoComplete="email"                   // brauzer autofill-i aktiv edir
              />
            </div>

            {/* Submit düyməsi — sorğu davam edərkən deaktiv olur, mətn dəyişir */}
            <button type="submit" disabled={isLoading} className="forgot-btn">
              {/* isLoading true-dursa "Göndərilir...", yoxdursa normal mətn */}
              {isLoading ? "Göndərilir..." : "Şifrəmi Sıfırla"}
            </button>
          </form>
        </div>

        {/* Toast bildiriş konteyner-i */}
        {/* position: bildirişin ekrandakı yeri */}
        {/* autoClose: 5000ms sonra avtomatik bağlanır */}
        {/* pauseOnHover: üzərinə gəldikdə geri sayım dayanır */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </section>
    </>
  )
}

export default ForgotPassword