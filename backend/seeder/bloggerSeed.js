// =====================================================================
// BLOGER SEED SKRIPT — seeds/bloggerSeed.js
// ---------------------------------------------------------------------
// Mövcud 30 blogeri verilənlər bazasına əlavə edir.
// Hər bloger üçün promo kod + link avtomatik yaradılır.
//
// İstifadə:
//   node seeds/bloggerSeed.js
// =====================================================================

import mongoose from "mongoose";
import dotenv   from "dotenv";
import Blogger  from "../models/Blogger.js";

dotenv.config({ path: "config/config.env" });

// ── 30 Bloger siyahısı ───────────────────────────────────────────────
// Ad, soyad məlum deyilsə placeholder istifadə edilir.
// Şifrə: Blogger123! (ilk girişdən sonra dəyişilməlidir)
const bloggers = [
    { firstName: "Nabat",     lastName: "Blogger",    fatherName: "",  commissionRate: 40 },
    { firstName: "Aydan",     lastName: "Blogger",    fatherName: "",  commissionRate: 40 },
    { firstName: "Aydan",     lastName: "Rzayayeva",  fatherName: "",  commissionRate: 40 },
    { firstName: "Sevda",     lastName: "Blogger",    fatherName: "",  commissionRate: 20 },
    { firstName: "Fatimə",    lastName: "Blogger",    fatherName: "",  commissionRate: 40 },
    { firstName: "Nərmin",    lastName: "Blogger",    fatherName: "",  commissionRate: 30 },
    { firstName: "Aysun",     lastName: "Blogger",    fatherName: "",  commissionRate: 41 },
    { firstName: "Sami",      lastName: "Blogger",    fatherName: "",  commissionRate: 40 },
    { firstName: "Aytaç",     lastName: "Blogger",    fatherName: "",  commissionRate: 40 },
    { firstName: "Ruzqar",    lastName: "Blogger",    fatherName: "",  commissionRate: 40 },
    { firstName: "Aytən",     lastName: "Blogger",    fatherName: "",  commissionRate: 40 },
    { firstName: "Ülkər",     lastName: "Blogger",    fatherName: "",  commissionRate: 40 },
    { firstName: "Günel",     lastName: "Blogger",    fatherName: "",  commissionRate: 40 },
    { firstName: "Aysel",     lastName: "Blogger",    fatherName: "",  commissionRate: 40 },
    { firstName: "Sevinc",    lastName: "Blogger",    fatherName: "",  commissionRate: 40 },
    { firstName: "Mahican",   lastName: "Blogger",    fatherName: "",  commissionRate: 40 },
    { firstName: "Arzu",      lastName: "Blogger",    fatherName: "",  commissionRate: 40 },
    { firstName: "Asya",      lastName: "Blogger",    fatherName: "",  commissionRate: 40 },
    { firstName: "Aygün",     lastName: "Blogger",    fatherName: "",  commissionRate: 40 },
    { firstName: "Aynaz",     lastName: "Blogger",    fatherName: "",  commissionRate: 30 },
    { firstName: "Sudabe",    lastName: "Blogger",    fatherName: "",  commissionRate: 30 },
    { firstName: "Husniyye",  lastName: "Blogger",    fatherName: "",  commissionRate: 30 },
    { firstName: "Fatimə",    lastName: "Məmmədli",   fatherName: "",  commissionRate: 40 },
    { firstName: "Fidan",     lastName: "Blogger",    fatherName: "",  commissionRate: 30 },
    { firstName: "Xeyale",    lastName: "Blogger",    fatherName: "",  commissionRate: 40 },
    { firstName: "Könül",     lastName: "Blogger",    fatherName: "",  commissionRate: 40 },
    { firstName: "Leman",     lastName: "Blogger",    fatherName: "",  commissionRate: 30 },
    { firstName: "Məryəm",    lastName: "Blogger",    fatherName: "",  commissionRate: 40 },
    { firstName: "Mujgan",    lastName: "Blogger",    fatherName: "",  commissionRate: 40 },
    { firstName: "Mətanət",   lastName: "Blogger",    fatherName: "",  commissionRate: 40 },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.DB_URI);
        console.log("MongoDB-ə qoşuldu.");

        let created = 0;
        let skipped = 0;

        for (let i = 0; i < bloggers.length; i++) {
            const b = bloggers[i];

            // E-poçt: nabat@blogger.az, aydan@blogger.az ...
            // Eyni ad varsa index əlavə edilir: aydan2@blogger.az
            const baseName = b.firstName.toLowerCase()
                .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o")
                .replace(/ü/g, "u").replace(/ç/g, "c").replace(/ş/g, "s")
                .replace(/ğ/g, "g");

            const email = `${baseName}${i + 1}@blogger.az`;

            const existing = await Blogger.findOne({ email });
            if (existing) {
                console.log(`[SKIP] ${b.firstName} ${b.lastName} — artıq mövcuddur.`);
                skipped++;
                continue;
            }

            const blogger = await Blogger.create({
                firstName:           b.firstName,
                lastName:            b.lastName,
                fatherName:          b.fatherName,
                email,
                password:            "Blogger123!",
                commissionRate:      b.commissionRate,
                commissionStartDate: new Date(),
            });

            console.log(
                `[OK] ${blogger.firstName} ${blogger.lastName}` +
                ` | ${blogger.commissionRate}%` +
                ` | ${blogger.promoCode}` +
                ` | ${blogger.promoLink}`
            );
            created++;
        }

        console.log(`\nTamamlandı: ${created} yaradıldı, ${skipped} atlandı.`);
        process.exit(0);

    } catch (err) {
        console.error("Seed xətası:", err.message);
        process.exit(1);
    }
};

seed();