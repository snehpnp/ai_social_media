import { Request, Response } from 'express';
import { prisma } from '../index';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config';

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
    return res.redirect(`${CONFIG.OAUTH.FACEBOOK.FRONTEND_REDIRECT}?error=InvalidToken`);
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
      const redirectUri = CONFIG.OAUTH.FACEBOOK.REDIRECT_URI;

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
    // Redirect to frontend
    res.redirect(`${CONFIG.OAUTH.FACEBOOK.FRONTEND_REDIRECT}?success=facebook_connected`);
  } catch (error) {
    console.error('FB Callback Error:', error);
    res.redirect(`${CONFIG.OAUTH.FACEBOOK.FRONTEND_REDIRECT}?error=AuthFailed`);
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

// GET /api/social/facebook/page-info - Get connected Facebook page details
export const getFacebookPageInfo = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Get user's Facebook account
    const fbAccount = await prisma.socialAccount.findFirst({
      where: { userId: user.userId, platform: 'facebook' },
    });

    if (!fbAccount) {
      return res.status(404).json({ message: 'Facebook account not connected' });
    }

    // Fetch pages using the access token
    try {
      const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${fbAccount.accessToken}`);
      const pagesData = await pagesRes.json();
      
      if (pagesData.error) {
        return res.status(400).json({ message: 'Failed to fetch pages', error: pagesData.error.message });
      }

      const pages = pagesData.data || [];
      
      if (pages.length === 0) {
        return res.status(404).json({ 
          message: 'No Facebook Pages found',
          account: {
            username: fbAccount.username,
            platformId: fbAccount.platformId,
            connectedAt: fbAccount.updatedAt,
          }
        });
      }

      // Get detailed info for the first page - fetch all available real-time data
      const page = pages[0];
      const pageToken = page.access_token;
      
      // Fetch comprehensive page details from Facebook API
      const pageDetailsRes = await fetch(
        `https://graph.facebook.com/v19.0/${page.id}?fields=name,fan_count,followers_count,link,picture,category,posts.limit(0).summary(true),engagement,unread_message_count,unseen_message_count,new_like_count,verified,talking_about_count&access_token=${pageToken}`
      );
      const pageDetails = await pageDetailsRes.json();

      // Fetch recent posts (last 5) for more detailed info
      const recentPostsRes = await fetch(
        `https://graph.facebook.com/v19.0/${page.id}/posts?fields=id,message,created_time,permalink_url,likes.summary(true),comments.summary(true),shares&limit=5&access_token=${pageToken}`
      );
      const recentPostsData = await recentPostsRes.json();

      res.json({
        account: {
          username: fbAccount.username,
          platformId: fbAccount.platformId,
          connectedAt: fbAccount.updatedAt,
        },
        page: {
          id: page.id,
          name: pageDetails.name || page.name,
          likes: pageDetails.fan_count || 0,
          followers: pageDetails.followers_count || 0,
          posts: pageDetails.posts?.summary?.total_count || 0,
          talking_about: pageDetails.talking_about_count || 0,
          engagement: pageDetails.engagement || 0,
          verified: pageDetails.verified || false,
          unread_messages: pageDetails.unread_message_count || 0,
          new_likes: pageDetails.new_like_count || 0,
          link: pageDetails.link || `https://facebook.com/${page.id}`,
          picture: pageDetails.picture?.data?.url || null,
          category: pageDetails.category || 'Page',
          recent_posts: recentPostsData.data || [],
        }
      });
    } catch (fetchError) {
      res.status(500).json({ message: 'Error fetching from Facebook API', error: (fetchError as Error).message });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch page info' });
  }
};
