import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ES Module-da __dirname yoxdur, ona görə əl ilə yaradırıq.
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// .env faylını yükləyirik. 
// Bu fayl bütün digər import-lardan ƏVVƏL app.js-də çağırılacaq.
// Beləliklə, controller-lər işə düşəndə process.env artıq dolu olacaq.
dotenv.config({ path: path.join(__dirname, "config.env") });

console.log("✅ Environment variables loaded from config/config.env");
