import { Router } from 'express';
import {
  listProviders,
  connectProvider,
  testProvider,
  updateProvider,
  disconnectProvider,
  generateContent,
} from '../controllers/aiProviderController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin-only: manage providers
router.get('/', authorize(['ADMIN']), listProviders);
router.post('/', authorize(['ADMIN']), connectProvider);
router.post('/:slug/test', authorize(['ADMIN']), testProvider);
router.put('/:slug', authorize(['ADMIN']), updateProvider);
router.delete('/:slug', authorize(['ADMIN']), disconnectProvider);

// All users: generate content
router.post('/generate', generateContent);

export default router;
