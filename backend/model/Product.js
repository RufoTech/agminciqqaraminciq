import mongoose from "mongoose";

const legacyCategoryValues = [
    "Phones", "Laptops", "Cameras", "Headphones",
    "Console", "iPad", "WomenClothing", "MenClothing",
    "KidsClothing", "HomeAppliances", "HomeAndGarden",
    "Beauty", "Sports", "Automotive",
];

const adminCategoryValues = [
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
];

const allowedCategoryValues = [...new Set([...legacyCategoryValues, ...adminCategoryValues])];

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
            type: String,
            required: [true, "Aciqlama hissesini daxil edin"],
            trim: true,
        },

        ratings: {
            type: Number,
            default: 0,
            min:     0,
            max:     5,
        },

        images: [
            {
                public_id: { type: String, required: true },
                url: { type: String, required: true },
            },
        ],

        category: {
            type: String,
            required: [true, "Kateqoriyani secmelisiniz"],
            enum: {
                values: [
                    // Mövcud kateqoriyalar
                    "Phones", "Laptops", "Cameras", "Headphones",
                    "Console", "iPad", "WomenClothing", "MenClothing",
                    "KidsClothing", "HomeAppliances", "HomeAndGarden",
                    "Beauty", "Sports", "Automotive",

                    // Yeni kateqoriyalar – Elektronika alt qrupları
                    "TVs", "AudioSystems", "PhotoVideo", "GameConsoles",
                    "SmartHome", "Gadgets", "ElectronicsAccessories",

                    // Telefonlar və aksesuarlar
                    "Smartphones", "FeaturePhones", "HeadphonesNew",
                    "CablesAdapters", "Powerbanks", "PhoneAccessories",

                    // Kompüter və ofis texnikası
                    "LaptopsNew", "Desktops", "Monitors",
                    "PrintersScanners", "OfficeAccessories", "Components",

                    // Məişət texnikası
                    "LargeAppliances", "SmallAppliances", "KitchenAppliances",
                    "AirConditioners", "WaterHeaters",

                    // Ev və dekor
                    "HomeDecor", "Lighting", "HomeTextiles",
                    "Kitchenware", "BathAccessories",

                    // Mebel
                    "LivingRoomFurniture", "BedroomFurniture",
                    "KitchenFurniture", "OfficeFurniture", "GardenFurniture",

                    // Geyim (kişi/qadın)
                    "MensClothing", "WomensClothing",

                    // Ayaqqabı
                    "SportsShoes", "ClassicShoes", "CasualShoes", "Sandals",

                    // Aksesuarlar
                    "Bags", "Watches", "Sunglasses", "Jewelry", "Belts",

                    // Gözəllik və kosmetika
                    "Makeup", "Skincare", "HairCare", "Fragrance",
                    "MenGrooming", "Hygiene",

                    // Uşaq və ana
                    "KidsClothingNew", "Toys", "Strollers",
                    "BabyFeeding", "SchoolSupplies",

                    // İdman və outdoor
                    "FitnessEquipment", "Camping", "Bicycles",
                    "SportsApparel", "SportsAccessories",

                    // Avto məhsullar
                    "AutoAccessories", "AutoElectronics",
                    "SpareParts", "AutoChemicals",

                    // Hədiyyələr və lifestyle
                    "GiftSets", "Souvenirs", "TrendingProducts", "BooksHobbies",
                ],
                message: "'{VALUE}' kateqoriyası mövcud deyil",
            },
        },

        subcategory: {
            type: String,
            trim: true,
            maxLength: [255, "Subkateqoriya 255 simvoldan cox ola bilmez"],
            default: "",
        },

        seller: {
            type: String,
            required: [true, "Mehsulu satan sirketi daxil edin"],
            trim: true,
        },

        stock: {
            type:     Number,
            required: [true, "Stok miqdarını daxil edin"],
            min:      [0, "Stok mənfi ola bilməz"],
        },

        numOfReviews: {
            type: Number,
            default: 0,
        },

        reviews: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                name: {
                    type:     String,
                    required: true,
                },
                rating: {
                    type: Number,
                    required: true,
                    min:      1,
                    max:      5,
                },
                comment: {
                    type: String,
                    default: "",
                },
            },
        ],

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    options
);

const Product = mongoose.model("Product", productSchema);


// =====================================================================
// ALT MODELLƏR — discriminator() ilə yaradılır
// =====================================================================

