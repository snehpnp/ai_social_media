import { prisma } from '../index';
import axios from 'axios';

// Simple in-memory scheduling without Redis
const scheduledPosts = new Map<string, NodeJS.Timeout>();

export const addPostToQueue = async (postId: string, scheduledAt: Date) => {
  const now = new Date();
  const delay = scheduledAt.getTime() - now.getTime();
  
  if (delay <= 0) {
    // Post should be published immediately
    await publishPost(postId);
  } else {
    // Schedule the post
    const timeoutId = setTimeout(() => {
      publishPost(postId);
    }, delay);
    
    scheduledPosts.set(postId, timeoutId);
    console.log(`Scheduled post ${postId} for ${scheduledAt.toISOString()}`);
  }
};

export const removePostFromQueue = (postId: string) => {
  const timeoutId = scheduledPosts.get(postId);
  if (timeoutId) {
    clearTimeout(timeoutId);
    scheduledPosts.delete(postId);
    console.log(`Removed post ${postId} from schedule`);
  }
};

async function publishPost(postId: string) {
  console.log(`Processing scheduled post: ${postId}`);
  scheduledPosts.delete(postId);

  try {
    // Fetch the post from database
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      console.error(`Post not found: ${postId}`);
      return;
    }

    if (post.status === 'PUBLISHED') {
      console.log(`Post ${postId} is already published, skipping`);
      return;
    }

    // Get user's Facebook account
    const fbAccount = await prisma.socialAccount.findFirst({
      where: { userId: post.userId, platform: 'facebook' },
    });

    if (!fbAccount || !fbAccount.accessToken) {
      console.error(`Facebook account not connected for user ${post.userId}`);
      await prisma.post.update({
        where: { id: postId },
        data: { 
          status: 'FAILED',
          errorTrace: 'Facebook account not connected or missing access token' as any
        },
      });
      return;
    }

    // Get user's pages
    const accountsRes = await axios.get(`https://graph.facebook.com/v19.0/me/accounts`, {
      params: { access_token: fbAccount.accessToken }
    });

    const pages = accountsRes.data?.data || [];
    
    if (pages.length === 0) {
      console.error(`No Facebook Pages found for user ${post.userId}`);
      await prisma.post.update({
        where: { id: postId },
        data: { 
          status: 'FAILED',
          errorTrace: 'No Facebook Pages found' as any
        },
      });
      return;
    }

    // Use the first page
    const page = pages[0];
    const pageId = page.id;
    const pageAccessToken = page.access_token;

    console.log(`Publishing post ${postId} to page: ${page.name} (ID: ${pageId})`);

    // Publish to the page
    const postWithArrays = post as { mediaUrls: string[] };
    const hasMedia = postWithArrays.mediaUrls && postWithArrays.mediaUrls.length > 0;
    
    if (hasMedia) {
      await axios.post(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
        url: postWithArrays.mediaUrls[0],
        caption: post.caption,
        access_token: pageAccessToken
      });
    } else {
      await axios.post(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
        message: post.caption,
        access_token: pageAccessToken
      });
    }

    // Mark as published
    await prisma.post.update({
      where: { id: postId },
      data: { 
        status: 'PUBLISHED',
        publishedAt: new Date(),
        errorTrace: null as any
      },
    });

    console.log(`Successfully published post ${postId} to Facebook`);
  } catch (error: any) {
    console.error(`Failed to publish post ${postId}:`, error.message);
    
    await prisma.post.update({
      where: { id: postId },
      data: { 
        status: 'FAILED',
        errorTrace: error.message as any
      },
    });
  }
}

// Load scheduled posts on startup (in case server restarted)
export const loadScheduledPosts = async () => {
  console.log('Loading scheduled posts from database...');
  const scheduledPostsFromDB = await prisma.post.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledAt: {
        gte: new Date()
      }
    }
  });

  for (const post of scheduledPostsFromDB) {
    if (post.scheduledAt) {
      await addPostToQueue(post.id, post.scheduledAt);
    }
  }
  
  console.log(`Loaded ${scheduledPostsFromDB.length} scheduled posts`);
};
