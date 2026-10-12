import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    parent: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category"
        }],
        default: []
    },
    image:{
        imageUrl: String,
        imageId:String,
        name:String
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
},{ timestamps: true });

export default mongoose.model("Category", categorySchema);