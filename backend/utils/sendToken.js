// =====================================================================
// TOKEN YARAT VƏ CAVAB GÖNDƏR — sendToken
// ---------------------------------------------------------------------
// Bu fayl giriş (login) və qeydiyyat (register) uğurlu olduqda
// çağırılır — istifadəçiyə JWT token verilir.
//
// Çağırıldığı yerlər:
//   authController.js       → registerUser(), login(), resetPassword()
//   superAdminController.js → registerSuperAdmin(), superAdminLogin(), superAdminResetPassword()
//
// Parametrlər:
//   user       → istifadəçi obyekti (User, Admin və ya SuperAdmin)
//   statusCode → HTTP kodu: 201 (yeni yaradıldı) və ya 200 (uğurlu)
//   res        → Express cavab obyekti
//   extraData  → isteğe bağlı əlavə məlumatlar (default: boş obyekt)
//                registerSuperAdmin-da generasiya edilmiş email/şifrəni
//                response-a əlavə etmək üçün istifadə olunur.
//                authController-da admin register üçün storeLink, storeSlug
//                bu parametr vasitəsilə cavaba əlavə edilir.
//
// superAdminMiddleware.js-dəki sendToken ilə fərqi:
//   Bu versiya — extraData dəstəkləyir və sellerInfo-nu da göndərir.
//   Digər versiya — həm cookie, həm response body-də token göndərir (Postman üçün).
//   Hansını istifadə etmək layihənin tələbindən asılıdır.
// =====================================================================
export default (user, statusCode, res, extraData = {}) => {

    // ── JWT TOKEN YARAT ─────────────────────────────────────────────
    // jwtTokeniEldeEt() — User/Admin/SuperAdmin modelindəki metoddur.
    // İçəridə: jwt.sign({ id: user._id, model: "User" }, SECRET, { expiresIn: "7d" })
    //
    // "model" sahəsi — isAuthenticatedUser middleware-i üçün lazımdır:
    //   "User"       → users kolleksiyasında axtarış
    //   "Admin"      → admins kolleksiyasında axtarış
    //   "SuperAdmin" → superadmins kolleksiyasında axtarış
    const token = user.jwtTokeniEldeEt();


    // ── COOKIE SEÇİMLƏRİ ─────────────────────────────────────────────
    // expires — cookie-nin bitmə tarixi:
    //   COOKIE_EXPIRES_TIME = 7 (gün)
    //   Date.now()                   → cari vaxt (millisaniyə)
    //   * 24 * 60 * 60 * 1000        → 7 günü millisaniyəyə çevir
    //   Nəticə: 7 gün sonrakı tarix → brauzer bu tarixdən sonra cookie-ni silir.
    //
    // httpOnly: true — XSS (Cross-Site Scripting) qoruması:
    //   JavaScript-dən document.cookie ilə token oxunabilir olmaması.
    //   Zərərli skript token-i oğurlaya bilmir.
    //   Token yalnız HTTP sorğularında avtomatik göndərilir.
    //
    // sameSite — DƏYİŞİKLİK: əvvəl yox idi, indi əlavə edildi.
    //   PRODUCTION-da "none"  → frontend və backend ayrı domendədirsə
    //                           cross-site cookie-lər göndərilsin deyə.
    //                           "none" yalnız secure: true ilə işləyir.
    //   DEVELOPMENT-da "lax"  → localhost-da cross-origin cookie-lər işləyir,
    //                           eyni zamanda CSRF-dən qoruyur.
    //
    // secure — DƏYİŞİKLİK: əvvəl yox idi, indi əlavə edildi.
    //   PRODUCTION-da true  → cookie yalnız HTTPS-də göndərilir (MITM qoruması)
    //   DEVELOPMENT-da false → localhost HTTP-də də cookie işləyir
    //
    // Bu iki sahənin olmaması login sonrası 401 xətasına səbəb olurdu:
    //   Brauzer cross-origin sorğularda cookie-ni göndərmirdi →
    //   isAuthenticatedUser token tapa bilmirdi → 401 qaytarırdı.
    const isProduction = process.env.NODE_ENV === "PRODUCTION";
    // COOKIE_EXPIRES_TIME yoxlanılır (default: 7 gün)
    const expiresDays = Number(process.env.COOKIE_EXPIRES_TIME) || 7;

    const options = {
        expires:  new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure:   isProduction,
    };


    // ── USER CAVAB OBYEKTİ ───────────────────────────────────────────
    // Əsas sahələr həmişə göndərilir: id, name, email, role.
    //
    // sellerStatus — admin üçün "approved"/"pending", user üçün "none".
    // sellerInfo   — admin üçün mağaza məlumatları (storeName, storeSlug...),
    //                user üçün null.
    //
    // Niyə sellerInfo əlavə edildi?
    //   AdminProducts komponenti user?.user?.sellerInfo?.storeName oxuyur.
    //   Navbar isAdmin yoxlaması user?.user?.role oxuyur.
    //   Bu sahələr olmazsa, admin panel düzgün işləmir:
    //     — AdminProducts boş siyahı göstərir (seller filter işləmir)
    //     — AddProduct "seller" sahəsini doldura bilmir
    //     — Login/Register sonrası fərq olmur (hər ikisi eyni davranır)
    //
    // Göndərilməyən həssas məlumatlar (təhlükəsizlik prinsipi):
    //   password           → hash olsa belə göndərilmir
    //   resetPasswordToken → sıfırlama tokeni şəxsidir
    //   phone, taxNumber, vonNumber → həssas biznes məlumatı
    //   __v, createdAt     → texniki sahələr
    const userResponse = {
        id:           user._id,
        name:         user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email:        user.email,
        role:         user.role,
        // sellerStatus — mövcud deyilsə (User modelində "none" default) null göndər
        sellerStatus: user.sellerStatus || null,
        // sellerInfo — mövcud deyilsə (User modelində yoxdur) null göndər
        // Admin modelindən gəlirsə: { storeName, storeSlug, storeAddress, ... }
        sellerInfo:   user.sellerInfo
            ? {
                storeName:    user.sellerInfo.storeName    || null,
                storeSlug:    user.sellerInfo.storeSlug    || null,
                storeAddress: user.sellerInfo.storeAddress || null,
                // phone, taxNumber, vonNumber — həssas, göndərilmir
            }
            : null,
    };


    // ── CAVAB GÖNDƏR ────────────────────────────────────────────────
    // .status(statusCode)  → HTTP status kodunu təyin et
    // .cookie("token", token, options) → "token" adlı cookie-ni brauzerə yaz
    // .json({...})         → JSON cavabı göndər
    //
    // Method chaining — üç metod ardıcıl zəncirlənir:
    //   status() → cookie() → json()
    //   Hər metod res obyektini qaytarır, ona görə zəncirlənə bilir.
    //
    // token — həm cookie-də (brauzer üçün), həm response body-də (Postman üçün).
    //
    // extraData — admin register zamanı storeLink və storeSlug əlavə edilir.
    //   Spread operator (...) ilə əsas cavaba birləşdirilir.
    //   Digər sendToken çağırışlarında extraData = {} olduğundan
    //   response-a heç bir əlavə sahə gəlmir — köhnə davranış dəyişmir.
    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        token,
        user: userResponse,
        ...extraData,
    });
};