import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import { S3 } from 'aws-sdk';
import fs from 'fs';
import dbConnect from '../../../../lib/mongoose';
import User from '../../../../models/User';
import { verifyToken } from '../../../../lib/auth/tokenUtils';

export const config = {
  api: {
    bodyParser: false,
  },
};

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const userId = req.query.user_id as string;

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const decoded = verifyToken(token);
  if (!decoded || decoded.userId !== userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await dbConnect();

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error parsing form data' });
    }

    const file = files.image as any;
    if (!file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type' });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return res.status(400).json({ message: 'File size exceeds 5MB limit' });
    }

    try {
      const fileContent = fs.readFileSync(file.filepath);
      const fileName = `${userId}-${Date.now()}-${file.originalFilename}`;

      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME as string,
        Key: fileName,
        Body: fileContent,
        ContentType: file.mimetype,
      };

      const uploadResult = await s3.upload(params).promise();

      const user = await User.findByIdAndUpdate(
        userId,
        { profilePicture: uploadResult.Location },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        message: 'Profile picture updated successfully',
        imageUrl: uploadResult.Location,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Error uploading file' });
    } finally {
      // Clean up the temp file
      fs.unlinkSync(file.filepath);
    }
  });
}
