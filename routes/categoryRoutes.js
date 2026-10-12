import express from 'express'
import {
  getAllCategories,
  getCategory,
  createCategory,
  editCategory,
  deleteCategory
} from '../controllers/categoryController.js'
import { upload } from '../utils/multer.js'

const router = express.Router()

router.get('/', getAllCategories)
router.get('/:id', getCategory)
router.post('/', upload.single('image'), createCategory)
router.patch('/:id/edit', upload.single('image'), editCategory)
router.delete('/:id/delete', deleteCategory)

export default router
