// mongoose — MongoDB-yə qoşulmaq üçün kitabxana.
import mongoose from "mongoose";

// dotenv — .env faylındakı mühit dəyişənlərini yükləyir.
// FIX: LOCAL_URI .env-dən oxunur — sabit URL əvəzinə.
import dotenv from "dotenv";
dotenv.config();

// Seed data — demo məhsullar massivi.
import products from "./data.js";

// Bütün kateqoriya modelləri.
import {
    allowedCategoryValues,
    Product,
    Phone,
    Laptop,
    Camera,
    Headphone,
    Console,
    iPad,
    WomenClothing,
    MenClothing,
    KidsClothing,
    HomeAppliance,
    HomeAndGarden,
    Beauty,
    Sports,
    Automotive,
    // Yeni modellər (hamısı)
    TVs,
    AudioSystems,
    PhotoVideo,
    GameConsoles,
    SmartHome,
    Gadgets,
    ElectronicsAccessories,
    Smartphones,
    FeaturePhones,
    HeadphonesNew,
    CablesAdapters,
    Powerbanks,
    PhoneAccessories,
    LaptopsNew,
    Desktops,
    Monitors,
    PrintersScanners,
    OfficeAccessories,
    Components,
    LargeAppliances,
    SmallAppliances,
    KitchenAppliances,
    AirConditioners,
    WaterHeaters,
    HomeDecor,
    Lighting,
    HomeTextiles,
    Kitchenware,
    BathAccessories,
    LivingRoomFurniture,
    BedroomFurniture,
    KitchenFurniture,
    OfficeFurniture,
    GardenFurniture,
    SportsShoes,
    ClassicShoes,
    CasualShoes,
    Sandals,
    Bags,
    Watches,
    Sunglasses,
    Jewelry,
    Belts,
    Makeup,
    Skincare,
    HairCare,
    Fragrance,
    MenGrooming,
    Hygiene,
    KidsClothingNew,
    Toys,
    Strollers,
    BabyFeeding,
    SchoolSupplies,
    FitnessEquipment,
    Camping,
    Bicycles,
    SportsApparel,
    SportsAccessories,
    AutoAccessories,
    AutoElectronics,
    SpareParts,
    AutoChemicals,
    GiftSets,
    Souvenirs,
    TrendingProducts,
    BooksHobbies,
} from "../model/Product.js";


