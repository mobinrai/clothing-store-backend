import Roles from '../models/roleModel.js'
import { getSlug } from '../utils/common.js'

export const getAllRoles = async (req,res)=>{
    try {
        const roles = await Roles.find()
        console.log(roles);
        return res.status(200).json({success:true, roles})
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:error.message})
    }
}

export const getRole=async(req, res)=>{
    try {
        const role = await Roles.findOne({slug:req.params.slug})
        return res.status(200).json({success:true, role})
    } catch (error) {

        return res.status(500).json({success:false, message:error.message})
    }
}

export const createRole = async(req,res)=>{
    try {
        const name = req.body.name
        const slug = await getSlug(name, Roles)
        const newRole = new Roles({slug, name})
        const role = await newRole.save()
        return res.status(200).json({success:true, role})
    } catch (error) {
        return res.status(500).json({success:false, message:error.message})
    }
}

export const editRole = async(req,res)=>{
    try {
        const _id = req.params.id
        let roleExist = await Roles.findOne({_id}) 
        
        if(!roleExist){
            return res.status(404).send('Couldn\'t find role')
        }
        const name=req.body.name
        const slug = await getSlug(name, Roles)
        const editRole = await Roles.findOneAndUpdate({_id},{name, slug})
        
        if(!editRole){
            return res.status(500).json({messsae:'Couldn\'t update role'})
        }
        return res.status(200).json({success:true,role:editRole,message:"Role edited succesfully"})
    } catch (error) {
        return res.status(500).json({success:false, message:error.message})
    }
}

export const restoreRole = async(req,res)=>{
    try {
        const _id = req.params.id
        let roleExist = await Roles.findOne({_id})
        if(!roleExist){
            return res.status(404).json({message:'Couldn\'t find role'})
        }
        const isDeleted = await Roles.findOneAndUpdate({_id}, {isDeleted:false})
        if(!isDeleted){
            return res.status(500).json({message:'Couldn\'t restore role'})
        }
        return res.status(200).json({success:true,message:"Role restore succesfully"})
    } catch (error) {
        return res.status(500).json({success:false, message:error.message})
    }
}

export const deleteRole = async(req,res)=>{
    
    try {
        const _id = req.params.id
        let roleExist = await Roles.findOne({_id})
        if(!roleExist){
            return res.status(404).json({message:'Couldn\'t find role'})
        }
        const isDeleted = await Roles.findOneAndUpdate({_id}, {isDeleted:true})

        if(!isDeleted){
            return res.status(500).json({message:'Couldn\'t delete role'})
        }
        
        return res.status(200).json({success:true,message:"Role deleted succesfully"})
    } catch (error) {
        return res.status(500).json({success:false, message:error.message})
    }
}
