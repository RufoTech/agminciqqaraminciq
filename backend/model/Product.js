import mongoose from "mongoose";

// =====================================================================
// REVIEW SCHEMA
// =====================================================================
const reviewSchema = new mongoose.Schema(
    {
        user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name:    { type: String, required: true },
        rating:  { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: "" },
    },
    { timestamps: true }
);

// =====================================================================
// BASE PRODUCT SCHEMA
// =====================================================================
const productSchema = new mongoose.Schema(
    {
        name:        { type: String, required: true, trim: true },
        description: { type: String, required: true },
        price:       { type: Number, required: true, min: 0 },
        stock:       { type: Number, required: true, min: 0, default: 0 },
        ratings:     { type: Number, default: 0 },
        numOfReviews:{ type: Number, default: 0 },
        reviews:     [reviewSchema],
        seller:      { type: String, required: true },
        salesCount:  { type: Number, default: 0 },
        category:    { type: String, required: true },
        subcategory: { type: String },
        images:      [{ public_id: String, url: String }],

        // ── TELEFON / iPad XÜSUSİYYƏTLƏRİ ──────────────────────────
        color:           { type: String },
        screenSize:      { type: String },
        storage:         { type: String },
        ram:             { type: String },
        frontCamera:     { type: String },
        backCamera:      { type: String },
        battery:         { type: String },
        processor:       { type: String },
        operatingSystem: { type: String },
        cellular:        { type: Boolean },

        // ── LAPTOP XÜSUSİYYƏTLƏRİ ───────────────────────────────────
        gpu:         { type: String },
        camera:      { type: String },
        batteryLife: { type: String },

        // ── KAMERA XÜSUSİYYƏTLƏRİ ───────────────────────────────────
        resolution:         { type: String },
        opticalZoom:        { type: String },
        sensorType:         { type: String },
        imageStabilization: { type: String },

        // ── QULAQLIQ XÜSUSİYYƏTLƏRİ ─────────────────────────────────
        connectivity:     { type: String },
        noiseCancellation:{ type: String },

        // ── OYUN KONSOLİ XÜSUSİYYƏTLƏRİ ─────────────────────────────
        cpu:                 { type: String },
        memory:              { type: String },
        supportedResolution: { type: String },
        controllerIncluded:  { type: Boolean },

        // ── ƏLAVƏ SAHƏLƏR (yeni kateqoriyalar üçün) ──────────────────
        material:         { type: String },
        dimensions:       { type: String },
        weight:           { type: String },
        size:             { type: String },
        season:           { type: String },
        gender:           { type: String },
        ageRange:         { type: String },
        volume:           { type: String },
        capacity:         { type: String },
        power:            { type: String },
        energyClass:      { type: String },
        panelType:        { type: String },
        smartTv:          { type: Boolean },
        videoResolution:  { type: String },
        compatibility:    { type: String },
        length:           { type: String },
        maxCharge:        { type: String },
        portCount:        { type: String },
        simCount:         { type: String },
        driverSize:       { type: String },
        refreshRate:      { type: String },
        printType:        { type: String },
        colorPrint:       { type: Boolean },
        partType:         { type: String },
        coverage:         { type: String },
        inverter:         { type: Boolean },
        lightType:        { type: String },
        setCount:         { type: String },
        dishwasherSafe:   { type: Boolean },
        seatingCapacity:  { type: String },
        adjustable:       { type: Boolean },
        weatherResistant: { type: Boolean },
        waterResistant:   { type: Boolean },
        foldable:         { type: Boolean },
        maxWeight:        { type: String },
        skinType:         { type: String },
        hairType:         { type: String },
        scentType:        { type: String },
        ingredients:      { type: String },
        occasion:         { type: String },
        frameType:        { type: String },
        uvProtection:     { type: String },
        viscosity:        { type: String },
        pageCount:        { type: String },
        language:         { type: String },
        author:           { type: String },
        partNumber:       { type: String },
        frameSize:        { type: String },
        gearCount:        { type: String },
        quantity:         { type: String },
    },
    { timestamps: true, discriminatorKey: "category" }
);

