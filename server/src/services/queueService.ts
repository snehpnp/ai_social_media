import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

export const postQueue = new Queue('post-scheduler', { connection });

export const addPostToQueue = async (postId: string, scheduledAt: Date) => {
  const delay = scheduledAt.getTime() - Date.now();
  
  if (delay > 0) {
    await postQueue.add('publish-post', { postId }, { delay });
  } else {
    await postQueue.add('publish-post', { postId });
  }
};

// Worker setup (To be moved to a separate file later if needed)
export const postWorker = new Worker(
  'post-scheduler',
  async (job) => {
    const { postId } = job.data;
    console.log(`Processing post: ${postId}`);
    // Logic to call social media APIs will go here
  },
  { connection }
);
