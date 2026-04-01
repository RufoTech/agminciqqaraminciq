// Commission — hər sifariş üçün komisya qeydlərini saxlayan model.
// Hansı sifarişdən, hansı satıcıdan, nə qədər komisya alındığını izləyir.
import Commission    from "../model/Commission.js";

// SellerBalance — hər satıcının pul vəziyyətini saxlayan model.
// availableBalance (çəkilə bilən), pendingCommission (şirkətə aid),
// totalEarned, totalWithdrawn kimi sahələr buradadır.
import SellerBalance from "../model/SellerBalance.js";

// Stripe — kart ödəməsini emal etmək üçün kitabxana.
// Komisya köçürməsini Stripe PaymentIntent vasitəsilə həyata keçirir.
import Stripe        from "stripe";

// generateReceipt — komisya köçürməsinin PDF çekini yaradan yardımçı funksiya.
// Satıcıya və şirkətə sübut sənədi kimi göndərilir.
import generateReceipt from "../utils/generateReceipt.js";


// Stripe obyekti yaradılır — .env-dəki gizli açarla.
// Bu fayl yüklənən kimi bir dəfə yaradılır və yenidən istifadə olunur (Singleton).
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ── KOMİSYA FAİZİ ────────────────────────────────────────────────────────────
// Şirkətin hər sifarişdən götürdüyü faiz — 8%.
// Mərkəzi sabit olaraq saxlanılır: dəyişmək lazım olsa yalnız burada dəyişilir,
// bütün hesablamalar avtomatik yenilənir.
const COMMISSION_PERCENTAGE = 8;


// ════════════════════════════════════════════════════════════════════════════
//  YARDIMÇI FUNKSIYA — Satıcı balansını tap, yoxdursa yarat
// ────────────────────────────────────────────────────────────────────────────
// Niyə ayrıca funksiya?
//   Çünki bir neçə yerdə eyni məntiq lazımdır: tapmaq, yoxdursa yaratmaq.
//   Kodu təkrarlamamaq üçün (DRY — Don't Repeat Yourself) buraya çıxarıldı.
//
// Niyə findOne + create, upsert deyil?
//   Upsert (findOneAndUpdate + upsert:true) balans sahələrini sıfır ilə
//   başladır; burada isə yaradılma anında default dəyərlər Schema-da
//   təyin olunur — daha aydın və təhlükəsizdir.
// ════════════════════════════════════════════════════════════════════════════
const getOrCreateBalance = async (sellerId) => {
    let balance = await SellerBalance.findOne({ sellerId });
    if (!balance) balance = await SellerBalance.create({ sellerId });
    return balance;
};


// ════════════════════════════════════════════════════════════════════════════
//  1. SİFARİŞ YARANANDA ÇAĞIRILIR — createCommission
// ────────────────────────────────────────────────────────────────────────────
// Bu funksiya birbaşa HTTP endpoint deyil — order controller-dən çağırılır:
//   await createCommission(order._id, order.sellerId, order.totalPrice)
//
// Nə edir:
//   ① Sifariş məbləğindən komisya və satıcı qazancını hesablayır
//   ② Commission kolleksiyasına yeni qeyd yazır
//   ③ Satıcının SellerBalance-ini yeniləyir
//
// Niyə "pending" statusu?
//   Komisya dərhal şirkətə köçürülmür — ay sonunda toplu köçürmə edilir.
//   Bu aralıq dövrdə status "pending" qalır.
// ════════════════════════════════════════════════════════════════════════════
export const createCommission = async (orderId, sellerId, orderAmount) => {

    // Komisya hesablaması:
    //   orderAmount = 100 AZN olsa:
    //   commissionAmount = 100 * 8 / 100 = 8 AZN  → şirkətə
    //   sellerEarning    = 100 - 8 = 92 AZN        → satıcıya
    const commissionAmount = (orderAmount * COMMISSION_PERCENTAGE) / 100;
    const sellerEarning    = orderAmount - commissionAmount;
    const now              = new Date();

    // Commission qeydini bazaya yaz.
    // month/year sahələri aylıq hesabat sorğularında filter üçün lazımdır.
    // Məsələn: "mart 2026-nın bütün komisyaları" → {month:3, year:2026}
    await Commission.create({
        orderId,
        sellerId,
        orderAmount,
        commissionPercentage: COMMISSION_PERCENTAGE,
        commissionAmount,
        sellerEarning,
        month:  now.getMonth() + 1, // getMonth() 0-dan başlayır → +1 lazımdır
        year:   now.getFullYear(),
        status: "pending",
    });

    // Satıcının balansını tap (yoxdursa yarat) və yenilə.
    //
    // availableBalance  → satıcının çəkə biləcəyi pul (sellerEarning əlavə olunur)
    // pendingCommission → şirkətə aid olan hissə (satıcı buna toxuna BİLMƏZ)
    // totalEarned       → bütün zamanlarda qazandığı ümumi məbləğ (statistika)
    const balance = await getOrCreateBalance(sellerId);
    balance.availableBalance  += sellerEarning;
    balance.pendingCommission += commissionAmount;
    balance.totalEarned       += sellerEarning;
    await balance.save();
};