// =====================================================================
// ALLOWED CATEGORY VALUES
// =====================================================================
export const allowedCategoryValues = [
    // ── Köhnə / Legacy kateqoriyalar ──────────────────────────────
    "Phones",
    "Laptops",
    "Cameras",
    "Headphones",
    "Console",
    "iPad",
    "WomenClothing",
    "MenClothing",
    "KidsClothing",
    "HomeAppliances",
    "HomeAndGarden",
    "Beauty",
    "Sports",
    "Automotive",

    // 1. Elektronika (köhnə flat)
    "TVs",
    "AudioSystems",
    "PhotoVideo",
    "GameConsoles",
    "SmartHome",
    "Gadgets",
    "ElectronicsAccessories",

    // 2. Telefonlar (köhnə flat)
    "Smartphones",
    "FeaturePhones",
    "HeadphonesNew",
    "CablesAdapters",
    "Powerbanks",
    "PhoneAccessories",

    // 3. Kompüter (köhnə flat)
    "LaptopsNew",
    "Desktops",
    "Monitors",
    "PrintersScanners",
    "OfficeAccessories",
    "Components",

    // 4. Məişət texnikası (köhnə flat)
    "LargeAppliances",
    "SmallAppliances",
    "KitchenAppliances",
    "AirConditioners",
    "WaterHeaters",

    // 5. Ev və dekor (köhnə flat)
    "HomeDecor",
    "Lighting",
    "HomeTextiles",
    "Kitchenware",
    "BathAccessories",

    // 6. Mebel (köhnə flat)
    "LivingRoomFurniture",
    "BedroomFurniture",
    "KitchenFurniture",
    "OfficeFurniture",
    "GardenFurniture",

    // 7. Qadın geyimləri (köhnə flat)
    "WomensTops",
    "WomensBottoms",
    "WomensCasual",
    "WomensSport",
    "WomensFormal",
    "WomensUnderwear",

    // 8. Kişi geyimləri (köhnə flat)
    "MensTops",
    "MensBottoms",
    "MensCasual",
    "MensSport",
    "MensFormal",
    "MensUnderwear",

    // 9. Ayaqqabı (köhnə flat)
    "SportsShoes",
    "ClassicShoes",
    "CasualShoes",
    "Sandals",

    // 10. Aksesuarlar (köhnə flat)
    "Bags",
    "Watches",
    "Sunglasses",
    "Jewelry",
    "Belts",

    // 11. Gözəllik (köhnə flat)
    "Makeup",
    "Skincare",
    "HairCare",
    "Fragrance",
    "MenGrooming",
    "Hygiene",

    // 12. Uşaq və ana (köhnə flat)
    "KidsClothingNew",
    "Toys",
    "Strollers",
    "BabyFeeding",
    "SchoolSupplies",

    // 13. İdman (köhnə flat)
    "FitnessEquipment",
    "Camping",
    "Bicycles",
    "SportsApparel",
    "SportsAccessories",

    // 14. Avto (köhnə flat)
    "AutoAccessories",
    "AutoElectronics",
    "SpareParts",
    "AutoChemicals",

    // 15. Hədiyyə (köhnə flat)
    "GiftSets",
    "Souvenirs",
    "TrendingProducts",
    "BooksHobbies",

    // Parent (əsas) kateqoriyalar
    "Elektronika",
    "Telefonlar ve aksesuarlar",
    "Komputer ve ofis texnikasi",
    "Meiset texnikasi",
    "Ev ve dekor",
    "Mebel",
    "Qadin geyimleri",
    "Kisi geyimleri",
    "Ayaqqabi",
    "Aksesuarlar",
    "Gozellik ve kosmetika",
    "Usaq ve ana",
    "Idman ve outdoor",
    "Avto mehsullar",
    "Hediyyeler ve lifestyle",

    // ── YENİ FRONTEND KATEQORİYALARI (AddProduct.jsx-dən gəlir) ──

    // 1. Elektronika
    "Electronics_TV",
    "Electronics_Photo",
    "Electronics_Console",
    "Electronics_SmartHome",
    "Electronics_Gadgets",
    "Electronics_Acc",

    // 2. Telefonlar
    "Phones_Smartphone",
    "Phones_Basic",
    "Phones_Headphones",
    "Phones_Cables",
    "Phones_Powerbank",
    "Phones_Acc",

    // 3. Kompüter
    "Computers_Laptop",
    "Computers_Desktop",
    "Computers_Monitor",
    "Computers_Printer",
    "Computers_OfficeAcc",
    "Computers_Parts",

    // 4. Məişət texnikası
    "HomeAppliances_Large",
    "HomeAppliances_Small",
    "HomeAppliances_Kitchen",
    "HomeAppliances_Climate",
    "HomeAppliances_Water",

    // 5. Ev və dekor
    "HomeDecor_Deco",
    "HomeDecor_Light",
    "HomeDecor_Textile",
    "HomeDecor_Kitchen",
    "HomeDecor_Bath",

    // 6. Mebel
    "Furniture_Living",
    "Furniture_Bedroom",
    "Furniture_Kitchen",
    "Furniture_Office",
    "Furniture_Garden",

    // 7. Qadın geyimi
    "WomenClothing_Outer",
    "WomenClothing_Inner",
    "WomenClothing_Casual",
    "WomenClothing_Sport",
    "WomenClothing_Formal",
    "WomenClothing_Under",

    // 8. Kişi geyimi
    "MenClothing_Outer",
    "MenClothing_Inner",
    "MenClothing_Casual",
    "MenClothing_Sport",
    "MenClothing_Formal",
    "MenClothing_Under",

    // 9. Ayaqqabı
    "Shoes_Sport",
    "Shoes_Classic",
    "Shoes_Casual",
    "Shoes_Sandal",

    // 10. Aksesuarlar
    "Accessories_Bag",
    "Accessories_Watch",
    "Accessories_Sunglasses",
    "Accessories_Jewelry",
    "Accessories_Belt",

    // 11. Gözəllik
    "Beauty_Makeup",
    "Beauty_Skin",
    "Beauty_Hair",
    "Beauty_Perfume",
    "Beauty_Men",
    "Beauty_Hygiene",

    // 12. Uşaq və ana
    "KidsAndMom_Clothing",
    "KidsAndMom_Toys",
    "KidsAndMom_Stroller",
    "KidsAndMom_Food",
    "KidsAndMom_School",

    // 13. İdman
    "Sports_Fitness",
    "Sports_Camping",
    "Sports_Bicycle",
    "Sports_Clothing",
    "Sports_Acc",

    // 14. Avto
    "Automotive_Acc",
    "Automotive_Electronics",
    "Automotive_Parts",
    "Automotive_Oils",

    // 15. Hədiyyə
    "Gifts_Sets",
    "Gifts_Souvenir",
    "Gifts_Trending",
    "Gifts_Books",
];

