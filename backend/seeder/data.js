// =====================================================================
// DEMO MƏHSUL VERİLƏNLƏRİ — Seed Data
// ---------------------------------------------------------------------
// seeder.js bu faylı import edib bazaya yazır.
// Hər kateqoriyanın öz discriminator schema sahələri doldurulub.
//
// FIX edilən problemlər:
//   1. iPad kateqoriyası əlavə edildi (əvvəl yox idi)
//   2. controllerIncluded — Boolean yazılıb (true/false)
//   3. Bütün məcburi sahələr doldurulub
//   4. seller sahəsi hər məhsulda var
// =====================================================================
export default [

    // =====================================================================
    // TELEFONLAR — Phones
    // Phone schema sahələri: screenSize, storage, ram, frontCamera,
    //   backCamera, battery, processor, operatingSystem
    // =====================================================================
    {
        name:            "Apple iPhone 13 128GB",
        price:           334.99,
        description:     "Apple iPhone 13 with A15 Bionic chip, 12MP camera system, and 5G capability.",
        ratings:         4.7,
        category:        "Phones",
        seller:          "Apple",
        stock:           30,
        numOfReviews:    89,
        reviews:         [],
        screenSize:      "6.1 inch",
        storage:         "128GB",
        ram:             "6GB",
        frontCamera:     "12MP",
        backCamera:      "12MP",
        battery:         "3227mAh",
        processor:       "A15 Bionic",
        operatingSystem: "iOS 15",
        images: [
            {
                public_id: "shopit/demo/phone1",
                url:       "https://res.cloudinary.com/dwdvr0oxa/image/upload/v1739452191/1_org_zoom_oorv7q.webp",
            },
        ],
    },
    {
        name:            "Samsung Galaxy S23 256GB",
        price:           299.99,
        description:     "Samsung Galaxy S23 with Snapdragon 8 Gen 2, 50MP camera, and 3900mAh battery.",
        ratings:         4.5,
        category:        "Phones",
        seller:          "Samsung",
        stock:           45,
        numOfReviews:    62,
        reviews:         [],
        screenSize:      "6.1 inch",
        storage:         "256GB",
        ram:             "8GB",
        frontCamera:     "12MP",
        backCamera:      "50MP",
        battery:         "3900mAh",
        processor:       "Snapdragon 8 Gen 2",
        operatingSystem: "Android 13",
        images: [
            {
                public_id: "shopit/demo/phone2",
                url:       "https://via.placeholder.com/400",
            },
        ],
    },


    // =====================================================================
    // NOUTBUKLAR — Laptops
    // Laptop schema sahələri: screenSize, storage, ram, gpu, camera,
    //   processor, batteryLife, operatingSystem
    // =====================================================================
    {
        name:            "4K Gaming Monitor 27-inch",
        price:           449.99,
        description:     "27-inch 4K gaming monitor with 144Hz refresh rate, 1ms response time, and HDR support.",
        ratings:         4.2,
        category:        "Laptops",
        seller:          "DisplayTech",
        stock:           30,
        numOfReviews:    89,
        reviews:         [],
        screenSize:      "27 inch",
        storage:         "512GB SSD",
        ram:             "16GB",
        gpu:             "NVIDIA RTX 3060",
        camera:          "1080p Webcam",
        processor:       "Intel i7",
        batteryLife:     "8 hours",
        operatingSystem: "Windows 11",
        images: [
            {
                public_id: "shopit/demo/laptop1",
                url:       "https://res.cloudinary.com/dwdvr0oxa/image/upload/v1739378739/1_org_zoom_6_dii1wp.webp",
            },
        ],
    },


    // =====================================================================
    // FOTOAPARATLAR — Cameras
    // Camera schema sahələri: resolution, opticalZoom, sensorType,
    //   imageStabilization
    // =====================================================================
    {
        name:               "DSLR Camera Lens 18-55mm",
        price:              299.99,
        description:        "Versatile 18-55mm zoom lens for DSLR cameras. Perfect for landscape and portrait photography.",
        ratings:            4.2,
        category:           "Cameras",
        seller:             "CameraWorld",
        stock:              20,
        numOfReviews:       28,
        reviews:            [],
        resolution:         "24.2 MP",
        opticalZoom:        "3x",
        sensorType:         "APS-C",
        imageStabilization: "Optical",
        images: [
            {
                public_id: "shopit/demo/camera1",
                url:       "https://res.cloudinary.com/dwdvr0oxa/image/upload/v1739372538/1_org_zoom_7_yfrron.webp",
            },
        ],
    },


    // =====================================================================
    // QULAQLILAR — Headphones
    // Headphone schema sahələri: connectivity, batteryLife, noiseCancellation
    // =====================================================================
    {
        name:              "Pro Gaming Headset X1",
        price:             599.99,
        description:       "Professional gaming headset with 7.1 surround sound, noise-canceling microphone, and RGB lighting.",
        ratings:           4.4,
        category:          "Headphones",
        seller:            "TechGear",
        stock:             50,
        numOfReviews:      32,
        reviews:           [],
        connectivity:      "Wireless",
        batteryLife:       "20 hours",
        noiseCancellation: "Active",
        images: [
            {
                public_id: "shopit/demo/headphone1",
                url:       "https://res.cloudinary.com/dwdvr0oxa/image/upload/v1739371207/Gaming_Heatds_zu8u8z.webp",
            },
        ],
    },
    {
        name:              "Wireless Gaming Mouse RGB",
        price:             259.99,
        description:       "High-precision wireless gaming mouse with 16000 DPI optical sensor and RGB lighting.",
        ratings:           4.0,
        category:          "Headphones",
        seller:            "GameTech",
        stock:             75,
        numOfReviews:      156,
        reviews:           [],
        connectivity:      "Wireless",
        batteryLife:       "70 hours",
        noiseCancellation: "None",
        images: [
            {
                public_id: "shopit/demo/headphone2",
                url:       "https://res.cloudinary.com/dwdvr0oxa/image/upload/v1739376838/1_org_zoom_5_clq4li.webp",
            },
        ],
    },


    // =====================================================================
    // OYUN KONSOLLARİ — Console
    // Console schema sahələri: cpu, gpu, storage, memory,
    //   supportedResolution, connectivity, controllerIncluded (Boolean)
    // =====================================================================
    {
        name:                "Gaming Controller",
        price:               699.99,
        description:         "Professional gaming controller with haptic feedback and adaptive triggers.",
        ratings:             5.0,
        category:            "Console",
        seller:              "DisplayTech",
        stock:               30,
        numOfReviews:        89,
        reviews:             [],
        cpu:                 "AMD Zen 2",
        gpu:                 "AMD RDNA 2",
        storage:             "825GB SSD",
        memory:              "16GB GDDR6",
        supportedResolution: "4K",
        connectivity:        "Wireless",
        // FIX: Boolean dəyər — string deyil.
        controllerIncluded:  true,
        images: [
            {
                public_id: "shopit/demo/console1",
                url:       "https://res.cloudinary.com/dwdvr0oxa/image/upload/v1739434190/1_org_zoom_hr08ir.webp",
            },
        ],
    },


    // =====================================================================
    // iPAD — iPad
    // FIX: Bu kateqoriya data.js-də YOX İDİ — əlavə edildi.
    // iPad schema sahələri: screenSize, storage, ram, battery,
    //   processor, operatingSystem, camera, cellular (Boolean)
    // =====================================================================
    {
        name:            "Apple iPad Air 5th Gen 256GB",
        price:           749.99,
        description:     "Apple iPad Air with M1 chip, 10.9-inch Liquid Retina display, and USB-C connectivity.",
        ratings:         4.8,
        category:        "iPad",
        seller:          "Apple",
        stock:           20,
        numOfReviews:    45,
        reviews:         [],
        screenSize:      "10.9 inch",
        storage:         "256GB",
        ram:             "8GB",
        battery:         "7606mAh",
        processor:       "Apple M1",
        operatingSystem: "iPadOS 16",
        camera:          "12MP Wide",
        // FIX: Boolean dəyər — cellular modeldirmi?
        cellular:        false,
        images: [
            {
                public_id: "shopit/demo/ipad1",
                url:       "https://via.placeholder.com/400",
            },
        ],
    },
    {
        name:            "Apple iPad Pro 12.9-inch 512GB",
        price:           1099.99,
        description:     "Apple iPad Pro with M2 chip, 12.9-inch Liquid Retina XDR display, and 5G support.",
        ratings:         4.9,
        category:        "iPad",
        seller:          "Apple",
        stock:           15,
        numOfReviews:    33,
        reviews:         [],
        screenSize:      "12.9 inch",
        storage:         "512GB",
        ram:             "16GB",
        battery:         "10758mAh",
        processor:       "Apple M2",
        operatingSystem: "iPadOS 16",
        camera:          "12MP Wide + 10MP Ultra Wide",
        cellular:        true,
        images: [
            {
                public_id: "shopit/demo/ipad2",
                url:       "https://via.placeholder.com/400",
            },
        ],
    },


    // =====================================================================
    // QADIN GEYİMLƏRİ — WomenClothing
    // WomenClothing schema sahələri: size, color, material, brand, season
    // =====================================================================
    {
        name:        "Qadın Yay Fənəri",
        price:       49.99,
        description: "Yüngül, nefes alan material ilə hazırlanmış şık qadın fənəri.",
        ratings:     4.3,
        category:    "WomenClothing",
        seller:      "FashionStore",
        stock:       100,
        numOfReviews: 14,
        reviews:     [],
        size:        "M",
        color:       "Ağ",
        material:    "Pambıq",
        brand:       "Zara",
        season:      "Yay",
        images: [
            {
                public_id: "shopit/demo/women1",
                url:       "https://via.placeholder.com/400",
            },
        ],
    },


    // =====================================================================
    // KİŞİ GEYİMLƏRİ — MenClothing
    // MenClothing schema sahələri: size, color, material, brand, season
    // =====================================================================
    {
        name:        "Kişi Klassik Köynəyi",
        price:       59.99,
        description: "Rəsmi görüşlər üçün ideal klassik kişi köynəyi.",
        ratings:     4.5,
        category:    "MenClothing",
        seller:      "MenStyle",
        stock:       80,
        numOfReviews: 22,
        reviews:     [],
        size:        "L",
        color:       "Mavi",
        material:    "Kətan",
        brand:       "HM",
        season:      "Yaz",
        images: [
            {
                public_id: "shopit/demo/men1",
                url:       "https://via.placeholder.com/400",
            },
        ],
    },


    // =====================================================================
    // UŞAQ GEYİMLƏRİ — KidsClothing
    // KidsClothing schema sahələri: size, color, material, brand,
    //   ageRange, gender
    // =====================================================================
    {
        name:        "Uşaq Cins Şalvarı",
        price:       29.99,
        description: "Rahat və davamlı uşaq cins şalvarı.",
        ratings:     4.1,
        category:    "KidsClothing",
        seller:      "KidsFashion",
        stock:       60,
        numOfReviews: 9,
        reviews:     [],
        size:        "4-5 yaş",
        color:       "Tünd Mavi",
        material:    "Denim",
        brand:       "LC Waikiki",
        ageRange:    "4-5 yaş",
        gender:      "Unisex",
        images: [
            {
                public_id: "shopit/demo/kids1",
                url:       "https://via.placeholder.com/400",
            },
        ],
    },


    // =====================================================================
    // EV TEXNİKASI — HomeAppliances
    // HomeAppliance schema sahələri: brand, powerConsumption,
    //   warranty, dimensions, color
    // =====================================================================
    {
        name:             "Robot Tozsoran",
        price:            349.99,
        description:      "Avtomatik robot tozsoran, 120 dəqiqə batareya ömrü.",
        ratings:          4.6,
        category:         "HomeAppliances",
        seller:           "HomeTech",
        stock:            25,
        numOfReviews:     41,
        reviews:          [],
        brand:            "Xiaomi",
        powerConsumption: "25W",
        warranty:         "2 il",
        dimensions:       "35x35x9 cm",
        color:            "Qara",
        images: [
            {
                public_id: "shopit/demo/home1",
                url:       "https://via.placeholder.com/400",
            },
        ],
    },


    // =====================================================================
    // EV VƏ BAĞ — HomeAndGarden
    // HomeAndGarden schema sahələri: material, dimensions, color,
    //   brand, indoorOutdoor
    // =====================================================================
    {
        name:          "Bağ Dəsti (Stol + 4 Stul)",
        price:         599.99,
        description:   "Xarici məkanlara uyğun möhkəm bağ stolu və stul dəsti.",
        ratings:       4.4,
        category:      "HomeAndGarden",
        seller:        "GardenPlus",
        stock:         15,
        numOfReviews:  7,
        reviews:       [],
        material:      "Polad",
        dimensions:    "120x70x75 cm",
        color:         "Yaşıl",
        brand:         "GardenPro",
        indoorOutdoor: "Xarici",
        images: [
            {
                public_id: "shopit/demo/garden1",
                url:       "https://via.placeholder.com/400",
            },
        ],
    },


    // =====================================================================
    // GÖZƏLLIK VƏ BAKIM — Beauty
    // Beauty schema sahələri: brand, skinType, volume,
    //   ingredients, expiryDate
    // =====================================================================
    {
        name:        "Üz Nəmləndirici Krem",
        price:       39.99,
        description: "24 saatlıq nəmləndirici effekti olan üz kremi.",
        ratings:     4.7,
        category:    "Beauty",
        seller:      "BeautyWorld",
        stock:       200,
        numOfReviews: 63,
        reviews:     [],
        brand:       "Nivea",
        skinType:    "Normal",
        volume:      "150ml",
        ingredients: "Aqua, Glycerin, Hyaluronic Acid",
        expiryDate:  "2027-06",
        images: [
            {
                public_id: "shopit/demo/beauty1",
                url:       "https://via.placeholder.com/400",
            },
        ],
    },


    // =====================================================================
    // İDMAN MƏHSULLARI — Sports
    // Sports schema sahələri: brand, material, weight, suitableFor, color
    // =====================================================================
    {
        name:        "Fitness Dumbbell Dəsti 20kg",
        price:       129.99,
        description: "Müxtəlif ağırlıqlarda 20kg-lıq dumbbell dəsti.",
        ratings:     4.5,
        category:    "Sports",
        seller:      "SportZone",
        stock:       40,
        numOfReviews: 18,
        reviews:     [],
        brand:       "SportFit",
        material:    "Çuqun + Neopren",
        weight:      "20 kg",
        suitableFor: "Fitness",
        color:       "Qara",
        images: [
            {
                public_id: "shopit/demo/sports1",
                url:       "https://via.placeholder.com/400",
            },
        ],
    },


    // =====================================================================
    // OTOMOBİL MƏHSULLARI — Automotive
    // Automotive schema sahələri: brand, compatibleModels,
    //   material, warranty, color
    // =====================================================================
    {
        name:             "Universal Avtomobil Oturacaq Örtüyü",
        price:            89.99,
        description:      "Hər növ avtomobilə uyğun premium dəri oturacaq örtüyü.",
        ratings:          4.3,
        category:         "Automotive",
        seller:           "AutoShop",
        stock:            55,
        numOfReviews:     27,
        reviews:          [],
        brand:            "AutoPro",
        compatibleModels: "Universal",
        material:         "Süni Dəri",
        warranty:         "1 il",
        color:            "Qara/Bej",
        images: [
            {
                public_id: "shopit/demo/auto1",
                url:       "https://via.placeholder.com/400",
            },
        ],
    },
];