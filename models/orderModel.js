import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: String,
    price: Number,
    quantity: Number,
    size: String,
    color: String,
    image: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    items: [orderItemSchema],

    shippingAddress: {
        fullName: String,
        phone: String,
        street: String,
        city: String,
        postalCode: String,
        country: String
    },

    paymentMethod: String,

    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending"
    },

    orderStatus: {
        type: String,
        enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
        ],
        default: "pending"
    },

    totalAmount: Number
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);