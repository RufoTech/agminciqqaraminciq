import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import products from "./data.js";

import {
    allowedCategoryValues,
    Product,
    Phone, Laptop, Camera, Headphone, Console, iPad,
    WomenClothing, MenClothing, KidsClothing,
    HomeAppliance, HomeAndGarden, Beauty, Sports, Automotive,
    // 1. Elektronika
    TVs, AudioSystems, PhotoVideo, GameConsoles, SmartHome, Gadgets, ElectronicsAccessories,
    // 2. Telefonlar və aksesuarlar
    Smartphones, FeaturePhones, HeadphonesNew, CablesAdapters, Powerbanks, PhoneAccessories,
    // 3. Kompüter və ofis
    LaptopsNew, Desktops, Monitors, PrintersScanners, OfficeAccessories, Components,
    // 4. Məişət texnikası
    LargeAppliances, SmallAppliances, KitchenAppliances, AirConditioners, WaterHeaters,
    // 5. Ev və dekor
    HomeDecor, Lighting, HomeTextiles, Kitchenware, BathAccessories,
    // 6. Mebel
    LivingRoomFurniture, BedroomFurniture, KitchenFurniture, OfficeFurniture, GardenFurniture,
    // 7. Qadın geyimləri
    WomensTops, WomensBottoms, WomensCasual, WomensSport, WomensFormal, WomensUnderwear,
    // 8. Kişi geyimləri
    MensTops, MensBottoms, MensCasual, MensSport, MensFormal, MensUnderwear,
    // 9. Ayaqqabı
    SportsShoes, ClassicShoes, CasualShoes, Sandals,
    // 10. Aksesuarlar
    Bags, Watches, Sunglasses, Jewelry, Belts,
    // 11. Gözəllik və kosmetika
    Makeup, Skincare, HairCare, Fragrance, MenGrooming, Hygiene,
    // 12. Uşaq və ana
    KidsClothingNew, Toys, Strollers, BabyFeeding, SchoolSupplies,
    // 13. İdman və outdoor
    FitnessEquipment, Camping, Bicycles, SportsApparel, SportsAccessories,
    // 14. Avto məhsullar
    AutoAccessories, AutoElectronics, SpareParts, AutoChemicals,
    // 15. Hədiyyələr və lifestyle
    GiftSets, Souvenirs, TrendingProducts, BooksHobbies,
} from "../model/Product.js";


// =====================================================================
// KATEQORİYA → MODEL XƏRİTƏSİ
// =====================================================================
const models = {
    // Legacy
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

    // 1. Elektronika
    TVs:                    TVs,
    AudioSystems:           AudioSystems,
    PhotoVideo:             PhotoVideo,
    GameConsoles:           GameConsoles,
    SmartHome:              SmartHome,
    Gadgets:                Gadgets,
    ElectronicsAccessories: ElectronicsAccessories,

    // 2. Telefonlar və aksesuarlar
    Smartphones:      Smartphones,
    FeaturePhones:    FeaturePhones,
    HeadphonesNew:    HeadphonesNew,
    CablesAdapters:   CablesAdapters,
    Powerbanks:       Powerbanks,
    PhoneAccessories: PhoneAccessories,

    // 3. Kompüter və ofis
    LaptopsNew:        LaptopsNew,
    Desktops:          Desktops,
    Monitors:          Monitors,
    PrintersScanners:  PrintersScanners,
    OfficeAccessories: OfficeAccessories,
    Components:        Components,

    // 4. Məişət texnikası
    LargeAppliances:   LargeAppliances,
    SmallAppliances:   SmallAppliances,
    KitchenAppliances: KitchenAppliances,
    AirConditioners:   AirConditioners,
    WaterHeaters:      WaterHeaters,

    // 5. Ev və dekor
    HomeDecor:       HomeDecor,
    Lighting:        Lighting,
    HomeTextiles:    HomeTextiles,
    Kitchenware:     Kitchenware,
    BathAccessories: BathAccessories,

    // 6. Mebel
    LivingRoomFurniture: LivingRoomFurniture,
    BedroomFurniture:    BedroomFurniture,
    KitchenFurniture:    KitchenFurniture,
    OfficeFurniture:     OfficeFurniture,
    GardenFurniture:     GardenFurniture,

    // 7. Qadın geyimləri
    WomensTops:      WomensTops,
    WomensBottoms:   WomensBottoms,
    WomensCasual:    WomensCasual,
    WomensSport:     WomensSport,
    WomensFormal:    WomensFormal,
    WomensUnderwear: WomensUnderwear,

    // 8. Kişi geyimləri
    MensTops:     MensTops,
    MensBottoms:  MensBottoms,
    MensCasual:   MensCasual,
    MensSport:    MensSport,
    MensFormal:   MensFormal,
    MensUnderwear:MensUnderwear,

    // 9. Ayaqqabı
    SportsShoes:  SportsShoes,
    ClassicShoes: ClassicShoes,
    CasualShoes:  CasualShoes,
    Sandals:      Sandals,

    // 10. Aksesuarlar
    Bags:       Bags,
    Watches:    Watches,
    Sunglasses: Sunglasses,
    Jewelry:    Jewelry,
    Belts:      Belts,

    // 11. Gözəllik və kosmetika
    Makeup:      Makeup,
    Skincare:    Skincare,
    HairCare:    HairCare,
    Fragrance:   Fragrance,
    MenGrooming: MenGrooming,
    Hygiene:     Hygiene,

    // 12. Uşaq və ana
    KidsClothingNew: KidsClothingNew,
    Toys:            Toys,
    Strollers:       Strollers,
    BabyFeeding:     BabyFeeding,
    SchoolSupplies:  SchoolSupplies,

    // 13. İdman və outdoor
    FitnessEquipment:  FitnessEquipment,
    Camping:           Camping,
    Bicycles:          Bicycles,
    SportsApparel:     SportsApparel,
    SportsAccessories: SportsAccessories,

    // 14. Avto məhsullar
    AutoAccessories:  AutoAccessories,
    AutoElectronics:  AutoElectronics,
    SpareParts:       SpareParts,
    AutoChemicals:    AutoChemicals,

    // 15. Hədiyyələr və lifestyle
    GiftSets:         GiftSets,
    Souvenirs:        Souvenirs,
    TrendingProducts: TrendingProducts,
    BooksHobbies:     BooksHobbies,
};


// =====================================================================
// SEEDER FUNKSİYASI
// =====================================================================
const seedProducts = async () => {
    try {
        const dbUri = process.env.LOCAL_URI || "mongodb://localhost:27017/e-commerce";
        await mongoose.connect(dbUri);
        console.log(`✅ DB-yə qoşuldu: ${dbUri}`);

        if (process.argv[2] === "--delete") {
            await Product.deleteMany();
            console.log("🗑️  Bütün məhsullar silindi");
            process.exit();
        }

        await Product.deleteMany();
        console.log("🗑️  Köhnə məhsullar silindi");

        let successCount = 0;
        let errorCount   = 0;

        for (let product of products) {

            const Model = allowedCategoryValues.includes(product.category)
                ? (models[product.category] || Product)
                : null;

            try {
                if (!Model) {
                    throw new Error(`Kateqoriya dəstəklənmir: ${product.category}`);
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