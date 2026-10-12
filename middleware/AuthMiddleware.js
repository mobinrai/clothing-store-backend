import mongoose from "mongoose";
import UserModel from '../models/userModel.js'
import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
       
        const user = await UserModel.findById({ _id: new mongoose.Types.ObjectId(decoded.id) }).populate('role', 'id name');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (decoded.tokenVersion !== user.tokenVersion) {
            return res.status(404).json({ message: 'Token already expired' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(error.name)
        let statusCode = 401;
        let errorCode = 'AUTH_FAILED';
        let message = 'Authentication failed';

        if (error.name === 'TokenExpiredError') {
            statusCode = 401;
            errorCode = 'TOKEN_EXPIRED';
            message = 'Your session has expired. Please login again.';
        } else if (error.name === 'JsonWebTokenError') {
            statusCode = 401;
            errorCode = 'INVALID_TOKEN';
            message = 'Invalid authentication token.';
        } else if (error.name === 'JWTError') {
            statusCode = error.statusCode || 401;
            errorCode = error.errorCode || 'JWT_ERROR';
            message = error.message;
        }

        res.status(statusCode).json({
            success: false,
            message: message,
            errorCode: errorCode,
            timestamp: new Date().toISOString()
        });
    }
};

export default auth;