import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

/**
 * Profile Model
 * 
 * Stores detailed information about a user's professional background, skills, and preferences
 * for finding a co-founder. This model is used to populate the user's public profile, power
 * the matching algorithm, and provide data for the founder search functionality. It is closely
 * linked to the User model and is essential for the core matching features of the platform.
 */

// Define interfaces for nested objects
interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
}

interface IWorkExperience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description: string;
}

interface ISkill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

// Define the interface for the Profile document
export interface IProfile extends Document {
  user: IUser['_id'];
  education: IEducation[];
  workExperience: IWorkExperience[];
  achievements: string[];
  skills: ISkill[];
  expertise: string[];
  businessIdeas: string[];
  industryPreferences: string[];
  desiredSkills: string[];
  workStyle: string;
  commitmentLevel: 'Full-time' | 'Part-time' | 'Flexible';
  linkedInUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
}

// Create the Mongoose schema
const ProfileSchema: Schema = new Schema({
  // Reference to User model
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  // Professional background
  education: [{
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date }
  }],
  workExperience: [{
    company: { type: String, required: true },
    position: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    description: { type: String }
  }],
  achievements: [{ type: String }],

  // Skills and expertise
  skills: [{
    name: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], required: true }
  }],
  expertise: [{ type: String }],

  // Business information
  businessIdeas: [{ type: String }],
  industryPreferences: [{ type: String }],

  // Co-founder preferences
  desiredSkills: [{ type: String }],
  workStyle: { type: String },
  commitmentLevel: { type: String, enum: ['Full-time', 'Part-time', 'Flexible'], required: true },

  // Social links
  linkedInUrl: { type: String },
  githubUrl: { type: String },
  twitterUrl: { type: String }
}, { timestamps: true });

// Add any pre-save hooks, methods, or statics here

// Create and export the Profile model
const Profile = mongoose.model<IProfile>('Profile', ProfileSchema);
export default Profile;

// Export the ProfileSchema for potential use in other schemas
export { ProfileSchema };
