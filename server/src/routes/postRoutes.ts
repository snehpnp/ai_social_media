import { Router } from 'express';
import { createPost, getPosts, deletePost, getPostById, publishPostToFacebook } from '../controllers/postController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', createPost);
router.get('/', getPosts);
router.get('/:id', getPostById);
router.delete('/:id', deletePost);
router.post('/:id/publish', publishPostToFacebook);

export default router;
