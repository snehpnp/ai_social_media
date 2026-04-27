import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middlewares/authMiddleware';

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

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post || post.userId !== userId) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await prisma.post.delete({
      where: { id },
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

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post || post.userId !== userId) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

import axios from 'axios';

export const publishPostToFacebook = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const post = await prisma.post.findUnique({ where: { id } });

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
      // Real Facebook API integration
      // If there's an image, post to /me/photos, otherwise /me/feed
      let fbResponse;
      const hasMedia = post.mediaUrls && post.mediaUrls.length > 0;
      
      if (hasMedia) {
        try {
           fbResponse = await axios.post(`https://graph.facebook.com/v19.0/me/photos`, {
            url: post.mediaUrls[0], // Only works if this is a public URL. Base64 will fail here.
            caption: post.caption,
            access_token: fbAccount.accessToken
          });
        } catch (apiError: any) {
          throw new Error(JSON.stringify(apiError.response?.data || apiError.message));
        }
      } else {
        // Text-only post
        try {
          fbResponse = await axios.post(`https://graph.facebook.com/v19.0/me/feed`, {
            message: post.caption,
            access_token: fbAccount.accessToken
          });
        } catch (apiError: any) {
          throw new Error(JSON.stringify(apiError.response?.data || apiError.message));
        }
      }

      // Mark as published in our database
      const updatedPost = await prisma.post.update({
        where: { id },
        data: { 
          status: 'PUBLISHED',
          errorTrace: null // clear any previous errors
        },
      });

      res.status(200).json({ 
        message: 'Successfully published to Facebook', 
        post: updatedPost,
        facebookPostId: fbResponse.data.id 
      });

    } catch (publishError: any) {
      // Complete failure - capture the exact error trace
      const errorMsg = publishError.response?.data ? JSON.stringify(publishError.response.data) : publishError.message;
      
      await prisma.post.update({
        where: { id },
        data: { 
          status: 'FAILED',
          errorTrace: errorMsg
        },
      });
      
      return res.status(500).json({ 
        message: 'Failed to publish to Facebook', 
        error: errorMsg 
      });
    }

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
