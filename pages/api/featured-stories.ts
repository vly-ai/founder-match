import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/mongoose';
import Match from '../../models/Match';
import User from '../../models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const featuredMatches = await Match.find({ status: 'accepted' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('users', 'name profilePicture');

    const featuredStories = featuredMatches.map(match => ({
      id: match._id,
      founders: match.users.map((user: any) => ({
        name: user.name,
        profilePicture: user.profilePicture
      })),
      description: `Successful match made on ${match.createdAt.toLocaleDateString()}`,
    }));

    res.status(200).json(featuredStories);
  } catch (error) {
    console.error('Error fetching featured stories:', error);
    res.status(500).json({ message: 'Error fetching featured stories' });
  }
}
