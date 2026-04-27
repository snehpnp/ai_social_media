import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middlewares/authMiddleware';
import { addPostToQueue } from '../services/queueService';
import axios from 'axios';
import FormData from 'form-data';

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { caption, mediaUrls, platforms, scheduledAt } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const post = await prisma.post.create({
      data: {
        userId,
        caption,
        mediaUrls,
        platforms,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
      },
    });

    // If post is scheduled, add to queue
    if (scheduledAt) {
      await addPostToQueue(post.id, new Date(scheduledAt));
    }

    res.status(201).json(post);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPosts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const posts = await prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(posts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const postId = id as string;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.userId !== userId) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const postId = id as string;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.userId !== userId) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const postId = id as string;
    const { scheduledAt } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || post.userId !== userId) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Update the scheduled time
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        scheduledAt: scheduledAt ? new Date(scheduledAt) : post.scheduledAt,
      },
    });

    // If the post is scheduled, update the queue
    if (post.status === 'SCHEDULED' && scheduledAt) {
      const { addPostToQueue } = await import('../services/queueService');
      await addPostToQueue(postId, new Date(scheduledAt));
    }

    res.status(200).json(updatedPost);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const publishPostToFacebook = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const postId = id as string;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post || post.userId !== userId) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.status === 'PUBLISHED') {
      return res.status(400).json({ message: 'Post is already published' });
    }

    // Check for Facebook connection
    const fbAccount = await prisma.socialAccount.findFirst({
      where: { userId, platform: 'facebook' },
    });

    if (!fbAccount || !fbAccount.accessToken) {
      return res.status(400).json({ message: 'Facebook account not connected or missing access token' });
    }

    try {
      // Step 1: Get user's pages using the user access token
      const accountsRes = await axios.get(`https://graph.facebook.com/v19.0/me/accounts`, {
        params: { access_token: fbAccount.accessToken }
      });

      const pages = accountsRes.data?.data || [];
      
      if (pages.length === 0) {
        return res.status(400).json({ 
          message: 'No Facebook Pages found', 
          error: 'You need to be an admin of at least one Facebook Page to publish posts. Please create a page or ask your page admin to add you.' 
        });
      }

      // Use the first page (or you could let user select which page)
      const page = pages[0];
      const pageId = page.id;
      const pageAccessToken = page.access_token;

      console.log('Publishing to page:', page.name, 'ID:', pageId);

      // Step 2: Publish to the page using Page Access Token
      let fbResponse;
      const postWithArrays = post as { mediaUrls: string[] };
      const hasMedia = postWithArrays.mediaUrls && postWithArrays.mediaUrls.length > 0;
      
      if (hasMedia) {
        const mediaUrl = postWithArrays.mediaUrls[0];
        
        // Check if it's a base64 data URL
        if (mediaUrl.startsWith('data:')) {
          // Handle base64 image upload using multipart/form-data
          const formData = new FormData();
          
          // Extract base64 data
          const base64Data = mediaUrl.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          
          // Determine content type from data URL
          const mimeType = mediaUrl.split(';')[0].split(':')[1] || 'image/png';
          
          formData.append('source', buffer, {
            filename: 'image.png',
            contentType: mimeType,
          });
          formData.append('caption', post.caption);
          formData.append('access_token', pageAccessToken);
          
          fbResponse = await axios.post(
            `https://graph.facebook.com/v19.0/${pageId}/photos`,
            formData,
            {
              headers: formData.getHeaders(),
            }
          );
        } else {
          // For regular URLs, use the existing approach
          fbResponse = await axios.post(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
            url: mediaUrl,
            caption: post.caption,
            access_token: pageAccessToken
          });
        }
      } else {
        // Text-only post to page feed
        fbResponse = await axios.post(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
          message: post.caption,
          access_token: pageAccessToken
        });
      }

      // Mark as published in our database
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: { 
          status: 'PUBLISHED',
          publishedAt: new Date(),
          errorTrace: null as any
        },
      });

      res.status(200).json({ 
        message: 'Successfully published to Facebook Page', 
        post: updatedPost,
        facebookPostId: fbResponse.data.id,
        pageName: page.name
      });

    } catch (publishError: any) {
      // Capture the exact error
      const errorMsg = publishError.response?.data ? JSON.stringify(publishError.response.data) : publishError.message;
      
      console.error('Facebook publish error:', errorMsg);
      
      await prisma.post.update({
        where: { id: postId },
        data: { 
          status: 'FAILED',
          errorTrace: errorMsg as any
        },
      });
      
      // Provide user-friendly error messages
      let userMessage = 'Failed to publish to Facebook';
      if (errorMsg.includes('(#200)')) {
        userMessage = 'Permission denied. Make sure you have admin access to a Facebook Page and the app has the required permissions (pages_manage_posts, pages_read_engagement).';
      } else if (errorMsg.includes('url') || errorMsg.includes('photo')) {
        userMessage = 'Failed to upload photo. Make sure the image URL is publicly accessible.';
      }
      
      return res.status(500).json({ 
        message: userMessage, 
        error: errorMsg 
      });
    }

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
