import UserModel from '../models/userModel.js'

import { getSlug } from '../utils/slug.js'

export const getAllUsers = async (req,res)=>{
    const roles = await UserModel.find()
    return res.status(200).send(roles)
}


export const editUser = async(req,res)=>{
    try {
        const _id = req.params.id
        let roleExist = await UserModel.findOne({_id}) 
        
        if(!roleExist){
            return res.status(404).send('Couldn\'t find role')
        }
        const name=req.body.name
        const slug = await getSlug(name, UserModel)
        const editUser = await UserModel.findOneAndUpdate({_id},{name, slug},{new:true})
        
        if(!editUser){
            return res.status(500).send('Couldn\'t update role')
        }
        return res.status(200).json(editUser)
    } catch (error) {
        return res.status(500).json({success:false, message:error.message})
    }
}

export const deleteUser = async(req,res)=>{
    try {
       const _id = req.params.id

        let roleExist = await UserModel.findOne({_id})
        if(!roleExist){
            return res.status(404).send('Couldn\'t find role')
        }

        const isDeleted = await UserModel.findOneAndUpdate({_id}, {isDeleted:true}, {new:true})

        if(!isDeleted){
            return res.status(500).send('Couldn\'t delete role')
        }
        
        return res.status(200).json({success:true, message:"User deleted succesfully"}) 
    } catch (error) {
        return res.status(500).json({success:false, message:error.message})
    }
    
}


