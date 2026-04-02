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

// TELEFONLAR — Phones
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

// NOUTBUKLAR — Laptops
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

// FOTOAPARATLAR — Cameras
const cameraSchema = new mongoose.Schema({
    resolution:         { type: String, required: [true, "Resolution melumatini daxil edin"], trim: true },
    opticalZoom:        { type: String, required: [true, "Optical zoom melumatini daxil edin"], trim: true },
    sensorType:         { type: String, required: [true, "Sensor novunu daxil edin"], trim: true },
    imageStabilization: { type: String, required: [true, "Image stabilization melumatini daxil edin"], trim: true },
});
const Camera = Product.discriminator("Cameras", cameraSchema);

// QULAQLILAR — Headphones
const headphoneSchema = new mongoose.Schema({
    connectivity:      { type: String, required: [true, "Connectivity melumatini daxil edin"], trim: true },
    batteryLife:       { type: String, required: [true, "Battery life melumatini daxil edin"], trim: true },
    noiseCancellation: { type: String, required: [true, "Noise cancellation melumatini daxil edin"], trim: true },
});
const Headphone = Product.discriminator("Headphones", headphoneSchema);

// OYUN KONSOLLARİ — Console
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

// iPAD
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

// QADIN GEYİMLƏRİ — WomenClothing
const womenClothingSchema = new mongoose.Schema({
    size:     { type: String, required: [true, "Olcunu daxil edin"], trim: true },
    color:    { type: String, required: [true, "Rengi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
    season:   { type: String, required: [true, "Movsumu daxil edin"], trim: true },
});
const WomenClothing = Product.discriminator("WomenClothing", womenClothingSchema);

// KİŞİ GEYİMLƏRİ — MenClothing
const menClothingSchema = new mongoose.Schema({
    size:     { type: String, required: [true, "Olcunu daxil edin"], trim: true },
    color:    { type: String, required: [true, "Rengi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
    season:   { type: String, required: [true, "Movsumu daxil edin"], trim: true },
});
const MenClothing = Product.discriminator("MenClothing", menClothingSchema);

// UŞAQ GEYİMLƏRİ — KidsClothing
const kidsClothingSchema = new mongoose.Schema({
    size:     { type: String, required: [true, "Olcunu daxil edin"], trim: true },
    color:    { type: String, required: [true, "Rengi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
    ageRange: { type: String, required: [true, "Yas araligini daxil edin"], trim: true },
    gender:   { type: String, required: [true, "Cinsi daxil edin"], trim: true },
});
const KidsClothing = Product.discriminator("KidsClothing", kidsClothingSchema);

// EV TEXNİKASI — HomeAppliances
const homeAppliancesSchema = new mongoose.Schema({
    brand:            { type: String, required: [true, "Brendi daxil edin"], trim: true },
    powerConsumption: { type: String, required: [true, "Guc istehlakini daxil edin"], trim: true },
    warranty:         { type: String, required: [true, "Zemaneti daxil edin"], trim: true },
    dimensions:       { type: String, required: [true, "Olculeri daxil edin"], trim: true },
    color:            { type: String, required: [true, "Rengi daxil edin"], trim: true },
});
const HomeAppliance = Product.discriminator("HomeAppliances", homeAppliancesSchema);

// EV VƏ BAĞ — HomeAndGarden
const homeAndGardenSchema = new mongoose.Schema({
    material:      { type: String, required: [true, "Materiali daxil edin"], trim: true },
    dimensions:    { type: String, required: [true, "Olculeri daxil edin"], trim: true },
    color:         { type: String, required: [true, "Rengi daxil edin"], trim: true },
    brand:         { type: String, required: [true, "Brendi daxil edin"], trim: true },
    indoorOutdoor: { type: String, required: [true, "Daxili/Xarici istifade ni daxil edin"], trim: true },
});
const HomeAndGarden = Product.discriminator("HomeAndGarden", homeAndGardenSchema);

// GÖZƏLLIK — Beauty
const beautySchema = new mongoose.Schema({
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
    skinType:    { type: String, required: [true, "Deri tipini daxil edin"], trim: true },
    volume:      { type: String, required: [true, "Hecmi daxil edin"], trim: true },
    ingredients: { type: String, required: [true, "Terkibi daxil edin"], trim: true },
    expiryDate:  { type: String, required: [true, "Istifade muddetini daxil edin"], trim: true },
});
const Beauty = Product.discriminator("Beauty", beautySchema);

// İDMAN — Sports
const sportsSchema = new mongoose.Schema({
    brand:      { type: String, required: [true, "Brendi daxil edin"], trim: true },
    material:   { type: String, required: [true, "Materiali daxil edin"], trim: true },
    weight:     { type: String, required: [true, "Cekini daxil edin"], trim: true },
    suitableFor:{ type: String, required: [true, "Idman novunu daxil edin"], trim: true },
    color:      { type: String, required: [true, "Rengi daxil edin"], trim: true },
});
const Sports = Product.discriminator("Sports", sportsSchema);

// OTOMOBİL — Automotive
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

// TV və audio sistemlər
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

// Foto və video texnika
const photoVideoSchema = new mongoose.Schema({
    cameraType:         { type: String, required: [true, "Kamera növünü daxil edin"], trim: true },
    lensMount:          { type: String, trim: true },
    resolution:         { type: String, required: [true, "Həlli daxil edin"], trim: true },
    videoResolution:    { type: String, trim: true },
    imageStabilization: { type: String, trim: true },
    brand:              { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const PhotoVideo = Product.discriminator("PhotoVideo", photoVideoSchema);

// Oyun konsolları (yeni)
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

// Smart Home
const smartHomeSchema = new mongoose.Schema({
    smartHomeProtocol: { type: String, required: [true, "Smart home protokolunu daxil edin"], trim: true },
    compatibility:     { type: String, trim: true },
    powerSource:       { type: String, trim: true },
    brand:             { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const SmartHome = Product.discriminator("SmartHome", smartHomeSchema);

// Gadgetlər
const gadgetSchema = new mongoose.Schema({
    gadgetType:   { type: String, required: [true, "Gadget növünü daxil edin"], trim: true },
    connectivity: { type: String, trim: true },
    batteryLife:  { type: String, trim: true },
    brand:        { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Gadgets = Product.discriminator("Gadgets", gadgetSchema);

// Elektronika aksesuarları
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

// Smartfonlar
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

// Düyməli telefonlar
const featurePhoneSchema = new mongoose.Schema({
    battery: { type: String, required: [true, "Batareyanı daxil edin"], trim: true },
    dualSim: { type: Boolean, default: false },
    camera:  { type: String, trim: true },
    radio:   { type: Boolean, default: false },
    brand:   { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const FeaturePhones = Product.discriminator("FeaturePhones", featurePhoneSchema);

// Qulaqlıqlar (yeni)
const headphonesNewSchema = new mongoose.Schema({
    headphoneType:     { type: String, required: [true, "Qulaqlıq növünü daxil edin"], trim: true },
    connectivity:      { type: String, required: [true, "Bağlantı növünü daxil edin"], trim: true },
    noiseCancellation: { type: String, trim: true },
    microphone:        { type: String, trim: true },
    batteryLife:       { type: String, trim: true },
    brand:             { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const HeadphonesNew = Product.discriminator("HeadphonesNew", headphonesNewSchema);

// Kabellər və adapterlər
const cableAdapterSchema = new mongoose.Schema({
    cableLength:   { type: String, required: [true, "Kabel uzunluğunu daxil edin"], trim: true },
    connectorType: { type: String, required: [true, "Konnektoru daxil edin"], trim: true },
    fastCharging:  { type: Boolean, default: false },
    brand:         { type: String, trim: true },
});
const CablesAdapters = Product.discriminator("CablesAdapters", cableAdapterSchema);

// Powerbank
const powerbankSchema = new mongoose.Schema({
    powerbankCapacity: { type: String, required: [true, "Tutumu daxil edin"], trim: true },
    ports:             { type: String, required: [true, "Portları daxil edin"], trim: true },
    wirelessCharging:  { type: Boolean, default: false },
    brand:             { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Powerbanks = Product.discriminator("Powerbanks", powerbankSchema);

// Telefon aksesuarları
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

// Noutbuklar (yeni)
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

// Stolüstü kompüterlər
const desktopSchema = new mongoose.Schema({
    desktopType: { type: String, required: [true, "Kompüter növünü daxil edin"], trim: true },
    processor:   { type: String, required: [true, "Prosessoru daxil edin"], trim: true },
    ram:         { type: String, required: [true, "RAM daxil edin"], trim: true },
    storage:     { type: String, required: [true, "Yaddaşı daxil edin"], trim: true },
    gpu:         { type: String, trim: true },
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Desktops = Product.discriminator("Desktops", desktopSchema);

// Monitorlar
const monitorSchema = new mongoose.Schema({
    monitorSize:  { type: String, required: [true, "Ekran ölçüsünü daxil edin"], trim: true },
    panelType:    { type: String, required: [true, "Panel növünü daxil edin"], trim: true },
    resolution:   { type: String, required: [true, "Həlli daxil edin"], trim: true },
    refreshRate:  { type: String, required: [true, "Yenilənmə tezliyini daxil edin"], trim: true },
    brand:        { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Monitors = Product.discriminator("Monitors", monitorSchema);

// Printer və skanerlər
const printerScannerSchema = new mongoose.Schema({
    printerType: { type: String, required: [true, "Printer növünü daxil edin"], trim: true },
    paperSize:   { type: String, required: [true, "Kağız ölçüsünü daxil edin"], trim: true },
    wireless:    { type: Boolean, default: false },
    scanner:     { type: Boolean, default: false },
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const PrintersScanners = Product.discriminator("PrintersScanners", printerScannerSchema);

// Ofis aksesuarları
const officeAccessorySchema = new mongoose.Schema({
    accessoryType: { type: String, required: [true, "Aksesuar növünü daxil edin"], trim: true },
    material:      { type: String, trim: true },
    brand:         { type: String, trim: true },
});
const OfficeAccessories = Product.discriminator("OfficeAccessories", officeAccessorySchema);

// Komponentlər (RAM, SSD və s.)
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

// Böyük məişət texnikası (soyuducu, paltaryuyan və s.)
const largeApplianceSchema = new mongoose.Schema({
    applianceType: { type: String, required: [true, "Texnika növünü daxil edin"], trim: true },
    energyClass:   { type: String, required: [true, "Enerji sinfini daxil edin"], trim: true },
    dimensions:    { type: String, required: [true, "Ölçüləri daxil edin"], trim: true },
    color:         { type: String, trim: true },
    brand:         { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const LargeAppliances = Product.discriminator("LargeAppliances", largeApplianceSchema);

// Kiçik məişət texnikası (tozsoran, blender və s.)
const smallApplianceSchema = new mongoose.Schema({
    applianceType: { type: String, required: [true, "Texnika növünü daxil edin"], trim: true },
    power:         { type: String, required: [true, "Gücü daxil edin"], trim: true },
    color:         { type: String, trim: true },
    brand:         { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const SmallAppliances = Product.discriminator("SmallAppliances", smallApplianceSchema);

// Mətbəx texnikası
const kitchenApplianceSchema = new mongoose.Schema({
    kitchenAppliance: { type: String, required: [true, "Mətbəx cihazını daxil edin"], trim: true },
    material:         { type: String, required: [true, "Materiali daxil edin"], trim: true },
    dishwasherSafe:   { type: Boolean, default: false },
    brand:            { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const KitchenAppliances = Product.discriminator("KitchenAppliances", kitchenApplianceSchema);

// Kondisioner və isitmə
const climateControlSchema = new mongoose.Schema({
    airConditionerType: { type: String, required: [true, "Kondisioner növünü daxil edin"], trim: true },
    heatingType:        { type: String, trim: true },
    energyClass:        { type: String, trim: true },
    brand:              { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const AirConditioners = Product.discriminator("AirConditioners", climateControlSchema);

// Su qızdırıcıları
const waterHeaterSchema = new mongoose.Schema({
    capacity:    { type: String, required: [true, "Tutumu daxil edin"], trim: true },
    energyClass: { type: String, required: [true, "Enerji sinfini daxil edin"], trim: true },
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const WaterHeaters = Product.discriminator("WaterHeaters", waterHeaterSchema);


// =====================================================================
// ── 5. EV VƏ DEKOR ───────────────────────────────────────────────────
// =====================================================================

// Dekorasiya
const homeDecorSchema = new mongoose.Schema({
    decorType: { type: String, required: [true, "Dekor növünü daxil edin"], trim: true },
    material:  { type: String, required: [true, "Materiali daxil edin"], trim: true },
    color:     { type: String, trim: true },
    brand:     { type: String, trim: true },
});
const HomeDecor = Product.discriminator("HomeDecor", homeDecorSchema);

// İşıqlandırma
const lightingSchema = new mongoose.Schema({
    lightType:        { type: String, required: [true, "İşıq növünü daxil edin"], trim: true },
    wattage:          { type: String, required: [true, "Gücü daxil edin"], trim: true },
    colorTemperature: { type: String, trim: true },
    brand:            { type: String, trim: true },
});
const Lighting = Product.discriminator("Lighting", lightingSchema);

// Ev tekstili
const homeTextilesSchema = new mongoose.Schema({
    textileType: { type: String, required: [true, "Tekstil növünü daxil edin"], trim: true },
    material:    { type: String, required: [true, "Materiali daxil edin"], trim: true },
    dimensions:  { type: String, required: [true, "Ölçüləri daxil edin"], trim: true },
    color:       { type: String, trim: true },
    brand:       { type: String, trim: true },
});
const HomeTextiles = Product.discriminator("HomeTextiles", homeTextilesSchema);

// Mətbəx qabları
const kitchenwareSchema = new mongoose.Schema({
    kitchenwareType: { type: String, required: [true, "Qab növünü daxil edin"], trim: true },
    material:        { type: String, required: [true, "Materiali daxil edin"], trim: true },
    dishwasherSafe:  { type: Boolean, default: false },
    brand:           { type: String, trim: true },
});
const Kitchenware = Product.discriminator("Kitchenware", kitchenwareSchema);

// Hamam aksesuarları
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

// Qonaq otağı mebeli
const livingRoomFurnitureSchema = new mongoose.Schema({
    furnitureType: { type: String, required: [true, "Mebel növünü daxil edin"], trim: true },
    material:      { type: String, required: [true, "Materiali daxil edin"], trim: true },
    color:         { type: String, trim: true },
    dimensions:    { type: String, required: [true, "Ölçüləri daxil edin"], trim: true },
    brand:         { type: String, trim: true },
});
const LivingRoomFurniture = Product.discriminator("LivingRoomFurniture", livingRoomFurnitureSchema);

// Yataq otağı mebeli
const bedroomFurnitureSchema = new mongoose.Schema({
    furnitureType: { type: String, required: [true, "Mebel növünü daxil edin"], trim: true },
    material:      { type: String, required: [true, "Materiali daxil edin"], trim: true },
    color:         { type: String, trim: true },
    dimensions:    { type: String, required: [true, "Ölçüləri daxil edin"], trim: true },
    brand:         { type: String, trim: true },
});
const BedroomFurniture = Product.discriminator("BedroomFurniture", bedroomFurnitureSchema);

// Mətbəx mebeli
const kitchenFurnitureSchema = new mongoose.Schema({
    furnitureType: { type: String, required: [true, "Mebel növünü daxil edin"], trim: true },
    material:      { type: String, required: [true, "Materiali daxil edin"], trim: true },
    color:         { type: String, trim: true },
    dimensions:    { type: String, required: [true, "Ölçüləri daxil edin"], trim: true },
    brand:         { type: String, trim: true },
});
const KitchenFurniture = Product.discriminator("KitchenFurniture", kitchenFurnitureSchema);

// Ofis mebeli
const officeFurnitureSchema = new mongoose.Schema({
    furnitureType: { type: String, required: [true, "Mebel növünü daxil edin"], trim: true },
    material:      { type: String, required: [true, "Materiali daxil edin"], trim: true },
    color:         { type: String, trim: true },
    dimensions:    { type: String, required: [true, "Ölçüləri daxil edin"], trim: true },
    brand:         { type: String, trim: true },
});
const OfficeFurniture = Product.discriminator("OfficeFurniture", officeFurnitureSchema);

// Bağ mebeli
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

// Üst geyim (bluz, köynək, sviter və s.)
const womensTopsSchema = new mongoose.Schema({
    size:     { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:    { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
    season:   { type: String, required: [true, "Mövsümü daxil edin"], trim: true },
    topType:  { type: String, trim: true },
});
const WomensTops = Product.discriminator("WomensTops", womensTopsSchema);

// Alt geyim (şalvar, ətək, cins)
const womensBottomsSchema = new mongoose.Schema({
    size:       { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:      { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material:   { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:      { type: String, required: [true, "Brendi daxil edin"], trim: true },
    season:     { type: String, required: [true, "Mövsümü daxil edin"], trim: true },
    bottomType: { type: String, trim: true },
});
const WomensBottoms = Product.discriminator("WomensBottoms", womensBottomsSchema);

// Gündəlik geyim
const womensCasualSchema = new mongoose.Schema({
    size:     { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:    { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
    season:   { type: String, required: [true, "Mövsümü daxil edin"], trim: true },
    style:    { type: String, trim: true },
});
const WomensCasual = Product.discriminator("WomensCasual", womensCasualSchema);

// İdman geyimi
const womensSportSchema = new mongoose.Schema({
    size:      { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:     { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material:  { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:     { type: String, required: [true, "Brendi daxil edin"], trim: true },
    sportType: { type: String, trim: true },
});
const WomensSport = Product.discriminator("WomensSport", womensSportSchema);

// Rəsmi geyim
const womensFormalSchema = new mongoose.Schema({
    size:     { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:    { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
    occasion: { type: String, trim: true },
});
const WomensFormal = Product.discriminator("WomensFormal", womensFormalSchema);

// Alt paltarları
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

// Üst geyim
const mensTopsSchema = new mongoose.Schema({
    size:     { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:    { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
    season:   { type: String, required: [true, "Mövsümü daxil edin"], trim: true },
    topType:  { type: String, trim: true },
});
const MensTops = Product.discriminator("MensTops", mensTopsSchema);

// Alt geyim (şalvar, cins)
const mensBottomsSchema = new mongoose.Schema({
    size:       { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:      { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material:   { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:      { type: String, required: [true, "Brendi daxil edin"], trim: true },
    season:     { type: String, required: [true, "Mövsümü daxil edin"], trim: true },
    bottomType: { type: String, trim: true },
});
const MensBottoms = Product.discriminator("MensBottoms", mensBottomsSchema);

// Gündəlik geyim
const mensCasualSchema = new mongoose.Schema({
    size:     { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:    { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
    season:   { type: String, required: [true, "Mövsümü daxil edin"], trim: true },
    style:    { type: String, trim: true },
});
const MensCasual = Product.discriminator("MensCasual", mensCasualSchema);

// İdman geyimi
const mensSportSchema = new mongoose.Schema({
    size:      { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:     { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material:  { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:     { type: String, required: [true, "Brendi daxil edin"], trim: true },
    sportType: { type: String, trim: true },
});
const MensSport = Product.discriminator("MensSport", mensSportSchema);

// Rəsmi geyim
const mensFormalSchema = new mongoose.Schema({
    size:     { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    color:    { type: String, required: [true, "Rəngi daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
    occasion: { type: String, trim: true },
});
const MensFormal = Product.discriminator("MensFormal", mensFormalSchema);

// Alt paltarları
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

// İdman ayaqqabısı
const sportsShoesSchema = new mongoose.Schema({
    shoeType:    { type: String, required: [true, "Ayaqqabı növünü daxil edin"], trim: true },
    size:        { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    soleMaterial:{ type: String, required: [true, "Alt materialını daxil edin"], trim: true },
    closureType: { type: String, required: [true, "Bağlama növünü daxil edin"], trim: true },
    color:       { type: String, trim: true },
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const SportsShoes = Product.discriminator("SportsShoes", sportsShoesSchema);

// Klassik ayaqqabı
const classicShoesSchema = new mongoose.Schema({
    shoeType:    { type: String, required: [true, "Ayaqqabı növünü daxil edin"], trim: true },
    size:        { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    material:    { type: String, required: [true, "Materiali daxil edin"], trim: true },
    closureType: { type: String, required: [true, "Bağlama növünü daxil edin"], trim: true },
    color:       { type: String, trim: true },
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const ClassicShoes = Product.discriminator("ClassicShoes", classicShoesSchema);

// Gündəlik ayaqqabı
const casualShoesSchema = new mongoose.Schema({
    shoeType:    { type: String, required: [true, "Ayaqqabı növünü daxil edin"], trim: true },
    size:        { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    material:    { type: String, required: [true, "Materiali daxil edin"], trim: true },
    closureType: { type: String, required: [true, "Bağlama növünü daxil edin"], trim: true },
    color:       { type: String, trim: true },
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const CasualShoes = Product.discriminator("CasualShoes", casualShoesSchema);

// Sandalet və yay ayaqqabıları
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

// Çantalar
const bagsSchema = new mongoose.Schema({
    bagType:  { type: String, required: [true, "Çanta növünü daxil edin"], trim: true },
    material: { type: String, required: [true, "Materiali daxil edin"], trim: true },
    color:    { type: String, trim: true },
    brand:    { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Bags = Product.discriminator("Bags", bagsSchema);

// Saatlar
const watchesSchema = new mongoose.Schema({
    watchType:  { type: String, required: [true, "Saat növünü daxil edin"], trim: true },
    material:   { type: String, required: [true, "Materiali daxil edin"], trim: true },
    waterproof: { type: Boolean, default: false },
    brand:      { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Watches = Product.discriminator("Watches", watchesSchema);

// Günəş eynəkləri
const sunglassesSchema = new mongoose.Schema({
    frameMaterial:  { type: String, required: [true, "Çərçivə materialını daxil edin"], trim: true },
    lensTechnology: { type: String, trim: true },
    uvProtection:   { type: Boolean, default: true },
    brand:          { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Sunglasses = Product.discriminator("Sunglasses", sunglassesSchema);

// Zərgərlik
const jewelrySchema = new mongoose.Schema({
    jewelryType: { type: String, required: [true, "Zərgərlik növünü daxil edin"], trim: true },
    material:    { type: String, required: [true, "Materiali daxil edin"], trim: true },
    gemstone:    { type: String, trim: true },
    brand:       { type: String, trim: true },
});
const Jewelry = Product.discriminator("Jewelry", jewelrySchema);

// Kəmərlər
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

// Makiyaj
const makeupSchema = new mongoose.Schema({
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
    productType: { type: String, required: [true, "Məhsul növünü daxil edin"], trim: true },
    shade:       { type: String, trim: true },
    volume:      { type: String, trim: true },
});
const Makeup = Product.discriminator("Makeup", makeupSchema);

// Dəriyə qulluq
const skincareSchema = new mongoose.Schema({
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
    skinType:    { type: String, required: [true, "Dəri növünü daxil edin"], trim: true },
    ingredients: { type: String, trim: true },
    volume:      { type: String, required: [true, "Həcmi daxil edin"], trim: true },
});
const Skincare = Product.discriminator("Skincare", skincareSchema);

// Saça qulluq
const hairCareSchema = new mongoose.Schema({
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
    hairType:    { type: String, required: [true, "Saç növünü daxil edin"], trim: true },
    volume:      { type: String, required: [true, "Həcmi daxil edin"], trim: true },
    ingredients: { type: String, trim: true },
});
const HairCare = Product.discriminator("HairCare", hairCareSchema);

// Parfümeriya
const fragranceSchema = new mongoose.Schema({
    brand:         { type: String, required: [true, "Brendi daxil edin"], trim: true },
    fragranceType: { type: String, required: [true, "Ətir növünü daxil edin"], trim: true },
    volume:        { type: String, required: [true, "Həcmi daxil edin"], trim: true },
});
const Fragrance = Product.discriminator("Fragrance", fragranceSchema);

// Kişi baxım məhsulları
const menGroomingSchema = new mongoose.Schema({
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
    productType: { type: String, required: [true, "Məhsul növünü daxil edin"], trim: true },
    volume:      { type: String, required: [true, "Həcmi daxil edin"], trim: true },
});
const MenGrooming = Product.discriminator("MenGrooming", menGroomingSchema);

// Gigiyena
const hygieneSchema = new mongoose.Schema({
    brand:       { type: String, required: [true, "Brendi daxil edin"], trim: true },
    productType: { type: String, required: [true, "Məhsul növünü daxil edin"], trim: true },
    quantity:    { type: String, required: [true, "Miqdarı daxil edin"], trim: true },
});
const Hygiene = Product.discriminator("Hygiene", hygieneSchema);


// =====================================================================
// ── 12. UŞAQ VƏ ANA ──────────────────────────────────────────────────
// =====================================================================

// Uşaq geyimləri (yeni)
const kidsClothingNewSchema = new mongoose.Schema({
    kidsClothingType: { type: String, required: [true, "Geyim növünü daxil edin"], trim: true },
    size:             { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    material:         { type: String, required: [true, "Materiali daxil edin"], trim: true },
    ageRange:         { type: String, required: [true, "Yaş aralığını daxil edin"], trim: true },
    brand:            { type: String, trim: true },
});
const KidsClothingNew = Product.discriminator("KidsClothingNew", kidsClothingNewSchema);

// Oyuncaqlar
const toysSchema = new mongoose.Schema({
    toyType:  { type: String, required: [true, "Oyuncaq növünü daxil edin"], trim: true },
    ageRange: { type: String, required: [true, "Yaş aralığını daxil edin"], trim: true },
    material: { type: String, trim: true },
    brand:    { type: String, trim: true },
});
const Toys = Product.discriminator("Toys", toysSchema);

// Uşaq arabaları
const strollersSchema = new mongoose.Schema({
    strollerType: { type: String, required: [true, "Araba növünü daxil edin"], trim: true },
    weight:       { type: String, required: [true, "Çəkisini daxil edin"], trim: true },
    foldable:     { type: Boolean, default: true },
    brand:        { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Strollers = Product.discriminator("Strollers", strollersSchema);

// Qidalanma məhsulları
const babyFeedingSchema = new mongoose.Schema({
    feedingProduct: { type: String, required: [true, "Məhsul növünü daxil edin"], trim: true },
    material:       { type: String, required: [true, "Materiali daxil edin"], trim: true },
    bpaFree:        { type: Boolean, default: true },
    brand:          { type: String, trim: true },
});
const BabyFeeding = Product.discriminator("BabyFeeding", babyFeedingSchema);

// Məktəb ləvazimatları
const schoolSuppliesSchema = new mongoose.Schema({
    productType: { type: String, required: [true, "Məhsul növünü daxil edin"], trim: true },
    brand:       { type: String, trim: true },
    ageGroup:    { type: String, required: [true, "Yaş qrupunu daxil edin"], trim: true },
});
const SchoolSupplies = Product.discriminator("SchoolSupplies", schoolSuppliesSchema);


// =====================================================================
// ── 13. İDMAN VƏ OUTDOOR ─────────────────────────────────────────────
// =====================================================================

// Fitness avadanlıqları
const fitnessEquipmentSchema = new mongoose.Schema({
    sportEquipmentType: { type: String, required: [true, "Avadanlıq növünü daxil edin"], trim: true },
    weight:             { type: String, trim: true },
    material:           { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:              { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const FitnessEquipment = Product.discriminator("FitnessEquipment", fitnessEquipmentSchema);

// Kampinq
const campingSchema = new mongoose.Schema({
    campingItem: { type: String, required: [true, "Məhsul növünü daxil edin"], trim: true },
    material:    { type: String, required: [true, "Materiali daxil edin"], trim: true },
    weight:      { type: String, trim: true },
    brand:       { type: String, trim: true },
});
const Camping = Product.discriminator("Camping", campingSchema);

// Velosipedlər
const bicyclesSchema = new mongoose.Schema({
    bikeType:      { type: String, required: [true, "Velosiped növünü daxil edin"], trim: true },
    frameMaterial: { type: String, required: [true, "Çərçivə materialını daxil edin"], trim: true },
    wheelSize:     { type: String, required: [true, "Təkər ölçüsünü daxil edin"], trim: true },
    brand:         { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const Bicycles = Product.discriminator("Bicycles", bicyclesSchema);

// İdman geyimi
const sportsApparelSchema = new mongoose.Schema({
    clothingType: { type: String, required: [true, "Geyim növünü daxil edin"], trim: true },
    size:         { type: String, required: [true, "Ölçü daxil edin"], trim: true },
    material:     { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:        { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const SportsApparel = Product.discriminator("SportsApparel", sportsApparelSchema);

// İdman aksesuarları
const sportsAccessoriesSchema = new mongoose.Schema({
    accessoryType: { type: String, required: [true, "Aksesuar növünü daxil edin"], trim: true },
    material:      { type: String, required: [true, "Materiali daxil edin"], trim: true },
    brand:         { type: String, trim: true },
});
const SportsAccessories = Product.discriminator("SportsAccessories", sportsAccessoriesSchema);


// =====================================================================
// ── 14. AVTO MƏHSULLAR ───────────────────────────────────────────────
// =====================================================================

// Avto aksesuarlar
const autoAccessoriesSchema = new mongoose.Schema({
    autoAccessoryType: { type: String, required: [true, "Aksesuar növünü daxil edin"], trim: true },
    compatibleModels:  { type: String, required: [true, "Uyğun modelleri daxil edin"], trim: true },
    material:          { type: String, trim: true },
    brand:             { type: String, trim: true },
});
const AutoAccessories = Product.discriminator("AutoAccessories", autoAccessoriesSchema);

// Avto elektronika (dashcam, registrator və s.)
const autoElectronicsSchema = new mongoose.Schema({
    deviceType:       { type: String, required: [true, "Cihaz növünü daxil edin"], trim: true },
    compatibleModels: { type: String, required: [true, "Uyğun modelleri daxil edin"], trim: true },
    features:         { type: String, trim: true },
    brand:            { type: String, required: [true, "Brendi daxil edin"], trim: true },
});
const AutoElectronics = Product.discriminator("AutoElectronics", autoElectronicsSchema);

// Ehtiyat hissələri
const sparePartsSchema = new mongoose.Schema({
    sparePartType:    { type: String, required: [true, "Hissə növünü daxil edin"], trim: true },
    compatibleModels: { type: String, required: [true, "Uyğun modelleri daxil edin"], trim: true },
    oemNumber:        { type: String, trim: true },
    brand:            { type: String, trim: true },
});
const SpareParts = Product.discriminator("SpareParts", sparePartsSchema);

// Yağlar və kimyəvi məhsullar
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

// Hədiyyə setləri
const giftSetsSchema = new mongoose.Schema({
    giftType: { type: String, required: [true, "Hədiyyə növünü daxil edin"], trim: true },
    occasion: { type: String, required: [true, "Mərasimi daxil edin"], trim: true },
    includes: { type: String, trim: true },
    brand:    { type: String, trim: true },
});
const GiftSets = Product.discriminator("GiftSets", giftSetsSchema);

// Suvenirlər
const souvenirsSchema = new mongoose.Schema({
    productType: { type: String, required: [true, "Məhsul növünü daxil edin"], trim: true },
    origin:      { type: String, trim: true },
    material:    { type: String, trim: true },
    brand:       { type: String, trim: true },
});
const Souvenirs = Product.discriminator("Souvenirs", souvenirsSchema);

// Maraqlı məhsullar (trending)
const trendingProductsSchema = new mongoose.Schema({
    productType:     { type: String, required: [true, "Məhsul növünü daxil edin"], trim: true },
    popularityScore: { type: Number, default: 0 },
    brand:           { type: String, trim: true },
});
const TrendingProducts = Product.discriminator("TrendingProducts", trendingProductsSchema);

// Kitablar və hobbi
const booksHobbiesSchema = new mongoose.Schema({
    hobbyType: { type: String, required: [true, "Hobbi növünü daxil edin"], trim: true },
    author:    { type: String, trim: true },
    format:    { type: String, trim: true },
    brand:     { type: String, trim: true },
});
const BooksHobbies = Product.discriminator("BooksHobbies", booksHobbiesSchema);


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
};