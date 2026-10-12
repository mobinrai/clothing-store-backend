import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    slug:{
        type:String,
        required:true,
        unique:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

export default mongoose.model("Role", roleSchema)