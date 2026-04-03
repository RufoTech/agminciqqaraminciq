import mongoose from "mongoose";

import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

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
} from "../model/Product.js";

import { notifyFavoritePriceChange } from "../utils/notificationHelper.js";


// =====================================================================
// KATEQORİYA → MODEL XƏRİTƏSİ
// =====================================================================
const categoryModels = {
    // ── Legacy kateqoriyalar ──────────────────────────────────────
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

    // 1. Elektronika (köhnə flat)
    TVs:                    TVs,
    AudioSystems:           AudioSystems,
    PhotoVideo:             PhotoVideo,
    GameConsoles:           GameConsoles,
    SmartHome:              SmartHome,
    Gadgets:                Gadgets,
    ElectronicsAccessories: ElectronicsAccessories,

    // 2. Telefonlar və aksesuarlar (köhnə flat)
    Smartphones:      Smartphones,
    FeaturePhones:    FeaturePhones,
    HeadphonesNew:    HeadphonesNew,
    CablesAdapters:   CablesAdapters,
    Powerbanks:       Powerbanks,
    PhoneAccessories: PhoneAccessories,

    // 3. Kompüter və ofis (köhnə flat)
    LaptopsNew:        LaptopsNew,
    Desktops:          Desktops,
    Monitors:          Monitors,
    PrintersScanners:  PrintersScanners,
    OfficeAccessories: OfficeAccessories,
    Components:        Components,

    // 4. Məişət texnikası (köhnə flat)
    LargeAppliances:   LargeAppliances,
    SmallAppliances:   SmallAppliances,
    KitchenAppliances: KitchenAppliances,
    AirConditioners:   AirConditioners,
    WaterHeaters:      WaterHeaters,

    // 5. Ev və dekor (köhnə flat)
    HomeDecor:       HomeDecor,
    Lighting:        Lighting,
    HomeTextiles:    HomeTextiles,
    Kitchenware:     Kitchenware,
    BathAccessories: BathAccessories,

    // 6. Mebel (köhnə flat)
    LivingRoomFurniture: LivingRoomFurniture,
    BedroomFurniture:    BedroomFurniture,
    KitchenFurniture:    KitchenFurniture,
    OfficeFurniture:     OfficeFurniture,
    GardenFurniture:     GardenFurniture,

    // 7. Qadın geyimləri (köhnə flat)
    WomensTops:      WomensTops,
    WomensBottoms:   WomensBottoms,
    WomensCasual:    WomensCasual,
    WomensSport:     WomensSport,
    WomensFormal:    WomensFormal,
    WomensUnderwear: WomensUnderwear,

    // 8. Kişi geyimləri (köhnə flat)
    MensTops:      MensTops,
    MensBottoms:   MensBottoms,
    MensCasual:    MensCasual,
    MensSport:     MensSport,
    MensFormal:    MensFormal,
    MensUnderwear: MensUnderwear,

    // 9. Ayaqqabı (köhnə flat)
    SportsShoes:  SportsShoes,
    ClassicShoes: ClassicShoes,
    CasualShoes:  CasualShoes,
    Sandals:      Sandals,

    // 10. Aksesuarlar (köhnə flat)
    Bags:       Bags,
    Watches:    Watches,
    Sunglasses: Sunglasses,
    Jewelry:    Jewelry,
    Belts:      Belts,

    // 11. Gözəllik və kosmetika (köhnə flat)
    Makeup:      Makeup,
    Skincare:    Skincare,
    HairCare:    HairCare,
    Fragrance:   Fragrance,
    MenGrooming: MenGrooming,
    Hygiene:     Hygiene,

    // 12. Uşaq və ana (köhnə flat)
    KidsClothingNew: KidsClothingNew,
    Toys:            Toys,
    Strollers:       Strollers,
    BabyFeeding:     BabyFeeding,
    SchoolSupplies:  SchoolSupplies,

    // 13. İdman və outdoor (köhnə flat)
    FitnessEquipment:  FitnessEquipment,
    Camping:           Camping,
    Bicycles:          Bicycles,
    SportsApparel:     SportsApparel,
    SportsAccessories: SportsAccessories,

    // 14. Avto məhsullar (köhnə flat)
    AutoAccessories:  AutoAccessories,
    AutoElectronics:  AutoElectronics,
    SpareParts:       SpareParts,
    AutoChemicals:    AutoChemicals,

    // 15. Hədiyyələr və lifestyle (köhnə flat)
    GiftSets:         GiftSets,
    Souvenirs:        Souvenirs,
    TrendingProducts: TrendingProducts,
    BooksHobbies:     BooksHobbies,

    // Parent (əsas) kateqoriyalar — ümumi Product modeli istifadə edir
    "Elektronika":                  Product,
    "Telefonlar ve aksesuarlar":    Product,
    "Komputer ve ofis texnikasi":   Product,
    "Meiset texnikasi":             Product,
    "Ev ve dekor":                  Product,
    "Mebel":                        Product,
    "Qadin geyimleri":              Product,
    "Kisi geyimleri":               Product,
    "Ayaqqabi":                     Product,
    "Aksesuarlar":                  Product,
    "Gozellik ve kosmetika":        Product,
    "Usaq ve ana":                  Product,
    "Idman ve outdoor":             Product,
    "Avto mehsullar":               Product,
    "Hediyyeler ve lifestyle":      Product,

    // ── YENİ FRONTEND KATEQORİYA → MODEL MAPPING ─────────────────
    // Frontend AddProduct.jsx-dən "Phones_Smartphone", "Electronics_TV"
    // və s. kimi dəyərlər gəlir. Bunlar aşağıda uyğun modelə map edilir.

    // 1. Elektronika
    "Electronics_TV":          Electronics_TV,
    "Electronics_Photo":       Electronics_Photo,
    "Electronics_Console":     Electronics_Console,
    "Electronics_SmartHome":   Electronics_SmartHome,
    "Electronics_Gadgets":     Electronics_Gadgets,
    "Electronics_Acc":         Electronics_Acc,

    // 2. Telefonlar
    "Phones_Smartphone":       Phones_Smartphone,
    "Phones_Basic":            Phones_Basic,
    "Phones_Headphones":       Phones_Headphones,
    "Phones_Cables":           Phones_Cables,
    "Phones_Powerbank":        Phones_Powerbank,
    "Phones_Acc":              Phones_Acc,

    // 3. Kompüter
    "Computers_Laptop":        Computers_Laptop,
    "Computers_Desktop":       Computers_Desktop,
    "Computers_Monitor":       Computers_Monitor,
    "Computers_Printer":       Computers_Printer,
    "Computers_OfficeAcc":     Computers_OfficeAcc,
    "Computers_Parts":         Computers_Parts,

    // 4. Məişət texnikası
    "HomeAppliances_Large":    HomeAppliances_Large,
    "HomeAppliances_Small":    HomeAppliances_Small,
    "HomeAppliances_Kitchen":  HomeAppliances_Kitchen,
    "HomeAppliances_Climate":  HomeAppliances_Climate,
    "HomeAppliances_Water":    HomeAppliances_Water,

    // 5. Ev və dekor
    "HomeDecor_Deco":          HomeDecor_Deco,
    "HomeDecor_Light":         HomeDecor_Light,
    "HomeDecor_Textile":       HomeDecor_Textile,
    "HomeDecor_Kitchen":       HomeDecor_Kitchen,
    "HomeDecor_Bath":          HomeDecor_Bath,

    // 6. Mebel
    "Furniture_Living":        Furniture_Living,
    "Furniture_Bedroom":       Furniture_Bedroom,
    "Furniture_Kitchen":       Furniture_Kitchen,
    "Furniture_Office":        Furniture_Office,
    "Furniture_Garden":        Furniture_Garden,

    // 7. Qadın geyimi
    "WomenClothing_Outer":     WomenClothing_Outer,
    "WomenClothing_Inner":     WomenClothing_Inner,
    "WomenClothing_Casual":    WomenClothing_Casual,
    "WomenClothing_Sport":     WomenClothing_Sport,
    "WomenClothing_Formal":    WomenClothing_Formal,
    "WomenClothing_Under":     WomenClothing_Under,

    // 8. Kişi geyimi
    "MenClothing_Outer":       MenClothing_Outer,
    "MenClothing_Inner":       MenClothing_Inner,
    "MenClothing_Casual":      MenClothing_Casual,
    "MenClothing_Sport":       MenClothing_Sport,
    "MenClothing_Formal":      MenClothing_Formal,
    "MenClothing_Under":       MenClothing_Under,

    // 9. Ayaqqabı
    "Shoes_Sport":             Shoes_Sport,
    "Shoes_Classic":           Shoes_Classic,
    "Shoes_Casual":            Shoes_Casual,
    "Shoes_Sandal":            Shoes_Sandal,

    // 10. Aksesuarlar
    "Accessories_Bag":         Accessories_Bag,
    "Accessories_Watch":       Accessories_Watch,
    "Accessories_Sunglasses":  Accessories_Sunglasses,
    "Accessories_Jewelry":     Accessories_Jewelry,
    "Accessories_Belt":        Accessories_Belt,

    // 11. Gözəllik
    "Beauty_Makeup":           Beauty_Makeup,
    "Beauty_Skin":             Beauty_Skin,
    "Beauty_Hair":             Beauty_Hair,
    "Beauty_Perfume":          Beauty_Perfume,
    "Beauty_Men":              Beauty_Men,
    "Beauty_Hygiene":          Beauty_Hygiene,

    // 12. Uşaq və ana
    "KidsAndMom_Clothing":     KidsAndMom_Clothing,
    "KidsAndMom_Toys":         KidsAndMom_Toys,
    "KidsAndMom_Stroller":     KidsAndMom_Stroller,
    "KidsAndMom_Food":         KidsAndMom_Food,
    "KidsAndMom_School":       KidsAndMom_School,

    // 13. İdman
    "Sports_Fitness":          Sports_Fitness,
    "Sports_Camping":          Sports_Camping,
    "Sports_Bicycle":          Sports_Bicycle,
    "Sports_Clothing":         Sports_Clothing,
    "Sports_Acc":              Sports_Acc,

    // 14. Avto
    "Automotive_Acc":          Automotive_Acc,
    "Automotive_Electronics":  Automotive_Electronics,
    "Automotive_Parts":        Automotive_Parts,
    "Automotive_Oils":         Automotive_Oils,

    // 15. Hədiyyə
    "Gifts_Sets":              Gifts_Sets,
    "Gifts_Souvenir":          Gifts_Souvenir,
    "Gifts_Trending":          Gifts_Trending,
    "Gifts_Books":             Gifts_Books,
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
        if (normalizedPayload[fieldName] === "true")  normalizedPayload[fieldName] = true;
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
// BÜTÜN MƏHSULLARI GÖSTƏR — getProducts
// GET /api/v1/products?limit=20&offset=0
// =====================================================================
export const getProducts = catchAsyncErrors(async (req, res, next) => {

    const limit  = parseInt(req.query.limit)  || 100;
    const offset = parseInt(req.query.offset) || 0;

    const products = await Product.find().skip(offset).limit(limit);

    res.status(200).json({ success: true, products });
});


// =====================================================================
// MƏHSULUN DETALLARI — getProductDetails
// GET /api/v1/product/:id
// =====================================================================
export const getProductDetails = catchAsyncErrors(async (req, res, next) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new ErrorHandler("Yanlış məhsul ID-si", 400));
    }

    const product = await Product.findById(req.params.id);

    if (!product) return next(new ErrorHandler("Məhsul tapılmadı", 404));

    res.status(200).json({ success: true, product });
});


