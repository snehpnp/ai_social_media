import { Request, Response } from 'express';
import { prisma } from '../index';

// GET /api/dashboard/stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const isAdmin = user.role === 'ADMIN';

    // Base filter: admin sees all, user sees own
    const userFilter = isAdmin ? {} : { userId: user.userId };

    // Total Users (admin only)
    const totalUsers = isAdmin
      ? await prisma.user.count()
      : 0;

    // Posts counts
    const totalPosts = await prisma.post.count({ where: userFilter });
    const publishedPosts = await prisma.post.count({ where: { ...userFilter, status: 'PUBLISHED' } });
    const scheduledPosts = await prisma.post.count({ where: { ...userFilter, status: 'SCHEDULED' } });
    const draftPosts = await prisma.post.count({ where: { ...userFilter, status: 'DRAFT' } });
    const failedPosts = await prisma.post.count({ where: { ...userFilter, status: 'FAILED' } });

    // Social accounts count
    const socialAccounts = isAdmin
      ? await prisma.socialAccount.count()
      : await prisma.socialAccount.count({ where: { userId: user.userId } });

    // AI Usage
    const aiUsage = isAdmin
      ? await prisma.user.aggregate({ _sum: { aiUsageCount: true } })
      : await prisma.user.findUnique({ where: { id: user.userId }, select: { aiUsageCount: true } });

    const totalAiUsage = isAdmin
      ? (aiUsage as any)?._sum?.aiUsageCount || 0
      : (aiUsage as any)?.aiUsageCount || 0;

    // Recent posts (last 10)
    const recentPosts = await prisma.post.findMany({
      where: userFilter,
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { name: true, email: true } } },
    });

    // Posts per month (last 12 months) for chart
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const postsRaw = await prisma.post.findMany({
      where: {
        ...userFilter,
        createdAt: { gte: twelveMonthsAgo },
      },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by month
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData: { name: string; posts: number; published: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.getMonth();
      const year = d.getFullYear();
      const postsInMonth = postsRaw.filter((p) => {
        const pd = new Date(p.createdAt);
        return pd.getMonth() === month && pd.getFullYear() === year;
      });
      chartData.push({
        name: monthNames[month],
        posts: postsInMonth.length,
        published: postsInMonth.filter((p) => p.status === 'PUBLISHED').length,
      });
    }

    // Recent activity (latest 5 posts with status info)
    const recentActivity = recentPosts.slice(0, 5).map((p) => ({
      id: p.id,
      title: p.caption ? (p.caption.length > 50 ? p.caption.substring(0, 50) + '...' : p.caption) : 'Untitled Post',
      status: p.status,
      platforms: p.platforms,
      time: p.createdAt,
      userName: p.user.name || p.user.email,
    }));

    // Plan distribution (admin only)
    let planDistribution = null;
    if (isAdmin) {
      const free = await prisma.user.count({ where: { plan: 'FREE' } });
      const basic = await prisma.user.count({ where: { plan: 'BASIC' } });
      const pro = await prisma.user.count({ where: { plan: 'PRO' } });
      planDistribution = { free, basic, pro };
    }

    res.json({
      stats: {
        totalUsers,
        totalPosts,
        publishedPosts,
        scheduledPosts,
        draftPosts,
        failedPosts,
        socialAccounts,
        totalAiUsage,
      },
      chartData,
      recentActivity,
      planDistribution,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};
