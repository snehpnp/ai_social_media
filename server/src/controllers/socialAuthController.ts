import { Request, Response } from 'express';
import { prisma } from '../index';
import jwt from 'jsonwebtoken';

const FRONTEND_URL = 'http://localhost:3000/settings';

// Helper to get user ID from token in query or cookie
const getUserIdFromState = (state: string) => {
  try {
    const decoded = jwt.verify(state, process.env.JWT_SECRET || 'supersecret') as any;
    return decoded.userId;
  } catch {
    return null;
  }
};

// Helper to get settings from DB
const getSetting = async (key: string, envFallback: string | undefined) => {
  const setting = await prisma.systemSetting.findUnique({ where: { key } });
  return setting?.value || envFallback;
};

export const facebookAuth = async (req: Request, res: Response) => {
  const appId = await getSetting('FACEBOOK_APP_ID', process.env.FACEBOOK_APP_ID);
  const token = req.query.token as string;
  
  // If no App ID is set OR it's still the default placeholder from .env
  if (!appId || appId === 'your_fb_app_id') {
    // Simulated flow for testing if no real App ID is configured
    return res.redirect(`/api/social/auth/facebook/callback?simulated=true&state=${token}`);
  }

  const redirectUri = encodeURIComponent(`http://localhost:5000/api/social/auth/facebook/callback`);
  const scope = encodeURIComponent('pages_show_list,pages_read_engagement,pages_manage_posts');
  const fbUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&state=${token}&scope=${scope}`;
  
  res.redirect(fbUrl);
};

export const facebookCallback = async (req: Request, res: Response) => {
  const { code, state, simulated } = req.query;
  const userId = getUserIdFromState(state as string);

  if (!userId) {
    return res.redirect(`${FRONTEND_URL}?error=InvalidToken`);
  }

  try {
    let accessToken = '';
    let platformId = '';
    let username = '';

    if (simulated === 'true') {
      accessToken = 'simulated_fb_token_' + Date.now();
      platformId = 'simulated_fb_user_123';
      username = 'Test Facebook Page';
    } else {
      // Real token exchange
      const appId = await getSetting('FACEBOOK_APP_ID', process.env.FACEBOOK_APP_ID);
      const appSecret = await getSetting('FACEBOOK_APP_SECRET', process.env.FACEBOOK_APP_SECRET);
      const redirectUri = `http://localhost:5000/api/social/auth/facebook/callback`;

      const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`);
      const tokenData = await tokenRes.json();
      
      if (tokenData.error) throw new Error(tokenData.error.message);
      accessToken = tokenData.access_token;

      // Get user profile
      const profileRes = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}`);
      const profileData = await profileRes.json();
      platformId = profileData.id;
      username = profileData.name;
    }

    // Save to database
    await prisma.socialAccount.upsert({
      where: {
        userId_platform_platformId: { userId, platform: 'facebook', platformId }
      },
      update: { accessToken, username, updatedAt: new Date() },
      create: {
        userId,
        platform: 'facebook',
        platformId,
        accessToken,
        username,
      }
    });

    res.redirect(`${FRONTEND_URL}?success=facebook_connected`);
  } catch (error) {
    console.error('FB Callback Error:', error);
    res.redirect(`${FRONTEND_URL}?error=AuthFailed`);
  }
};

// GET /api/social/accounts - Get connected accounts for the user
export const getConnectedAccounts = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const accounts = await prisma.socialAccount.findMany({
      where: { userId: user.userId },
      select: { id: true, platform: true, username: true, updatedAt: true }
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch accounts' });
  }
};

export const disconnectAccount = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { platform } = req.params;
    
    await prisma.socialAccount.deleteMany({
      where: { userId: user.userId, platform }
    });
    
    res.json({ message: 'Account disconnected' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to disconnect account' });
  }
};
