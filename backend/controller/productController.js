// mongoose â€” MongoDB ilÉ™ iÅŸlÉ™mÉ™k Ã¼Ã§Ã¼n kitabxana.
import mongoose from "mongoose";

// catchAsyncErrors â€” async funksiyalardakÄ± xÉ™talarÄ± avtomatik tutur.
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";

// ErrorHandler â€” Ã¶zÉ™l xÉ™ta sinifi.
import ErrorHandler from "../utils/errorHandler.js";

// cloudinary â€” ÅŸÉ™kil yÃ¼klÉ™mÉ™ vÉ™ silmÉ™ servisi.
import cloudinary from "../utils/cloudinary.js";

// fs â€” Node.js-in fayl sistemi modulu.
import fs from "fs";

// â”€â”€ MÆHSUL MODELLÆRÄ° â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import {
    allowedCategoryValues,
    Product,
    Phone, Laptop, Camera, Headphone, Console, iPad,
    WomenClothing, MenClothing, KidsClothing,
    HomeAppliance, HomeAndGarden, Beauty, Sports, Automotive,
    // Yeni modellər (hamısı)
    TVs, AudioSystems, PhotoVideo, GameConsoles, SmartHome, Gadgets, ElectronicsAccessories,
    Smartphones, FeaturePhones, HeadphonesNew, CablesAdapters, Powerbanks, PhoneAccessories,
    LaptopsNew, Desktops, Monitors, PrintersScanners, OfficeAccessories, Components,
    LargeAppliances, SmallAppliances, KitchenAppliances, AirConditioners, WaterHeaters,
    HomeDecor, Lighting, HomeTextiles, Kitchenware, BathAccessories,
    LivingRoomFurniture, BedroomFurniture, KitchenFurniture, OfficeFurniture, GardenFurniture,
    SportsShoes, ClassicShoes, CasualShoes, Sandals,
    Bags, Watches, Sunglasses, Jewelry, Belts,
    Makeup, Skincare, HairCare, Fragrance, MenGrooming, Hygiene,
    KidsClothingNew, Toys, Strollers, BabyFeeding, SchoolSupplies,
    FitnessEquipment, Camping, Bicycles, SportsApparel, SportsAccessories,
    AutoAccessories, AutoElectronics, SpareParts, AutoChemicals,
    GiftSets, Souvenirs, TrendingProducts, BooksHobbies,
} from "../model/Product.js";

// notifyFavoritePriceChange â€” qiymÉ™t dÉ™yiÅŸdikdÉ™ bildiriÅŸ gÃ¶ndÉ™rir.
import { notifyFavoritePriceChange } from "../utils/notificationHelper.js";


