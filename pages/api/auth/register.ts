import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongoose';
import User from '../../../models/User';
import { registrationSchema } from '../../../lib/validation/authSchemas';
import { hashPassword } from '../../../lib/auth/passwordUtils';
import { generateVerificationToken } from '../../../lib/auth/tokenUtils';
import { sendVerificationEmail } from '../../../lib/email/sendEmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { email, password, name } = await registrationSchema.validate(req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = generateVerificationToken();

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      isEmailVerified: false,
    });

    await newUser.save();

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
}