// =====================================================================
// BASE MODEL
// =====================================================================
export const Product = mongoose.model("Product", productSchema);

// =====================================================================
// LEGACY DİSCRİMİNATOR MODELLƏRİ
// =====================================================================
export const Phone     = Product.discriminator("Phones",        new mongoose.Schema({}));
export const Laptop    = Product.discriminator("Laptops",       new mongoose.Schema({}));
export const Camera    = Product.discriminator("Cameras",       new mongoose.Schema({}));
export const Headphone = Product.discriminator("Headphones",    new mongoose.Schema({}));
export const Console   = Product.discriminator("Console",       new mongoose.Schema({}));
export const iPad      = Product.discriminator("iPad",          new mongoose.Schema({}));

export const WomenClothing  = Product.discriminator("WomenClothing",  new mongoose.Schema({}));
export const MenClothing    = Product.discriminator("MenClothing",    new mongoose.Schema({}));
export const KidsClothing   = Product.discriminator("KidsClothing",   new mongoose.Schema({}));
export const HomeAppliance  = Product.discriminator("HomeAppliances", new mongoose.Schema({}));
export const HomeAndGarden  = Product.discriminator("HomeAndGarden",  new mongoose.Schema({}));
export const Beauty         = Product.discriminator("Beauty",         new mongoose.Schema({}));
export const Sports         = Product.discriminator("Sports",         new mongoose.Schema({}));
export const Automotive     = Product.discriminator("Automotive",     new mongoose.Schema({}));

