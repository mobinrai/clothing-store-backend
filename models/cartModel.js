import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  variant: {
    size: String,
    color: String
  },
  quantity: { type: Number, default: 1 },
  price: Number
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true
  },
  items: [cartItemSchema]
}, { timestamps: true });

export default CartModel = mongoose.model("Cart", cartSchema);