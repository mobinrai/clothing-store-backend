import express from 'express'
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js'
import { upload } from '../utils/multer.js';
import auth from '../middleware/AuthMiddleware.js';

const router=express.Router()

router.post("/", upload.any(), auth, createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.patch("/:id/edit",upload.any(),auth, updateProduct);
router.delete("/:id/delete", deleteProduct);

export default router 

