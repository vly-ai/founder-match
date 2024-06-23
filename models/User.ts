import mongoose, { Document, Schema } from 'mongoose';

/**
 * User Model
 * 
 * Represents a user of the founder-match platform. This model stores essential user information,
 * authentication details, profile completion status, and user preferences. It also manages
 * relationships with other users, such as blocked users and saved profiles. The User model
 * is central to the application, linking to other models like Profile, Conversation, and Match.
 */

// Define the interface for the User document
export interface IUser extends Document {
  email: string;
  password: string;
  isEmailVerified: boolean;
  name: string;
  profilePicture?: string;
  location?: string;
  oauthProviders: Array<{ provider: string; id: string }>;
  createdAt: Date;
  lastLogin: Date;
  blockedUsers: mongoose.Types.ObjectId[];
  savedProfiles: mongoose.Types.ObjectId[];
  profileCompletionPercentage: number;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacySettings: {
    profileVisibility: 'public' | 'private' | 'matches';
    showLocation: boolean;
  };
}

// Create the Mongoose schema
const UserSchema: Schema = new Schema({
  // Authentication fields
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  isEmailVerified: { type: Boolean, default: false },

  // Profile fields
  name: { type: String, required: true, trim: true },
  profilePicture: { type: String },
  location: { type: String },

  // OAuth fields
  oauthProviders: [{
    provider: { type: String, required: true },
    id: { type: String, required: true }
  }],

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },

  // Relationships
  blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  savedProfiles: [{ type: Schema.Types.ObjectId, ref: 'User' }],

  // Profile completion
  profileCompletionPercentage: { type: Number, default: 0, min: 0, max: 100 },

  // User settings
  notificationPreferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  privacySettings: {
    profileVisibility: { type: String, enum: ['public', 'private', 'matches'], default: 'public' },
    showLocation: { type: Boolean, default: true }
  }
}, { timestamps: true });

// Add any pre-save hooks, methods, or statics here

// Create and export the User model
const User = mongoose.model<IUser>('User', UserSchema);
export default User;

// Export the UserSchema for potential use in other schemas
export { UserSchema };