// =====================================================================
// 1. ELEKTRONİKA
// =====================================================================
export const TVs                    = Product.discriminator("TVs",                    new mongoose.Schema({}));
export const AudioSystems           = Product.discriminator("AudioSystems",           new mongoose.Schema({}));
export const PhotoVideo             = Product.discriminator("PhotoVideo",             new mongoose.Schema({}));
export const GameConsoles           = Product.discriminator("GameConsoles",           new mongoose.Schema({}));
export const SmartHome              = Product.discriminator("SmartHome",              new mongoose.Schema({}));
export const Gadgets                = Product.discriminator("Gadgets",                new mongoose.Schema({}));
export const ElectronicsAccessories = Product.discriminator("ElectronicsAccessories", new mongoose.Schema({}));

// =====================================================================
// 2. TELEFONLAR VƏ AKSESUARLAR
// =====================================================================
export const Smartphones      = Product.discriminator("Smartphones",      new mongoose.Schema({}));
export const FeaturePhones    = Product.discriminator("FeaturePhones",    new mongoose.Schema({}));
export const HeadphonesNew    = Product.discriminator("HeadphonesNew",    new mongoose.Schema({}));
export const CablesAdapters   = Product.discriminator("CablesAdapters",   new mongoose.Schema({}));
export const Powerbanks       = Product.discriminator("Powerbanks",       new mongoose.Schema({}));
export const PhoneAccessories = Product.discriminator("PhoneAccessories", new mongoose.Schema({}));

// =====================================================================
// 3. KOMPÜTER VƏ OFİS
// =====================================================================
export const LaptopsNew        = Product.discriminator("LaptopsNew",        new mongoose.Schema({}));
export const Desktops          = Product.discriminator("Desktops",          new mongoose.Schema({}));
export const Monitors          = Product.discriminator("Monitors",          new mongoose.Schema({}));
export const PrintersScanners  = Product.discriminator("PrintersScanners",  new mongoose.Schema({}));
export const OfficeAccessories = Product.discriminator("OfficeAccessories", new mongoose.Schema({}));
export const Components        = Product.discriminator("Components",        new mongoose.Schema({}));

// =====================================================================
// 4. MƏİŞƏT TEXNİKASI
// =====================================================================
export const LargeAppliances   = Product.discriminator("LargeAppliances",   new mongoose.Schema({}));
export const SmallAppliances   = Product.discriminator("SmallAppliances",   new mongoose.Schema({}));
export const KitchenAppliances = Product.discriminator("KitchenAppliances", new mongoose.Schema({}));
export const AirConditioners   = Product.discriminator("AirConditioners",   new mongoose.Schema({}));
export const WaterHeaters      = Product.discriminator("WaterHeaters",      new mongoose.Schema({}));

// =====================================================================
// 5. EV VƏ DEKOR
// =====================================================================
export const HomeDecor       = Product.discriminator("HomeDecor",       new mongoose.Schema({}));
export const Lighting        = Product.discriminator("Lighting",        new mongoose.Schema({}));
export const HomeTextiles    = Product.discriminator("HomeTextiles",    new mongoose.Schema({}));
export const Kitchenware     = Product.discriminator("Kitchenware",     new mongoose.Schema({}));
export const BathAccessories = Product.discriminator("BathAccessories", new mongoose.Schema({}));

