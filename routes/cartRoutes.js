import express from 'express'
import {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart

} from '../controllers/cartController.js'
import auth from '../middleware/AuthMiddleware.js'

const router=express.Router()

router.get("/", auth, getCart);

router.post("/add", auth, addToCart);

router.put("/:itemId", auth, updateCartItem);

router.delete("/:itemId", auth, removeCartItem);

router.delete("/", auth, clearCart);


export default router