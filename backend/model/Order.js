import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        orderItems: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                name:     { type: String, required: true },
                price:    { type: Number, required: true },
                quantity: { type: Number, required: true, default: 1 },
                image:    { type: String },
                seller:   { type: String },
            },
        ],
        paymentInfo: {
            stripePaymentId: { type: String, required: true },
            status:          { type: String, required: true },
            currency:        { type: String, default: "azn" },
        },
        totalAmount: {
            type: Number,
            required: true,
            default: 0,
        },
        orderStatus: {
            type: String,
            required: true,
            default: "pending",
            enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
        deliveredAt: Date,
    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);