// =====================================================================
// 6. MEBEL
// =====================================================================
export const LivingRoomFurniture = Product.discriminator("LivingRoomFurniture", new mongoose.Schema({}));
export const BedroomFurniture    = Product.discriminator("BedroomFurniture",    new mongoose.Schema({}));
export const KitchenFurniture    = Product.discriminator("KitchenFurniture",    new mongoose.Schema({}));
export const OfficeFurniture     = Product.discriminator("OfficeFurniture",     new mongoose.Schema({}));
export const GardenFurniture     = Product.discriminator("GardenFurniture",     new mongoose.Schema({}));

// =====================================================================
// 7. QADIN GEYİMLƏRİ
// =====================================================================
export const WomensTops      = Product.discriminator("WomensTops",      new mongoose.Schema({}));
export const WomensBottoms   = Product.discriminator("WomensBottoms",   new mongoose.Schema({}));
export const WomensCasual    = Product.discriminator("WomensCasual",    new mongoose.Schema({}));
export const WomensSport     = Product.discriminator("WomensSport",     new mongoose.Schema({}));
export const WomensFormal    = Product.discriminator("WomensFormal",    new mongoose.Schema({}));
export const WomensUnderwear = Product.discriminator("WomensUnderwear", new mongoose.Schema({}));

// =====================================================================
// 8. KİŞİ GEYİMLƏRİ
// =====================================================================
export const MensTops     = Product.discriminator("MensTops",     new mongoose.Schema({}));
export const MensBottoms  = Product.discriminator("MensBottoms",  new mongoose.Schema({}));
export const MensCasual   = Product.discriminator("MensCasual",   new mongoose.Schema({}));
export const MensSport    = Product.discriminator("MensSport",    new mongoose.Schema({}));
export const MensFormal   = Product.discriminator("MensFormal",   new mongoose.Schema({}));
export const MensUnderwear= Product.discriminator("MensUnderwear",new mongoose.Schema({}));

// =====================================================================
// 9. AYAQQABI
// =====================================================================
export const SportsShoes  = Product.discriminator("SportsShoes",  new mongoose.Schema({}));
export const ClassicShoes = Product.discriminator("ClassicShoes", new mongoose.Schema({}));
export const CasualShoes  = Product.discriminator("CasualShoes",  new mongoose.Schema({}));
export const Sandals      = Product.discriminator("Sandals",      new mongoose.Schema({}));

// =====================================================================
// 10. AKSESUARLAR
// =====================================================================
export const Bags       = Product.discriminator("Bags",       new mongoose.Schema({}));
export const Watches    = Product.discriminator("Watches",    new mongoose.Schema({}));
export const Sunglasses = Product.discriminator("Sunglasses", new mongoose.Schema({}));
export const Jewelry    = Product.discriminator("Jewelry",    new mongoose.Schema({}));
export const Belts      = Product.discriminator("Belts",      new mongoose.Schema({}));

// =====================================================================
// 11. GÖZƏLLİK VƏ KOSMETİKA
// =====================================================================
export const Makeup      = Product.discriminator("Makeup",      new mongoose.Schema({}));
export const Skincare    = Product.discriminator("Skincare",    new mongoose.Schema({}));
export const HairCare    = Product.discriminator("HairCare",    new mongoose.Schema({}));
export const Fragrance   = Product.discriminator("Fragrance",   new mongoose.Schema({}));
export const MenGrooming = Product.discriminator("MenGrooming", new mongoose.Schema({}));
export const Hygiene     = Product.discriminator("Hygiene",     new mongoose.Schema({}));

