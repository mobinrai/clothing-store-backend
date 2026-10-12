import express from 'express'
import {
    createUser,
    login,
    logout,
    me
} from '../controllers/authController.js'
import auth from '../middleware/AuthMiddleware.js'

const router=express.Router()

router.post('/register', createUser)
router.post('/login', login)
router.post('/logout',auth, logout)
router.get('/me', auth, me)

export default router