import mongoose from "mongoose";

const sellerReviewSchema = new mongoose.Schema(
    {
        seller: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "Admin",
            required: true,
        },
        user: {
            type:     mongoose.Schema.Types.ObjectId,
            ref:      "User",
            required: true,
        },
        userName: {
            type:     String,
            required: true,
        },
        rating: {
            type:     Number,
            required: true,
            min:      1,
            max:      5,
        },
        comment: {
            type:    String,
            default: "",
            maxLength: 500,
        },
    },
    { timestamps: true }
);

// Bir istifadəçi bir mağazaya yalnız bir rəy buraxa bilər
sellerReviewSchema.index({ seller: 1, user: 1 }, { unique: true });

export default mongoose.model("SellerReview", sellerReviewSchema);