// =====================================================================
// 12. UŞAQ VƏ ANA
// =====================================================================
export const KidsClothingNew = Product.discriminator("KidsClothingNew", new mongoose.Schema({}));
export const Toys            = Product.discriminator("Toys",            new mongoose.Schema({}));
export const Strollers       = Product.discriminator("Strollers",       new mongoose.Schema({}));
export const BabyFeeding     = Product.discriminator("BabyFeeding",     new mongoose.Schema({}));
export const SchoolSupplies  = Product.discriminator("SchoolSupplies",  new mongoose.Schema({}));

// =====================================================================
// 13. İDMAN VƏ OUTDOOR
// =====================================================================
export const FitnessEquipment  = Product.discriminator("FitnessEquipment",  new mongoose.Schema({}));
export const Camping           = Product.discriminator("Camping",           new mongoose.Schema({}));
export const Bicycles          = Product.discriminator("Bicycles",          new mongoose.Schema({}));
export const SportsApparel     = Product.discriminator("SportsApparel",     new mongoose.Schema({}));
export const SportsAccessories = Product.discriminator("SportsAccessories", new mongoose.Schema({}));

// =====================================================================
// 14. AVTO MƏHSULLAR
// =====================================================================
export const AutoAccessories  = Product.discriminator("AutoAccessories",  new mongoose.Schema({}));
export const AutoElectronics  = Product.discriminator("AutoElectronics",  new mongoose.Schema({}));
export const SpareParts       = Product.discriminator("SpareParts",       new mongoose.Schema({}));
export const AutoChemicals    = Product.discriminator("AutoChemicals",    new mongoose.Schema({}));

// =====================================================================
// 15. HƏDİYYƏLƏR VƏ LİFESTYLE
// =====================================================================
export const GiftSets         = Product.discriminator("GiftSets",         new mongoose.Schema({}));
export const Souvenirs        = Product.discriminator("Souvenirs",        new mongoose.Schema({}));
export const TrendingProducts = Product.discriminator("TrendingProducts", new mongoose.Schema({}));
export const BooksHobbies     = Product.discriminator("BooksHobbies",     new mongoose.Schema({}));

// =====================================================================
// YENİ FRONTEND KATEQORİYALARI ÜÇÜN DİSCRİMİNATORLAR
// ---------------------------------------------------------------------
// Frontend "Phones_Smartphone", "Electronics_TV" və s. göndərir.
// Bu discriminatorlar həmin dəyərləri MongoDB-də saxlayır.
// Hər biri mövcud modellə eyni sxemi paylaşır — əlavə sahə tələb etmir.
// =====================================================================

// 1. Elektronika
export const Electronics_TV        = Product.discriminator("Electronics_TV",        new mongoose.Schema({}));
export const Electronics_Photo     = Product.discriminator("Electronics_Photo",     new mongoose.Schema({}));
export const Electronics_Console   = Product.discriminator("Electronics_Console",   new mongoose.Schema({}));
export const Electronics_SmartHome = Product.discriminator("Electronics_SmartHome", new mongoose.Schema({}));
export const Electronics_Gadgets   = Product.discriminator("Electronics_Gadgets",   new mongoose.Schema({}));
export const Electronics_Acc       = Product.discriminator("Electronics_Acc",       new mongoose.Schema({}));

// 2. Telefonlar
export const Phones_Smartphone = Product.discriminator("Phones_Smartphone", new mongoose.Schema({}));
export const Phones_Basic      = Product.discriminator("Phones_Basic",      new mongoose.Schema({}));
export const Phones_Headphones = Product.discriminator("Phones_Headphones", new mongoose.Schema({}));
export const Phones_Cables     = Product.discriminator("Phones_Cables",     new mongoose.Schema({}));
export const Phones_Powerbank  = Product.discriminator("Phones_Powerbank",  new mongoose.Schema({}));
export const Phones_Acc        = Product.discriminator("Phones_Acc",        new mongoose.Schema({}));