// â”€â”€ KATEQORÄ°YA â†’ MODEL XÆRÄ°TÆSÄ° â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Bu xÉ™ritÉ™ bÃ¼tÃ¼n controllerlarda eyni olduÄŸu Ã¼Ã§Ã¼n bir dÉ™fÉ™ tÉ™yin edilir,
// newProduct vÉ™ updateProduct hÉ™r ikisi istifadÉ™ edir â€” kod tÉ™krarÄ± aradan qalxÄ±r.
const categoryModels = {
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

    // Yeni kateqoriyalar – Elektronika
    TVs:                     TVs,
    AudioSystems:            AudioSystems,
    PhotoVideo:              PhotoVideo,
    GameConsoles:            GameConsoles,
    SmartHome:               SmartHome,
    Gadgets:                 Gadgets,
    ElectronicsAccessories:  ElectronicsAccessories,

    // Telefonlar və aksesuarlar
    Smartphones:             Smartphones,
    FeaturePhones:           FeaturePhones,
    HeadphonesNew:           HeadphonesNew,
    CablesAdapters:          CablesAdapters,
    Powerbanks:              Powerbanks,
    PhoneAccessories:        PhoneAccessories,

    // Kompüter və ofis
    LaptopsNew:              LaptopsNew,
    Desktops:                Desktops,
    Monitors:                Monitors,
    PrintersScanners:        PrintersScanners,
    OfficeAccessories:       OfficeAccessories,
    Components:              Components,

    // Məişət texnikası
    LargeAppliances:         LargeAppliances,
    SmallAppliances:         SmallAppliances,
    KitchenAppliances:       KitchenAppliances,
    AirConditioners:         AirConditioners,
    WaterHeaters:            WaterHeaters,

    // Ev və dekor
    HomeDecor:               HomeDecor,
    Lighting:                Lighting,
    HomeTextiles:            HomeTextiles,
    Kitchenware:             Kitchenware,
    BathAccessories:         BathAccessories,

    // Mebel
    LivingRoomFurniture:     LivingRoomFurniture,
    BedroomFurniture:        BedroomFurniture,
    KitchenFurniture:        KitchenFurniture,
    OfficeFurniture:         OfficeFurniture,
    GardenFurniture:         GardenFurniture,

    // Ayaqqabı
    SportsShoes:             SportsShoes,
    ClassicShoes:            ClassicShoes,
    CasualShoes:             CasualShoes,
    Sandals:                 Sandals,

    // Aksesuarlar
    Bags:                    Bags,
    Watches:                 Watches,
    Sunglasses:              Sunglasses,
    Jewelry:                 Jewelry,
    Belts:                   Belts,

    // Gözəllik və kosmetika
    Makeup:                  Makeup,
    Skincare:                Skincare,
    HairCare:                HairCare,
    Fragrance:               Fragrance,
    MenGrooming:             MenGrooming,
    Hygiene:                 Hygiene,

    // Uşaq və ana
    KidsClothingNew:         KidsClothingNew,
    Toys:                    Toys,
    Strollers:               Strollers,
    BabyFeeding:             BabyFeeding,
    SchoolSupplies:          SchoolSupplies,

    // İdman və outdoor
    FitnessEquipment:        FitnessEquipment,
    Camping:                 Camping,
    Bicycles:                Bicycles,
    SportsApparel:           SportsApparel,
    SportsAccessories:       SportsAccessories,

    // Avto məhsullar
    AutoAccessories:         AutoAccessories,
    AutoElectronics:         AutoElectronics,
    SpareParts:              SpareParts,
    AutoChemicals:           AutoChemicals,

    // Hədiyyələr və lifestyle
    GiftSets:                GiftSets,
    Souvenirs:               Souvenirs,
    TrendingProducts:        TrendingProducts,
    BooksHobbies:            BooksHobbies,
};

const booleanFieldNames = ["controllerIncluded", "cellular"];

const normalizeProductPayload = (payload = {}) => {
    const normalizedPayload = { ...payload };

    if (typeof normalizedPayload.category === "string") {
        normalizedPayload.category = normalizedPayload.category.trim();
    }

    if (typeof normalizedPayload.subcategory === "string") {
        normalizedPayload.subcategory = normalizedPayload.subcategory.trim();
    }

    for (const fieldName of booleanFieldNames) {
        if (normalizedPayload[fieldName] === "true") normalizedPayload[fieldName] = true;
        if (normalizedPayload[fieldName] === "false") normalizedPayload[fieldName] = false;
    }

    return normalizedPayload;
};

const getModelByCategory = (category) => {
    if (!category) return Product;
    if (!allowedCategoryValues.includes(category)) return null;
    return categoryModels[category] || Product;
};


// =====================================================================
// BÃœTÃœN MÆHSULLARI GÃ–STÆR â€” getProducts
// GET /api/v1/products?limit=20&offset=0
// =====================================================================
export const getProducts = catchAsyncErrors(async (req, res, next) => {

    const limit  = parseInt(req.query.limit)  || 100;
    const offset = parseInt(req.query.offset) || 0;

    const products = await Product.find().skip(offset).limit(limit);

    res.status(200).json({ success: true, products });
});


// =====================================================================
// MÆHSULUN DETALLARI â€” getProductDetails
// GET /api/v1/product/:id
// =====================================================================
export const getProductDetails = catchAsyncErrors(async (req, res, next) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new ErrorHandler("YanlÄ±ÅŸ mÉ™hsul ID-si", 400));
    }

    const product = await Product.findById(req.params.id);

    if (!product) return next(new ErrorHandler("MÉ™hsul tapÄ±lmadÄ±", 404));

    res.status(200).json({ success: true, product });
});