// ── TELEFONLAR (mövcud) ────────────────────────────────────────────────
const phoneSchema = new mongoose.Schema({
    screenSize: { type: String, required: [true, "Screen size daxil edin"], trim: true },
    storage: { type: String, required: [true, "Storage melumatini daxil edin"], trim: true },
    ram: { type: String, required: [true, "RAM melumatini daxil edin"], trim: true },
    frontCamera: { type: String, required: [true, "Front camera melumatini daxil edin"], trim: true },
    backCamera: { type: String, required: [true, "Back camera melumatini daxil edin"], trim: true },
    battery: { type: String, required: [true, "Battery melumatini daxil edin"], trim: true },
    processor: { type: String, required: [true, "Processor melumatini daxil edin"], trim: true },
    operatingSystem: { type: String, required: [true, "Emeliyyat sistemi melumatini daxil edin"], trim: true },
});
const Phone = Product.discriminator("Phones", phoneSchema);

// ── NOUTBUKLAR (mövcud) ────────────────────────────────────────────────
const laptopSchema = new mongoose.Schema({
    screenSize: { type: String, required: [true, "Screen size daxil edin"], trim: true },
    storage: { type: String, required: [true, "Storage melumatini daxil edin"], trim: true },
    ram: { type: String, required: [true, "RAM melumatini daxil edin"], trim: true },
    gpu: { type: String, required: [true, "GPU melumatini daxil edin"], trim: true },
    camera: { type: String, required: [true, "Kamera melumatini daxil edin"], trim: true },
    processor: { type: String, required: [true, "Processor melumatini daxil edin"], trim: true },
    batteryLife: { type: String, required: [true, "Battery life melumatini daxil edin"], trim: true },
    operatingSystem: { type: String, required: [true, "Emeliyyat sistemi melumatini daxil edin"], trim: true },
});
const Laptop = Product.discriminator("Laptops", laptopSchema);

// ── FOTOAPARATLAR (mövcud) ─────────────────────────────────────────────
const cameraSchema = new mongoose.Schema({
    resolution: { type: String, required: [true, "Resolution melumatini daxil edin"], trim: true },
    opticalZoom: { type: String, required: [true, "Optical zoom melumatini daxil edin"], trim: true },
    sensorType: { type: String, required: [true, "Sensor novunu daxil edin"], trim: true },
    imageStabilization: { type: String, required: [true, "Image stabilization melumatini daxil edin"], trim: true },
});
const Camera = Product.discriminator("Cameras", cameraSchema);

// ── QULAQLILAR (mövcud) ────────────────────────────────────────────────
const headphoneSchema = new mongoose.Schema({
    connectivity: { type: String, required: [true, "Connectivity melumatini daxil edin"], trim: true },
    batteryLife: { type: String, required: [true, "Battery life melumatini daxil edin"], trim: true },
    noiseCancellation: { type: String, required: [true, "Noise cancellation melumatini daxil edin"], trim: true },
});
const Headphone = Product.discriminator("Headphones", headphoneSchema);

// ── OYUN KONSOLLARİ (mövcud) ───────────────────────────────────────────
const consoleSchema = new mongoose.Schema({
    cpu: { type: String, required: [true, "CPU melumatini daxil edin"], trim: true },
    gpu: { type: String, required: [true, "GPU melumatini daxil edin"], trim: true },
    storage: { type: String, required: [true, "Storage melumatini daxil edin"], trim: true },
    memory: { type: String, required: [true, "Memory melumatini daxil edin"], trim: true },
    supportedResolution: { type: String, required: [true, "Desteklenen cozunurluk melumatini daxil edin"], trim: true },
    connectivity: { type: String, required: [true, "Connectivity melumatini daxil edin"], trim: true },
    controllerIncluded: { type: Boolean, default: true },
});
const Console = Product.discriminator("Console", consoleSchema);

// ── iPAD (mövcud) ──────────────────────────────────────────────────────
const iPadSchema = new mongoose.Schema({
    screenSize: { type: String, required: [true, "Screen size daxil edin"], trim: true },
    storage: { type: String, required: [true, "Storage melumatini daxil edin"], trim: true },
    ram: { type: String, required: [true, "RAM melumatini daxil edin"], trim: true },
    battery: { type: String, required: [true, "Battery melumatini daxil edin"], trim: true },
    processor: { type: String, required: [true, "Processor melumatini daxil edin"], trim: true },
    operatingSystem: { type: String, required: [true, "Emeliyyat sistemi melumatini daxil edin"], trim: true },
    camera: { type: String, required: [true, "Kamera melumatini daxil edin"], trim: true },
    cellular: { type: Boolean, required: [true, "Cellular variantini daxil edin"] },
});
const iPad = Product.discriminator("iPad", iPadSchema);