// 3. Kompüter
export const Computers_Laptop     = Product.discriminator("Computers_Laptop",     new mongoose.Schema({}));
export const Computers_Desktop    = Product.discriminator("Computers_Desktop",    new mongoose.Schema({}));
export const Computers_Monitor    = Product.discriminator("Computers_Monitor",    new mongoose.Schema({}));
export const Computers_Printer    = Product.discriminator("Computers_Printer",    new mongoose.Schema({}));
export const Computers_OfficeAcc  = Product.discriminator("Computers_OfficeAcc",  new mongoose.Schema({}));
export const Computers_Parts      = Product.discriminator("Computers_Parts",      new mongoose.Schema({}));

// 4. Məişət texnikası
export const HomeAppliances_Large   = Product.discriminator("HomeAppliances_Large",   new mongoose.Schema({}));
export const HomeAppliances_Small   = Product.discriminator("HomeAppliances_Small",   new mongoose.Schema({}));
export const HomeAppliances_Kitchen = Product.discriminator("HomeAppliances_Kitchen", new mongoose.Schema({}));
export const HomeAppliances_Climate = Product.discriminator("HomeAppliances_Climate", new mongoose.Schema({}));
export const HomeAppliances_Water   = Product.discriminator("HomeAppliances_Water",   new mongoose.Schema({}));

// 5. Ev və dekor
export const HomeDecor_Deco    = Product.discriminator("HomeDecor_Deco",    new mongoose.Schema({}));
export const HomeDecor_Light   = Product.discriminator("HomeDecor_Light",   new mongoose.Schema({}));
export const HomeDecor_Textile = Product.discriminator("HomeDecor_Textile", new mongoose.Schema({}));
export const HomeDecor_Kitchen = Product.discriminator("HomeDecor_Kitchen", new mongoose.Schema({}));
export const HomeDecor_Bath    = Product.discriminator("HomeDecor_Bath",    new mongoose.Schema({}));

// 6. Mebel
export const Furniture_Living  = Product.discriminator("Furniture_Living",  new mongoose.Schema({}));
export const Furniture_Bedroom = Product.discriminator("Furniture_Bedroom", new mongoose.Schema({}));
export const Furniture_Kitchen = Product.discriminator("Furniture_Kitchen", new mongoose.Schema({}));
export const Furniture_Office  = Product.discriminator("Furniture_Office",  new mongoose.Schema({}));
export const Furniture_Garden  = Product.discriminator("Furniture_Garden",  new mongoose.Schema({}));

// 7. Qadın geyimi
export const WomenClothing_Outer  = Product.discriminator("WomenClothing_Outer",  new mongoose.Schema({}));
export const WomenClothing_Inner  = Product.discriminator("WomenClothing_Inner",  new mongoose.Schema({}));
export const WomenClothing_Casual = Product.discriminator("WomenClothing_Casual", new mongoose.Schema({}));
export const WomenClothing_Sport  = Product.discriminator("WomenClothing_Sport",  new mongoose.Schema({}));
export const WomenClothing_Formal = Product.discriminator("WomenClothing_Formal", new mongoose.Schema({}));
export const WomenClothing_Under  = Product.discriminator("WomenClothing_Under",  new mongoose.Schema({}));

// 8. Kişi geyimi
export const MenClothing_Outer  = Product.discriminator("MenClothing_Outer",  new mongoose.Schema({}));
export const MenClothing_Inner  = Product.discriminator("MenClothing_Inner",  new mongoose.Schema({}));
export const MenClothing_Casual = Product.discriminator("MenClothing_Casual", new mongoose.Schema({}));
export const MenClothing_Sport  = Product.discriminator("MenClothing_Sport",  new mongoose.Schema({}));
export const MenClothing_Formal = Product.discriminator("MenClothing_Formal", new mongoose.Schema({}));
export const MenClothing_Under  = Product.discriminator("MenClothing_Under",  new mongoose.Schema({}));

