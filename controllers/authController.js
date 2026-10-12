import bcrypt from "bcrypt";
import UserModel from "../models/userModel.js";
import Roles from '../models/roleModel.js'
import jwt from "jsonwebtoken";

export const createUser = async(req,res)=>{
    try {
        const {email, firstName,lastName, password} = req.body
        const emailExists = await UserModel.findOne({email})

        if(emailExists){
            return res.status(400).json({message:'Email already exists.Please enter different email'})
        }
        const passwordHash = await hashPassword(password)
        const getRoleId = await Roles.findOne({name:'user'})

        const newUser = new UserModel({firstName, lastName, password:passwordHash, email, role:getRoleId._id})
        await newUser.save()

        if(!newUser){
            return res.status(500).json({message:'Couldn\'t register user.'})
        }
        
        const token = jwt.sign(
            { 
                id: newUser._id,
                roleId:newUser.role,
                tokenVersion: newUser.tokenVersion
             },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );
        return res.status(201).json({
            success:true,
            token,
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email
            }
        });
    } catch (error) {
        return res.status(500).json({success:false, message:error.message})
    }
}

export const login= async (req, res) => {
    try {
        if(!req.body){
            return res.status(500).json({ message: 'Email and password is missing' });
        }
        const { email, password } = req.body;

        const user = await UserModel.findOne({email}).populate('role', 'id name');
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.Email or Password is incorrect' });
        }

        const isMatch = await verifyPassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.Email or Password is incorrect' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {   id: user._id,
                roleId:user.role,
                tokenVersion: user.tokenVersion
             },
            process.env.JWT_SECRET,
            { expiresIn: '15m'}
        );

        return res.json({
            success:true,
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    roleName:user.role.name
                }
            });
    } catch (error) {
        return res.status(500).json({success:false, message:error.message})
    }
}

export const logout = async (req, res)=>{
    try{
        const userId = req?.user?._id
        if(!userId){
            return res.status(401).json({ message: 'User not found' });
        }
        const userLogout = await UserModel.findByIdAndUpdate(userId,{ $inc: { tokenVersion: 1 } })

        if(!userLogout){
            return res.status(500).json({ message:'Something went wrong.' });
        }
        return res.status(200).json({ success:true, message:'User logout successfully' });
    } catch (error) {
        return res.status(500).json({ message:error.message });
    }
}

export const me = async (req, res) => {
    try {
        return res.json({
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                roleName:req.user.role.name
            }
        });
    } catch (error) {
        return res.status(500).json({ message:error.message });
    }
}

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}