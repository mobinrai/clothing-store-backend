import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    isDefault: { type: Boolean, default: false }
}, { _id: false });

export default addressSchema;
