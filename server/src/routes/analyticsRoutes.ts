import { Router, Request, Response } from 'express';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, (req: Request, res: Response) => {
  // Dummy analytics data
  const analytics = {
    totalReach: 12500,
    followers: 2840,
    likes: 45200,
    shares: 1204,
    weeklyData: [
      { name: "Mon", reach: 4000, engagement: 2400 },
      { name: "Tue", reach: 3000, engagement: 1398 },
      { name: "Wed", reach: 2000, engagement: 9800 },
      { name: "Thu", reach: 2780, engagement: 3908 },
      { name: "Fri", reach: 1890, engagement: 4800 },
      { name: "Sat", reach: 2390, engagement: 3800 },
      { name: "Sun", reach: 3490, engagement: 4300 },
    ]
  };
  res.status(200).json(analytics);
});

export default router;
