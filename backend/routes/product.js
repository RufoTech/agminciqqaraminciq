// express — Node.js üçün veb framework.
import express from "express";

// productController — məhsul CRUD əməliyyatları, axtarış, rəylər.
import {
    getProducts,
    getProductDetails,
    updateProduct,
    deleteProduct,
    newProduct,
    searchProducts,
    createOrUpdateReview,
    getProductReviews,
} from "../controller/productController.js";

// Autentifikasiya və rol yoxlaması middleware-ləri.
import { authorizeRoles, isAuthenticatedUser } from "../middleware/auth.js";

// cartController — alış-veriş səbəti əməliyyatları.
import {
    addToCart,
    getCartProducts,
    removeFromCart,
    updateCartQuantity,
} from "../controller/cartController.js";

// favoriteController — favori siyahısı əməliyyatları.
import {
    addToFavorites,
    getFavoriteProducts,
    removeFromFavorites,
} from "../controller/favoriteController.js";

// uploadImages — multer middleware-i.
import { uploadImages } from "../middleware/multer.js";

// filterController — çoxlu parametrlə məhsul filterlənməsi.
import { getFilteredProducts } from "../controller/filterController.js";


// =====================================================================
// ROUTER YARATMA
// ---------------------------------------------------------------------
// ⚠️ ROUTE SIRASI QAYDALARI:
//   Statik path-lar dinamik path-lardan ƏVVƏL yazılmalıdır:
//     /products/cart   → əvvəl (statik)
//     /products/:id    → sonra (dinamik)
// =====================================================================
const router = express.Router();


// =====================================================================
// SƏBƏT (CART) ROUTE-LARI
// =====================================================================

// PUT /products/cart/update/:productId — miqdarı dəyişdir
router.put("/products/cart/update/:productId", isAuthenticatedUser, updateCartQuantity);

// POST /products/cart — məhsul əlavə et / miqdar artır
router.post("/products/cart",                  isAuthenticatedUser, addToCart);

// DELETE /products/cart/:productId — məhsulu çıxar
router.delete("/products/cart/:productId",     isAuthenticatedUser, removeFromCart);

// GET /products/cart — səbəti göstər
router.get("/products/cart",                   isAuthenticatedUser, getCartProducts);


// =====================================================================
// FAVORİLƏR ROUTE-LARI
// =====================================================================

// POST /products/favorites — favorilərə əlavə et
router.post("/products/favorites",              isAuthenticatedUser, addToFavorites);

// GET /products/favorites — favori siyahısını göstər
router.get("/products/favorites",               isAuthenticatedUser, getFavoriteProducts);

// DELETE /products/favorites/:productId — favorilərdən çıxar
router.delete("/products/favorites/:productId", isAuthenticatedUser, removeFromFavorites);


// =====================================================================
// FİLTR VƏ AXTAR
// ---------------------------------------------------------------------
// ⚠️ Bu route-lar /:id-dən MÜTLƏQ əvvəl yazılmalıdır.
// =====================================================================

// GET /products/filter?category=phones&priceMin=100&color=black
router.get("/products/filter", getFilteredProducts);

// GET /products/search?query=iphone&page=1&limit=10
router.get("/products/search", searchProducts);


// =====================================================================
// MƏHSUL ROUTE-LARI (İctimai)
// =====================================================================

// GET /products?limit=20&offset=0
router.get("/products",     getProducts);

// GET /products/:id
// ⚠️ Bütün statik route-lar yuxarıda yazıldığı üçün burada problem yoxdur.
router.get("/products/:id", getProductDetails);


// =====================================================================
// ADMİN MƏHSUL ƏMƏLİYYATLARI
// ---------------------------------------------------------------------
// Üçqat qoruma: token → admin rolu → fayl yükləmə
// uploadImages yalnız fayl göndərilən route-larda istifadə olunur.
// =====================================================================

// POST /admin/products — yeni məhsul yarat
router.post("/admin/products",       isAuthenticatedUser, authorizeRoles("admin"), uploadImages, newProduct);

// PUT /admin/products/:id — məhsulu yenilə
router.put("/admin/products/:id",    isAuthenticatedUser, authorizeRoles("admin"), uploadImages, updateProduct);

// DELETE /admin/products/:id — məhsulu sil
// uploadImages lazım deyil — fayl yüklənmir.
router.delete("/admin/products/:id", isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);


// =====================================================================
// RƏY ROUTE-LARI
// ---------------------------------------------------------------------
// FIX: POST /products/review → PUT /products/review
//   createOrUpdateReview həm yeni rəy əlavə edir, həm mövcudu yeniləyir.
//   REST standartına görə "upsert" əməliyyatı PUT ilə ifadə olunur.
//   Köhnə kod POST istifadə edirdi — bu route-u çağıran frontend-i
//   də PUT-a yeniləmək lazımdır.
//
// ⚠️ SIRA VACİBDİR:
//   /products/review  → statik — əvvəl yazılır
//   /products/:id/reviews → dinamik — sonra yazılır
// =====================================================================

// PUT /products/review — rəy əlavə et / yenilə (token tələb olunur)
router.put("/products/review", isAuthenticatedUser, createOrUpdateReview);

// GET /products/:id/reviews — məhsulun bütün rəyləri (ictimai)
router.get("/products/:id/reviews", getProductReviews);


export default router;