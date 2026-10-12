import express from 'express'
import {
  getAllRoles,
  getRole,
  createRole,
  editRole,
  deleteRole,
  restoreRole
} from '../controllers/roleController.js'

const router = express.Router()

router.get('/', getAllRoles)
router.get('/:slug', getRole)
router.post('/', createRole)
router.patch('/:id/edit', editRole)
router.patch('/:id/delete', deleteRole)
router.patch('/:id/restore', restoreRole)

export default router