// =====================================================================
// SEED FUNKSİYASI — seedProducts
// ---------------------------------------------------------------------
// İstifadəsi:
//   node seeder.js           ← bazaya yaz
//   node seeder.js --delete  ← yalnız sil
// =====================================================================
const seedProducts = async () => {
    try {

        // ── BAZAYA QOŞUL ─────────────────────────────────────────────
        // FIX: .env-dəki LOCAL_URI istifadə edilir.
        // Əgər LOCAL_URI yoxdursa — fallback olaraq lokal URL.
        const dbUri = process.env.LOCAL_URI || "mongodb://localhost:27017/e-commerce";
        await mongoose.connect(dbUri);
        console.log(`✅ DB-yə qoşuldu: ${dbUri}`);


        // ── YALNIZ SİL REJİMİ ────────────────────────────────────────
        // FIX: node seeder.js --delete ilə yalnız silmə əməliyyatı.
        if (process.argv[2] === "--delete") {
            await Product.deleteMany();
            console.log("🗑️  Bütün məhsullar silindi");
            process.exit();
        }


        // ── MÖVCUD MƏHSULLARI SİL ────────────────────────────────────
        await Product.deleteMany();
        console.log("🗑️  Köhnə məhsullar silindi");


        // ── KATEQORİYA → MODEL XƏRİTƏSİ ─────────────────────────────
        const models = {
            // Mövcud kateqoriyalar
            Phones:         Phone,
            Laptops:        Laptop,
            Cameras:        Camera,
            Headphones:     Headphone,
            Console:        Console,
            iPad:           iPad,
            WomenClothing:  WomenClothing,
            MenClothing:    MenClothing,
            KidsClothing:   KidsClothing,
            HomeAppliances: HomeAppliance,
            HomeAndGarden:  HomeAndGarden,
            Beauty:         Beauty,
            Sports:         Sports,
            Automotive:     Automotive,

            // Yeni kateqoriyalar
            TVs:                     TVs,
            AudioSystems:            AudioSystems,
            PhotoVideo:              PhotoVideo,
            GameConsoles:            GameConsoles,
            SmartHome:               SmartHome,
            Gadgets:                 Gadgets,
            ElectronicsAccessories:  ElectronicsAccessories,
            Smartphones:             Smartphones,
            FeaturePhones:           FeaturePhones,
            HeadphonesNew:           HeadphonesNew,
            CablesAdapters:          CablesAdapters,
            Powerbanks:              Powerbanks,
            PhoneAccessories:        PhoneAccessories,
            LaptopsNew:              LaptopsNew,
            Desktops:                Desktops,
            Monitors:                Monitors,
            PrintersScanners:        PrintersScanners,
            OfficeAccessories:       OfficeAccessories,
            Components:              Components,
            LargeAppliances:         LargeAppliances,
            SmallAppliances:         SmallAppliances,
            KitchenAppliances:       KitchenAppliances,
            AirConditioners:         AirConditioners,
            WaterHeaters:            WaterHeaters,
            HomeDecor:               HomeDecor,
            Lighting:                Lighting,
            HomeTextiles:            HomeTextiles,
            Kitchenware:             Kitchenware,
            BathAccessories:         BathAccessories,
            LivingRoomFurniture:     LivingRoomFurniture,
            BedroomFurniture:        BedroomFurniture,
            KitchenFurniture:        KitchenFurniture,
            OfficeFurniture:         OfficeFurniture,
            GardenFurniture:         GardenFurniture,
            SportsShoes:             SportsShoes,
            ClassicShoes:            ClassicShoes,
            CasualShoes:             CasualShoes,
            Sandals:                 Sandals,
            Bags:                    Bags,
            Watches:                 Watches,
            Sunglasses:              Sunglasses,
            Jewelry:                 Jewelry,
            Belts:                   Belts,
            Makeup:                  Makeup,
            Skincare:                Skincare,
            HairCare:                HairCare,
            Fragrance:               Fragrance,
            MenGrooming:             MenGrooming,
            Hygiene:                 Hygiene,
            KidsClothingNew:         KidsClothingNew,
            Toys:                    Toys,
            Strollers:               Strollers,
            BabyFeeding:             BabyFeeding,
            SchoolSupplies:          SchoolSupplies,
            FitnessEquipment:        FitnessEquipment,
            Camping:                 Camping,
            Bicycles:                Bicycles,
            SportsApparel:           SportsApparel,
            SportsAccessories:       SportsAccessories,
            AutoAccessories:         AutoAccessories,
            AutoElectronics:         AutoElectronics,
            SpareParts:              SpareParts,
            AutoChemicals:           AutoChemicals,
            GiftSets:                GiftSets,
            Souvenirs:               Souvenirs,
            TrendingProducts:        TrendingProducts,
            BooksHobbies:            BooksHobbies,
        };


        // ── HƏR MƏHSULU AYRIAYRILIĞDA YARAT ─────────────────────────
        // FIX: Statistika — neçə uğurlu, neçə xətalı olduğu göstərilir.
        let successCount = 0;
        let errorCount   = 0;

        for (let product of products) {

            const Model = allowedCategoryValues.includes(product.category)
                ? (models[product.category] || Product)
                : null;

            try {
                if (!Model) {
                    throw new Error(`Kateqoriya destetlenmir: ${product.category}`);
                }

                await Model.create(product);
                console.log(`✅ ${product.name} (${product.category}) əlavə edildi`);
                successCount++;
            } catch (err) {
                if (err.name === "ValidationError") {
                    const fields = Object.keys(err.errors).join(", ");
                    console.error(`❌ ${product.name} — Validasiya xətası: [${fields}]`);
                    console.error(`   Detallar: ${err.message}`);
                } else {
                    console.error(`❌ ${product.name} xətası: ${err.message}`);
                }
                errorCount++;
            }
        }

        // ── NƏTİCƏ ───────────────────────────────────────────────────
        console.log("\n" + "=".repeat(50));
        console.log(`✅ Uğurlu: ${successCount} məhsul`);
        if (errorCount > 0) {
            console.log(`❌ Xətalı:  ${errorCount} məhsul`);
        }
        console.log("=".repeat(50));
        console.log("Bitdi!");

        process.exit();

    } catch (err) {
        console.error("❌ Ümumi xəta:", err.message);
        process.exit(1);
    }
};


seedProducts();