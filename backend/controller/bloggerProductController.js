import mongoose from "mongoose";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import {
    Product,
    allowedCategoryValues,
} from "../model/Product.js";

// Helper from productController (re-implemented or imported if possible, but for simplicity I'll re-implement the necessary logic)
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

// =====================================================================
// BLOGERİN MƏHSULLARINI GÖSTƏR
// GET /commerce/mehsullar/blogger/products
// =====================================================================
export const getBloggerProducts = catchAsyncErrors(async (req, res, next) => {
    const products = await Product.find({ blogger: req.user._id });

    res.status(200).json({
        success: true,
        products,
    });
});

// =====================================================================
// BLOGER YENİ MƏHSUL YARAT
// POST /commerce/mehsullar/blogger/products
// =====================================================================
export const newBloggerProduct = catchAsyncErrors(async (req, res, next) => {
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

    req.body.blogger = req.user._id;
    req.body.seller = `${req.user.firstName} ${req.user.lastName}`; // Bloqerin adı satıcı kimi qeyd olunur

    if (!req.body.category) {
        return next(new ErrorHandler("Kateqoriya seçilməyib", 400));
    }

    const normalizedPayload = normalizeProductPayload(req.body);
    
    // We use the base Product model or discriminators. 
    // For blogger simplification, we can use Product.create which handles discriminators via category field.
    const product = await Product.create({ ...normalizedPayload, images });

    res.status(201).json({
        success: true,
        product,
    });
});

// =====================================================================
// BLOGER MƏHSULU YENİLƏ
// PUT /commerce/mehsullar/blogger/products/:id
// =====================================================================
export const updateBloggerProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Məhsul tapılmadı", 404));
    }

    // Yalnız öz məhsulunu yeniləyə bilər
    if (product.blogger?.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("Bu məhsulu yeniləmək səlahiyyətiniz yoxdur", 403));
    }

    const normalizedPayload = normalizeProductPayload(req.body);
    let images = [...(product.images || [])];

    // Şəkillərin idarə olunması (silinmə)
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
                        console.error(`Cloudinary şəkil silmə xətası:`, err.message);
                    }
                    images = images.filter((i) => i.public_id !== img.public_id);
                }
            }
        } catch (err) {
            console.error("existingImages parse xətası:", err.message);
        }
    }

    // Yeni şəkillərin əlavə olunması
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

    product = await Product.findByIdAndUpdate(req.params.id, normalizedPayload, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        product,
    });
});

// =====================================================================
// BLOGER MƏHSULU SİL
// DELETE /commerce/mehsullar/blogger/products/:id
// =====================================================================
export const deleteBloggerProduct = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Məhsul tapılmadı", 404));
    }

    // Yalnız öz məhsulunu silə bilər
    if (product.blogger?.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("Bu məhsulu silmək səlahiyyətiniz yoxdur", 403));
    }

    // Cloudinary-dən şəkilləri sil
    if (product.images && product.images.length > 0) {
        for (let image of product.images) {
            try {
                await cloudinary.uploader.destroy(image.public_id);
            } catch (err) {
                console.error(`Cloudinary şəkil silmə xətası:`, err.message);
            }
        }
    }

    await product.deleteOne();

    res.status(200).json({
        success: true,
        message: "Məhsul silindi",
    });
});