// ════════════════════════════════════════════════════════════════════════════
//  2. SİFARİŞ ÜZRƏ KOMİSYA — getOrderCommission
// ────────────────────────────────────────────────────────────────────────────
// GET /commission/order/:orderId
//
// Sifariş detalları səhifəsində göstərilir:
//   "Bu sifarişdən 8 AZN komisya tutuldu, sizə 92 AZN çatdı."
// ════════════════════════════════════════════════════════════════════════════
export const getOrderCommission = async (req, res) => {
    try {
        // orderId ilə həmin sifarişin komisya qeydini tap
        const commission = await Commission.findOne({ orderId: req.params.orderId });

        if (!commission) {
            return res.status(404).json({ success: false, message: "Komisya tapılmadı." });
        }

        // Həssas sahələr (sellerId, stripeId) göndərilmir — yalnız lazımlılar
        res.json({
            success:              true,
            orderAmount:          commission.orderAmount,
            commissionPercentage: commission.commissionPercentage,
            commissionAmount:     commission.commissionAmount,
            sellerEarning:        commission.sellerEarning,
            status:               commission.status,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// ════════════════════════════════════════════════════════════════════════════
//  3. SATICININ BALANSI — getSellerBalance
// ────────────────────────────────────────────────────────────────────────────
// GET /commission/balance/:sellerId
//
// Satıcı panelindəki "Balans" widget-i üçün:
//   "Çəkilə bilən: 920 AZN | Gözləyən komisya: 80 AZN"
//
// getOrCreateBalance istifadəsi — ilk dəfə panelə girən satıcıda
// balanssız xəta verməsin deyə avtomatik 0 balans yaradılır.
// ════════════════════════════════════════════════════════════════════════════
export const getSellerBalance = async (req, res) => {
    try {
        const balance = await getOrCreateBalance(req.params.sellerId);
        res.json({ success: true, balance });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// ════════════════════════════════════════════════════════════════════════════
//  4. AYLIK XÜLASƏ — getMonthlyCommission
// ────────────────────────────────────────────────════════════════════════════
// GET /commission/monthly/:sellerId?month=3&year=2026
//
// Satıcı panelindəki aylıq hesabat üçün:
//   "Mart 2026: 15 sifariş, 1500 AZN dövriyyə, 120 AZN komisya tutuldu."
//
// Query parametrləri göndərilməsə — cari ay/il istifadə olunur (default).
// ════════════════════════════════════════════════════════════════════════════
export const getMonthlyCommission = async (req, res) => {
    try {
        const { sellerId } = req.params;
        const now   = new Date();

        // parseInt() — URL-dən gələn dəyər string olur, rəqəmə çevirmək lazımdır.
        // || ilə default dəyər: göndərilməsə cari ay/il götürülür.
        const month = parseInt(req.query.month) || now.getMonth() + 1;
        const year  = parseInt(req.query.year)  || now.getFullYear();

        // populate("orderId", "createdAt totalPrice") —
        // Commission sənədindəki orderId-ni götürüb Order kolleksiyasından
        // yalnız createdAt və totalPrice sahələrini çəkir.
        // Bu sayəsində cavabda hər komisyanın sifariş tarixi və məbləği görünür.
        const commissions = await Commission.find({ sellerId, month, year }).populate(
            "orderId",
            "createdAt totalPrice"
        );

        // reduce() — massivin bütün elementlərini toplayır.
        // s = yığılan cəm (accumulator), c = cari element (current)
        const totalOrderAmount   = commissions.reduce((s, c) => s + c.orderAmount,     0);
        const totalCommission    = commissions.reduce((s, c) => s + c.commissionAmount, 0);
        const totalSellerEarning = commissions.reduce((s, c) => s + c.sellerEarning,    0);

        // Hələ köçürülməmiş (pending) komisyaların cəmi
        const pendingAmount = commissions
            .filter((c) => c.status === "pending")
            .reduce((s, c) => s + c.commissionAmount, 0);

        res.json({
            success:            true,
            month,
            year,
            totalOrderAmount,
            totalCommission,
            totalSellerEarning,
            totalOrders:        commissions.length,
            pendingAmount,                           // hələ köçürülməyən komisya
            alreadyTransferred: totalCommission - pendingAmount, // köçürülmüş hissə
            commissions,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// ════════════════════════════════════════════════════════════════════════════
//  5. AY SONU KOMİSYA TRANSFERİ — transferCommission
// ────────────────────────────────────────────────────────────────────────────
// POST /commission/transfer
// Body: { sellerId, sellerName, month, year, paymentMethodId }
//
// Bu, sistemin ən kritik endpoint-idir. Addımlar:
//   ① Həmin ay üçün "pending" komisyaları tapır
//   ② Stripe PaymentIntent ilə şirkət hesabına ödəniş edir
//   ③ Stripe uğurlu olarsa — komisyaları "transferred" edir
//   ④ Satıcının pendingCommission balansını sıfırlayır
//   ⑤ PDF çek yaradır
//   ⑥ Çek URL-ini komisyalara əlavə edir
//
// Niyə addımlar bu ardıcıllıqla?
//   Stripe uğursuz olarsa komisyalar "failed" olur — heç bir balans
//   dəyişmir. Bu, "yarım köçürmə" ssenarisinin qarşısını alır.
// ════════════════════════════════════════════════════════════════════════════
export const transferCommission = async (req, res) => {
    try {
        const { sellerId, sellerName, month, year, paymentMethodId } = req.body;

        // ① Həmin ay üçün "pending" statuslu komisyaları tap
        const pending = await Commission.find({ sellerId, month, year, status: "pending" });

        // Pending komisya yoxdursa — ya köçürülüb, ya da bu ay sifariş yoxdur
        if (pending.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Köçürüləcək komisya yoxdur. Artıq köçürülmüş ola bilər.",
            });
        }

        // ② Ümumi məbləğləri hesabla — Stripe-a göndəriləcək rəqəm buradan çıxır
        const totalOrderAmount   = pending.reduce((s, c) => s + c.orderAmount,     0);
        const totalCommission    = pending.reduce((s, c) => s + c.commissionAmount, 0);
        const totalSellerEarning = pending.reduce((s, c) => s + c.sellerEarning,    0);

        // ③ Stripe PaymentIntent yarat və dərhal təsdiqlə
        //
        // amount: Math.round(totalCommission * 100) — Stripe qəpik (kuruş) ilə işləyir.
        //   Məsələn: 80.50 AZN → 8050 qəpik. Math.round() ondalıq xətalarını düzəldir.
        //
        // confirm: true — yaratmaqla eyni anda təsdiqlər, ayrıca confirm() lazım deyil.
        //
        // automatic_payment_methods + allow_redirects: "never" —
        //   Server tərəfli ödənişdə yönləndirmə olmur; bu parametr Stripe-ın
        //   3D Secure yönləndirməsini söndürür.
        let paymentIntent;
        try {
            paymentIntent = await stripe.paymentIntents.create({
                amount:      Math.round(totalCommission * 100),
                currency:    "azn",
                payment_method: paymentMethodId,
                confirm:     true,
                automatic_payment_methods: { enabled: true, allow_redirects: "never" },
                description: `Komisya köçürməsi | Satıcı: ${sellerId} | ${month}/${year}`,
            });
        } catch (stripeErr) {
            // Stripe xətasında komisyaları "failed" et —
            // satıcı nə baş verdiyini görə bilsin, yenidən cəhd etsin.
            await Commission.updateMany(
                { sellerId, month, year, status: "pending" },
                { status: "failed" }
            );
            return res.status(400).json({
                success: false,
                message: `Stripe xətası: ${stripeErr.message}`,
            });
        }

        // Stripe cavabı "succeeded" deyilsə — ödəniş tamamlanmayıb
        // (məsələn: "requires_action" → 3D Secure tələb edir)
        if (paymentIntent.status !== "succeeded") {
            return res.status(400).json({
                success: false,
                message: `Ödəniş tamamlanmadı. Stripe statusu: ${paymentIntent.status}`,
            });
        }

        const transferredAt = new Date();

        // ④ Komisyaları "transferred" olaraq işarələ.
        // updateMany — eyni şərtə uyan bütün sənədləri bir əməliyyatla yeniləyir.
        // stripePaymentIntentId — uğurlu ödənişin Stripe-dakı ID-si (izlənə bilər).
        await Commission.updateMany(
            { sellerId, month, year, status: "pending" },
            {
                status:                "transferred",
                stripePaymentIntentId: paymentIntent.id,
                transferredAt,
            }
        );

        // ⑤ Satıcının pendingCommission balansını azalt.
        // $inc — MongoDB-nin artırma/azaltma operatoru.
        //   pendingCommission: -totalCommission → azalt (0-a çatır)
        //   totalCommissionPaid: +totalCommission → statistika üçün artır
        //
        // Niyə availableBalance dəyişmir?
        //   Çünki bu pul artıq şirkətin — satıcının balansına heç daxil olmamışdı.
        //   Yalnız pendingCommission sütunu azalır.
        await SellerBalance.findOneAndUpdate(
            { sellerId },
            {
                $inc: {
                    pendingCommission:   -totalCommission,
                    totalCommissionPaid:  totalCommission,
                },
            }
        );

        // ⑥ PDF çek yarat — köçürmənin rəsmi sənədi
        const { fileName } = await generateReceipt({
            sellerId,
            sellerName,
            month,
            year,
            totalOrderAmount,
            totalCommission,
            totalSellerEarning,
            ordersCount: pending.length,
            stripeId:    paymentIntent.id,
            transferredAt,
        });

        const receiptUrl = `/uploads/receipts/${fileName}`;

        // ⑦ Çek URL-ini həmin komisyalara əlavə et —
        // satıcı hər komisyanın çekini ayrıca görə bilsin.
        await Commission.updateMany(
            { sellerId, month, year, status: "transferred", transferredAt },
            { receiptUrl }
        );

        res.json({
            success:           true,
            message:           `${totalCommission.toFixed(2)} AZN uğurla şirkət hesabına köçürüldü!`,
            totalCommission,
            totalSellerEarning,
            ordersCount:       pending.length,
            stripeId:          paymentIntent.id,
            receiptUrl,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// ════════════════════════════════════════════════════════════════════════════
//  6. SATICININ QAZANCINI ÇƏKMƏSİ — withdrawBalance
// ────────────────────────────────────────────────────────────────────────────
// POST /commission/withdraw
// Body: { sellerId, amount }
//
// Satıcı öz qazancını (availableBalance) hesabına çıxardır.
//
// Niyə pendingCommission-a toxunulmur?
//   pendingCommission şirkətə aiddir — satıcı onu çəkə bilməz.
//   Yalnız availableBalance (satıcının qazancı) azalır.
// ════════════════════════════════════════════════════════════════════════════
export const withdrawBalance = async (req, res) => {
    try {
        const { sellerId, amount } = req.body;

        // Mənfi və ya sıfır məbləğ qəbul edilmir
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Məbləğ 0-dan böyük olmalıdır.",
            });
        }

        const balance = await SellerBalance.findOne({ sellerId });

        // Balans yoxdur və ya çəkilmək istənilən məbləğ mövcud balansdan çoxdur
        // balance?.availableBalance → balance null olarsa 0 qaytarır (optional chaining)
        if (!balance || balance.availableBalance < amount) {
            return res.status(400).json({
                success:          false,
                message:          "Kifayət qədər balans yoxdur.",
                availableBalance: balance?.availableBalance || 0,
            });
        }

        // availableBalance azaldılır — çəkilən məbləğ qədər
        // totalWithdrawn artırılır — satıcının ümumi çəkimə statistikası üçün
        balance.availableBalance -= amount;
        balance.totalWithdrawn   += amount;
        await balance.save();

        res.json({
            success:           true,
            message:           `${amount.toFixed(2)} AZN uğurla çəkildi!`,
            remainingBalance:  balance.availableBalance,
            // pendingCommission da göstərilir — satıcı nə qədər komisya
            // gözlədiyini bilsin (amma ona çata bilməz)
            pendingCommission: balance.pendingCommission,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// ════════════════════════════════════════════════════════════════════════════
//  7. ADMİN — BÜTÜN SATICILARIN KOMİSYALARI — getAllCommissions
// ────────────────────────────────────────────────────────────────────────────
// GET /commission/admin/all?month=3&year=2026&status=pending
//
// Admin panelindəki "Komisyalar" cədvəli üçün.
// Query parametrləri ilə filter edilə bilir: ay, il, status.
// Göndərilməyən filter parametrləri nəzərə alınmır — hamısı gəlir.
// ════════════════════════════════════════════════════════════════════════════
export const getAllCommissions = async (req, res) => {
    try {
        // Dinamik filter obyekti — yalnız göndərilən parametrlər əlavə edilir.
        // Məsələn: yalnız month göndərilibsə → {month: 3}
        // Heç biri göndərilməyibsə → {} → bütün komisyalar gəlir
        const filter = {};
        if (req.query.month)  filter.month  = parseInt(req.query.month);
        if (req.query.year)   filter.year   = parseInt(req.query.year);
        if (req.query.status) filter.status = req.query.status;

        const commissions = await Commission.find(filter)
            .populate("sellerId", "name email")  // satıcının adı və emaili
            .populate("orderId",  "totalPrice createdAt") // sifarişin məbləği və tarixi
            .sort({ createdAt: -1 }); // ən yeni üstdə

        // Ümumi komisya məbləği — admin neçə pul topladığını görür
        const totalCommissionAmount = commissions.reduce(
            (s, c) => s + c.commissionAmount, 0
        );

        res.json({
            success:             true,
            totalCommissionAmount,
            count:               commissions.length,
            commissions,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// ════════════════════════════════════════════════════════════════════════════
//  8. ADMİN — BÜTÜN SATICILARIN BALANSLARI — getAllSellerBalances
// ────────────────────────────────────────────────────────────────────────────
// GET /commission/admin/balances
//
// Admin "Satıcı Balansları" səhifəsi üçün.
// sort({ pendingCommission: -1 }) — ən çox komisya borcu olan satıcı üstdə,
// bu, adminin kimə öncelik verəcəyini asanlaşdırır.
// ════════════════════════════════════════════════════════════════════════════
export const getAllSellerBalances = async (req, res) => {
    try {
        const balances = await SellerBalance.find()
            .populate("sellerId", "name email")
            .sort({ pendingCommission: -1 }); // ən çox gözləyən üstdə

        // Bütün satıcıların gözləyən komisyalarının cəmi —
        // şirkətin bu ay alacağı ümumi məbləğ
        const totalPendingCommission = balances.reduce(
            (s, b) => s + b.pendingCommission, 0
        );

        res.json({
            success:             true,
            totalPendingCommission,
            count:               balances.length,
            balances,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};