import mongoose from "mongoose";

// =====================================================================
// KATEQORİYA DƏYƏRLƏRİ
// =====================================================================

const legacyCategoryValues = [
    "Phones", "Laptops", "Cameras", "Headphones",
    "Console", "iPad", "WomenClothing", "MenClothing",
    "KidsClothing", "HomeAppliances", "HomeAndGarden",
    "Beauty", "Sports", "Automotive",
];

const adminCategoryValues = [
    // 1. Elektronika
    "Elektronika",
    "TVs", "AudioSystems", "PhotoVideo", "GameConsoles",
    "SmartHome", "Gadgets", "ElectronicsAccessories",

    // 2. Telefonlar və aksesuarlar
    "Telefonlar ve aksesuarlar",
    "Smartphones", "FeaturePhones", "HeadphonesNew",
    "CablesAdapters", "Powerbanks", "PhoneAccessories",

    // 3. Kompüter və ofis texnikası
    "Komputer ve ofis texnikasi",
    "LaptopsNew", "Desktops", "Monitors",
    "PrintersScanners", "OfficeAccessories", "Components",

    // 4. Məişət texnikası
    "Meiset texnikasi",
    "LargeAppliances", "SmallAppliances", "KitchenAppliances",
    "AirConditioners", "WaterHeaters",

    // 5. Ev və dekor
    "Ev ve dekor",
    "HomeDecor", "Lighting", "HomeTextiles",
    "Kitchenware", "BathAccessories",

    // 6. Mebel
    "Mebel",
    "LivingRoomFurniture", "BedroomFurniture",
    "KitchenFurniture", "OfficeFurniture", "GardenFurniture",

    // 7. Qadın geyimləri
    "Qadin geyimleri",
    "WomensTops", "WomensBottoms", "WomensCasual",
    "WomensSport", "WomensFormal", "WomensUnderwear",

    // 8. Kişi geyimləri
    "Kisi geyimleri",
    "MensTops", "MensBottoms", "MensCasual",
    "MensSport", "MensFormal", "MensUnderwear",

    // 9. Ayaqqabı
    "Ayaqqabi",
    "SportsShoes", "ClassicShoes", "CasualShoes", "Sandals",

    // 10. Aksesuarlar
    "Aksesuarlar",
    "Bags", "Watches", "Sunglasses", "Jewelry", "Belts",

    // 11. Gözəllik və kosmetika
    "Gozellik ve kosmetika",
    "Makeup", "Skincare", "HairCare", "Fragrance",
    "MenGrooming", "Hygiene",

    // 12. Uşaq və ana
    "Usaq ve ana",
    "KidsClothingNew", "Toys", "Strollers",
    "BabyFeeding", "SchoolSupplies",

    // 13. İdman və outdoor
    "Idman ve outdoor",
    "FitnessEquipment", "Camping", "Bicycles",
    "SportsApparel", "SportsAccessories",

    // 14. Avto məhsullar
    "Avto mehsullar",
    "AutoAccessories", "AutoElectronics",
    "SpareParts", "AutoChemicals",

    // 15. Hədiyyələr və lifestyle
    "Hediyyeler ve lifestyle",
    "GiftSets", "Souvenirs", "TrendingProducts", "BooksHobbies",

    // ── YENİ FRONTEND KATEQORİYALARI ──────────────────────────────
    // 1. Elektronika
    "Electronics_TV", "Electronics_Photo", "Electronics_Console",
    "Electronics_SmartHome", "Electronics_Gadgets", "Electronics_Acc",

    // 2. Telefonlar
    "Phones_Smartphone", "Phones_Basic", "Phones_Headphones",
    "Phones_Cables", "Phones_Powerbank", "Phones_Acc",

    // 3. Kompüter
    "Computers_Laptop", "Computers_Desktop", "Computers_Monitor",
    "Computers_Printer", "Computers_OfficeAcc", "Computers_Parts",

    // 4. Məişət texnikası
    "HomeAppliances_Large", "HomeAppliances_Small", "HomeAppliances_Kitchen",
    "HomeAppliances_Climate", "HomeAppliances_Water",

    // 5. Ev və dekor
    "HomeDecor_Deco", "HomeDecor_Light", "HomeDecor_Textile",
    "HomeDecor_Kitchen", "HomeDecor_Bath",

    // 6. Mebel
    "Furniture_Living", "Furniture_Bedroom", "Furniture_Kitchen",
    "Furniture_Office", "Furniture_Garden",

    // 7. Qadın geyimi
    "WomenClothing_Outer", "WomenClothing_Inner", "WomenClothing_Casual",
    "WomenClothing_Sport", "WomenClothing_Formal", "WomenClothing_Under",

    // 8. Kişi geyimi
    "MenClothing_Outer", "MenClothing_Inner", "MenClothing_Casual",
    "MenClothing_Sport", "MenClothing_Formal", "MenClothing_Under",

    // 9. Ayaqqabı
    "Shoes_Sport", "Shoes_Classic", "Shoes_Casual", "Shoes_Sandal",

    // 10. Aksesuarlar
    "Accessories_Bag", "Accessories_Watch", "Accessories_Sunglasses",
    "Accessories_Jewelry", "Accessories_Belt",

    // 11. Gözəllik
    "Beauty_Makeup", "Beauty_Skin", "Beauty_Hair",
    "Beauty_Perfume", "Beauty_Men", "Beauty_Hygiene",

    // 12. Uşaq və ana
    "KidsAndMom_Clothing", "KidsAndMom_Toys", "KidsAndMom_Stroller",
    "KidsAndMom_Food", "KidsAndMom_School",

    // 13. İdman
    "Sports_Fitness", "Sports_Camping", "Sports_Bicycle",
    "Sports_Clothing", "Sports_Acc",

    // 14. Avto
    "Automotive_Acc", "Automotive_Electronics", "Automotive_Parts", "Automotive_Oils",

    // 15. Hədiyyə
    "Gifts_Sets", "Gifts_Souvenir", "Gifts_Trending", "Gifts_Books",
];

const allowedCategoryValues = [...new Set([...legacyCategoryValues, ...adminCategoryValues])];

// =====================================================================
// ƏSAS PRODUCT SCHEMA
// =====================================================================

const options = { discriminatorKey: "category", timestamps: true };

const productSchema = new mongoose.Schema(
    {
        name: {
            type:      String,
            required:  [true, "Məhsul adını daxil edin"],
            maxLength: [255, "Məhsulun adı 255 simvoldan çox ola bilməz"],
            trim:      true,
        },
        price: {
            type:     Number,
            required: [true, "Qiyməti daxil edin"],
            min:      [0, "Qiymət mənfi ola bilməz"],
        },
        description: {
            type:     String,
            required: [true, "Aciqlama hissesini daxil edin"],
            trim:     true,
        },
        ratings: {
            type:    Number,
            default: 0,
            min:     0,
            max:     5,
        },
        images: [
            {
                public_id: { type: String, required: true },
                url:       { type: String, required: true },
            },
        ],
        category: {
            type:     String,
            required: [true, "Kateqoriyani secmelisiniz"],
            enum: {
                values:  allowedCategoryValues,
                message: "'{VALUE}' kateqoriyası mövcud deyil",
            },
        },
        subcategory: {
            type:      String,
            trim:      true,
            maxLength: [255, "Subkateqoriya 255 simvoldan cox ola bilmez"],
            default:   "",
        },
        seller: {
            type:     String,
            required: [true, "Mehsulu satan sirketi daxil edin"],
            trim:     true,
        },
        stock: {
            type:     Number,
            required: [true, "Stok miqdarını daxil edin"],
            min:      [0, "Stok mənfi ola bilməz"],
        },
        numOfReviews: {
            type:    Number,
            default: 0,
        },
        reviews: [
            {
                user: {
                    type:     mongoose.Schema.Types.ObjectId,
                    ref:      "User",
                    required: true,
                },
                name:    { type: String, required: true },
                rating:  { type: Number, required: true, min: 1, max: 5 },
                comment: { type: String, default: "" },
            },
        ],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref:  "User",
        },
    },
    options
);

