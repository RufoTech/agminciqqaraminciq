// =====================================================================
// DEMO MƏHSUL VERİLƏNLƏRİ — Seed Data
// Bütün 15 kateqoriya + subkateqoriyalar üçün nümunə məhsullar
// =====================================================================
export default [

    // ─────────────────────────────────────────────────────────────────
    // LEGACY — Phones
    // ─────────────────────────────────────────────────────────────────
    {
        name: "Apple iPhone 13 128GB", price: 334.99,
        description: "Apple iPhone 13 with A15 Bionic chip, 12MP camera system, and 5G capability.",
        ratings: 4.7, category: "Phones", seller: "Apple", stock: 30, numOfReviews: 89, reviews: [],
        screenSize: "6.1 inch", storage: "128GB", ram: "6GB",
        frontCamera: "12MP", backCamera: "12MP", battery: "3227mAh",
        processor: "A15 Bionic", operatingSystem: "iOS 15",
        images: [{ public_id: "shopit/demo/phone1", url: "https://via.placeholder.com/400" }],
    },
    {
        name: "Samsung Galaxy S23 256GB", price: 299.99,
        description: "Samsung Galaxy S23 with Snapdragon 8 Gen 2, 50MP camera, and 3900mAh battery.",
        ratings: 4.5, category: "Phones", seller: "Samsung", stock: 45, numOfReviews: 62, reviews: [],
        screenSize: "6.1 inch", storage: "256GB", ram: "8GB",
        frontCamera: "12MP", backCamera: "50MP", battery: "3900mAh",
        processor: "Snapdragon 8 Gen 2", operatingSystem: "Android 13",
        images: [{ public_id: "shopit/demo/phone2", url: "https://via.placeholder.com/400" }],
    },

    // LEGACY — Laptops
    {
        name: "Asus ROG Gaming Laptop 15.6\"", price: 1299.99,
        description: "High-performance gaming laptop with RTX 3070 and 16GB RAM.",
        ratings: 4.6, category: "Laptops", seller: "Asus", stock: 20, numOfReviews: 45, reviews: [],
        screenSize: "15.6 inch", storage: "512GB SSD", ram: "16GB",
        gpu: "NVIDIA RTX 3070", camera: "1080p Webcam",
        processor: "AMD Ryzen 7", batteryLife: "6 hours", operatingSystem: "Windows 11",
        images: [{ public_id: "shopit/demo/laptop1", url: "https://via.placeholder.com/400" }],
    },

    // LEGACY — Cameras
    {
        name: "Canon EOS 250D DSLR", price: 699.99,
        description: "Entry-level DSLR camera with 24.1MP APS-C sensor.",
        ratings: 4.3, category: "Cameras", seller: "Canon", stock: 15, numOfReviews: 28, reviews: [],
        resolution: "24.1 MP", opticalZoom: "3x", sensorType: "APS-C", imageStabilization: "Optical",
        images: [{ public_id: "shopit/demo/camera1", url: "https://via.placeholder.com/400" }],
    },

    // LEGACY — Headphones
    {
        name: "Sony WH-1000XM5", price: 349.99,
        description: "Industry-leading noise canceling wireless headphones.",
        ratings: 4.8, category: "Headphones", seller: "Sony", stock: 50, numOfReviews: 120, reviews: [],
        connectivity: "Wireless Bluetooth", batteryLife: "30 hours", noiseCancellation: "Active",
        images: [{ public_id: "shopit/demo/headphone1", url: "https://via.placeholder.com/400" }],
    },

    // LEGACY — Console
    {
        name: "PlayStation 5 Digital Edition", price: 399.99,
        description: "Next-gen gaming console with DualSense wireless controller.",
        ratings: 4.9, category: "Console", seller: "Sony", stock: 10, numOfReviews: 200, reviews: [],
        cpu: "AMD Zen 2 8-core", gpu: "AMD RDNA 2 10.3 TFLOPS", storage: "825GB SSD",
        memory: "16GB GDDR6", supportedResolution: "4K 120fps", connectivity: "Wi-Fi 6",
        controllerIncluded: true,
        images: [{ public_id: "shopit/demo/console1", url: "https://via.placeholder.com/400" }],
    },

    // LEGACY — iPad
    {
        name: "Apple iPad Air 5th Gen 256GB", price: 749.99,
        description: "Apple iPad Air with M1 chip and 10.9-inch Liquid Retina display.",
        ratings: 4.8, category: "iPad", seller: "Apple", stock: 20, numOfReviews: 45, reviews: [],
        screenSize: "10.9 inch", storage: "256GB", ram: "8GB", battery: "7606mAh",
        processor: "Apple M1", operatingSystem: "iPadOS 16", camera: "12MP Wide", cellular: false,
        images: [{ public_id: "shopit/demo/ipad1", url: "https://via.placeholder.com/400" }],
    },

    // LEGACY — WomenClothing
    {
        name: "Qadın Yay Fənəri", price: 49.99,
        description: "Yüngül, nəfəs alan material ilə hazırlanmış şık qadın fənəri.",
        ratings: 4.3, category: "WomenClothing", seller: "FashionStore", stock: 100, numOfReviews: 14, reviews: [],
        size: "M", color: "Ağ", material: "Pambıq", brand: "Zara", season: "Yay",
        images: [{ public_id: "shopit/demo/women1", url: "https://via.placeholder.com/400" }],
    },

    // LEGACY — MenClothing
    {
        name: "Kişi Klassik Köynəyi", price: 59.99,
        description: "Rəsmi görüşlər üçün ideal klassik kişi köynəyi.",
        ratings: 4.5, category: "MenClothing", seller: "MenStyle", stock: 80, numOfReviews: 22, reviews: [],
        size: "L", color: "Mavi", material: "Kətan", brand: "HM", season: "Yaz",
        images: [{ public_id: "shopit/demo/men1", url: "https://via.placeholder.com/400" }],
    },

    // LEGACY — KidsClothing
    {
        name: "Uşaq Cins Şalvarı", price: 29.99,
        description: "Rahat və davamlı uşaq cins şalvarı.",
        ratings: 4.1, category: "KidsClothing", seller: "KidsFashion", stock: 60, numOfReviews: 9, reviews: [],
        size: "4-5 yaş", color: "Tünd Mavi", material: "Denim", brand: "LC Waikiki",
        ageRange: "4-5 yaş", gender: "Unisex",
        images: [{ public_id: "shopit/demo/kids1", url: "https://via.placeholder.com/400" }],
    },

    // LEGACY — HomeAppliances
    {
        name: "Xiaomi Robot Tozsoran", price: 349.99,
        description: "Avtomatik robot tozsoran, 120 dəqiqə batareya ömrü.",
        ratings: 4.6, category: "HomeAppliances", seller: "HomeTech", stock: 25, numOfReviews: 41, reviews: [],
        brand: "Xiaomi", powerConsumption: "25W", warranty: "2 il", dimensions: "35x35x9 cm", color: "Qara",
        images: [{ public_id: "shopit/demo/home1", url: "https://via.placeholder.com/400" }],
    },

    // LEGACY — HomeAndGarden
    {
        name: "Bağ Dəsti (Stol + 4 Stul)", price: 599.99,
        description: "Xarici məkanlara uyğun möhkəm bağ stolu və stul dəsti.",
        ratings: 4.4, category: "HomeAndGarden", seller: "GardenPlus", stock: 15, numOfReviews: 7, reviews: [],
        material: "Polad", dimensions: "120x70x75 cm", color: "Yaşıl", brand: "GardenPro", indoorOutdoor: "Xarici",
        images: [{ public_id: "shopit/demo/garden1", url: "https://via.placeholder.com/400" }],
    },

    // LEGACY — Beauty
    {
        name: "Üz Nəmləndirici Krem", price: 39.99,
        description: "24 saatlıq nəmləndirici effekti olan üz kremi.",
        ratings: 4.7, category: "Beauty", seller: "BeautyWorld", stock: 200, numOfReviews: 63, reviews: [],
        brand: "Nivea", skinType: "Normal", volume: "150ml",
        ingredients: "Aqua, Glycerin, Hyaluronic Acid", expiryDate: "2027-06",
        images: [{ public_id: "shopit/demo/beauty1", url: "https://via.placeholder.com/400" }],
    },

    // LEGACY — Sports
    {
        name: "Fitness Dumbbell Dəsti 20kg", price: 129.99,
        description: "Müxtəlif ağırlıqlarda 20kg-lıq dumbbell dəsti.",
        ratings: 4.5, category: "Sports", seller: "SportZone", stock: 40, numOfReviews: 18, reviews: [],
        brand: "SportFit", material: "Çuqun + Neopren", weight: "20 kg", suitableFor: "Fitness", color: "Qara",
        images: [{ public_id: "shopit/demo/sports1", url: "https://via.placeholder.com/400" }],
    },

    // LEGACY — Automotive
    {
        name: "Universal Avtomobil Oturacaq Örtüyü", price: 89.99,
        description: "Hər növ avtomobilə uyğun premium dəri oturacaq örtüyü.",
        ratings: 4.3, category: "Automotive", seller: "AutoShop", stock: 55, numOfReviews: 27, reviews: [],
        brand: "AutoPro", compatibleModels: "Universal", material: "Süni Dəri", warranty: "1 il", color: "Qara/Bej",
        images: [{ public_id: "shopit/demo/auto1", url: "https://via.placeholder.com/400" }],
    },


    // ─────────────────────────────────────────────────────────────────
    // 1. ELEKTRONİKA
    // ─────────────────────────────────────────────────────────────────

    // TVs
    {
        name: "Samsung 55\" 4K Smart TV", price: 799.99,
        description: "55 düymlük 4K UHD Smart TV, HDR10+ dəstəyi.",
        ratings: 4.5, category: "TVs", seller: "Samsung", stock: 20, numOfReviews: 55, reviews: [],
        tvType: "LED", screenSize: "55 inch", screenResolution: "4K UHD", smartTv: true,
        audioOutputPower: "40W", brand: "Samsung",
        images: [{ public_id: "shopit/demo/tv1", url: "https://via.placeholder.com/400" }],
    },

    // AudioSystems
    {
        name: "JBL PartyBox 310 Bluetooth Dinamik", price: 449.99,
        description: "240W güclü portativ Bluetooth dinamik, rəngli LED işıqlandırma.",
        ratings: 4.6, category: "AudioSystems", seller: "JBL", stock: 15, numOfReviews: 38, reviews: [],
        audioOutputPower: "240W", connectivity: "Bluetooth 5.1", wireless: true, brand: "JBL",
        images: [{ public_id: "shopit/demo/audio1", url: "https://via.placeholder.com/400" }],
    },

    // PhotoVideo
    {
        name: "Sony A7 III Mirrorless Kamera", price: 1999.99,
        description: "Full-frame mirrorless kamera, 24.2MP BSI CMOS sensor.",
        ratings: 4.9, category: "PhotoVideo", seller: "Sony", stock: 8, numOfReviews: 42, reviews: [],
        cameraType: "Mirrorless", lensMount: "Sony E-mount", resolution: "24.2 MP",
        videoResolution: "4K 30fps", imageStabilization: "5-axis IBIS", brand: "Sony",
        images: [{ public_id: "shopit/demo/photo1", url: "https://via.placeholder.com/400" }],
    },

    // GameConsoles
    {
        name: "Xbox Series X", price: 499.99,
        description: "Microsoft Xbox Series X, 12 TFLOPS GPU gücü, 4K gaming.",
        ratings: 4.8, category: "GameConsoles", seller: "Microsoft", stock: 12, numOfReviews: 88, reviews: [],
        cpu: "AMD Zen 2 8-core 3.8GHz", gpu: "AMD RDNA 2 12 TFLOPS", storage: "1TB SSD",
        memory: "16GB GDDR6", supportedResolution: "4K 120fps", controllerIncluded: true, brand: "Microsoft",
        images: [{ public_id: "shopit/demo/gameconsole1", url: "https://via.placeholder.com/400" }],
    },

    // SmartHome
    {
        name: "Philips Hue Smart Lampası", price: 49.99,
        description: "16 milyon rəng dəstəkli ağıllı ev lampası, Zigbee protokolu.",
        ratings: 4.4, category: "SmartHome", seller: "Philips", stock: 100, numOfReviews: 67, reviews: [],
        smartHomeProtocol: "Zigbee", compatibility: "Amazon Alexa, Google Home, Apple HomeKit",
        powerSource: "220V", brand: "Philips",
        images: [{ public_id: "shopit/demo/smarthome1", url: "https://via.placeholder.com/400" }],
    },

    // Gadgets
    {
        name: "Apple Watch Series 9 45mm", price: 429.99,
        description: "GPS + Cellular, S9 SiP çip, Ultra Wideband dəstəyi.",
        ratings: 4.7, category: "Gadgets", seller: "Apple", stock: 25, numOfReviews: 95, reviews: [],
        gadgetType: "Smartwatch", connectivity: "Bluetooth 5.3, Wi-Fi, LTE", batteryLife: "18 hours", brand: "Apple",
        images: [{ public_id: "shopit/demo/gadget1", url: "https://via.placeholder.com/400" }],
    },

    // ElectronicsAccessories
    {
        name: "USB-C Hub 7-in-1", price: 39.99,
        description: "7 portlu USB-C hub, 4K HDMI, SD kart oxuyucu dəstəyi.",
        ratings: 4.3, category: "ElectronicsAccessories", seller: "Baseus", stock: 80, numOfReviews: 44, reviews: [],
        accessoryType: "USB Hub", compatibility: "MacBook, Windows Laptop", color: "Gümüşü", brand: "Baseus",
        images: [{ public_id: "shopit/demo/elaccess1", url: "https://via.placeholder.com/400" }],
    },


    // ─────────────────────────────────────────────────────────────────
    // 2. TELEFONLAR VƏ AKSESUARLAR
    // ─────────────────────────────────────────────────────────────────

    // Smartphones
    {
        name: "iPhone 15 Pro Max 256GB", price: 1199.99,
        description: "Apple iPhone 15 Pro Max, titanium dizayn, 48MP ProRAW kamera.",
        ratings: 4.9, category: "Smartphones", seller: "Apple", stock: 18, numOfReviews: 130, reviews: [],
        screenSize: "6.7 inch", storage: "256GB", ram: "8GB", frontCamera: "12MP TrueDepth",
        backCamera: "48MP ProRAW + 12MP Ultra Wide", battery: "4422mAh",
        processor: "Apple A17 Pro", operatingSystem: "iOS 17", dualSim: true, brand: "Apple",
        images: [{ public_id: "shopit/demo/smartphone1", url: "https://via.placeholder.com/400" }],
    },

    // FeaturePhones
    {
        name: "Nokia 3310 Klassik", price: 49.99,
        description: "Davamlı düyməli telefon, uzun batareya ömrü.",
        ratings: 4.0, category: "FeaturePhones", seller: "Nokia", stock: 40, numOfReviews: 22, reviews: [],
        battery: "1200mAh (25 gün", dualSim: true, camera: "2MP", radio: true, brand: "Nokia",
        images: [{ public_id: "shopit/demo/featurephone1", url: "https://via.placeholder.com/400" }],
    },

    // HeadphonesNew
    {
        name: "AirPods Pro 2nd Gen", price: 249.99,
        description: "Apple AirPods Pro, aktiv səs-küy ləğvetmə, Adaptive Audio.",
        ratings: 4.8, category: "HeadphonesNew", seller: "Apple", stock: 35, numOfReviews: 150, reviews: [],
        headphoneType: "In-ear TWS", connectivity: "Bluetooth 5.3", noiseCancellation: "Aktiv ANC",
        microphone: "Adaptiv Mikrofon", batteryLife: "6 saat (30 saat keys ilə)", brand: "Apple",
        images: [{ public_id: "shopit/demo/headnew1", url: "https://via.placeholder.com/400" }],
    },

    // CablesAdapters
    {
        name: "Anker USB-C 100W Kabel 2m", price: 19.99,
        description: "100W sürətli şarj dəstəkli USB-C kabel, 2 metr.",
        ratings: 4.5, category: "CablesAdapters", seller: "Anker", stock: 200, numOfReviews: 88, reviews: [],
        cableLength: "2m", connectorType: "USB-C to USB-C", fastCharging: true, brand: "Anker",
        images: [{ public_id: "shopit/demo/cable1", url: "https://via.placeholder.com/400" }],
    },

    // Powerbanks
    {
        name: "Xiaomi Powerbank 20000mAh Pro", price: 59.99,
        description: "20000mAh tutumlu powerbank, 33W sürətli şarj, USB-C + 2xUSB-A.",
        ratings: 4.6, category: "Powerbanks", seller: "Xiaomi", stock: 60, numOfReviews: 110, reviews: [],
        powerbankCapacity: "20000mAh", ports: "USB-C, 2x USB-A", wirelessCharging: false, brand: "Xiaomi",
        images: [{ public_id: "shopit/demo/powerbank1", url: "https://via.placeholder.com/400" }],
    },

    // PhoneAccessories
    {
        name: "iPhone 15 MagSafe Silikon Kılıf", price: 29.99,
        description: "MagSafe uyğunluqlu orijinal silikon kılıf.",
        ratings: 4.4, category: "PhoneAccessories", seller: "Apple", stock: 150, numOfReviews: 75, reviews: [],
        accessoryType: "Telefon kılıfı", compatibleModels: "iPhone 15", color: "Dərin mor", brand: "Apple",
        images: [{ public_id: "shopit/demo/phoneaccess1", url: "https://via.placeholder.com/400" }],
    },


    // ─────────────────────────────────────────────────────────────────
    // 3. KOMPÜTER VƏ OFİS TEXNİKASI
    // ─────────────────────────────────────────────────────────────────

    // LaptopsNew
    {
        name: "MacBook Pro 14\" M3 Pro", price: 1999.99,
        description: "Apple M3 Pro çip, 18GB RAM, 512GB SSD, ProMotion ekran.",
        ratings: 4.9, category: "LaptopsNew", seller: "Apple", stock: 10, numOfReviews: 65, reviews: [],
        screenSize: "14.2 inch", storage: "512GB SSD", ram: "18GB", processor: "Apple M3 Pro",
        gpu: "18-core GPU (daxili)", operatingSystem: "macOS Sonoma", batteryLife: "18 hours", brand: "Apple",
        images: [{ public_id: "shopit/demo/laptopnew1", url: "https://via.placeholder.com/400" }],
    },

    // Desktops
    {
        name: "Dell XPS 8960 Stolüstü PC", price: 1499.99,
        description: "Intel Core i9, 32GB RAM, 1TB SSD, RTX 4070 ilə güclü stolüstü kompüter.",
        ratings: 4.7, category: "Desktops", seller: "Dell", stock: 8, numOfReviews: 30, reviews: [],
        desktopType: "Tower PC", processor: "Intel Core i9-13900", ram: "32GB DDR5",
        storage: "1TB NVMe SSD", gpu: "NVIDIA RTX 4070", brand: "Dell",
        images: [{ public_id: "shopit/demo/desktop1", url: "https://via.placeholder.com/400" }],
    },

    // Monitors
    {
        name: "LG UltraWide 34\" QHD Monitor", price: 599.99,
        description: "34 düymlük QHD IPS panel, 160Hz, 1ms, FreeSync Premium.",
        ratings: 4.6, category: "Monitors", seller: "LG", stock: 15, numOfReviews: 48, reviews: [],
        monitorSize: "34 inch", panelType: "IPS", resolution: "3440x1440 QHD", refreshRate: "160Hz", brand: "LG",
        images: [{ public_id: "shopit/demo/monitor1", url: "https://via.placeholder.com/400" }],
    },

    // PrintersScanners
    {
        name: "HP LaserJet Pro M404dn", price: 349.99,
        description: "Sürətli lazer printer, simpleks/dupleks çap, Ethernet.",
        ratings: 4.4, category: "PrintersScanners", seller: "HP", stock: 12, numOfReviews: 25, reviews: [],
        printerType: "Lazer", paperSize: "A4", wireless: false, scanner: false, brand: "HP",
        images: [{ public_id: "shopit/demo/printer1", url: "https://via.placeholder.com/400" }],
    },

    // OfficeAccessories
    {
        name: "Logitech MX Keys Klaviatura", price: 109.99,
        description: "Çoxcihazlı simsiz klaviatura, arxa işıqlandırma, USB-C şarj.",
        ratings: 4.7, category: "OfficeAccessories", seller: "Logitech", stock: 45, numOfReviews: 85, reviews: [],
        accessoryType: "Klaviatura", material: "Plastik + Alüminium", brand: "Logitech",
        images: [{ public_id: "shopit/demo/officeaccess1", url: "https://via.placeholder.com/400" }],
    },

    // Components
    {
        name: "Samsung 1TB NVMe SSD 980 Pro", price: 89.99,
        description: "PCIe 4.0 NVMe SSD, oxuma sürəti 7000MB/s.",
        ratings: 4.8, category: "Components", seller: "Samsung", stock: 50, numOfReviews: 120, reviews: [],
        componentType: "NVMe SSD", capacity: "1TB", speed: "7000MB/s oxuma", brand: "Samsung",
        images: [{ public_id: "shopit/demo/component1", url: "https://via.placeholder.com/400" }],
    },


    // ─────────────────────────────────────────────────────────────────
    // 4. MƏİŞƏT TEXNİKASI
    // ─────────────────────────────────────────────────────────────────

    // LargeAppliances
    {
        name: "Samsung 500L No-Frost Soyuducu", price: 899.99,
        description: "500 litr həcmli, No-Frost texnologiyalı, A+ enerji sinfi.",
        ratings: 4.5, category: "LargeAppliances", seller: "Samsung", stock: 10, numOfReviews: 33, reviews: [],
        applianceType: "Soyuducu", energyClass: "A+", dimensions: "185x70x65 cm", color: "Gümüşü", brand: "Samsung",
        images: [{ public_id: "shopit/demo/largeappl1", url: "https://via.placeholder.com/400" }],
    },

    // SmallAppliances
    {
        name: "Dyson V15 Detect Tozsoran", price: 699.99,
        description: "Lazer toz aşkarlama, HEPA filtrasiya, 60 dəq. batareya.",
        ratings: 4.7, category: "SmallAppliances", seller: "Dyson", stock: 8, numOfReviews: 60, reviews: [],
        applianceType: "Simsiz tozsoran", power: "240W", color: "Sarı/Nikel", brand: "Dyson",
        images: [{ public_id: "shopit/demo/smallappl1", url: "https://via.placeholder.com/400" }],
    },

    // KitchenAppliances
    {
        name: "Tefal Multifunksional Çömçə", price: 149.99,
        description: "12-in-1 multifunksional çömçə, buxar, qızartma, 6L.",
        ratings: 4.4, category: "KitchenAppliances", seller: "Tefal", stock: 25, numOfReviews: 42, reviews: [],
        kitchenAppliance: "Çoxfunksiyalı çömçə", material: "Polad + plastik", dishwasherSafe: true, brand: "Tefal",
        images: [{ public_id: "shopit/demo/kitchenappl1", url: "https://via.placeholder.com/400" }],
    },

    // AirConditioners
    {
        name: "Daikin 12000 BTU İnverter Kondisioner", price: 799.99,
        description: "12000 BTU inverter kondisioner, A++ enerji sinfi, Wi-Fi idarəetmə.",
        ratings: 4.6, category: "AirConditioners", seller: "Daikin", stock: 12, numOfReviews: 27, reviews: [],
        airConditionerType: "Split inverter", heatingType: "Isı nasosu", energyClass: "A++", brand: "Daikin",
        images: [{ public_id: "shopit/demo/aircond1", url: "https://via.placeholder.com/400" }],
    },

    // WaterHeaters
    {
        name: "Ariston 80L Boiler", price: 299.99,
        description: "80 litrlik elektrik su qızdırıcısı, enerji tasarruflu.",
        ratings: 4.3, category: "WaterHeaters", seller: "Ariston", stock: 20, numOfReviews: 18, reviews: [],
        capacity: "80 litr", energyClass: "B", brand: "Ariston",
        images: [{ public_id: "shopit/demo/waterheater1", url: "https://via.placeholder.com/400" }],
    },


    // ─────────────────────────────────────────────────────────────────
    // 5. EV VƏ DEKOR
    // ─────────────────────────────────────────────────────────────────

    // HomeDecor
    {
        name: "Taxta Dekorativ Çərçivə Dəsti", price: 34.99,
        description: "3 ədəd taxta foto çərçivəsi, vintaj dizayn.",
        ratings: 4.2, category: "HomeDecor", seller: "DekorHouse", stock: 80, numOfReviews: 15, reviews: [],
        decorType: "Foto çərçivəsi", material: "Taxta", color: "Qəhvəyi", brand: "DekorHouse",
        images: [{ public_id: "shopit/demo/homedecor1", url: "https://via.placeholder.com/400" }],
    },

    // Lighting
    {
        name: "Philips LED Panel İşıq 24W", price: 24.99,
        description: "24W LED panel, 2400 lümen, gün işığı rəngi.",
        ratings: 4.4, category: "Lighting", seller: "Philips", stock: 100, numOfReviews: 30, reviews: [],
        lightType: "LED Panel", wattage: "24W", colorTemperature: "4000K Gün işığı", brand: "Philips",
        images: [{ public_id: "shopit/demo/lighting1", url: "https://via.placeholder.com/400" }],
    },

    // HomeTextiles
    {
        name: "Bambus Yorğan-döşək Dəsti 200x220cm", price: 89.99,
        description: "Bambus lifindən hazırlanmış yorğan-döşək dəsti, hipoalerjenik.",
        ratings: 4.5, category: "HomeTextiles", seller: "TextilHome", stock: 40, numOfReviews: 22, reviews: [],
        textileType: "Yorğan-döşək dəsti", material: "Bambus 100%", dimensions: "200x220 cm", color: "Ağ", brand: "TextilHome",
        images: [{ public_id: "shopit/demo/textile1", url: "https://via.placeholder.com/400" }],
    },

    // Kitchenware
    {
        name: "Teflon Qazandəsti 5 parça", price: 79.99,
        description: "5 parçalı teflon örtüklü alüminium qazandəsti.",
        ratings: 4.3, category: "Kitchenware", seller: "Tefal", stock: 30, numOfReviews: 19, reviews: [],
        kitchenwareType: "Qazandəsti", material: "Alüminium + Teflon", dishwasherSafe: true, brand: "Tefal",
        images: [{ public_id: "shopit/demo/kitchenware1", url: "https://via.placeholder.com/400" }],
    },

    // BathAccessories
    {
        name: "Bambus Hamam Aksesuarları Dəsti", price: 44.99,
        description: "6 parçalı bambus hamam aksesuar dəsti: sabunqabı, diş fırçası tutacağı və s.",
        ratings: 4.2, category: "BathAccessories", seller: "BathPro", stock: 50, numOfReviews: 12, reviews: [],
        bathAccessoryType: "Hamam dəsti", material: "Bambus", color: "Təbii", brand: "BathPro",
        images: [{ public_id: "shopit/demo/bathaccess1", url: "https://via.placeholder.com/400" }],
    },


    // ─────────────────────────────────────────────────────────────────
    // 6. MEBEL
    // ─────────────────────────────────────────────────────────────────

    // LivingRoomFurniture
    {
        name: "Divan L-şəkilli 3+2", price: 1299.99,
        description: "L-şəkilli yumşaq divan, çeşidli rənglər mövcuddur.",
        ratings: 4.5, category: "LivingRoomFurniture", seller: "FurnitureAZ", stock: 5, numOfReviews: 14, reviews: [],
        furnitureType: "Divan", material: "Kvadrat parça + taxta ayaqlar", color: "Boz", dimensions: "280x200 cm", brand: "FurnitureAZ",
        images: [{ public_id: "shopit/demo/living1", url: "https://via.placeholder.com/400" }],
    },

    // BedroomFurniture
    {
        name: "Yataq Dəsti 160x200 (Baş daşı + 2 Komod)", price: 899.99,
        description: "Yataq + başdaşı + 2 komoddan ibarət tam yataq otağı dəsti.",
        ratings: 4.4, category: "BedroomFurniture", seller: "SleepAZ", stock: 6, numOfReviews: 9, reviews: [],
        furnitureType: "Yataq dəsti", material: "MDF laminat", color: "Ağ", dimensions: "160x200 cm", brand: "SleepAZ",
        images: [{ public_id: "shopit/demo/bedroom1", url: "https://via.placeholder.com/400" }],
    },

    // KitchenFurniture
    {
        name: "Mətbəx Şkafı 3 qapılı", price: 549.99,
        description: "Polimer fasadlı 3 qapılı mətbəx şkafı, davamlı material.",
        ratings: 4.3, category: "KitchenFurniture", seller: "KitchenDesign", stock: 8, numOfReviews: 7, reviews: [],
        furnitureType: "Mətbəx şkafı", material: "Polimer fasad + MDF", color: "Ağ parlaq", dimensions: "180x85x60 cm", brand: "KitchenDesign",
        images: [{ public_id: "shopit/demo/kitchenfurn1", url: "https://via.placeholder.com/400" }],
    },

    // OfficeFurniture
    {
        name: "Ergonomik Ofis Kreslosu", price: 399.99,
        description: "Bel dəstəyi, boyun dəstəyi, 4D qolluqlar, mesh arxa.",
        ratings: 4.6, category: "OfficeFurniture", seller: "ErgoAZ", stock: 20, numOfReviews: 38, reviews: [],
        furnitureType: "Ofis kreslosu", material: "Mesh + alüminium", color: "Qara", dimensions: "65x65x120 cm", brand: "ErgoAZ",
        images: [{ public_id: "shopit/demo/officefurn1", url: "https://via.placeholder.com/400" }],
    },

    // GardenFurniture
    {
        name: "Ratanoid Bağ Divanı Dəsti", price: 699.99,
        description: "Yağışadavamlı ratanoid material, 4 nəfərlik bağ divanı dəsti.",
        ratings: 4.4, category: "GardenFurniture", seller: "GardenPro", stock: 7, numOfReviews: 10, reviews: [],
        furnitureType: "Bağ divanı", material: "Ratanoid + alüminium çərçivə", color: "Tünd qəhvəyi", dimensions: "220x150 cm", brand: "GardenPro",
        images: [{ public_id: "shopit/demo/gardenfurn1", url: "https://via.placeholder.com/400" }],
    },


    // ─────────────────────────────────────────────────────────────────
    // 7. QADIN GEYİMLƏRİ
    // ─────────────────────────────────────────────────────────────────

    // WomensTops
    {
        name: "Qadın Çiçəkli Bluz", price: 39.99,
        description: "Şifon materialdan hazırlanmış çiçəkli naxışlı bluz.",
        ratings: 4.3, category: "WomensTops", seller: "Zara", stock: 80, numOfReviews: 20, reviews: [],
        size: "S", color: "Çəhrayı", material: "Şifon", brand: "Zara", season: "Yaz", topType: "Bluz",
        images: [{ public_id: "shopit/demo/womenstops1", url: "https://via.placeholder.com/400" }],
    },

    // WomensBottoms
    {
        name: "Qadın Yüksək Bel Cins Şalvar", price: 59.99,
        description: "Yüksək bellı slim fit qadın cins şalvarı.",
        ratings: 4.4, category: "WomensBottoms", seller: "Mango", stock: 60, numOfReviews: 33, reviews: [],
        size: "M", color: "Açıq mavi", material: "Denim", brand: "Mango", season: "Bütün mövsümlər", bottomType: "Cins şalvar",
        images: [{ public_id: "shopit/demo/womensbottoms1", url: "https://via.placeholder.com/400" }],
    },

    // WomensCasual
    {
        name: "Qadın Oversize Sweatshirt", price: 44.99,
        description: "Rahat gündəlik oversize sweatshirt.",
        ratings: 4.2, category: "WomensCasual", seller: "HM", stock: 70, numOfReviews: 18, reviews: [],
        size: "L", color: "Bej", material: "Pambıq + Polyester", brand: "HM", season: "Payız", style: "Oversize",
        images: [{ public_id: "shopit/demo/womenscasual1", url: "https://via.placeholder.com/400" }],
    },

    // WomensSport
    {
        name: "Qadın Yoga Leggings", price: 34.99,
        description: "Elastik, nəfəs alan yoga şalvarı.",
        ratings: 4.5, category: "WomensSport", seller: "Nike", stock: 90, numOfReviews: 55, reviews: [],
        size: "S", color: "Qara", material: "Nylon + Spandex", brand: "Nike", sportType: "Yoga/Fitness",
        images: [{ public_id: "shopit/demo/womenssport1", url: "https://via.placeholder.com/400" }],
    },

    // WomensFormal
    {
        name: "Qadın Kostyumu (Ceket + Şalvar)", price: 149.99,
        description: "Rəsmi mərasimlər üçün qadın kostyumu.",
        ratings: 4.6, category: "WomensFormal", seller: "Reserved", stock: 30, numOfReviews: 14, reviews: [],
        size: "M", color: "Tünd göy", material: "Viskoz", brand: "Reserved", occasion: "İş/Rəsmi",
        images: [{ public_id: "shopit/demo/womensformal1", url: "https://via.placeholder.com/400" }],
    },

    // WomensUnderwear
    {
        name: "Qadın Pambıq Alt Paltarı Dəsti", price: 24.99,
        description: "3 ədədli pambıq alt paltarı dəsti.",
        ratings: 4.3, category: "WomensUnderwear", seller: "Marks&Spencer", stock: 120, numOfReviews: 40, reviews: [],
        size: "M", color: "Ağ/Bej/Qara", material: "Pambıq 100%", brand: "Marks&Spencer", type: "Brief",
        images: [{ public_id: "shopit/demo/womensunderwear1", url: "https://via.placeholder.com/400" }],
    },


    // ─────────────────────────────────────────────────────────────────
    // 8. KİŞİ GEYİMLƏRİ
    // ─────────────────────────────────────────────────────────────────

    // MensTops
    {
        name: "Kişi Polo Köynəyi", price: 44.99,
        description: "Klassik kişi polo köynəyi, 100% pambıq.",
        ratings: 4.4, category: "MensTops", seller: "Ralph Lauren", stock: 75, numOfReviews: 28, reviews: [],
        size: "XL", color: "Ağ", material: "Pambıq", brand: "Ralph Lauren", season: "Yaz", topType: "Polo",
        images: [{ public_id: "shopit/demo/menstops1", url: "https://via.placeholder.com/400" }],
    },

    // MensBottoms
    {
        name: "Kişi Slim Fit Kətan Şalvarı", price: 64.99,
        description: "Yüngül kətan kişi şalvarı, yay üçün ideal.",
        ratings: 4.3, category: "MensBottoms", seller: "Zara Man", stock: 55, numOfReviews: 19, reviews: [],
        size: "32x32", color: "Bej", material: "Kətan", brand: "Zara Man", season: "Yay", bottomType: "Kətan şalvar",
        images: [{ public_id: "shopit/demo/mensbottoms1", url: "https://via.placeholder.com/400" }],
    },

    // MensCasual
    {
        name: "Kişi Kapüşonlu Sweatshirt", price: 54.99,
        description: "Gündəlik kapüşonlu kişi sweatshirt, qalın material.",
        ratings: 4.2, category: "MensCasual", seller: "Adidas", stock: 85, numOfReviews: 35, reviews: [],
        size: "L", color: "Tünd göy", material: "Pambıq 80% + Polyester 20%", brand: "Adidas", season: "Payız/Qış", style: "Hoodie",
        images: [{ public_id: "shopit/demo/menscasual1", url: "https://via.placeholder.com/400" }],
    },

    // MensSport
    {
        name: "Kişi Running Şort", price: 29.99,
        description: "Nəfəs alan Dri-FIT material, qaçış üçün dizayn edilmiş.",
        ratings: 4.5, category: "MensSport", seller: "Nike", stock: 100, numOfReviews: 60, reviews: [],
        size: "M", color: "Qara", material: "Dri-FIT Polyester", brand: "Nike", sportType: "Qaçış",
        images: [{ public_id: "shopit/demo/menssport1", url: "https://via.placeholder.com/400" }],
    },

    // MensFormal
    {
        name: "Kişi Slim Fit Kostyumu", price: 249.99,
        description: "İtalyan kəsimli slim fit kişi kostyumu, tam dəst.",
        ratings: 4.6, category: "MensFormal", seller: "Hugo Boss", stock: 20, numOfReviews: 16, reviews: [],
        size: "50", color: "Tünd göy", material: "Yun qarışıqı", brand: "Hugo Boss", occasion: "Toy/İş",
        images: [{ public_id: "shopit/demo/mensformal1", url: "https://via.placeholder.com/400" }],
    },

    // MensUnderwear
    {
        name: "Kişi Pambıq Boxer Dəsti (3 ədəd)", price: 19.99,
        description: "3 ədədli rahat pambıq boxer dəsti.",
        ratings: 4.3, category: "MensUnderwear", seller: "Calvin Klein", stock: 150, numOfReviews: 70, reviews: [],
        size: "L", color: "Çoxrəngli", material: "Pambıq 95% + Elastan 5%", brand: "Calvin Klein", type: "Boxer",
        images: [{ public_id: "shopit/demo/mensunderwear1", url: "https://via.placeholder.com/400" }],
    },


    // ─────────────────────────────────────────────────────────────────
    // 9. AYAQQABI
    // ─────────────────────────────────────────────────────────────────

    // SportsShoes
    {
        name: "Nike Air Max 270", price: 129.99,
        description: "Air Max yastıqlama texnologiyası, gündəlik/idman istifadəsi.",
        ratings: 4.6, category: "SportsShoes", seller: "Nike", stock: 40, numOfReviews: 80, reviews: [],
        shoeType: "Krossovka", size: "42", soleMaterial: "Rezin + Eva", closureType: "Bağcıq", color: "Ağ/Qara", brand: "Nike",
        images: [{ public_id: "shopit/demo/sportsshoes1", url: "https://via.placeholder.com/400" }],
    },

    // ClassicShoes
    {
        name: "Ecco Erkək Dəri Tuflisi", price: 179.99,
        description: "GORE-TEX su keçirməz dəri tuflisi, iş üçün ideal.",
        ratings: 4.5, category: "ClassicShoes", seller: "Ecco", stock: 25, numOfReviews: 32, reviews: [],
        shoeType: "Oxford tuflisi", size: "43", material: "Tam dəri", closureType: "Bağcıq", color: "Qara", brand: "Ecco",
        images: [{ public_id: "shopit/demo/classicshoes1", url: "https://via.placeholder.com/400" }],
    },

    // CasualShoes
    {
        name: "Vans Old Skool", price: 79.99,
        description: "Klassik skate dizaynlı gündəlik ayaqqabı.",
        ratings: 4.4, category: "CasualShoes", seller: "Vans", stock: 55, numOfReviews: 95, reviews: [],
        shoeType: "Skate", size: "41", material: "Süet + Kətan", closureType: "Bağcıq", color: "Qara/Ağ", brand: "Vans",
        images: [{ public_id: "shopit/demo/casualshoes1", url: "https://via.placeholder.com/400" }],
    },

    // Sandals
    {
        name: "Birkenstock Arizona", price: 99.99,
        description: "Ergonomik anatomik kork dabanı, uniseks dəri sandalet.",
        ratings: 4.6, category: "Sandals", seller: "Birkenstock", stock: 30, numOfReviews: 65, reviews: [],
        shoeType: "Sandalet", size: "40", material: "Dəri + Kork", closureType: "Toka", color: "Bej", brand: "Birkenstock",
        images: [{ public_id: "shopit/demo/sandals1", url: "https://via.placeholder.com/400" }],
    },


    // ─────────────────────────────────────────────────────────────────
    // 10. AKSESUARLAR
    // ─────────────────────────────────────────────────────────────────

    // Bags
    {
        name: "Michael Kors Dəri Çanta", price: 249.99,
        description: "Orijinal dəri, orta ölçülü qadın çantası.",
        ratings: 4.5, category: "Bags", seller: "Michael Kors", stock: 20, numOfReviews: 28, reviews: [],
        bagType: "Crossbody", material: "Orijinal dəri", color: "Qəhvəyi", brand: "Michael Kors",
        images: [{ public_id: "shopit/demo/bags1", url: "https://via.placeholder.com/400" }],
    },

    // Watches
    {
        name: "Casio G-Shock GA-2100", price: 119.99,
        description: "Ultradavamlı G-Shock kişi saatı, karbon çərçivəsi.",
        ratings: 4.7, category: "Watches", seller: "Casio", stock: 35, numOfReviews: 90, reviews: [],
        watchType: "Analog-Rəqəmsal", material: "Rezin + Karbon", waterproof: true, brand: "Casio",
        images: [{ public_id: "shopit/demo/watches1", url: "https://via.placeholder.com/400" }],
    },

    // Sunglasses
    {
        name: "Ray-Ban Aviator Klassik", price: 159.99,
        description: "Klassik pilot günəş eynəyi, 100% UV qorunma.",
        ratings: 4.6, category: "Sunglasses", seller: "Ray-Ban", stock: 45, numOfReviews: 75, reviews: [],
        frameMaterial: "Metal", lensTechnology: "Polarize G-15", uvProtection: true, brand: "Ray-Ban",
        images: [{ public_id: "shopit/demo/sunglasses1", url: "https://via.placeholder.com/400" }],
    },

    // Jewelry
    {
        name: "Gümüş 925 Zəncir Boyunbağı", price: 49.99,
        description: "Sterling gümüş, 45 sm, klassik zəncir boyunbağı.",
        ratings: 4.4, category: "Jewelry", seller: "SilverAZ", stock: 60, numOfReviews: 22, reviews: [],
        jewelryType: "Boyunbağı", material: "Gümüş 925", gemstone: "Yoxdur", brand: "SilverAZ",
        images: [{ public_id: "shopit/demo/jewelry1", url: "https://via.placeholder.com/400" }],
    },

    // Belts
    {
        name: "Tommy Hilfiger Dəri Kəməri", price: 59.99,
        description: "Orijinal dəri, iş üçün klassik kişi kəməri.",
        ratings: 4.5, category: "Belts", seller: "Tommy Hilfiger", stock: 40, numOfReviews: 30, reviews: [],
        beltType: "Klassik", material: "Orijinal dəri", size: "95 cm", brand: "Tommy Hilfiger",
        images: [{ public_id: "shopit/demo/belts1", url: "https://via.placeholder.com/400" }],
    },


    // ─────────────────────────────────────────────────────────────────
    // 11. GÖZƏLLIK VƏ KOSMETİKA
    // ─────────────────────────────────────────────────────────────────

    // Makeup
    {
        name: "MAC Ruby Woo Dodaq Boyası", price: 24.99,
        description: "İkonik qırmızı mat dodaq boyası, uzun müddətli.",
        ratings: 4.7, category: "Makeup", seller: "MAC", stock: 150, numOfReviews: 200, reviews: [],
        brand: "MAC", productType: "Dodaq boyası", shade: "Ruby Woo", volume: "3g",
        images: [{ public_id: "shopit/demo/makeup1", url: "https://via.placeholder.com/400" }],
    },

    // Skincare
    {
        name: "The Ordinary Niacinamide 10% Serum", price: 12.99,
        description: "Məsamə daraldan, yağ balanslaşdıran niacinamide serumu.",
        ratings: 4.6, category: "Skincare", seller: "The Ordinary", stock: 200, numOfReviews: 350, reviews: [],
        brand: "The Ordinary", skinType: "Yağlı/Karma", ingredients: "Niacinamide 10%, Zinc 1%", volume: "30ml",
        images: [{ public_id: "shopit/demo/skincare1", url: "https://via.placeholder.com/400" }],
    },

    // HairCare
    {
        name: "Kerastase Nutritive Şampun", price: 34.99,
        description: "Quru saçlar üçün intensiv nəmləndirici şampun.",
        ratings: 4.5, category: "HairCare", seller: "Kerastase", stock: 80, numOfReviews: 65, reviews: [],
        brand: "Kerastase", hairType: "Quru saç", volume: "250ml", ingredients: "Irisome Nutritive kompleks",
        images: [{ public_id: "shopit/demo/haircare1", url: "https://via.placeholder.com/400" }],
    },

    // Fragrance
    {
        name: "Chanel No.5 Eau de Parfum", price: 149.99,
        description: "Dünyaca məşhur klassik qadın ətri, 100ml EDP.",
        ratings: 4.9, category: "Fragrance", seller: "Chanel", stock: 20, numOfReviews: 180, reviews: [],
        brand: "Chanel", fragranceType: "Eau de Parfum", volume: "100ml",
        images: [{ public_id: "shopit/demo/fragrance1", url: "https://via.placeholder.com/400" }],
    },

    // MenGrooming
    {
        name: "Gillette ProGlide Tıraş Jeli", price: 9.99,
        description: "200ml tıraş jeli, dəri qoruyucu formula.",
        ratings: 4.3, category: "MenGrooming", seller: "Gillette", stock: 300, numOfReviews: 120, reviews: [],
        brand: "Gillette", productType: "Tıraş jeli", volume: "200ml",
        images: [{ public_id: "shopit/demo/mengrooming1", url: "https://via.placeholder.com/400" }],
    },

    // Hygiene
    {
        name: "Dove Duş Jeli Dəsti (3 ədəd)", price: 14.99,
        description: "Nəmləndirici formullu Dove duş jeli, 3x250ml.",
        ratings: 4.4, category: "Hygiene", seller: "Dove", stock: 200, numOfReviews: 85, reviews: [],
        brand: "Dove", productType: "Duş jeli", quantity: "3x250ml",
        images: [{ public_id: "shopit/demo/hygiene1", url: "https://via.placeholder.com/400" }],
    },


    // ─────────────────────────────────────────────────────────────────
    // 12. UŞAQ VƏ ANA
    // ─────────────────────────────────────────────────────────────────

    // KidsClothingNew
    {
        name: "Uşaq Pambıq Kombinezonu", price: 24.99,
        description: "Körpələr üçün yumşaq pambıq kombinezon.",
        ratings: 4.5, category: "KidsClothingNew", seller: "Mothercare", stock: 80, numOfReviews: 30, reviews: [],
        kidsClothingType: "Kombinezon", size: "74", material: "Pambıq 100%", ageRange: "6-9 ay", brand: "Mothercare",
        images: [{ public_id: "shopit/demo/kidsclotnew1", url: "https://via.placeholder.com/400" }],
    },

    // Toys
    {
        name: "LEGO Creator 3-in-1 Ev", price: 49.99,
        description: "3-ü 1-də LEGO Creator dəsti, 7+ yaş üçün.",
        ratings: 4.7, category: "Toys", seller: "LEGO", stock: 30, numOfReviews: 55, reviews: [],
        toyType: "Konstruktor", ageRange: "7+ yaş", material: "ABS plastik", brand: "LEGO",
        images: [{ public_id: "shopit/demo/toys1", url: "https://via.placeholder.com/400" }],
    },

    // Strollers
    {
        name: "Bugaboo Fox 5 Uşaq Arabası", price: 1099.99,
        description: "Premium uşaq arabası, tam yatma mövqeyi, hava təkərləri.",
        ratings: 4.8, category: "Strollers", seller: "Bugaboo", stock: 5, numOfReviews: 18, reviews: [],
        strollerType: "Tam ölçülü", weight: "9.5 kg", foldable: true, brand: "Bugaboo",
        images: [{ public_id: "shopit/demo/strollers1", url: "https://via.placeholder.com/400" }],
    },

    // BabyFeeding
    {
        name: "Philips Avent Natural Biberon Dəsti", price: 34.99,
        description: "Döş kimi Natural biberon, körpə üçün natural emzirməyə keçid.",
        ratings: 4.6, category: "BabyFeeding", seller: "Philips Avent", stock: 60, numOfReviews: 88, reviews: [],
        feedingProduct: "Biberon dəsti", material: "Polipropilen + Silikon", bpaFree: true, brand: "Philips Avent",
        images: [{ public_id: "shopit/demo/babyfeeding1", url: "https://via.placeholder.com/400" }],
    },

    // SchoolSupplies
    {
        name: "Stabilo Rəngli Qələm Dəsti 36 Rəng", price: 14.99,
        description: "36 rəngli Stabilo keçə uçlu qələm dəsti.",
        ratings: 4.5, category: "SchoolSupplies", seller: "Stabilo", stock: 150, numOfReviews: 65, reviews: [],
        productType: "Rəngli qələm", brand: "Stabilo", ageGroup: "6+ yaş",
        images: [{ public_id: "shopit/demo/school1", url: "https://via.placeholder.com/400" }],
    },


    // ─────────────────────────────────────────────────────────────────
    // 13. İDMAN VƏ OUTDOOR
    // ─────────────────────────────────────────────────────────────────

    // FitnessEquipment
    {
        name: "Treadmill Treadmill Pro 5000", price: 799.99,
        description: "Ev üçün elektrik treadmill, 0-18 km/s, yokuş funksiyası.",
        ratings: 4.4, category: "FitnessEquipment", seller: "SportZone", stock: 8, numOfReviews: 20, reviews: [],
        sportEquipmentType: "Qaçış lenti", weight: "75 kg", material: "Polad + Plastik", brand: "ProSport",
        images: [{ public_id: "shopit/demo/fitness1", url: "https://via.placeholder.com/400" }],
    },

    // Camping
    {
        name: "Coleman 4 Nəfərlik Çadır", price: 199.99,
        description: "Su keçirməz 4 nəfərlik kampinq çadırı, asan quraşdırma.",
        ratings: 4.5, category: "Camping", seller: "Coleman", stock: 15, numOfReviews: 35, reviews: [],
        campingItem: "Çadır", material: "Polyester + Alüminium dirəklər", weight: "6.5 kg", brand: "Coleman",
        images: [{ public_id: "shopit/demo/camping1", url: "https://via.placeholder.com/400" }],
    },

    // Bicycles
    {
        name: "Trek Marlin 5 Mountain Bike", price: 699.99,
        description: "29\" təkərlər, 21 sürət, hidravlik disk əyləclər.",
        ratings: 4.6, category: "Bicycles", seller: "Trek", stock: 10, numOfReviews: 25, reviews: [],
        bikeType: "Dağ velosipedi", frameMaterial: "Alüminium", wheelSize: "29 inch", brand: "Trek",
        images: [{ public_id: "shopit/demo/bicycle1", url: "https://via.placeholder.com/400" }],
    },

    // SportsApparel
    {
        name: "Adidas Techfit Idman Köynəyi", price: 39.99,
        description: "Sıxma effektli, nəfəs alan idman köynəyi.",
        ratings: 4.4, category: "SportsApparel", seller: "Adidas", stock: 70, numOfReviews: 45, reviews: [],
        clothingType: "İdman köynəyi", size: "M", material: "Techfit Climacool", brand: "Adidas",
        images: [{ public_id: "shopit/demo/sportsapparel1", url: "https://via.placeholder.com/400" }],
    },

    // SportsAccessories
    {
        name: "Everlast Boks Əlcəyi", price: 49.99,
        description: "12oz boks əlcəyi, əsl dəri, çarpaz bant dəstəyi.",
        ratings: 4.5, category: "SportsAccessories", seller: "Everlast", stock: 30, numOfReviews: 38, reviews: [],
        accessoryType: "Boks əlcəyi", material: "Əsl dəri", brand: "Everlast",
        images: [{ public_id: "shopit/demo/sportsaccess1", url: "https://via.placeholder.com/400" }],
    },


    // ─────────────────────────────────────────────────────────────────
    // 14. AVTO MƏHSULLAR
    // ─────────────────────────────────────────────────────────────────

    // AutoAccessories
    {
        name: "Maxton Design Arxa Spoyleri", price: 149.99,
        description: "Universal arxa spoyleri, ABS plastik, asan montaj.",
        ratings: 4.3, category: "AutoAccessories", seller: "Maxton", stock: 20, numOfReviews: 12, reviews: [],
        autoAccessoryType: "Spoyleri", compatibleModels: "Universal hatchback", material: "ABS plastik", brand: "Maxton",
        images: [{ public_id: "shopit/demo/autoaccess1", url: "https://via.placeholder.com/400" }],
    },

    // AutoElectronics
    {
        name: "Garmin DriveSmart 55 GPS Navigator", price: 199.99,
        description: "5.5\" ekranlı GPS navigator, canlı trafik, Bluetooth.",
        ratings: 4.5, category: "AutoElectronics", seller: "Garmin", stock: 18, numOfReviews: 30, reviews: [],
        deviceType: "GPS Navigator", compatibleModels: "Universal", features: "Canlı trafik, Bluetooth, Wi-Fi", brand: "Garmin",
        images: [{ public_id: "shopit/demo/autoelectronics1", url: "https://via.placeholder.com/400" }],
    },

    // SpareParts
    {
        name: "Bosch Ön Əyləc Diski", price: 79.99,
        description: "Ön əyləc diski, ventilasiyalı, 280mm.",
        ratings: 4.6, category: "SpareParts", seller: "Bosch", stock: 25, numOfReviews: 15, reviews: [],
        sparePartType: "Əyləc diski", compatibleModels: "Volkswagen Golf, Passat 2010-2020", oemNumber: "0986479R41", brand: "Bosch",
        images: [{ public_id: "shopit/demo/spareparts1", url: "https://via.placeholder.com/400" }],
    },

    // AutoChemicals
    {
        name: "Castrol Edge 5W-30 Motor Yağı 5L", price: 59.99,
        description: "Tam sintetik motor yağı, 5W-30, BMW/VW sertifikatı.",
        ratings: 4.7, category: "AutoChemicals", seller: "Castrol", stock: 50, numOfReviews: 65, reviews: [],
        chemicalType: "Motor yağı", volume: "5 litr", application: "Benzin və Dizel mühərriklər", brand: "Castrol",
        images: [{ public_id: "shopit/demo/autochemical1", url: "https://via.placeholder.com/400" }],
    },


    // ─────────────────────────────────────────────────────────────────
    // 15. HƏDİYYƏLƏR VƏ LİFESTYLE
    // ─────────────────────────────────────────────────────────────────

    // GiftSets
    {
        name: "Spa Hədiyyə Dəsti Qadın üçün", price: 79.99,
        description: "Duş jeli, losyon, duz hamam, üz maskası — 5 məhsuldan ibarət spa dəsti.",
        ratings: 4.6, category: "GiftSets", seller: "GiftShop", stock: 30, numOfReviews: 40, reviews: [],
        giftType: "Spa/gözəllik dəsti", occasion: "Ad günü, 8 Mart", includes: "Duş jeli, Losyon, Duz, Maska, Sabun", brand: "GiftShop",
        images: [{ public_id: "shopit/demo/giftset1", url: "https://via.placeholder.com/400" }],
    },

    // Souvenirs
    {
        name: "Azərbaycan Milli Ornamentli Qazan", price: 34.99,
        description: "Azərbaycan milli naxışlı dekorativ mis qazan, suvenir.",
        ratings: 4.4, category: "Souvenirs", seller: "AzSouvenir", stock: 45, numOfReviews: 16, reviews: [],
        productType: "Dekorativ qazan", origin: "Azərbaycan", material: "Mis", brand: "AzSouvenir",
        images: [{ public_id: "shopit/demo/souvenir1", url: "https://via.placeholder.com/400" }],
    },

    // TrendingProducts
    {
        name: "Stanley Quencher Termos 1L", price: 44.99,
        description: "Viral Stanley Quencher termos, 1L, soyuq saxlama 24 saat.",
        ratings: 4.8, category: "TrendingProducts", seller: "Stanley", stock: 60, numOfReviews: 250, reviews: [],
        productType: "Termos", popularityScore: 98, brand: "Stanley",
        images: [{ public_id: "shopit/demo/trending1", url: "https://via.placeholder.com/400" }],
    },

    // BooksHobbies
    {
        name: "Atomic Habits — James Clear (Az. dilində)", price: 19.99,
        description: "Dünyaca məşhur self-help kitabı Azərbaycan dilində.",
        ratings: 4.8, category: "BooksHobbies", seller: "KitabAZ", stock: 80, numOfReviews: 120, reviews: [],
        hobbyType: "Kitab / Self-help", author: "James Clear", format: "Cild (Hardcover)", brand: "KitabAZ",
        images: [{ public_id: "shopit/demo/books1", url: "https://via.placeholder.com/400" }],
    },
];