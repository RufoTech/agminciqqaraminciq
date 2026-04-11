import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "config/config.env" });

const dropIndex = async () => {
    try {
        console.log("MongoDB-yə qoşulur...");
        await mongoose.connect(process.env.DB_URI);
        console.log("Qoşuldu! 'bloggers' kolleksiyasındakı köhnə user_1 indeksi silinir...");
        
        await mongoose.connection.db.collection("bloggers").dropIndex("user_1");
        console.log("ƏLA ✅ user_1 indeksi uğurla silindi.");
    } catch (err) {
        if (err.codeName === "IndexNotFound") {
             console.log("Məlumat: Belə bir indeks zatən yoxdur.");
        } else {
             console.error("Xəta baş verdi:", err);
        }
    } finally {
        process.exit();
    }
};

dropIndex();