// =====================================================================
// MƏHSULU SİL — deleteProduct
// DELETE /api/v1/admin/product/:id
// =====================================================================
export const deleteProduct = catchAsyncErrors(async (req, res, next) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new ErrorHandler("Yanlış məhsul ID-si", 400));
    }

    const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler("Məhsul tapılmadı", 404));

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

    res.status(200).json({ success: true, message: "Məhsul uğurla silindi" });
});


// =====================================================================
// YENİ MƏHSUL YARAT — newProduct
// POST /api/v1/admin/product/new
// Body: FormData (şəkillər + məhsul məlumatları)
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
                console.error("Cloudinary yükləmə xətası:", err.message);
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
        return next(new ErrorHandler("Satıcı məlumatı tapılmadı", 400));
    }

    if (!req.body.category) {
        return next(new ErrorHandler("Kateqoriya seçilməyib", 400));
    }

    const normalizedPayload = normalizeProductPayload(req.body);
    const Model = getModelByCategory(normalizedPayload.category);
    if (!Model) {
        return next(new ErrorHandler("Daxil edilen kateqoriya movcud deyil", 400));
    }

    const product = await Model.create({ ...normalizedPayload, images });

    res.status(201).json({ success: true, product });
});


// =====================================================================
// MƏHSULU YENİLƏ — updateProduct
// PUT /api/v1/admin/product/:id
// Body: FormData
// =====================================================================
export const updateProduct = catchAsyncErrors(async (req, res, next) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new ErrorHandler("Yanlış məhsul ID-si", 400));
    }

    let product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler("Məhsul tapılmadı", 404));

    const normalizedPayload = normalizeProductPayload(req.body);
    const oldPrice    = product.price;
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
                        console.error(`Cloudinary şəkil silmə xətası (${img.public_id}):`, err.message);
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
                console.error("Cloudinary yükləmə xətası:", err.message);
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
// MƏHSUL AXTAR — searchProducts
// GET /api/v1/products/search?query=iphone&page=1&limit=10
// =====================================================================
export const searchProducts = catchAsyncErrors(async (req, res, next) => {

    const { query, page = 1, limit = 10 } = req.query;

    if (!query || query.trim() === "") {
        return next(new ErrorHandler("Axtarış sözü daxil edin", 400));
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
        success:     true,
        products,
        total,
        totalPages:  Math.ceil(total / limitNum),
        currentPage: pageNum,
    });
});


