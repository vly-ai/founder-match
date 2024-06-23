import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongoose';
import User from '../../../models/User';
import Profile from '../../../models/Profile';
import { profileSchema } from '../../../lib/validation/profileSchema';
import { verifyToken } from '../../../lib/auth/tokenUtils';
import { calculateProfileCompletion } from '../../../lib/utils/profileCompletion';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;
  const userId = query.user_id as string;

  await dbConnect();

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.userId !== userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  switch (method) {
    case 'GET':
      try {
        const profile = await Profile.findOne({ user: userId });
        if (!profile) {
          return res.status(404).json({ message: 'Profile not found' });
        }
        res.status(200).json(profile);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
      }
      break;

    case 'POST':
    case 'PUT':
      try {
        const validatedData = await profileSchema.validate(body, { abortEarly: false });
        let profile = await Profile.findOne({ user: userId });

        if (!profile) {
          profile = new Profile({ user: userId, ...validatedData });
        } else {
          Object.assign(profile, validatedData);
        }

        await profile.save();

        const completionPercentage = calculateProfileCompletion(profile);
        await User.findByIdAndUpdate(userId, { profileCompletionPercentage: completionPercentage });

        res.status(200).json({ profile, completionPercentage });
      } catch (error) {
        if (error.name === 'ValidationError') {
          res.status(400).json({ message: 'Validation error', errors: error.errors });
        } else {
          res.status(500).json({ message: 'Error updating profile' });
        }
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
