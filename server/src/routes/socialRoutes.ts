import { Router } from 'express';
import {
  facebookAuth,
  facebookCallback,
  getConnectedAccounts,
  disconnectAccount,
  getFacebookPageInfo
} from '../controllers/socialAuthController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// OAuth endpoints (public, but they use the token in query string)
router.get('/auth/facebook', facebookAuth);
router.get('/auth/facebook/callback', facebookCallback);

// API endpoints (require auth header)
router.get('/accounts', authenticate, getConnectedAccounts);
router.delete('/accounts/:platform', authenticate, disconnectAccount);
router.get('/facebook/page-info', authenticate, getFacebookPageInfo);

export default router;
