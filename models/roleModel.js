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

const Roles = mongoose.model("Role", roleSchema)
export default Roles