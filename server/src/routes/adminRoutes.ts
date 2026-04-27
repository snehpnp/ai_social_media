import { Router } from 'express';
import { 
  createUserByAdmin, getAllUsers, getUserById, updateUserByAdmin, deleteUserByAdmin,
  getSystemSettings, updateSystemSettings, getUserPosts
} from '../controllers/adminController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);
router.use(authorize(['ADMIN']));

// Users
router.post('/users', createUserByAdmin);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.get('/users/:id/posts', getUserPosts);
router.put('/users/:id', updateUserByAdmin);
router.delete('/users/:id', deleteUserByAdmin);

// Settings
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

export default router;
