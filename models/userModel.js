import mongoose from "mongoose";
import AddressModel from "./addressModel.js";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    },
    addresses: [AddressModel],
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }],
    tokenVersion: {
        type: Number,
        default: 0
    }
    }, { timestamps: true });

export default mongoose.model("User", userSchema);
