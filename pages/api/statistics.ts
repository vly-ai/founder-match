import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongoose';
import User from '../../models/User';
import Match from '../../models/Match';
import Statistics from '../../models/Statistics';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const stats = await Statistics.getStatistics();
    const totalUsers = await User.countDocuments();
    const successfulMatches = await Match.countDocuments({ status: 'accepted' });

    const updatedStats = await Statistics.updateStatistics({
      totalUsers,
      successfulMatches,
      totalMatches: stats.totalMatches + successfulMatches,
    });

    res.status(200).json(updatedStats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
}