// 9. Ayaqqabı
export const Shoes_Sport   = Product.discriminator("Shoes_Sport",   new mongoose.Schema({}));
export const Shoes_Classic = Product.discriminator("Shoes_Classic", new mongoose.Schema({}));
export const Shoes_Casual  = Product.discriminator("Shoes_Casual",  new mongoose.Schema({}));
export const Shoes_Sandal  = Product.discriminator("Shoes_Sandal",  new mongoose.Schema({}));

// 10. Aksesuarlar
export const Accessories_Bag        = Product.discriminator("Accessories_Bag",        new mongoose.Schema({}));
export const Accessories_Watch      = Product.discriminator("Accessories_Watch",      new mongoose.Schema({}));
export const Accessories_Sunglasses = Product.discriminator("Accessories_Sunglasses", new mongoose.Schema({}));
export const Accessories_Jewelry    = Product.discriminator("Accessories_Jewelry",    new mongoose.Schema({}));
export const Accessories_Belt       = Product.discriminator("Accessories_Belt",       new mongoose.Schema({}));

// 11. Gözəllik
export const Beauty_Makeup  = Product.discriminator("Beauty_Makeup",  new mongoose.Schema({}));
export const Beauty_Skin    = Product.discriminator("Beauty_Skin",    new mongoose.Schema({}));
export const Beauty_Hair    = Product.discriminator("Beauty_Hair",    new mongoose.Schema({}));
export const Beauty_Perfume = Product.discriminator("Beauty_Perfume", new mongoose.Schema({}));
export const Beauty_Men     = Product.discriminator("Beauty_Men",     new mongoose.Schema({}));
export const Beauty_Hygiene = Product.discriminator("Beauty_Hygiene", new mongoose.Schema({}));

// 12. Uşaq və ana
export const KidsAndMom_Clothing = Product.discriminator("KidsAndMom_Clothing", new mongoose.Schema({}));
export const KidsAndMom_Toys     = Product.discriminator("KidsAndMom_Toys",     new mongoose.Schema({}));
export const KidsAndMom_Stroller = Product.discriminator("KidsAndMom_Stroller", new mongoose.Schema({}));
export const KidsAndMom_Food     = Product.discriminator("KidsAndMom_Food",     new mongoose.Schema({}));
export const KidsAndMom_School   = Product.discriminator("KidsAndMom_School",   new mongoose.Schema({}));

// 13. İdman
export const Sports_Fitness  = Product.discriminator("Sports_Fitness",  new mongoose.Schema({}));
export const Sports_Camping  = Product.discriminator("Sports_Camping",  new mongoose.Schema({}));
export const Sports_Bicycle  = Product.discriminator("Sports_Bicycle",  new mongoose.Schema({}));
export const Sports_Clothing = Product.discriminator("Sports_Clothing", new mongoose.Schema({}));
export const Sports_Acc      = Product.discriminator("Sports_Acc",      new mongoose.Schema({}));

// 14. Avto
export const Automotive_Acc         = Product.discriminator("Automotive_Acc",         new mongoose.Schema({}));
export const Automotive_Electronics = Product.discriminator("Automotive_Electronics", new mongoose.Schema({}));
export const Automotive_Parts       = Product.discriminator("Automotive_Parts",       new mongoose.Schema({}));
export const Automotive_Oils        = Product.discriminator("Automotive_Oils",        new mongoose.Schema({}));

// 15. Hədiyyə
export const Gifts_Sets     = Product.discriminator("Gifts_Sets",     new mongoose.Schema({}));
export const Gifts_Souvenir = Product.discriminator("Gifts_Souvenir", new mongoose.Schema({}));
export const Gifts_Trending = Product.discriminator("Gifts_Trending", new mongoose.Schema({}));
export const Gifts_Books    = Product.discriminator("Gifts_Books",    new mongoose.Schema({}));