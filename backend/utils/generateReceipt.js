// pdfkit — Node.js-də PDF faylı yaratmaq üçün kitabxana.
// Mətn, cədvəl, rəng, şrift kimi elementlər əlavə etməyə imkan verir.
import PDFDocument from "pdfkit";

// fs — fayl sistemi: qovluq yaratmaq, fayla yazmaq üçün.
import fs from "fs";

// path — fayl yollarını idarə etmək üçün.
import path from "path";

// fileURLToPath — ES Module-da __dirname əl ilə yaratmaq üçün.
import { fileURLToPath } from "url";


// ── ES MODULE YOLU ───────────────────────────────────────────────────
// CommonJS-də __dirname avtomatik gəlir, ES Module-da əl ilə yazılır.
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);


// ── ÇEKLƏR QOVLUĞUNU YARAT ──────────────────────────────────────────
// Yaradılan PDF çeklər bu qovluğa yazılır: uploads/receipts/
// Qovluq yoxdursa — avtomatik yaradılır.
// { recursive: true } — ana qovluqlar da yoxdursa yaradılır.
const receiptsDir = path.join(__dirname, "../uploads/receipts");
if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
}


// =====================================================================
// PDF ÇEK YARADAN — generateReceipt
// ---------------------------------------------------------------------
// Niyə Promise qaytarır?
//   PDF yaratmaq asinxron axın (stream) əməliyyatıdır.
//   doc.pipe(stream) — sənədi fayla yazmağa başlayır.
//   stream.on("finish") — fayl tam yazıldıqda çağırılır.
//   Promise ilə "finish" hadisəsini await ilə gözləyə bilirik:
//     const { fileName } = await generateReceipt(data)
//
// Nəticə: { fileName, filePath }
//   fileName → çekin URL-i üçün: `/uploads/receipts/receipt_...pdf`
//   filePath → serverdəki tam yol (lazım olsa oxumaq üçün)
// =====================================================================
const generateReceipt = (data) => {
    return new Promise((resolve, reject) => {

        // ── VERİLƏNLƏRİ ÇIXAR ───────────────────────────────────────
        const {
            sellerId,           // Satıcının mağaza adı (fayl adında istifadə)
            sellerName,         // Çekdə göstəriləcək satıcı adı
            month,              // Hansı ay: 3
            year,               // Hansı il: 2026
            totalOrderAmount,   // Cəmi satış məbləği: 1000 AZN
            totalCommission,    // Şirkətə gedən komisya: 80 AZN (8%)
            totalSellerEarning, // Satıcıya qalan: 920 AZN
            ordersCount,        // Neçə sifariş: 15
            stripeId,           // Stripe ödəniş ID-si: "pi_3Qv..."
            transferredAt,      // Köçürmə tarixi/saatı
        } = data;


        // ── FAYL ADI VƏ YOLU ─────────────────────────────────────────
        // Date.now() — eyni satıcı üçün eyni ay çeki bir neçə dəfə
        // yaradılsa adlar toqquşmasın deyə əlavə edilir.
        // Nəticə: "receipt_Apple-Store_3_2026_1718923456789.pdf"
        const fileName = `receipt_${sellerId}_${month}_${year}_${Date.now()}.pdf`;
        const filePath = path.join(receiptsDir, fileName);


        // ── PDF SƏNƏDİ YARAT ─────────────────────────────────────────
        // PDFDocument — yeni boş PDF sənədi.
        // { margin: 50 } — hər tərəfdən 50 point (təxminən 1.76sm) boşluq.
        const doc = new PDFDocument({ margin: 50 });

        // fs.createWriteStream — PDF-i fayla yazan axın (stream) yaradır.
        // doc.pipe(stream) — PDF məzmunu bu axına yönləndirilir.
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);


        // ── BAŞLIQ BÖLMƏSİ ──────────────────────────────────────────
        // fontSize → şrift ölçüsü (point)
        // font → şrift ailməsi (PDFKit-in daxili şriftləri: Helvetica, Times-Roman, Courier)
        // fillColor → mətn rəngi (hex)
        // text → sənədə mətn əlavə et
        // { align: "center" } → mərkəzlənmiş
        doc
            .fontSize(24)
            .font("Helvetica-Bold")
            .fillColor("#1a1a2e")
            .text("KOMİSYA ÇEKİ", { align: "center" });

        doc
            .fontSize(11)
            .font("Helvetica")
            .fillColor("#666666")
            .text("Rəsmi Ödəniş Qəbzi", { align: "center" });

        // moveDown(0.8) — aşağıya 0.8 sətir boşluğu.
        // moveTo/lineTo → üfüqi xətt çək.
        // strokeColor → xətt rəngi, lineWidth → xətt qalınlığı, stroke() → çəkmə.
        doc.moveDown(0.8);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#cccccc").lineWidth(1).stroke();
        doc.moveDown(0.8);


        // ── SƏTIR KÖMƏKÇİ FUNKSİYASI ────────────────────────────────
        // addRow — əsas (sol) və dəyər (sağ) olan bir sətir yaradır.
        //
        // Parametrlər:
        //   label     → sol tərəf: "Satıcı:", "Cəmi məbləğ:" kimi
        //   value     → sağ tərəf: dəyər
        //   highlight → true olarsa — qalın şrift, tünd rəng (nəticə sətri üçün)
        //
        // { continued: true, width: 280 } — mətn buradan davam edir,
        //   maksimum 280 point genişlik. Növbəti .text() çağırışı eyni sətirdə davam edir.
        // { align: "right" } — dəyər sağa yanaşdırılır.
        const addRow = (label, value, highlight = false) => {
            const y = doc.y;
            doc
                .fontSize(11)
                .font(highlight ? "Helvetica-Bold" : "Helvetica")
                .fillColor(highlight ? "#000000" : "#333333")
                .text(label, 50, y, { continued: true, width: 280 });

            doc
                .font(highlight ? "Helvetica-Bold" : "Helvetica")
                .fillColor(highlight ? "#1a1a2e" : "#555555")
                .text(value, { align: "right" });

            doc.moveDown(0.45); // Sətirlərar boşluq
        };


        // ── MƏLUMAT SƏTİRLƏRİ ───────────────────────────────────────
        // sellerName || sellerId.toString() — sellerName boşdursa ID göstər.
        addRow("Satıcı:",            sellerName || sellerId.toString());
        addRow("Dövr:",              `${month}/${year}`);
        // toLocaleString("az-AZ") → Azərbaycan tarix/saat formatı:
        //   "14.03.2026, 15:30:45"
        addRow("Köçürülmə tarixi:",  new Date(transferredAt).toLocaleString("az-AZ"));
        // Stripe ID olmasa "-" göstər
        addRow("Stripe Ödəniş ID:", stripeId || "-");
        addRow("Sifariş sayı:",      `${ordersCount} sifariş`);

        // Bölücü xətt
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#cccccc").lineWidth(1).stroke();
        doc.moveDown(0.8);

        // ── MALİYYƏ MƏLUMATLARİ ─────────────────────────────────────
        // toFixed(2) → 80.00 AZN kimi iki ondalıq rəqəm
        addRow("Cəmi satış məbləği:",        `${totalOrderAmount.toFixed(2)} AZN`);
        addRow("Komisya faizi:",              "8%");
        addRow("Komisya məbləği (şirkətə):",  `${totalCommission.toFixed(2)} AZN`);
        addRow("Satıcıya qalan məbləğ:",      `${totalSellerEarning.toFixed(2)} AZN`);

        // Nəticədən əvvəl qalın bölücü xətt (lineWidth: 1.5 — daha görünən)
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#000000").lineWidth(1.5).stroke();
        doc.moveDown(0.8);

        // ── NƏTİCƏ SƏTRİ ────────────────────────────────────────────
        // highlight: true → qalın şrift + tünd rəng — ən vacib məlumat
        addRow("Şirkətə köçürüldü:", `${totalCommission.toFixed(2)} AZN`, true);

        // ── ALTBILGI (FOOTER) ────────────────────────────────────────
        // moveDown(2) → 2 sətir boşluq
        doc.moveDown(2);
        doc
            .fontSize(9)
            .fillColor("#999999")
            .text(
                "Bu çek avtomatik sistem tərəfindən yaradılmışdır. Rəsmi sənəd kimi qəbul edilir.",
                { align: "center" }
            );


        // ── PDF-İ TAMAMLA ────────────────────────────────────────────
        // doc.end() — PDF sənədinin yaradılmasını bitirir.
        // Bu çağırışdan sonra stream-ə daha heç nə yazılmır.
        doc.end();


        // ── AXIN HADİSƏLƏRİ ─────────────────────────────────────────
        // "finish" — bütün məlumatlar fayla yazıldıqda çağırılır.
        //   resolve({ fileName, filePath }) → Promise uğurla tamamlanır.
        //   commissionController-da:
        //     const { fileName } = await generateReceipt(data)
        //     const receiptUrl = `/uploads/receipts/${fileName}`
        //
        // "error" — fayla yazma zamanı xəta baş verərsə.
        //   reject(err) → Promise xəta ilə tamamlanır.
        stream.on("finish", () => resolve({ fileName, filePath }));
        stream.on("error",  reject);
    });
};


export default generateReceipt;