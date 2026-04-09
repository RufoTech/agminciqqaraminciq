// Alıcı üçün PDF çek yaradan funksiya (komisya çekindən fərqli)
import PDFDocument from "pdfkit";
import fs          from "fs";
import path        from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const receiptsDir = path.join(__dirname, "../uploads/receipts");
if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
}

// =====================================================================
// ALICI ÇEKİ YARADAN — generateOrderReceipt
// ---------------------------------------------------------------------
// data: { orderId, userName, userEmail, orderItems, totalAmount, currency, createdAt }
// Qaytarır: { fileName, filePath, receiptUrl }
// =====================================================================
const generateOrderReceipt = (data) => {
    return new Promise((resolve, reject) => {
        const { orderId, userName, userEmail, orderItems, totalAmount, currency, createdAt } = data;

        const orderNum  = orderId.toString().slice(-8).toUpperCase();
        const fileName  = `order_receipt_${orderId}_${Date.now()}.pdf`;
        const filePath  = path.join(receiptsDir, fileName);
        const receiptUrl = `/uploads/receipts/${fileName}`;

        const doc    = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // ── BAŞLIQ ────────────────────────────────────────────────────
        doc
            .fontSize(26)
            .font("Helvetica-Bold")
            .fillColor("#E8192C")
            .text("Brendex", { align: "center", continued: true })
            .fillColor("#111111")
            .text(" — Ödəniş Çeki", { align: "center" });

        doc
            .fontSize(10)
            .font("Helvetica")
            .fillColor("#888888")
            .text("Onlayn Alış-veriş Platforması | www.brendex.az", { align: "center" });

        doc.moveDown(0.8);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#cccccc").lineWidth(1).stroke();
        doc.moveDown(0.8);

        // ── SİFARİŞ MƏLUMATLARI ───────────────────────────────────────
        const addRow = (label, value, bold = false) => {
            const y = doc.y;
            doc
                .fontSize(11)
                .font(bold ? "Helvetica-Bold" : "Helvetica")
                .fillColor(bold ? "#111111" : "#444444")
                .text(label, 50, y, { continued: true, width: 280 });
            doc
                .font(bold ? "Helvetica-Bold" : "Helvetica")
                .fillColor(bold ? "#111111" : "#666666")
                .text(value, { align: "right" });
            doc.moveDown(0.45);
        };

        addRow("Sifariş №:",  `#${orderNum}`);
        addRow("Alıcı:",      userName || "—");
        addRow("Email:",      userEmail || "—");
        addRow("Tarix:",      new Date(createdAt).toLocaleString("az-AZ"));
        addRow("Valyuta:",    (currency || "AZN").toUpperCase());

        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#cccccc").lineWidth(1).stroke();
        doc.moveDown(0.8);

        // ── MƏHSULLAR ─────────────────────────────────────────────────
        doc.fontSize(12).font("Helvetica-Bold").fillColor("#111111").text("Məhsullar");
        doc.moveDown(0.5);

        for (const item of orderItems) {
            const lineTotal = (item.price * item.quantity).toFixed(2);
            const y = doc.y;
            doc
                .fontSize(10)
                .font("Helvetica")
                .fillColor("#333333")
                .text(`${item.name}  ×${item.quantity}`, 50, y, { continued: true, width: 380 });
            doc
                .font("Helvetica-Bold")
                .fillColor("#111111")
                .text(`${lineTotal} ${(currency || "AZN").toUpperCase()}`, { align: "right" });
            doc.moveDown(0.35);
        }

        // ── CƏMI ─────────────────────────────────────────────────────
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#000000").lineWidth(1.5).stroke();
        doc.moveDown(0.7);
        addRow("CƏMİ:", `${totalAmount.toFixed(2)} ${(currency || "AZN").toUpperCase()}`, true);
        addRow("Çatdırılma:", "Pulsuz");

        // ── FOOTER ────────────────────────────────────────────────────
        doc.moveDown(2);
        doc
            .fontSize(9)
            .font("Helvetica")
            .fillColor("#aaaaaa")
            .text("Bu çek avtomatik sistem tərəfindən yaradılmışdır.", { align: "center" });
        doc.text("Brendex-ə alış-verişiniz üçün təşəkkür edirik!", { align: "center" });

        doc.end();

        stream.on("finish", () => resolve({ fileName, filePath, receiptUrl }));
        stream.on("error",  reject);
    });
};

export default generateOrderReceipt;