// ── QADIN GEYİMLƏRİ (mövcud) ───────────────────────────────────────────
const womenClothingSchema = new mongoose.Schema({
    size: { type: String, required: [true, "Olcunu daxil edin"], trim: true },
    color: { type: String, required: [true, "Rengi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand: { type: String, required: [true, "Brendi daxil edin"], trim: true },
    season: { type: String, required: [true, "Movsumu daxil edin"], trim: true },
});
const WomenClothing = Product.discriminator("WomenClothing", womenClothingSchema);

// ── KİŞİ GEYİMLƏRİ (mövcud) ────────────────────────────────────────────
const menClothingSchema = new mongoose.Schema({
    size: { type: String, required: [true, "Olcunu daxil edin"], trim: true },
    color: { type: String, required: [true, "Rengi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand: { type: String, required: [true, "Brendi daxil edin"], trim: true },
    season: { type: String, required: [true, "Movsumu daxil edin"], trim: true },
});
const MenClothing = Product.discriminator("MenClothing", menClothingSchema);

// ── UŞAQ GEYİMLƏRİ (mövcud) ────────────────────────────────────────────
const kidsClothingSchema = new mongoose.Schema({
    size: { type: String, required: [true, "Olcunu daxil edin"], trim: true },
    color: { type: String, required: [true, "Rengi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand: { type: String, required: [true, "Brendi daxil edin"], trim: true },
    ageRange: { type: String, required: [true, "Yas araligini daxil edin"], trim: true },
    gender: { type: String, required: [true, "Cinsi daxil edin"], trim: true },
});
const KidsClothing = Product.discriminator("KidsClothing", kidsClothingSchema);

// ── EV TEXNİKASI (mövcud) ──────────────────────────────────────────────
const homeAppliancesSchema = new mongoose.Schema({
    brand: { type: String, required: [true, "Brendi daxil edin"], trim: true },
    powerConsumption: { type: String, required: [true, "Guc istehlakini daxil edin"], trim: true },
    warranty: { type: String, required: [true, "Zemaneti daxil edin"], trim: true },
    dimensions: { type: String, required: [true, "Olculeri daxil edin"], trim: true },
    color: { type: String, required: [true, "Rengi daxil edin"], trim: true },
});
const HomeAppliance = Product.discriminator("HomeAppliances", homeAppliancesSchema);

// ── EV VƏ BAĞ (mövcud) ─────────────────────────────────────────────────
const homeAndGardenSchema = new mongoose.Schema({
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    dimensions: { type: String, required: [true, "Olculeri daxil edin"], trim: true },
    color: { type: String, required: [true, "Rengi daxil edin"], trim: true },
    brand: { type: String, required: [true, "Brendi daxil edin"], trim: true },
    indoorOutdoor: { type: String, required: [true, "Daxili/Xarici istifade ni daxil edin"], trim: true },
});
const HomeAndGarden = Product.discriminator("HomeAndGarden", homeAndGardenSchema);

// ── GÖZƏLLIK VƏ BAKIM (mövcud) ─────────────────────────────────────────
const beautySchema = new mongoose.Schema({
    brand: { type: String, required: [true, "Brendi daxil edin"], trim: true },
    skinType: { type: String, required: [true, "Deri tipini daxil edin"], trim: true },
    volume: { type: String, required: [true, "Hecmi daxil edin"], trim: true },
    ingredients: { type: String, required: [true, "Terkibi daxil edin"], trim: true },
    expiryDate: { type: String, required: [true, "Istifade muddetini daxil edin"], trim: true },
});
const Beauty = Product.discriminator("Beauty", beautySchema);

// ── İDMAN MƏHSULLARI (mövcud) ──────────────────────────────────────────
const sportsSchema = new mongoose.Schema({
    brand: { type: String, required: [true, "Brendi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    weight: { type: String, required: [true, "Cekini daxil edin"], trim: true },
    suitableFor: { type: String, required: [true, "Idman novunu daxil edin"], trim: true },
    color: { type: String, required: [true, "Rengi daxil edin"], trim: true },
});
const Sports = Product.discriminator("Sports", sportsSchema);

// ── OTOMOBİL MƏHSULLARI (mövcud) ───────────────────────────────────────
const automotiveSchema = new mongoose.Schema({
    brand: { type: String, required: [true, "Brendi daxil edin"], trim: true },
    compatibleModels: { type: String, required: [true, "Uygun avtomobil modellerini daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    warranty: { type: String, required: [true, "Zemaneti daxil edin"], trim: true },
    color: { type: String, required: [true, "Rengi daxil edin"], trim: true },
});
const Automotive = Product.discriminator("Automotive", automotiveSchema);

// ======================= YENİ KATEQORİYA MODELLƏRİ =======================

// TV və Audio
const tvSchema = new mongoose.Schema({
    tvType:            { type: String, required: true, trim: true },
    screenSize:        { type: String, required: true, trim: true },
    screenResolution:  { type: String, required: true, trim: true },
    smartTv:           { type: Boolean, default: false },
    audioOutputPower:  { type: String, trim: true },
});
const TVs = Product.discriminator("TVs", tvSchema);

const audioSystemSchema = new mongoose.Schema({
    audioOutputPower:  { type: String, required: true, trim: true },
    connectivity:      { type: String, required: true, trim: true },
    wireless:          { type: Boolean, default: false },
});
const AudioSystems = Product.discriminator("AudioSystems", audioSystemSchema);

// Foto və video
const photoVideoSchema = new mongoose.Schema({
    cameraType:        { type: String, required: true, trim: true },
    lensMount:         { type: String, trim: true },
    resolution:        { type: String, required: true, trim: true },
    videoResolution:   { type: String, trim: true },
    imageStabilization: { type: String, trim: true },
});
const PhotoVideo = Product.discriminator("PhotoVideo", photoVideoSchema);

// Oyun konsolları
const gameConsoleSchema = new mongoose.Schema({
    cpu:               { type: String, required: true, trim: true },
    gpu:               { type: String, required: true, trim: true },
    storage:           { type: String, required: true, trim: true },
    memory:            { type: String, required: true, trim: true },
    supportedResolution: { type: String, required: true, trim: true },
    controllerIncluded: { type: Boolean, default: true },
});
const GameConsoles = Product.discriminator("GameConsoles", gameConsoleSchema);

// Smart Home
const smartHomeSchema = new mongoose.Schema({
    smartHomeProtocol: { type: String, required: true, trim: true },
    compatibility:     { type: String, trim: true },
    powerSource:       { type: String, trim: true },
});
const SmartHome = Product.discriminator("SmartHome", smartHomeSchema);

// Gadgetlər
const gadgetSchema = new mongoose.Schema({
    gadgetType:        { type: String, required: true, trim: true },
    connectivity:      { type: String, trim: true },
    batteryLife:       { type: String, trim: true },
});
const Gadgets = Product.discriminator("Gadgets", gadgetSchema);

// Elektronika aksesuarları
const electronicsAccessorySchema = new mongoose.Schema({
    accessoryType:     { type: String, required: true, trim: true },
    compatibility:     { type: String, trim: true },
    color:             { type: String, trim: true },
});
const ElectronicsAccessories = Product.discriminator("ElectronicsAccessories", electronicsAccessorySchema);

// Smartfonlar
const smartphoneSchema = new mongoose.Schema({
    screenSize:        { type: String, required: true, trim: true },
    storage:           { type: String, required: true, trim: true },
    ram:               { type: String, required: true, trim: true },
    frontCamera:       { type: String, required: true, trim: true },
    backCamera:        { type: String, required: true, trim: true },
    battery:           { type: String, required: true, trim: true },
    processor:         { type: String, required: true, trim: true },
    operatingSystem:   { type: String, required: true, trim: true },
    dualSim:           { type: Boolean, default: false },
});
const Smartphones = Product.discriminator("Smartphones", smartphoneSchema);

// Düyməli telefonlar
const featurePhoneSchema = new mongoose.Schema({
    battery:           { type: String, required: true, trim: true },
    dualSim:           { type: Boolean, default: false },
    camera:            { type: String, trim: true },
    radio:             { type: Boolean, default: false },
});
const FeaturePhones = Product.discriminator("FeaturePhones", featurePhoneSchema);

// Qulaqlıqlar (yeni)
const headphonesNewSchema = new mongoose.Schema({
    headphoneType:     { type: String, required: true, trim: true },
    connectivity:      { type: String, required: true, trim: true },
    noiseCancellation: { type: String, trim: true },
    microphone:        { type: String, trim: true },
    batteryLife:       { type: String, trim: true },
});
const HeadphonesNew = Product.discriminator("HeadphonesNew", headphonesNewSchema);

// Kabellər və adapterlər
const cableAdapterSchema = new mongoose.Schema({
    cableLength:       { type: String, required: true, trim: true },
    connectorType:     { type: String, required: true, trim: true },
    fastCharging:      { type: Boolean, default: false },
});
const CablesAdapters = Product.discriminator("CablesAdapters", cableAdapterSchema);

// Powerbank
const powerbankSchema = new mongoose.Schema({
    powerbankCapacity: { type: String, required: true, trim: true },
    ports:             { type: String, required: true, trim: true },
    wirelessCharging:  { type: Boolean, default: false },
});
const Powerbanks = Product.discriminator("Powerbanks", powerbankSchema);

// Telefon aksesuarları
const phoneAccessorySchema = new mongoose.Schema({
    accessoryType:     { type: String, required: true, trim: true },
    compatibleModels:  { type: String, trim: true },
    color:             { type: String, trim: true },
});
const PhoneAccessories = Product.discriminator("PhoneAccessories", phoneAccessorySchema);

// Noutbuklar (yeni)
const laptopsNewSchema = new mongoose.Schema({
    screenSize:        { type: String, required: true, trim: true },
    storage:           { type: String, required: true, trim: true },
    ram:               { type: String, required: true, trim: true },
    processor:         { type: String, required: true, trim: true },
    gpu:               { type: String, trim: true },
    operatingSystem:   { type: String, required: true, trim: true },
});
const LaptopsNew = Product.discriminator("LaptopsNew", laptopsNewSchema);

// Stolüstü kompüterlər
const desktopSchema = new mongoose.Schema({
    desktopType:       { type: String, required: true, trim: true },
    processor:         { type: String, required: true, trim: true },
    ram:               { type: String, required: true, trim: true },
    storage:           { type: String, required: true, trim: true },
    gpu:               { type: String, trim: true },
});
const Desktops = Product.discriminator("Desktops", desktopSchema);

// Monitorlar
const monitorSchema = new mongoose.Schema({
    monitorSize:       { type: String, required: true, trim: true },
    panelType:         { type: String, required: true, trim: true },
    resolution:        { type: String, required: true, trim: true },
    refreshRate:       { type: String, required: true, trim: true },
});
const Monitors = Product.discriminator("Monitors", monitorSchema);

// Printer və skanerlər
const printerScannerSchema = new mongoose.Schema({
    printerType:       { type: String, required: true, trim: true },
    paperSize:         { type: String, required: true, trim: true },
    wireless:          { type: Boolean, default: false },
    scanner:           { type: Boolean, default: false },
});
const PrintersScanners = Product.discriminator("PrintersScanners", printerScannerSchema);

// Ofis aksesuarları
const officeAccessorySchema = new mongoose.Schema({
    accessoryType:     { type: String, required: true, trim: true },
    material:          { type: String, trim: true },
});
const OfficeAccessories = Product.discriminator("OfficeAccessories", officeAccessorySchema);

// Komponentlər
const componentSchema = new mongoose.Schema({
    componentType:     { type: String, required: true, trim: true },
    capacity:          { type: String, required: true, trim: true },
    speed:             { type: String, trim: true },
});
const Components = Product.discriminator("Components", componentSchema);

// Böyük məişət texnikası
const largeApplianceSchema = new mongoose.Schema({
    applianceType:     { type: String, required: true, trim: true },
    energyClass:       { type: String, required: true, trim: true },
    dimensions:        { type: String, required: true, trim: true },
});
const LargeAppliances = Product.discriminator("LargeAppliances", largeApplianceSchema);

// Kiçik məişət texnikası
const smallApplianceSchema = new mongoose.Schema({
    applianceType:     { type: String, required: true, trim: true },
    power:             { type: String, required: true, trim: true },
    color:             { type: String, trim: true },
});
const SmallAppliances = Product.discriminator("SmallAppliances", smallApplianceSchema);

// Mətbəx texnikası
const kitchenApplianceSchema = new mongoose.Schema({
    kitchenAppliance:  { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
    dishwasherSafe:    { type: Boolean, default: false },
});
const KitchenAppliances = Product.discriminator("KitchenAppliances", kitchenApplianceSchema);

// Kondisioner və isitmə
const climateControlSchema = new mongoose.Schema({
    airConditionerType: { type: String, required: true, trim: true },
    heatingType:        { type: String, trim: true },
    energyClass:        { type: String, trim: true },
});
const AirConditioners = Product.discriminator("AirConditioners", climateControlSchema);

// Su qızdırıcıları
const waterHeaterSchema = new mongoose.Schema({
    capacity:          { type: String, required: true, trim: true },
    energyClass:       { type: String, required: true, trim: true },
});
const WaterHeaters = Product.discriminator("WaterHeaters", waterHeaterSchema);

// Ev və dekor kateqoriyaları
const homeDecorSchema = new mongoose.Schema({
    decorType:         { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
    color:             { type: String, trim: true },
});
const HomeDecor = Product.discriminator("HomeDecor", homeDecorSchema);

const lightingSchema = new mongoose.Schema({
    lightType:         { type: String, required: true, trim: true },
    wattage:           { type: String, required: true, trim: true },
    colorTemperature:  { type: String, trim: true },
});
const Lighting = Product.discriminator("Lighting", lightingSchema);

const homeTextilesSchema = new mongoose.Schema({
    textileType:       { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
    dimensions:        { type: String, required: true, trim: true },
});
const HomeTextiles = Product.discriminator("HomeTextiles", homeTextilesSchema);

const kitchenwareSchema = new mongoose.Schema({
    kitchenwareType:   { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
    dishwasherSafe:    { type: Boolean, default: false },
});
const Kitchenware = Product.discriminator("Kitchenware", kitchenwareSchema);

const bathAccessorySchema = new mongoose.Schema({
    bathAccessoryType: { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
    color:             { type: String, trim: true },
});
const BathAccessories = Product.discriminator("BathAccessories", bathAccessorySchema);

// Mebel
const livingRoomFurnitureSchema = new mongoose.Schema({
    furnitureType:     { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
    color:             { type: String, trim: true },
    dimensions:        { type: String, required: true, trim: true },
});
const LivingRoomFurniture = Product.discriminator("LivingRoomFurniture", livingRoomFurnitureSchema);

const bedroomFurnitureSchema = new mongoose.Schema({
    furnitureType:     { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
    color:             { type: String, trim: true },
    dimensions:        { type: String, required: true, trim: true },
});
const BedroomFurniture = Product.discriminator("BedroomFurniture", bedroomFurnitureSchema);

const kitchenFurnitureSchema = new mongoose.Schema({
    furnitureType:     { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
    color:             { type: String, trim: true },
    dimensions:        { type: String, required: true, trim: true },
});
const KitchenFurniture = Product.discriminator("KitchenFurniture", kitchenFurnitureSchema);

const officeFurnitureSchema = new mongoose.Schema({
    furnitureType:     { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
    color:             { type: String, trim: true },
    dimensions:        { type: String, required: true, trim: true },
});
const OfficeFurniture = Product.discriminator("OfficeFurniture", officeFurnitureSchema);

const gardenFurnitureSchema = new mongoose.Schema({
    furnitureType:     { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
    color:             { type: String, trim: true },
    dimensions:        { type: String, required: true, trim: true },
});
const GardenFurniture = Product.discriminator("GardenFurniture", gardenFurnitureSchema);

// Ayaqqabı
const sportsShoesSchema = new mongoose.Schema({
    shoeType:          { type: String, required: true, trim: true },
    size:              { type: String, required: true, trim: true },
    soleMaterial:      { type: String, required: true, trim: true },
    closureType:       { type: String, required: true, trim: true },
});
const SportsShoes = Product.discriminator("SportsShoes", sportsShoesSchema);

const classicShoesSchema = new mongoose.Schema({
    shoeType:          { type: String, required: true, trim: true },
    size:              { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
    closureType:       { type: String, required: true, trim: true },
});
const ClassicShoes = Product.discriminator("ClassicShoes", classicShoesSchema);

const casualShoesSchema = new mongoose.Schema({
    shoeType:          { type: String, required: true, trim: true },
    size:              { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
    closureType:       { type: String, required: true, trim: true },
});
const CasualShoes = Product.discriminator("CasualShoes", casualShoesSchema);

const sandalsSchema = new mongoose.Schema({
    shoeType:          { type: String, required: true, trim: true },
    size:              { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
    closureType:       { type: String, required: true, trim: true },
});
const Sandals = Product.discriminator("Sandals", sandalsSchema);

// Aksesuarlar
const bagsSchema = new mongoose.Schema({
    bagType:           { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
    color:             { type: String, trim: true },
});
const Bags = Product.discriminator("Bags", bagsSchema);

const watchesSchema = new mongoose.Schema({
    watchType:         { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
    waterproof:        { type: Boolean, default: false },
});
const Watches = Product.discriminator("Watches", watchesSchema);

const sunglassesSchema = new mongoose.Schema({
    frameMaterial:     { type: String, required: true, trim: true },
    lensTechnology:    { type: String, trim: true },
    uvProtection:      { type: Boolean, default: true },
});
const Sunglasses = Product.discriminator("Sunglasses", sunglassesSchema);

const jewelrySchema = new mongoose.Schema({
    jewelryType:       { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
    gemstone:          { type: String, trim: true },
});
const Jewelry = Product.discriminator("Jewelry", jewelrySchema);

const beltsSchema = new mongoose.Schema({
    beltType:          { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
    size:              { type: String, required: true, trim: true },
});
const Belts = Product.discriminator("Belts", beltsSchema);

// Gözəllik və kosmetika
const makeupSchema = new mongoose.Schema({
    brand:             { type: String, required: true, trim: true },
    productType:       { type: String, required: true, trim: true },
    shade:             { type: String, trim: true },
    volume:            { type: String, trim: true },
});
const Makeup = Product.discriminator("Makeup", makeupSchema);

const skincareSchema = new mongoose.Schema({
    brand:             { type: String, required: true, trim: true },
    skinType:          { type: String, required: true, trim: true },
    ingredients:       { type: String, trim: true },
    volume:            { type: String, required: true, trim: true },
});
const Skincare = Product.discriminator("Skincare", skincareSchema);

const hairCareSchema = new mongoose.Schema({
    brand:             { type: String, required: true, trim: true },
    hairType:          { type: String, required: true, trim: true },
    volume:            { type: String, required: true, trim: true },
    ingredients:       { type: String, trim: true },
});
const HairCare = Product.discriminator("HairCare", hairCareSchema);

const fragranceSchema = new mongoose.Schema({
    brand:             { type: String, required: true, trim: true },
    fragranceType:     { type: String, required: true, trim: true },
    volume:            { type: String, required: true, trim: true },
});
const Fragrance = Product.discriminator("Fragrance", fragranceSchema);

const menGroomingSchema = new mongoose.Schema({
    brand:             { type: String, required: true, trim: true },
    productType:       { type: String, required: true, trim: true },
    volume:            { type: String, required: true, trim: true },
});
const MenGrooming = Product.discriminator("MenGrooming", menGroomingSchema);

const hygieneSchema = new mongoose.Schema({
    brand:             { type: String, required: true, trim: true },
    productType:       { type: String, required: true, trim: true },
    quantity:          { type: String, required: true, trim: true },
});
const Hygiene = Product.discriminator("Hygiene", hygieneSchema);

// Uşaq və ana
const kidsClothingNewSchema = new mongoose.Schema({
    kidsClothingType:  { type: String, required: true, trim: true },
    size:              { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
    ageRange:          { type: String, required: true, trim: true },
});
const KidsClothingNew = Product.discriminator("KidsClothingNew", kidsClothingNewSchema);

const toysSchema = new mongoose.Schema({
    toyType:           { type: String, required: true, trim: true },
    ageRange:          { type: String, required: true, trim: true },
    material:          { type: String, trim: true },
});
const Toys = Product.discriminator("Toys", toysSchema);

const strollersSchema = new mongoose.Schema({
    strollerType:      { type: String, required: true, trim: true },
    weight:            { type: String, required: true, trim: true },
    foldable:          { type: Boolean, default: true },
});
const Strollers = Product.discriminator("Strollers", strollersSchema);

const babyFeedingSchema = new mongoose.Schema({
    feedingProduct:    { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
    bpaFree:           { type: Boolean, default: true },
});
const BabyFeeding = Product.discriminator("BabyFeeding", babyFeedingSchema);

const schoolSuppliesSchema = new mongoose.Schema({
    productType:       { type: String, required: true, trim: true },
    brand:             { type: String, trim: true },
    ageGroup:          { type: String, required: true, trim: true },
});
const SchoolSupplies = Product.discriminator("SchoolSupplies", schoolSuppliesSchema);

// İdman və outdoor
const fitnessEquipmentSchema = new mongoose.Schema({
    sportEquipmentType:{ type: String, required: true, trim: true },
    weight:            { type: String, trim: true },
    material:          { type: String, required: true, trim: true },
});
const FitnessEquipment = Product.discriminator("FitnessEquipment", fitnessEquipmentSchema);

const campingSchema = new mongoose.Schema({
    campingItem:       { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
    weight:            { type: String, trim: true },
});
const Camping = Product.discriminator("Camping", campingSchema);

const bicyclesSchema = new mongoose.Schema({
    bikeType:          { type: String, required: true, trim: true },
    frameMaterial:     { type: String, required: true, trim: true },
    wheelSize:         { type: String, required: true, trim: true },
});
const Bicycles = Product.discriminator("Bicycles", bicyclesSchema);

const sportsApparelSchema = new mongoose.Schema({
    clothingType:      { type: String, required: true, trim: true },
    size:              { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
});
const SportsApparel = Product.discriminator("SportsApparel", sportsApparelSchema);

const sportsAccessoriesSchema = new mongoose.Schema({
    accessoryType:     { type: String, required: true, trim: true },
    material:          { type: String, required: true, trim: true },
});
const SportsAccessories = Product.discriminator("SportsAccessories", sportsAccessoriesSchema);

// Avto məhsullar
const autoAccessoriesSchema = new mongoose.Schema({
    autoAccessoryType: { type: String, required: true, trim: true },
    compatibleModels:  { type: String, required: true, trim: true },
    material:          { type: String, trim: true },
});
const AutoAccessories = Product.discriminator("AutoAccessories", autoAccessoriesSchema);

const autoElectronicsSchema = new mongoose.Schema({
    deviceType:        { type: String, required: true, trim: true },
    compatibleModels:  { type: String, required: true, trim: true },
    features:          { type: String, trim: true },
});
const AutoElectronics = Product.discriminator("AutoElectronics", autoElectronicsSchema);

const sparePartsSchema = new mongoose.Schema({
    sparePartType:     { type: String, required: true, trim: true },
    compatibleModels:  { type: String, required: true, trim: true },
    oemNumber:         { type: String, trim: true },
});
const SpareParts = Product.discriminator("SpareParts", sparePartsSchema);

const autoChemicalsSchema = new mongoose.Schema({
    chemicalType:      { type: String, required: true, trim: true },
    volume:            { type: String, required: true, trim: true },
    application:       { type: String, trim: true },
});
const AutoChemicals = Product.discriminator("AutoChemicals", autoChemicalsSchema);

// Hədiyyələr və lifestyle
const giftSetsSchema = new mongoose.Schema({
    giftType:          { type: String, required: true, trim: true },
    occasion:          { type: String, required: true, trim: true },
    includes:          { type: String, trim: true },
});
const GiftSets = Product.discriminator("GiftSets", giftSetsSchema);

const souvenirsSchema = new mongoose.Schema({
    productType:       { type: String, required: true, trim: true },
    origin:            { type: String, trim: true },
    material:          { type: String, trim: true },
});
const Souvenirs = Product.discriminator("Souvenirs", souvenirsSchema);

const trendingProductsSchema = new mongoose.Schema({
    productType:       { type: String, required: true, trim: true },
    popularityScore:   { type: Number, default: 0 },
});
const TrendingProducts = Product.discriminator("TrendingProducts", trendingProductsSchema);

const booksHobbiesSchema = new mongoose.Schema({
    hobbyType:         { type: String, required: true, trim: true },
    author:            { type: String, trim: true },
    format:            { type: String, trim: true },
});
const BooksHobbies = Product.discriminator("BooksHobbies", booksHobbiesSchema);


// =====================================================================
// BÜTÜN MODELLƏRİ İXRAC ET
// =====================================================================
export {
    legacyCategoryValues,
    adminCategoryValues,
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

    // Elektronika
    TVs,
    AudioSystems,
    PhotoVideo,
    GameConsoles,
    SmartHome,
    Gadgets,
    ElectronicsAccessories,

    // Telefonlar və aksesuarlar
    Smartphones,
    FeaturePhones,
    HeadphonesNew,
    CablesAdapters,
    Powerbanks,
    PhoneAccessories,

    // Kompüter və ofis
    LaptopsNew,
    Desktops,
    Monitors,
    PrintersScanners,
    OfficeAccessories,
    Components,

    // Məişət texnikası – DÜZƏLİŞ: AirConditioners və WaterHeaters əlavə edildi
    LargeAppliances,
    SmallAppliances,
    KitchenAppliances,
    AirConditioners,   // ✅ əlavə edildi
    WaterHeaters,      // ✅ əlavə edildi

    // Ev və dekor
    HomeDecor,
    Lighting,
    HomeTextiles,
    Kitchenware,
    BathAccessories,

    // Mebel
    LivingRoomFurniture,
    BedroomFurniture,
    KitchenFurniture,
    OfficeFurniture,
    GardenFurniture,

    // Ayaqqabı
    SportsShoes,
    ClassicShoes,
    CasualShoes,
    Sandals,

    // Aksesuarlar
    Bags,
    Watches,
    Sunglasses,
    Jewelry,
    Belts,

    // Gözəllik və kosmetika
    Makeup,
    Skincare,
    HairCare,
    Fragrance,
    MenGrooming,
    Hygiene,

    // Uşaq və ana
    KidsClothingNew,
    Toys,
    Strollers,
    BabyFeeding,
    SchoolSupplies,

    // İdman və outdoor
    FitnessEquipment,
    Camping,
    Bicycles,
    SportsApparel,
    SportsAccessories,

    // Avto məhsullar
    AutoAccessories,
    AutoElectronics,
    SpareParts,
    AutoChemicals,

    // Hədiyyələr və lifestyle
    GiftSets,
    Souvenirs,
    TrendingProducts,
    BooksHobbies,
};