const Product = mongoose.model("Product", productSchema);


// =====================================================================
// ── KÖHNƏ (LEGACY) DİSCRİMİNATORLAR ─────────────────────────────────
// =====================================================================

const phoneSchema = new mongoose.Schema({
    screenSize:      { type: String, required: [true, "Screen size daxil edin"], trim: true },
    storage:         { type: String, required: [true, "Storage melumatini daxil edin"], trim: true },
    ram:             { type: String, required: [true, "RAM melumatini daxil edin"], trim: true },
    frontCamera:     { type: String, required: [true, "Front camera melumatini daxil edin"], trim: true },
    backCamera:      { type: String, required: [true, "Back camera melumatini daxil edin"], trim: true },
    battery:         { type: String, required: [true, "Battery melumatini daxil edin"], trim: true },
    processor:       { type: String, required: [true, "Processor melumatini daxil edin"], trim: true },
    operatingSystem: { type: String, required: [true, "Emeliyyat sistemi melumatini daxil edin"], trim: true },
});
const Phone = Product.discriminator("Phones", phoneSchema);

const laptopSchema = new mongoose.Schema({
    screenSize:      { type: String, required: [true, "Screen size daxil edin"], trim: true },
    storage:         { type: String, required: [true, "Storage melumatini daxil edin"], trim: true },
    ram:             { type: String, required: [true, "RAM melumatini daxil edin"], trim: true },
    gpu:             { type: String, required: [true, "GPU melumatini daxil edin"], trim: true },
    camera:          { type: String, required: [true, "Kamera melumatini daxil edin"], trim: true },
    processor:       { type: String, required: [true, "Processor melumatini daxil edin"], trim: true },
    batteryLife:     { type: String, required: [true, "Battery life melumatini daxil edin"], trim: true },
    operatingSystem: { type: String, required: [true, "Emeliyyat sistemi melumatini daxil edin"], trim: true },
});
const Laptop = Product.discriminator("Laptops", laptopSchema);

const cameraSchema = new mongoose.Schema({
    resolution:         { type: String, required: [true, "Resolution melumatini daxil edin"], trim: true },
    opticalZoom:        { type: String, required: [true, "Optical zoom melumatini daxil edin"], trim: true },
    sensorType:         { type: String, required: [true, "Sensor novunu daxil edin"], trim: true },
    imageStabilization: { type: String, required: [true, "Image stabilization melumatini daxil edin"], trim: true },
});
const Camera = Product.discriminator("Cameras", cameraSchema);

const headphoneSchema = new mongoose.Schema({
    connectivity:      { type: String, required: [true, "Connectivity melumatini daxil edin"], trim: true },
    batteryLife:       { type: String, required: [true, "Battery life melumatini daxil edin"], trim: true },
    noiseCancellation: { type: String, required: [true, "Noise cancellation melumatini daxil edin"], trim: true },
});
const Headphone = Product.discriminator("Headphones", headphoneSchema);

const consoleSchema = new mongoose.Schema({
    cpu:                 { type: String, required: [true, "CPU melumatini daxil edin"], trim: true },
    gpu:                 { type: String, required: [true, "GPU melumatini daxil edin"], trim: true },
    storage:             { type: String, required: [true, "Storage melumatini daxil edin"], trim: true },
    memory:              { type: String, required: [true, "Memory melumatini daxil edin"], trim: true },
    supportedResolution: { type: String, required: [true, "Desteklenen cozunurluk melumatini daxil edin"], trim: true },
    connectivity:        { type: String, required: [true, "Connectivity melumatini daxil edin"], trim: true },
    controllerIncluded:  { type: Boolean, default: true },
});
const Console = Product.discriminator("Console", consoleSchema);

const iPadSchema = new mongoose.Schema({
    screenSize:      { type: String, required: [true, "Screen size daxil edin"], trim: true },
    storage:         { type: String, required: [true, "Storage melumatini daxil edin"], trim: true },
    ram:             { type: String, required: [true, "RAM melumatini daxil edin"], trim: true },
    battery:         { type: String, required: [true, "Battery melumatini daxil edin"], trim: true },
    processor:       { type: String, required: [true, "Processor melumatini daxil edin"], trim: true },
    operatingSystem: { type: String, required: [true, "Emeliyyat sistemi melumatini daxil edin"], trim: true },
    camera:          { type: String, required: [true, "Kamera melumatini daxil edin"], trim: true },
    cellular:        { type: Boolean, required: [true, "Cellular variantini daxil edin"] },
});
const iPad = Product.discriminator("iPad", iPadSchema);

