import express from "express";
import {
    createOrUpdateSellerReview,
    getSellerReviews,
    checkCanReview,
} from "../controller/sellerReviewController.js";
import { isAuthenticatedUser } from "../middleware/auth.js";

const router = express.Router();

// Açıq — mağazanın rəylərini görmək üçün
router.get("/seller/:sellerId/reviews",    getSellerReviews);

// Auth tələb olunur
router.get("/seller/:sellerId/can-review", isAuthenticatedUser, checkCanReview);
router.put("/seller/:sellerId/review",     isAuthenticatedUser, createOrUpdateSellerReview);

export default router;
