// =====================================================================
// BLOGGER SEEDER — backend/seeder/bloggerSeeder.js
// ---------------------------------------------------------------------
// 30 blogger-i verilənlər bazasına əlavə edir.
//
// İstifadə:
//   node backend/seeder/bloggerSeeder.js
//
// Qeyd:
//   • Artıq mövcud e-poçtlar ötürülür (upsert).
//   • Hər blogger üçün default şifrə: Blogger@2024
//     (İlk girişdən sonra dəyişdirilməsi tövsiyə olunur)
// =====================================================================

import dotenv from "dotenv";
import path   from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

// .env faylını yüklə
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../config/config.env") });

// DB bağlantısı
const DB_URI =
  process.env.NODE_ENV === "PRODUCTION"
    ? process.env.DB_URI
    : process.env.LOCAL_URI;

// Blogger modelini birbaşa import et
import Blogger from "../model/Blogger.js";

// ─── 30 nəfərlik siyahı ───────────────────────────────────────────────────
// firstName, lastName — adı bölmək mümkün olmadıqda tam adı firstName-ə yazırıq
const BLOGGERS = [
  { firstName: "Nabat",       lastName: "",          commissionRate: 40 },
  { firstName: "Aydan",       lastName: "",          commissionRate: 40 },
  { firstName: "Aydan",       lastName: "Rzayeva",   commissionRate: 40 },
  { firstName: "Sevda",       lastName: "",          commissionRate: 20 },
  { firstName: "Fatimə",      lastName: "",          commissionRate: 40 },
  { firstName: "Nərmin",      lastName: "",          commissionRate: 30 },
  { firstName: "Aysun",       lastName: "",          commissionRate: 41 },
  { firstName: "Sami",        lastName: "",          commissionRate: 40 },
  { firstName: "Aytaç",       lastName: "",          commissionRate: 40 },
  { firstName: "Ruzqar",      lastName: "",          commissionRate: 40 },
  { firstName: "Aytən",       lastName: "",          commissionRate: 40 },
  { firstName: "Ülkər",       lastName: "",          commissionRate: 40 },
  { firstName: "Günel",       lastName: "",          commissionRate: 40 },
  { firstName: "Aysel",       lastName: "",          commissionRate: 40 },
  { firstName: "Sevinc",      lastName: "",          commissionRate: 40 },
  { firstName: "Mahican",     lastName: "",          commissionRate: 40 },
  { firstName: "Arzu",        lastName: "",          commissionRate: 40 },
  { firstName: "Asya",        lastName: "",          commissionRate: 40 },
  { firstName: "Aygün",       lastName: "",          commissionRate: 40 },
  { firstName: "Aynaz",       lastName: "",          commissionRate: 30 },
  { firstName: "Sudabe",      lastName: "",          commissionRate: 30 },
  { firstName: "Husniyye",    lastName: "",          commissionRate: 30 },
  { firstName: "Fatimə",      lastName: "Məmmədli",  commissionRate: 40 },
  { firstName: "Fidan",       lastName: "",          commissionRate: 30 },
  { firstName: "Xeyale",      lastName: "",          commissionRate: 40 },
  { firstName: "Könül",       lastName: "",          commissionRate: 40 },
  { firstName: "Leman",       lastName: "",          commissionRate: 30 },
  { firstName: "Məryəm",      lastName: "",          commissionRate: 40 },
  { firstName: "Mujgan",      lastName: "",          commissionRate: 40 },
  { firstName: "Mətanət",     lastName: "",          commissionRate: 40 },
];

const DEFAULT_PASSWORD      = "Blogger@2024";
const DEFAULT_DURATION_MONTHS = 6;

// ─── E-poçt generasiyası ──────────────────────────────────────────────────
// Ad/soyaddan @ brendex.az domen ile e-poçt yaradır.
// Azərbaycan hərflərini latına çevirir.
function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ö/g, "o")
    .replace(/ü/g, "u").replace(/ğ/g, "g").replace(/ç/g, "c")
    .replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ə/g, "e")
    .replace(/[^a-z0-9]/g, "");
}

function makeEmail(firstName, lastName, index) {
  const base = toSlug(firstName) + (lastName ? toSlug(lastName) : "") || `blogger${index + 1}`;
  return `${base}${index + 1}@brendex.az`;
}

// ─── Seeder ───────────────────────────────────────────────────────────────
async function seed() {
  if (!DB_URI) {
    console.error("❌ DB_URI tapılmadı. config.env faylını yoxlayın.");
    process.exit(1);
  }

  console.log("🔗 Bazaya qoşulur:", DB_URI);
  await mongoose.connect(DB_URI);
  console.log("✅ Baza qoşuldu\n");

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < BLOGGERS.length; i++) {
    const { firstName, lastName, commissionRate } = BLOGGERS[i];
    const email = makeEmail(firstName, lastName, i);

    const exists = await Blogger.findOne({ email });
    if (exists) {
      console.log(`  ⚠️  Ötürüldü (artıq mövcuddur): ${firstName} ${lastName} — ${email}`);
      skipped++;
      continue;
    }

    const blogger = new Blogger({
      firstName,
      lastName:           lastName || "",
      email,
      password:           DEFAULT_PASSWORD,
      commissionRate,
      commissionDuration: DEFAULT_DURATION_MONTHS,
      isActive:           true,
    });

    await blogger.save();  // pre-save hook: şifrə hash + promoCode auto-generate

    console.log(
      `  ✅ ${String(i + 1).padStart(2, "0")}. ${firstName} ${lastName}`.padEnd(35) +
      `| ${commissionRate}% | ${email} | Promo: ${blogger.promoCode}`
    );
    created++;
  }

  console.log(`\n📊 Nəticə: ${created} yaradıldı, ${skipped} ötürüldü.`);
  console.log("🔑 Default şifrə: Blogger@2024 (dəyişdirilməsi tövsiyə olunur)\n");

  await mongoose.disconnect();
  console.log("🔌 Baza bağlantısı bağlandı.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeder xətası:", err);
  process.exit(1);
});