const womenClothingSchema = new mongoose.Schema({
    size:     { type: String, required: [true, "Olcunu daxil edin"], trim: true },
    color:    { type: String, required: [true, "Rengi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
    season:   { type: String, required: [true, "Movsumu daxil edin"], trim: true },
});
const WomenClothing = Product.discriminator("WomenClothing", womenClothingSchema);

const menClothingSchema = new mongoose.Schema({
    size:     { type: String, required: [true, "Olcunu daxil edin"], trim: true },
    color:    { type: String, required: [true, "Rengi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
    season:   { type: String, required: [true, "Movsumu daxil edin"], trim: true },
});
const MenClothing = Product.discriminator("MenClothing", menClothingSchema);

const kidsClothingSchema = new mongoose.Schema({
    size:     { type: String, required: [true, "Olcunu daxil edin"], trim: true },
    color:    { type: String, required: [true, "Rengi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
    ageRange: { type: String, required: [true, "Yas araligini daxil edin"], trim: true },
    gender:   { type: String, required: [true, "Cinsi daxil edin"], trim: true },
});
const KidsClothing = Product.discriminator("KidsClothing", kidsClothingSchema);

const homeAppliancesSchema = new mongoose.Schema({
    brand:            { type: String, required: [true, "Brendi daxil edin"], trim: true },
    powerConsumption: { type: String, required: [true, "Guc istehlakini daxil edin"], trim: true },
    warranty:         { type: String, required: [true, "Zemaneti daxil edin"], trim: true },
    dimensions:       { type: String, required: [true, "Olculeri daxil edin"], trim: true },
    color:            { type: String, required: [true, "Rengi daxil edin"], trim: true },
});
const HomeAppliance = Product.discriminator("HomeAppliances", homeAppliancesSchema);

const homeAndGardenSchema = new mongoose.Schema({
    material:      { type: String, required: [true, "Materiali daxil edin"], trim: true },
    dimensions:    { type: String, required: [true, "Olculeri daxil edin"], trim: true },
    color:         { type: String, required: [true, "Rengi daxil edin"], trim: true },
    brand:         { type: String, required: [true, "Brendi daxil edin"], trim: true },
    indoorOutdoor: { type: String, required: [true, "Daxili/Xarici istifade ni daxil edin"], trim: true },
});
const HomeAndGarden = Product.discriminator("HomeAndGarden", homeAndGardenSchema);

const beautySchema = new mongoose.Schema({
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
    skinType:    { type: String, required: [true, "Deri tipini daxil edin"], trim: true },
    volume:      { type: String, required: [true, "Hecmi daxil edin"], trim: true },
    ingredients: { type: String, required: [true, "Terkibi daxil edin"], trim: true },
    expiryDate:  { type: String, required: [true, "Istifade muddetini daxil edin"], trim: true },
});
const Beauty = Product.discriminator("Beauty", beautySchema);

const sportsSchema = new mongoose.Schema({
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
    material:    { type: String, required: [true, "Materiali daxil edin"], trim: true },
    weight:      { type: String, required: [true, "Cekini daxil edin"], trim: true },
    suitableFor: { type: String, required: [true, "Idman novunu daxil edin"], trim: true },
    color:       { type: String, required: [true, "Rengi daxil edin"], trim: true },
});
const Sports = Product.discriminator("Sports", sportsSchema);

const automotiveSchema = new mongoose.Schema({
    brand:            { type: String, required: [true, "Brendi daxil edin"], trim: true },
    compatibleModels: { type: String, required: [true, "Uygun avtomobil modellerini daxil edin"], trim: true },
    material:         { type: String, required: [true, "Materiali daxil edin"], trim: true },
    warranty:         { type: String, required: [true, "Zemaneti daxil edin"], trim: true },
    color:            { type: String, required: [true, "Rengi daxil edin"], trim: true },
});
const Automotive = Product.discriminator("Automotive", automotiveSchema);


// =====================================================================
// ── 1. ELEKTRONİKA ALT KATEQORİYALARI ───────────────────────────────
// =====================================================================

const tvSchema = new mongoose.Schema({
    tvType:           { type: String, required: [true, "TV növünü daxil edin"], trim: true },
    screenSize:       { type: String, required: [true, "Ekran ölçüsünü daxil edin"], trim: true },
    screenResolution: { type: String, required: [true, "Ekran həllini daxil edin"], trim: true },
    smartTv:          { type: Boolean, default: false },
    audioOutputPower: { type: String, trim: true },
    brand:            { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const TVs = Product.discriminator("TVs", tvSchema);

const audioSystemSchema = new mongoose.Schema({
    audioOutputPower: { type: String, required: [true, "Audio gücünü daxil edin"], trim: true },
    connectivity:     { type: String, required: [true, "Bağlantı növünü daxil edin"], trim: true },
    wireless:         { type: Boolean, default: false },
    brand:            { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const AudioSystems = Product.discriminator("AudioSystems", audioSystemSchema);

const photoVideoSchema = new mongoose.Schema({
    cameraType:         { type: String, required: [true, "Kamera növünü daxil edin"], trim: true },
    lensMount:          { type: String, trim: true },
    resolution:         { type: String, required: [true, "Həlli daxil edin"], trim: true },
    videoResolution:    { type: String, trim: true },
    imageStabilization: { type: String, trim: true },
    brand:              { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const PhotoVideo = Product.discriminator("PhotoVideo", photoVideoSchema);

const gameConsoleSchema = new mongoose.Schema({
    cpu:                 { type: String, required: [true, "CPU daxil edin"], trim: true },
    gpu:                 { type: String, required: [true, "GPU daxil edin"], trim: true },
    storage:             { type: String, required: [true, "Yaddaşı daxil edin"], trim: true },
    memory:              { type: String, required: [true, "RAM daxil edin"], trim: true },
    supportedResolution: { type: String, required: [true, "Dəstəklənən həlli daxil edin"], trim: true },
    controllerIncluded:  { type: Boolean, default: true },
    brand:               { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const GameConsoles = Product.discriminator("GameConsoles", gameConsoleSchema);

const smartHomeSchema = new mongoose.Schema({
    smartHomeProtocol: { type: String, required: [true, "Smart home protokolunu daxil edin"], trim: true },
    compatibility:     { type: String, trim: true },
    powerSource:       { type: String, trim: true },
    brand:             { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const SmartHome = Product.discriminator("SmartHome", smartHomeSchema);

const gadgetSchema = new mongoose.Schema({
    gadgetType:   { type: String, required: [true, "Gadget növünü daxil edin"], trim: true },
    connectivity: { type: String, trim: true },
    batteryLife:  { type: String, trim: true },
    brand:        { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Gadgets = Product.discriminator("Gadgets", gadgetSchema);

const electronicsAccessorySchema = new mongoose.Schema({
    accessoryType: { type: String, required: [true, "Aksesuar növünü daxil edin"], trim: true },
    compatibility: { type: String, trim: true },
    color:         { type: String, trim: true },
    brand:         { type: String, trim: true },
});
const ElectronicsAccessories = Product.discriminator("ElectronicsAccessories", electronicsAccessorySchema);


// =====================================================================
// ── 2. TELEFONLAR VƏ AKSESUARLAR ─────────────────────────────────────
// =====================================================================

const smartphoneSchema = new mongoose.Schema({
    screenSize:      { type: String, required: [true, "Ekran ölçüsünü daxil edin"], trim: true },
    storage:         { type: String, required: [true, "Yaddaşı daxil edin"], trim: true },
    ram:             { type: String, required: [true, "RAM daxil edin"], trim: true },
    frontCamera:     { type: String, required: [true, "Ön kameranı daxil edin"], trim: true },
    backCamera:      { type: String, required: [true, "Arxa kameranı daxil edin"], trim: true },
    battery:         { type: String, required: [true, "Batareyanı daxil edin"], trim: true },
    processor:       { type: String, required: [true, "Prosessoru daxil edin"], trim: true },
    operatingSystem: { type: String, required: [true, "ƏS daxil edin"], trim: true },
    dualSim:         { type: Boolean, default: false },
    brand:           { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Smartphones = Product.discriminator("Smartphones", smartphoneSchema);

const featurePhoneSchema = new mongoose.Schema({
    battery: { type: String, required: [true, "Batareyanı daxil edin"], trim: true },
    dualSim: { type: Boolean, default: false },
    camera:  { type: String, trim: true },
    radio:   { type: Boolean, default: false },
    brand:   { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const FeaturePhones = Product.discriminator("FeaturePhones", featurePhoneSchema);

const headphonesNewSchema = new mongoose.Schema({
    headphoneType:     { type: String, required: [true, "Qulaqlıq növünü daxil edin"], trim: true },
    connectivity:      { type: String, required: [true, "Bağlantı növünü daxil edin"], trim: true },
    noiseCancellation: { type: String, trim: true },
    microphone:        { type: String, trim: true },
    batteryLife:       { type: String, trim: true },
    brand:             { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const HeadphonesNew = Product.discriminator("HeadphonesNew", headphonesNewSchema);

const cableAdapterSchema = new mongoose.Schema({
    cableLength:   { type: String, required: [true, "Kabel uzunluğunu daxil edin"], trim: true },
    connectorType: { type: String, required: [true, "Konnektoru daxil edin"], trim: true },
    fastCharging:  { type: Boolean, default: false },
    brand:         { type: String, trim: true },
});
const CablesAdapters = Product.discriminator("CablesAdapters", cableAdapterSchema);

const powerbankSchema = new mongoose.Schema({
    powerbankCapacity: { type: String, required: [true, "Tutumu daxil edin"], trim: true },
    ports:             { type: String, required: [true, "Portları daxil edin"], trim: true },
    wirelessCharging:  { type: Boolean, default: false },
    brand:             { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Powerbanks = Product.discriminator("Powerbanks", powerbankSchema);

const phoneAccessorySchema = new mongoose.Schema({
    accessoryType:    { type: String, required: [true, "Aksesuar növünü daxil edin"], trim: true },
    compatibleModels: { type: String, trim: true },
    color:            { type: String, trim: true },
    brand:            { type: String, trim: true },
});
const PhoneAccessories = Product.discriminator("PhoneAccessories", phoneAccessorySchema);


// =====================================================================
// ── 3. KOMPÜTER VƏ OFİS TEXNİKASI ────────────────────────────────────
// =====================================================================

const laptopsNewSchema = new mongoose.Schema({
    screenSize:      { type: String, required: [true, "Ekran ölçüsünü daxil edin"], trim: true },
    storage:         { type: String, required: [true, "Yaddaşı daxil edin"], trim: true },
    ram:             { type: String, required: [true, "RAM daxil edin"], trim: true },
    processor:       { type: String, required: [true, "Prosessoru daxil edin"], trim: true },
    gpu:             { type: String, trim: true },
    operatingSystem: { type: String, required: [true, "ƏS daxil edin"], trim: true },
    batteryLife:     { type: String, trim: true },
    brand:           { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const LaptopsNew = Product.discriminator("LaptopsNew", laptopsNewSchema);

const desktopSchema = new mongoose.Schema({
    desktopType: { type: String, required: [true, "Kompüter növünü daxil edin"], trim: true },
    processor:   { type: String, required: [true, "Prosessoru daxil edin"], trim: true },
    ram:         { type: String, required: [true, "RAM daxil edin"], trim: true },
    storage:     { type: String, required: [true, "Yaddaşı daxil edin"], trim: true },
    gpu:         { type: String, trim: true },
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Desktops = Product.discriminator("Desktops", desktopSchema);

const monitorSchema = new mongoose.Schema({
    monitorSize: { type: String, required: [true, "Ekran ölçüsünü daxil edin"], trim: true },
    panelType:   { type: String, required: [true, "Panel növünü daxil edin"], trim: true },
    resolution:  { type: String, required: [true, "Həlli daxil edin"], trim: true },
    refreshRate: { type: String, required: [true, "Yenilənmə tezliyini daxil edin"], trim: true },
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Monitors = Product.discriminator("Monitors", monitorSchema);

const printerScannerSchema = new mongoose.Schema({
    printerType: { type: String, required: [true, "Printer növünü daxil edin"], trim: true },
    paperSize:   { type: String, required: [true, "Kağız ölçüsünü daxil edin"], trim: true },
    wireless:    { type: Boolean, default: false },
    scanner:     { type: Boolean, default: false },
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const PrintersScanners = Product.discriminator("PrintersScanners", printerScannerSchema);

const officeAccessorySchema = new mongoose.Schema({
    accessoryType: { type: String, required: [true, "Aksesuar növünü daxil edin"], trim: true },
    material:      { type: String, trim: true },
    brand:         { type: String, trim: true },
});
const OfficeAccessories = Product.discriminator("OfficeAccessories", officeAccessorySchema);

const componentSchema = new mongoose.Schema({
    componentType: { type: String, required: [true, "Komponent növünü daxil edin"], trim: true },
    capacity:      { type: String, required: [true, "Tutumu daxil edin"], trim: true },
    speed:         { type: String, trim: true },
    brand:         { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Components = Product.discriminator("Components", componentSchema);


// =====================================================================
// ── 4. MƏİŞƏT TEXNİKASI ──────────────────────────────────────────────
// =====================================================================

const largeApplianceSchema = new mongoose.Schema({
    applianceType: { type: String, required: [true, "Texnika növünü daxil edin"], trim: true },
    energyClass:   { type: String, required: [true, "Enerji sinfini daxil edin"], trim: true },
    dimensions:    { type: String, required: [true, "Ölçüləri daxil edin"], trim: true },
    color:         { type: String, trim: true },
    brand:         { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const LargeAppliances = Product.discriminator("LargeAppliances", largeApplianceSchema);

const smallApplianceSchema = new mongoose.Schema({
    applianceType: { type: String, required: [true, "Texnika növünü daxil edin"], trim: true },
    power:         { type: String, required: [true, "Gücü daxil edin"], trim: true },
    color:         { type: String, trim: true },
    brand:         { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const SmallAppliances = Product.discriminator("SmallAppliances", smallApplianceSchema);

const kitchenApplianceSchema = new mongoose.Schema({
    kitchenAppliance: { type: String, required: [true, "Mətbəx cihazını daxil edin"], trim: true },
    material:         { type: String, required: [true, "Materiali daxil edin"], trim: true },
    dishwasherSafe:   { type: Boolean, default: false },
    brand:            { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const KitchenAppliances = Product.discriminator("KitchenAppliances", kitchenApplianceSchema);

const climateControlSchema = new mongoose.Schema({
    airConditionerType: { type: String, required: [true, "Kondisioner növünü daxil edin"], trim: true },
    heatingType:        { type: String, trim: true },
    energyClass:        { type: String, trim: true },
    brand:              { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const AirConditioners = Product.discriminator("AirConditioners", climateControlSchema);

const waterHeaterSchema = new mongoose.Schema({
    capacity:    { type: String, required: [true, "Tutumu daxil edin"], trim: true },
    energyClass: { type: String, required: [true, "Enerji sinfini daxil edin"], trim: true },
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const WaterHeaters = Product.discriminator("WaterHeaters", waterHeaterSchema);


// =====================================================================
// ── 5. EV VƏ DEKOR ───────────────────────────────────────────────────
// =====================================================================

const homeDecorSchema = new mongoose.Schema({
    decorType: { type: String, required: [true, "Dekor növünü daxil edin"], trim: true },
    material:  { type: String, required: [true, "Materiali daxil edin"], trim: true },
    color:     { type: String, trim: true },
    brand:     { type: String, trim: true },
});
const HomeDecor = Product.discriminator("HomeDecor", homeDecorSchema);

const lightingSchema = new mongoose.Schema({
    lightType:        { type: String, required: [true, "İşıq növünü daxil edin"], trim: true },
    wattage:          { type: String, required: [true, "Gücü daxil edin"], trim: true },
    colorTemperature: { type: String, trim: true },
    brand:            { type: String, trim: true },
});
const Lighting = Product.discriminator("Lighting", lightingSchema);

const homeTextilesSchema = new mongoose.Schema({
    textileType: { type: String, required: [true, "Tekstil növünü daxil edin"], trim: true },
    material:    { type: String, required: [true, "Materiali daxil edin"], trim: true },
    dimensions:  { type: String, required: [true, "Ölçüləri daxil edin"], trim: true },
    color:       { type: String, trim: true },
    brand:       { type: String, trim: true },
});
const HomeTextiles = Product.discriminator("HomeTextiles", homeTextilesSchema);

const kitchenwareSchema = new mongoose.Schema({
    kitchenwareType: { type: String, required: [true, "Qab növünü daxil edin"], trim: true },
    material:        { type: String, required: [true, "Materiali daxil edin"], trim: true },
    dishwasherSafe:  { type: Boolean, default: false },
    brand:           { type: String, trim: true },
});
const Kitchenware = Product.discriminator("Kitchenware", kitchenwareSchema);

const bathAccessorySchema = new mongoose.Schema({
    bathAccessoryType: { type: String, required: [true, "Aksesuar növünü daxil edin"], trim: true },
    material:          { type: String, required: [true, "Materiali daxil edin"], trim: true },
    color:             { type: String, trim: true },
    brand:             { type: String, trim: true },
});
const BathAccessories = Product.discriminator("BathAccessories", bathAccessorySchema);


// =====================================================================
// ── 6. MEBEL ─────────────────────────────────────────────────────────
// =====================================================================

const livingRoomFurnitureSchema = new mongoose.Schema({
    furnitureType: { type: String, required: [true, "Mebel növünü daxil edin"], trim: true },
    material:      { type: String, required: [true, "Materiali daxil edin"], trim: true },
    color:         { type: String, trim: true },
    dimensions:    { type: String, required: [true, "Ölçüləri daxil edin"], trim: true },
    brand:         { type: String, trim: true },
});
const LivingRoomFurniture = Product.discriminator("LivingRoomFurniture", livingRoomFurnitureSchema);

const bedroomFurnitureSchema = new mongoose.Schema({
    furnitureType: { type: String, required: [true, "Mebel növünü daxil edin"], trim: true },
    material:      { type: String, required: [true, "Materiali daxil edin"], trim: true },
    color:         { type: String, trim: true },
    dimensions:    { type: String, required: [true, "Ölçüləri daxil edin"], trim: true },
    brand:         { type: String, trim: true },
});
const BedroomFurniture = Product.discriminator("BedroomFurniture", bedroomFurnitureSchema);

const kitchenFurnitureSchema = new mongoose.Schema({
    furnitureType: { type: String, required: [true, "Mebel növünü daxil edin"], trim: true },
    material:      { type: String, required: [true, "Materiali daxil edin"], trim: true },
    color:         { type: String, trim: true },
    dimensions:    { type: String, required: [true, "Ölçüləri daxil edin"], trim: true },
    brand:         { type: String, trim: true },
});
const KitchenFurniture = Product.discriminator("KitchenFurniture", kitchenFurnitureSchema);

const officeFurnitureSchema = new mongoose.Schema({
    furnitureType: { type: String, required: [true, "Mebel növünü daxil edin"], trim: true },
    material:      { type: String, required: [true, "Materiali daxil edin"], trim: true },
    color:         { type: String, trim: true },
    dimensions:    { type: String, required: [true, "Ölçüləri daxil edin"], trim: true },
    brand:         { type: String, trim: true },
});
const OfficeFurniture = Product.discriminator("OfficeFurniture", officeFurnitureSchema);

const gardenFurnitureSchema = new mongoose.Schema({
    furnitureType: { type: String, required: [true, "Mebel növünü daxil edin"], trim: true },
    material:      { type: String, required: [true, "Materiali daxil edin"], trim: true },
    color:         { type: String, trim: true },
    dimensions:    { type: String, required: [true, "Ölçüləri daxil edin"], trim: true },
    brand:         { type: String, trim: true },
});
const GardenFurniture = Product.discriminator("GardenFurniture", gardenFurnitureSchema);


// =====================================================================
// ── 7. QADIN GEYİMLƏRİ ALT KATEQORİYALARI ───────────────────────────
// =====================================================================

const womensTopsSchema = new mongoose.Schema({
    size:     { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:    { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
    season:   { type: String, required: [true, "Mövsümü daxil edin"], trim: true },
    topType:  { type: String, trim: true },
});
const WomensTops = Product.discriminator("WomensTops", womensTopsSchema);

const womensBottomsSchema = new mongoose.Schema({
    size:       { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:      { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material:   { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:      { type: String, required: [true, "Brendi daxil edin"], trim: true },
    season:     { type: String, required: [true, "Mövsümü daxil edin"], trim: true },
    bottomType: { type: String, trim: true },
});
const WomensBottoms = Product.discriminator("WomensBottoms", womensBottomsSchema);

const womensCasualSchema = new mongoose.Schema({
    size:     { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:    { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
    season:   { type: String, required: [true, "Mövsümü daxil edin"], trim: true },
    style:    { type: String, trim: true },
});
const WomensCasual = Product.discriminator("WomensCasual", womensCasualSchema);

const womensSportSchema = new mongoose.Schema({
    size:      { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:     { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material:  { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:     { type: String, required: [true, "Brendi daxil edin"], trim: true },
    sportType: { type: String, trim: true },
});
const WomensSport = Product.discriminator("WomensSport", womensSportSchema);

const womensFormalSchema = new mongoose.Schema({
    size:     { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:    { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
    occasion: { type: String, trim: true },
});
const WomensFormal = Product.discriminator("WomensFormal", womensFormalSchema);

const womensUnderwearSchema = new mongoose.Schema({
    size:     { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:    { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
    type:     { type: String, trim: true },
});
const WomensUnderwear = Product.discriminator("WomensUnderwear", womensUnderwearSchema);


// =====================================================================
// ── 8. KİŞİ GEYİMLƏRİ ALT KATEQORİYALARI ────────────────────────────
// =====================================================================

const mensTopsSchema = new mongoose.Schema({
    size:     { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:    { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
    season:   { type: String, required: [true, "Mövsümü daxil edin"], trim: true },
    topType:  { type: String, trim: true },
});
const MensTops = Product.discriminator("MensTops", mensTopsSchema);

const mensBottomsSchema = new mongoose.Schema({
    size:       { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:      { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material:   { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:      { type: String, required: [true, "Brendi daxil edin"], trim: true },
    season:     { type: String, required: [true, "Mövsümü daxil edin"], trim: true },
    bottomType: { type: String, trim: true },
});
const MensBottoms = Product.discriminator("MensBottoms", mensBottomsSchema);

const mensCasualSchema = new mongoose.Schema({
    size:     { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:    { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
    season:   { type: String, required: [true, "Mövsümü daxil edin"], trim: true },
    style:    { type: String, trim: true },
});
const MensCasual = Product.discriminator("MensCasual", mensCasualSchema);

const mensSportSchema = new mongoose.Schema({
    size:      { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:     { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material:  { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:     { type: String, required: [true, "Brendi daxil edin"], trim: true },
    sportType: { type: String, trim: true },
});
const MensSport = Product.discriminator("MensSport", mensSportSchema);

const mensFormalSchema = new mongoose.Schema({
    size:     { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:    { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
    occasion: { type: String, trim: true },
});
const MensFormal = Product.discriminator("MensFormal", mensFormalSchema);

const mensUnderwearSchema = new mongoose.Schema({
    size:     { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:    { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
    type:     { type: String, trim: true },
});
const MensUnderwear = Product.discriminator("MensUnderwear", mensUnderwearSchema);


// =====================================================================
// ── 9. AYAQQABI ──────────────────────────────────────────────────────
// =====================================================================

const sportsShoesSchema = new mongoose.Schema({
    shoeType:     { type: String, required: [true, "Ayaqqabı növünü daxil edin"], trim: true },
    size:         { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    soleMaterial: { type: String, required: [true, "Alt materialını daxil edin"], trim: true },
    closureType:  { type: String, required: [true, "Bağlama növünü daxil edin"], trim: true },
    color:        { type: String, trim: true },
    brand:        { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const SportsShoes = Product.discriminator("SportsShoes", sportsShoesSchema);

const classicShoesSchema = new mongoose.Schema({
    shoeType:    { type: String, required: [true, "Ayaqqabı növünü daxil edin"], trim: true },
    size:        { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    material:    { type: String, required: [true, "Materiali daxil edin"], trim: true },
    closureType: { type: String, required: [true, "Bağlama növünü daxil edin"], trim: true },
    color:       { type: String, trim: true },
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const ClassicShoes = Product.discriminator("ClassicShoes", classicShoesSchema);

const casualShoesSchema = new mongoose.Schema({
    shoeType:    { type: String, required: [true, "Ayaqqabı növünü daxil edin"], trim: true },
    size:        { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    material:    { type: String, required: [true, "Materiali daxil edin"], trim: true },
    closureType: { type: String, required: [true, "Bağlama növünü daxil edin"], trim: true },
    color:       { type: String, trim: true },
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const CasualShoes = Product.discriminator("CasualShoes", casualShoesSchema);

const sandalsSchema = new mongoose.Schema({
    shoeType:    { type: String, required: [true, "Ayaqqabı növünü daxil edin"], trim: true },
    size:        { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    material:    { type: String, required: [true, "Materiali daxil edin"], trim: true },
    closureType: { type: String, required: [true, "Bağlama növünü daxil edin"], trim: true },
    color:       { type: String, trim: true },
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Sandals = Product.discriminator("Sandals", sandalsSchema);


// =====================================================================
// ── 10. AKSESUARLAR ──────────────────────────────────────────────────
// =====================================================================

const bagsSchema = new mongoose.Schema({
    bagType:  { type: String, required: [true, "Çanta növünü daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    color:    { type: String, trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Bags = Product.discriminator("Bags", bagsSchema);

const watchesSchema = new mongoose.Schema({
    watchType:  { type: String, required: [true, "Saat növünü daxil edin"], trim: true },
    material:   { type: String, required: [true, "Materiali daxil edin"], trim: true },
    waterproof: { type: Boolean, default: false },
    brand:      { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Watches = Product.discriminator("Watches", watchesSchema);

const sunglassesSchema = new mongoose.Schema({
    frameMaterial:  { type: String, required: [true, "Çərçivə materialını daxil edin"], trim: true },
    lensTechnology: { type: String, trim: true },
    uvProtection:   { type: Boolean, default: true },
    brand:          { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Sunglasses = Product.discriminator("Sunglasses", sunglassesSchema);

const jewelrySchema = new mongoose.Schema({
    jewelryType: { type: String, required: [true, "Zərgərlik növünü daxil edin"], trim: true },
    material:    { type: String, required: [true, "Materiali daxil edin"], trim: true },
    gemstone:    { type: String, trim: true },
    brand:       { type: String, trim: true },
});
const Jewelry = Product.discriminator("Jewelry", jewelrySchema);

const beltsSchema = new mongoose.Schema({
    beltType: { type: String, required: [true, "Kəmər növünü daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    size:     { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Belts = Product.discriminator("Belts", beltsSchema);


// =====================================================================
// ── 11. GÖZƏLLIK VƏ KOSMETİKA ────────────────────────────────────────
// =====================================================================

const makeupSchema = new mongoose.Schema({
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
    productType: { type: String, required: [true, "Məhsul növünü daxil edin"], trim: true },
    shade:       { type: String, trim: true },
    volume:      { type: String, trim: true },
});
const Makeup = Product.discriminator("Makeup", makeupSchema);

const skincareSchema = new mongoose.Schema({
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
    skinType:    { type: String, required: [true, "Dəri növünü daxil edin"], trim: true },
    ingredients: { type: String, trim: true },
    volume:      { type: String, required: [true, "Həcmi daxil edin"], trim: true },
});
const Skincare = Product.discriminator("Skincare", skincareSchema);

const hairCareSchema = new mongoose.Schema({
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
    hairType:    { type: String, required: [true, "Saç növünü daxil edin"], trim: true },
    volume:      { type: String, required: [true, "Həcmi daxil edin"], trim: true },
    ingredients: { type: String, trim: true },
});
const HairCare = Product.discriminator("HairCare", hairCareSchema);

const fragranceSchema = new mongoose.Schema({
    brand:         { type: String, required: [true, "Brendi daxil edin"], trim: true },
    fragranceType: { type: String, required: [true, "Ətir növünü daxil edin"], trim: true },
    volume:        { type: String, required: [true, "Həcmi daxil edin"], trim: true },
});
const Fragrance = Product.discriminator("Fragrance", fragranceSchema);

const menGroomingSchema = new mongoose.Schema({
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
    productType: { type: String, required: [true, "Məhsul növünü daxil edin"], trim: true },
    volume:      { type: String, required: [true, "Həcmi daxil edin"], trim: true },
});
const MenGrooming = Product.discriminator("MenGrooming", menGroomingSchema);

const hygieneSchema = new mongoose.Schema({
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
    productType: { type: String, required: [true, "Məhsul növünü daxil edin"], trim: true },
    quantity:    { type: String, required: [true, "Miqdarı daxil edin"], trim: true },
});
const Hygiene = Product.discriminator("Hygiene", hygieneSchema);


// =====================================================================
// ── 12. UŞAQ VƏ ANA ──────────────────────────────────────────────────
// =====================================================================

const kidsClothingNewSchema = new mongoose.Schema({
    kidsClothingType: { type: String, required: [true, "Geyim növünü daxil edin"], trim: true },
    size:             { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    material:         { type: String, required: [true, "Materiali daxil edin"], trim: true },
    ageRange:         { type: String, required: [true, "Yaş aralığını daxil edin"], trim: true },
    brand:            { type: String, trim: true },
});
const KidsClothingNew = Product.discriminator("KidsClothingNew", kidsClothingNewSchema);

const toysSchema = new mongoose.Schema({
    toyType:  { type: String, required: [true, "Oyuncaq növünü daxil edin"], trim: true },
    ageRange: { type: String, required: [true, "Yaş aralığını daxil edin"], trim: true },
    material: { type: String, trim: true },
    brand:    { type: String, trim: true },
});
const Toys = Product.discriminator("Toys", toysSchema);

const strollersSchema = new mongoose.Schema({
    strollerType: { type: String, required: [true, "Araba növünü daxil edin"], trim: true },
    weight:       { type: String, required: [true, "Çəkisini daxil edin"], trim: true },
    foldable:     { type: Boolean, default: true },
    brand:        { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Strollers = Product.discriminator("Strollers", strollersSchema);

const babyFeedingSchema = new mongoose.Schema({
    feedingProduct: { type: String, required: [true, "Məhsul növünü daxil edin"], trim: true },
    material:       { type: String, required: [true, "Materiali daxil edin"], trim: true },
    bpaFree:        { type: Boolean, default: true },
    brand:          { type: String, trim: true },
});
const BabyFeeding = Product.discriminator("BabyFeeding", babyFeedingSchema);

const schoolSuppliesSchema = new mongoose.Schema({
    productType: { type: String, required: [true, "Məhsul növünü daxil edin"], trim: true },
    brand:       { type: String, trim: true },
    ageGroup:    { type: String, required: [true, "Yaş qrupunu daxil edin"], trim: true },
});
const SchoolSupplies = Product.discriminator("SchoolSupplies", schoolSuppliesSchema);


// =====================================================================
// ── 13. İDMAN VƏ OUTDOOR ─────────────────────────────────────────────
// =====================================================================

const fitnessEquipmentSchema = new mongoose.Schema({
    sportEquipmentType: { type: String, required: [true, "Avadanlıq növünü daxil edin"], trim: true },
    weight:             { type: String, trim: true },
    material:           { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:              { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const FitnessEquipment = Product.discriminator("FitnessEquipment", fitnessEquipmentSchema);

const campingSchema = new mongoose.Schema({
    campingItem: { type: String, required: [true, "Məhsul növünü daxil edin"], trim: true },
    material:    { type: String, required: [true, "Materiali daxil edin"], trim: true },
    weight:      { type: String, trim: true },
    brand:       { type: String, trim: true },
});
const Camping = Product.discriminator("Camping", campingSchema);

const bicyclesSchema = new mongoose.Schema({
    bikeType:      { type: String, required: [true, "Velosiped növünü daxil edin"], trim: true },
    frameMaterial: { type: String, required: [true, "Çərçivə materialını daxil edin"], trim: true },
    wheelSize:     { type: String, required: [true, "Təkər ölçüsünü daxil edin"], trim: true },
    brand:         { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Bicycles = Product.discriminator("Bicycles", bicyclesSchema);

const sportsApparelSchema = new mongoose.Schema({
    clothingType: { type: String, required: [true, "Geyim növünü daxil edin"], trim: true },
    size:         { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    material:     { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:        { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const SportsApparel = Product.discriminator("SportsApparel", sportsApparelSchema);

const sportsAccessoriesSchema = new mongoose.Schema({
    accessoryType: { type: String, required: [true, "Aksesuar növünü daxil edin"], trim: true },
    material:      { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:         { type: String, trim: true },
});
const SportsAccessories = Product.discriminator("SportsAccessories", sportsAccessoriesSchema);


// =====================================================================
// ── 14. AVTO MƏHSULLAR ───────────────────────────────────────────────
// =====================================================================

const autoAccessoriesSchema = new mongoose.Schema({
    autoAccessoryType: { type: String, required: [true, "Aksesuar növünü daxil edin"], trim: true },
    compatibleModels:  { type: String, required: [true, "Uyğun modelleri daxil edin"], trim: true },
    material:          { type: String, trim: true },
    brand:             { type: String, trim: true },
});
const AutoAccessories = Product.discriminator("AutoAccessories", autoAccessoriesSchema);

const autoElectronicsSchema = new mongoose.Schema({
    deviceType:       { type: String, required: [true, "Cihaz növünü daxil edin"], trim: true },
    compatibleModels: { type: String, required: [true, "Uyğun modelleri daxil edin"], trim: true },
    features:         { type: String, trim: true },
    brand:            { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const AutoElectronics = Product.discriminator("AutoElectronics", autoElectronicsSchema);

const sparePartsSchema = new mongoose.Schema({
    sparePartType:    { type: String, required: [true, "Hissə növünü daxil edin"], trim: true },
    compatibleModels: { type: String, required: [true, "Uyğun modelleri daxil edin"], trim: true },
    oemNumber:        { type: String, trim: true },
    brand:            { type: String, trim: true },
});
const SpareParts = Product.discriminator("SpareParts", sparePartsSchema);

const autoChemicalsSchema = new mongoose.Schema({
    chemicalType: { type: String, required: [true, "Kimyəvi növünü daxil edin"], trim: true },
    volume:       { type: String, required: [true, "Həcmi daxil edin"], trim: true },
    application:  { type: String, trim: true },
    brand:        { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const AutoChemicals = Product.discriminator("AutoChemicals", autoChemicalsSchema);


// =====================================================================
// ── 15. HƏDİYYƏLƏR VƏ LİFESTYLE ─────────────────────────────────────
// =====================================================================

const giftSetsSchema = new mongoose.Schema({
    giftType: { type: String, required: [true, "Hədiyyə növünü daxil edin"], trim: true },
    occasion: { type: String, required: [true, "Mərasimi daxil edin"], trim: true },
    includes: { type: String, trim: true },
    brand:    { type: String, trim: true },
});
const GiftSets = Product.discriminator("GiftSets", giftSetsSchema);

const souvenirsSchema = new mongoose.Schema({
    productType: { type: String, required: [true, "Məhsul növünü daxil edin"], trim: true },
    origin:      { type: String, trim: true },
    material:    { type: String, trim: true },
    brand:       { type: String, trim: true },
});
const Souvenirs = Product.discriminator("Souvenirs", souvenirsSchema);

const trendingProductsSchema = new mongoose.Schema({
    productType:     { type: String, required: [true, "Məhsul növünü daxil edin"], trim: true },
    popularityScore: { type: Number, default: 0 },
    brand:           { type: String, trim: true },
});
const TrendingProducts = Product.discriminator("TrendingProducts", trendingProductsSchema);

const booksHobbiesSchema = new mongoose.Schema({
    hobbyType: { type: String, required: [true, "Hobbi növünü daxil edin"], trim: true },
    author:    { type: String, trim: true },
    format:    { type: String, trim: true },
    brand:     { type: String, trim: true },
});
const BooksHobbies = Product.discriminator("BooksHobbies", booksHobbiesSchema);


// =====================================================================
// ── YENİ FRONTEND DİSCRİMİNATORLARI ─────────────────────────────────
// =====================================================================

const es = () => new mongoose.Schema({});

// 1. Elektronika
const Electronics_TV        = Product.discriminator("Electronics_TV",        es());
const Electronics_Photo     = Product.discriminator("Electronics_Photo",     es());
const Electronics_Console   = Product.discriminator("Electronics_Console",   es());
const Electronics_SmartHome = Product.discriminator("Electronics_SmartHome", es());
const Electronics_Gadgets   = Product.discriminator("Electronics_Gadgets",   es());
const Electronics_Acc       = Product.discriminator("Electronics_Acc",       es());

// 2. Telefonlar
const Phones_Smartphone = Product.discriminator("Phones_Smartphone", es());
const Phones_Basic      = Product.discriminator("Phones_Basic",      es());
const Phones_Headphones = Product.discriminator("Phones_Headphones", es());
const Phones_Cables     = Product.discriminator("Phones_Cables",     es());
const Phones_Powerbank  = Product.discriminator("Phones_Powerbank",  es());
const Phones_Acc        = Product.discriminator("Phones_Acc",        es());

// 3. Kompüter
const Computers_Laptop    = Product.discriminator("Computers_Laptop",    es());
const Computers_Desktop   = Product.discriminator("Computers_Desktop",   es());
const Computers_Monitor   = Product.discriminator("Computers_Monitor",   es());
const Computers_Printer   = Product.discriminator("Computers_Printer",   es());
const Computers_OfficeAcc = Product.discriminator("Computers_OfficeAcc", es());
const Computers_Parts     = Product.discriminator("Computers_Parts",     es());

// 4. Məişət texnikası
const HomeAppliances_Large   = Product.discriminator("HomeAppliances_Large",   es());
const HomeAppliances_Small   = Product.discriminator("HomeAppliances_Small",   es());
const HomeAppliances_Kitchen = Product.discriminator("HomeAppliances_Kitchen", es());
const HomeAppliances_Climate = Product.discriminator("HomeAppliances_Climate", es());
const HomeAppliances_Water   = Product.discriminator("HomeAppliances_Water",   es());

// 5. Ev və dekor
const HomeDecor_Deco    = Product.discriminator("HomeDecor_Deco",    es());
const HomeDecor_Light   = Product.discriminator("HomeDecor_Light",   es());
const HomeDecor_Textile = Product.discriminator("HomeDecor_Textile", es());
const HomeDecor_Kitchen = Product.discriminator("HomeDecor_Kitchen", es());
const HomeDecor_Bath    = Product.discriminator("HomeDecor_Bath",    es());

// 6. Mebel
const Furniture_Living   = Product.discriminator("Furniture_Living",   es());
const Furniture_Bedroom  = Product.discriminator("Furniture_Bedroom",  es());
const Furniture_Kitchen  = Product.discriminator("Furniture_Kitchen",  es());
const Furniture_Office   = Product.discriminator("Furniture_Office",   es());
const Furniture_Garden   = Product.discriminator("Furniture_Garden",   es());

// 7. Qadın geyimi
const WomenClothing_Outer  = Product.discriminator("WomenClothing_Outer",  es());
const WomenClothing_Inner  = Product.discriminator("WomenClothing_Inner",  es());
const WomenClothing_Casual = Product.discriminator("WomenClothing_Casual", es());
const WomenClothing_Sport  = Product.discriminator("WomenClothing_Sport",  es());
const WomenClothing_Formal = Product.discriminator("WomenClothing_Formal", es());
const WomenClothing_Under  = Product.discriminator("WomenClothing_Under",  es());

// 8. Kişi geyimi
const MenClothing_Outer  = Product.discriminator("MenClothing_Outer",  es());
const MenClothing_Inner  = Product.discriminator("MenClothing_Inner",  es());
const MenClothing_Casual = Product.discriminator("MenClothing_Casual", es());
const MenClothing_Sport  = Product.discriminator("MenClothing_Sport",  es());
const MenClothing_Formal = Product.discriminator("MenClothing_Formal", es());
const MenClothing_Under  = Product.discriminator("MenClothing_Under",  es());

// 9. Ayaqqabı
const Shoes_Sport   = Product.discriminator("Shoes_Sport",   es());
const Shoes_Classic = Product.discriminator("Shoes_Classic", es());
const Shoes_Casual  = Product.discriminator("Shoes_Casual",  es());
const Shoes_Sandal  = Product.discriminator("Shoes_Sandal",  es());

// 10. Aksesuarlar
const Accessories_Bag        = Product.discriminator("Accessories_Bag",        es());
const Accessories_Watch      = Product.discriminator("Accessories_Watch",      es());
const Accessories_Sunglasses = Product.discriminator("Accessories_Sunglasses", es());
const Accessories_Jewelry    = Product.discriminator("Accessories_Jewelry",    es());
const Accessories_Belt       = Product.discriminator("Accessories_Belt",       es());

// 11. Gözəllik
const Beauty_Makeup  = Product.discriminator("Beauty_Makeup",  es());
const Beauty_Skin    = Product.discriminator("Beauty_Skin",    es());
const Beauty_Hair    = Product.discriminator("Beauty_Hair",    es());
const Beauty_Perfume = Product.discriminator("Beauty_Perfume", es());
const Beauty_Men     = Product.discriminator("Beauty_Men",     es());
const Beauty_Hygiene = Product.discriminator("Beauty_Hygiene", es());

// 12. Uşaq və ana
const KidsAndMom_Clothing = Product.discriminator("KidsAndMom_Clothing", es());
const KidsAndMom_Toys     = Product.discriminator("KidsAndMom_Toys",     es());
const KidsAndMom_Stroller = Product.discriminator("KidsAndMom_Stroller", es());
const KidsAndMom_Food     = Product.discriminator("KidsAndMom_Food",     es());
const KidsAndMom_School   = Product.discriminator("KidsAndMom_School",   es());

// 13. İdman
const Sports_Fitness  = Product.discriminator("Sports_Fitness",  es());
const Sports_Camping  = Product.discriminator("Sports_Camping",  es());
const Sports_Bicycle  = Product.discriminator("Sports_Bicycle",  es());
const Sports_Clothing = Product.discriminator("Sports_Clothing", es());
const Sports_Acc      = Product.discriminator("Sports_Acc",      es());

// 14. Avto
const Automotive_Acc         = Product.discriminator("Automotive_Acc",         es());
const Automotive_Electronics = Product.discriminator("Automotive_Electronics", es());
const Automotive_Parts       = Product.discriminator("Automotive_Parts",       es());
const Automotive_Oils        = Product.discriminator("Automotive_Oils",        es());

// 15. Hədiyyə
const Gifts_Sets     = Product.discriminator("Gifts_Sets",     es());
const Gifts_Souvenir = Product.discriminator("Gifts_Souvenir", es());
const Gifts_Trending = Product.discriminator("Gifts_Trending", es());
const Gifts_Books    = Product.discriminator("Gifts_Books",    es());


// =====================================================================
// BÜTÜN MODELLƏRİ İXRAC ET
// =====================================================================
export {
    legacyCategoryValues,
    adminCategoryValues,
    allowedCategoryValues,

    // Əsas model
    Product,

    // Legacy modellər
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

    // 1. Elektronika
    TVs,
    AudioSystems,
    PhotoVideo,
    GameConsoles,
    SmartHome,
    Gadgets,
    ElectronicsAccessories,

    // 2. Telefonlar və aksesuarlar
    Smartphones,
    FeaturePhones,
    HeadphonesNew,
    CablesAdapters,
    Powerbanks,
    PhoneAccessories,

    // 3. Kompüter və ofis
    LaptopsNew,
    Desktops,
    Monitors,
    PrintersScanners,
    OfficeAccessories,
    Components,

    // 4. Məişət texnikası
    LargeAppliances,
    SmallAppliances,
    KitchenAppliances,
    AirConditioners,
    WaterHeaters,

    // 5. Ev və dekor
    HomeDecor,
    Lighting,
    HomeTextiles,
    Kitchenware,
    BathAccessories,

    // 6. Mebel
    LivingRoomFurniture,
    BedroomFurniture,
    KitchenFurniture,
    OfficeFurniture,
    GardenFurniture,

    // 7. Qadın geyimləri
    WomensTops,
    WomensBottoms,
    WomensCasual,
    WomensSport,
    WomensFormal,
    WomensUnderwear,

    // 8. Kişi geyimləri
    MensTops,
    MensBottoms,
    MensCasual,
    MensSport,
    MensFormal,
    MensUnderwear,

    // 9. Ayaqqabı
    SportsShoes,
    ClassicShoes,
    CasualShoes,
    Sandals,

    // 10. Aksesuarlar
    Bags,
    Watches,
    Sunglasses,
    Jewelry,
    Belts,

    // 11. Gözəllik və kosmetika
    Makeup,
    Skincare,
    HairCare,
    Fragrance,
    MenGrooming,
    Hygiene,

    // 12. Uşaq və ana
    KidsClothingNew,
    Toys,
    Strollers,
    BabyFeeding,
    SchoolSupplies,

    // 13. İdman və outdoor
    FitnessEquipment,
    Camping,
    Bicycles,
    SportsApparel,
    SportsAccessories,

    // 14. Avto məhsullar
    AutoAccessories,
    AutoElectronics,
    SpareParts,
    AutoChemicals,

    // 15. Hədiyyələr və lifestyle
    GiftSets,
    Souvenirs,
    TrendingProducts,
    BooksHobbies,

    // ── YENİ FRONTEND DİSCRİMİNATORLARI ──────────────────────────
    // 1. Elektronika
    Electronics_TV, Electronics_Photo, Electronics_Console,
    Electronics_SmartHome, Electronics_Gadgets, Electronics_Acc,

    // 2. Telefonlar
    Phones_Smartphone, Phones_Basic, Phones_Headphones,
    Phones_Cables, Phones_Powerbank, Phones_Acc,

    // 3. Kompüter
    Computers_Laptop, Computers_Desktop, Computers_Monitor,
    Computers_Printer, Computers_OfficeAcc, Computers_Parts,

    // 4. Məişət texnikası
    HomeAppliances_Large, HomeAppliances_Small, HomeAppliances_Kitchen,
    HomeAppliances_Climate, HomeAppliances_Water,

    // 5. Ev və dekor
    HomeDecor_Deco, HomeDecor_Light, HomeDecor_Textile,
    HomeDecor_Kitchen, HomeDecor_Bath,

    // 6. Mebel
    Furniture_Living, Furniture_Bedroom, Furniture_Kitchen,
    Furniture_Office, Furniture_Garden,

    // 7. Qadın geyimi
    WomenClothing_Outer, WomenClothing_Inner, WomenClothing_Casual,
    WomenClothing_Sport, WomenClothing_Formal, WomenClothing_Under,

    // 8. Kişi geyimi
    MenClothing_Outer, MenClothing_Inner, MenClothing_Casual,
    MenClothing_Sport, MenClothing_Formal, MenClothing_Under,

    // 9. Ayaqqabı
    Shoes_Sport, Shoes_Classic, Shoes_Casual, Shoes_Sandal,

    // 10. Aksesuarlar
    Accessories_Bag, Accessories_Watch, Accessories_Sunglasses,
    Accessories_Jewelry, Accessories_Belt,

    // 11. Gözəllik
    Beauty_Makeup, Beauty_Skin, Beauty_Hair,
    Beauty_Perfume, Beauty_Men, Beauty_Hygiene,

    // 12. Uşaq və ana
    KidsAndMom_Clothing, KidsAndMom_Toys, KidsAndMom_Stroller,
    KidsAndMom_Food, KidsAndMom_School,

    // 13. İdman
    Sports_Fitness, Sports_Camping, Sports_Bicycle,
    Sports_Clothing, Sports_Acc,

    // 14. Avto
    Automotive_Acc, Automotive_Electronics, Automotive_Parts, Automotive_Oils,

    // 15. Hədiyyə
    Gifts_Sets, Gifts_Souvenir, Gifts_Trending, Gifts_Books,
};