// =====================================================================
// MÆHSULU SÄ°L â€” deleteProduct
// DELETE /api/v1/admin/product/:id
// =====================================================================
export const deleteProduct = catchAsyncErrors(async (req, res, next) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new ErrorHandler("YanlÄ±ÅŸ mÉ™hsul ID-si", 400));
    }

    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler("MÉ™hsul tapÄ±lmadÄ±", 404));

    if (product.images && product.images.length > 0) {
        for (let image of product.images) {
            try {
                await cloudinary.uploader.destroy(image.public_id);
            } catch (err) {
                console.error(`Cloudinary şəkil silmə xətası (${image.public_id}):`, err.message);
            }
        }
    }

    await Product.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, message: "MÉ™hsul uÄŸurla silindi" });
});


// =====================================================================
// YENÄ° MÆHSUL YARAT â€” newProduct
// POST /api/v1/admin/product/new
// Body: FormData (ÅŸÉ™killÉ™r + mÉ™hsul mÉ™lumatlarÄ±)
// =====================================================================
export const newProduct = catchAsyncErrors(async (req, res, next) => {

    const images = [];

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        for (let file of req.files) {
            try {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "products",
                });
                images.push({ public_id: result.public_id, url: result.secure_url });
            } catch (err) {
                console.error("Cloudinary yÃ¼klÉ™mÉ™ xÉ™tasÄ±:", err.message);
            } finally {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
        }
    }

    if (req.user?.role === "admin" && req.user?.sellerInfo?.storeName) {
        req.body.seller = req.user.sellerInfo.storeName;
    }

    if (!req.body.seller) {
        return next(new ErrorHandler("SatÄ±cÄ± mÉ™lumatÄ± tapÄ±lmadÄ±", 400));
    }

    if (!req.body.category) {
        return next(new ErrorHandler("Kateqoriya seçilməyib", 400));
    }

    const Model = getModelByCategory(normalizedPayload.category);
    if (!Model) {
        return next(new ErrorHandler("Daxil edilen kateqoriya movcud deyil", 400));
    }

    const product = await Model.create({ ...normalizedPayload, images });

    res.status(201).json({ success: true, product });
});


// =====================================================================
// MÆHSULU YENÄ°LÆ â€” updateProduct
// PUT /api/v1/admin/product/:id
// Body: FormData
// =====================================================================
export const updateProduct = catchAsyncErrors(async (req, res, next) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new ErrorHandler("YanlÄ±ÅŸ mÉ™hsul ID-si", 400));
    }

    let product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler("MÉ™hsul tapÄ±lmadÄ±", 404));

    const normalizedPayload = normalizeProductPayload(req.body);
    const oldPrice   = product.price;
    const newCategory = normalizedPayload.category;

    let images = [...(product.images || [])];

    if (req.body.existingImages) {
        try {
            const imagesToRemove = typeof req.body.existingImages === "string"
                ? JSON.parse(req.body.existingImages)
                : req.body.existingImages;

            if (Array.isArray(imagesToRemove)) {
                for (let img of imagesToRemove) {
                    try {
                        await cloudinary.uploader.destroy(img.public_id);
                    } catch (err) {
                        console.error(`Cloudinary ÅŸÉ™kil silmÉ™ xÉ™tasÄ± (${img.public_id}):`, err.message);
                    }
                    images = images.filter((i) => i.public_id !== img.public_id);
                }
            }
        } catch (parseErr) {
            console.error("existingImages parse xətası:", parseErr.message);
        }
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        for (let file of req.files) {
            try {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "products",
                });
                images.push({ public_id: result.public_id, url: result.secure_url });
            } catch (err) {
                console.error("Cloudinary yÃ¼klÉ™mÉ™ xÉ™tasÄ±:", err.message);
            } finally {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
        }
    }

    normalizedPayload.images = images;

    if (newCategory && newCategory !== product.category) {

        const NewModel = getModelByCategory(newCategory);
        if (!NewModel) {
            return next(new ErrorHandler("Daxil edilen kateqoriya movcud deyil", 400));
        }

        await Product.deleteOne({ _id: req.params.id });

        const updatedProduct = await NewModel.create({
            ...normalizedPayload,
            _id: new mongoose.Types.ObjectId(req.params.id),
        });

        if (req.body.price && Number(req.body.price) !== oldPrice) {
            await notifyFavoritePriceChange({
                productId:   req.params.id,
                productName: updatedProduct.name,
                oldPrice,
                newPrice:    Number(normalizedPayload.price),
            });
        }

        return res.status(200).json({ success: true, product: updatedProduct });

    } else {

        product = await Product.findByIdAndUpdate(
            req.params.id,
            normalizedPayload,
            { new: true, runValidators: true }
        );

        if (!product) return next(new ErrorHandler("Yeniləmə zamanı xəta baş verdi", 500));

        if (normalizedPayload.price && Number(normalizedPayload.price) !== oldPrice) {
            await notifyFavoritePriceChange({
                productId:   product._id,
                productName: product.name,
                oldPrice,
                newPrice:    Number(normalizedPayload.price),
            });
        }

        res.status(200).json({ success: true, product });
    }
});