// =====================================================================
// RƏY ƏLAVƏ ET / YENİLƏ — createOrUpdateReview
// PUT /api/v1/review
// Body: { productId, rating, comment }
// =====================================================================
export const createOrUpdateReview = catchAsyncErrors(async (req, res, next) => {

    const { productId, rating, comment } = req.body;

    if (!productId || !rating) {
        return next(new ErrorHandler("productId və rating məcburidir", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new ErrorHandler("Yanlış məhsul ID-si", 400));
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return next(new ErrorHandler("Reytinq 1 ilə 5 arasında olmalıdır", 400));
    }

    const product = await Product.findById(productId);
    if (!product) return next(new ErrorHandler("Məhsul tapılmadı", 404));

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

    res.status(200).json({ success: true, message: "Rəy uğurla əlavə edildi" });
});


// =====================================================================
// MƏHSULUN RƏYLƏRİNİ GÖSTƏR — getProductReviews
// GET /api/v1/reviews/:id
// =====================================================================
export const getProductReviews = catchAsyncErrors(async (req, res, next) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return next(new ErrorHandler("Yanlış məhsul ID-si", 400));
    }

    const product = await Product.findById(req.params.id);

    if (!product) return next(new ErrorHandler("Məhsul tapılmadı", 404));

    res.status(200).json({ success: true, reviews: product.reviews });
});