// =====================================================================
// MÆHSUL AXTAR â€” searchProducts
// GET /api/v1/products/search?query=iphone&page=1&limit=10
// =====================================================================
export const searchProducts = catchAsyncErrors(async (req, res, next) => {

    const { query, page = 1, limit = 10 } = req.query;

    if (!query || query.trim() === "") {
        return next(new ErrorHandler("AxtarÄ±ÅŸ sÃ¶zÃ¼ daxil edin", 400));
    }

    const trimmedQuery = query.trim();

    const searchFilter = {
        name: { $regex: trimmedQuery, $options: "i" },
    };

    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));

    const [products, total] = await Promise.all([
        Product.find(searchFilter)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum),
        Product.countDocuments(searchFilter),
    ]);

    res.status(200).json({
        success:    true,
        products,
        total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
    });
});


// =====================================================================
// RÆY ÆLAVÆ ET / YENÄ°LÆ â€” createOrUpdateReview
// PUT /api/v1/review
// Body: { productId, rating, comment }
// =====================================================================
export const createOrUpdateReview = catchAsyncErrors(async (req, res, next) => {

    const { productId, rating, comment } = req.body;

    if (!productId || !rating) {
        return next(new ErrorHandler("productId vÉ™ rating mÉ™cburidir", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new ErrorHandler("YanlÄ±ÅŸ mÉ™hsul ID-si", 400));
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return next(new ErrorHandler("Reytinq 1 ilÉ™ 5 arasÄ±nda olmalÄ±dÄ±r", 400));
    }

    const product = await Product.findById(productId);
    if (!product) return next(new ErrorHandler("MÉ™hsul tapÄ±lmadÄ±", 404));

    const review = {
        user:    req.user._id,
        name:    req.user.name,
        rating:  ratingNum,
        comment: comment || "",
    };

    const isReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
    );

    if (isReviewed) {
        product.reviews.forEach((r) => {
            if (r.user.toString() === req.user._id.toString()) {
                r.comment = review.comment;
                r.rating  = ratingNum;
                r.name    = req.user.name;
            }
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    if (product.reviews.length > 0) {
        product.ratings =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;
    } else {
        product.ratings = 0;
    }

    await product.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: "RÉ™y uÄŸurla É™lavÉ™ edildi" });
});


// =====================================================================
// MÆHSULUN RÆYLÆRÄ°NÄ° GÃ–STÆR â€” getProductReviews
// GET /api/v1/reviews/:id
// =====================================================================
export const getProductReviews = catchAsyncErrors(async (req, res, next) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new ErrorHandler("YanlÄ±ÅŸ mÉ™hsul ID-si", 400));
    }

    const product = await Product.findById(req.params.id);

    if (!product) return next(new ErrorHandler("MÉ™hsul tapÄ±lmadÄ±", 404));

    res.status(200).json({ success: true, reviews: product.reviews });
});
