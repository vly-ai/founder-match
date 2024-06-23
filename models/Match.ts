import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

/**
 * Match Model
 *
 * Represents a potential or established match between two users. This model is crucial for the matching system,
 * storing the compatibility score, match status, and user feedback. It is used to display suggested matches,
 * track user responses to matches, and improve the matching algorithm based on user feedback.
 */

// Define the interface for the Feedback subdocument
export interface IFeedback {
  user: mongoose.Types.ObjectId | IUser;
  rating: number;
  comments?: string;
  createdAt: Date;
}

// Define the interface for the Match document
export interface IMatch extends Document {
  users: [mongoose.Types.ObjectId | IUser, mongoose.Types.ObjectId | IUser];
  compatibilityScore: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  feedback: IFeedback[];
}

// Create the Feedback schema
const FeedbackSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comments: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Create the Match schema
const MatchSchema: Schema = new Schema({
  // Array of two User IDs involved in the match
  users: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],

  // Compatibility score calculated by the matching algorithm
  compatibilityScore: { type: Number, required: true, min: 0, max: 100 },

  // Current status of the match
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },

  // Timestamp for when the match was created
  createdAt: { type: Date, default: Date.now },

  // Array of feedback objects from users
  feedback: [FeedbackSchema]
});

// Add index for efficient querying
MatchSchema.index({ users: 1, status: 1 });

// Validate that there are exactly two users in the match
MatchSchema.pre('save', function(next) {
  if (this.users.length !== 2) {
    next(new Error('A match must have exactly two users'));
  } else {
    next();
  }
});

// Create and export the Match model
const Match = mongoose.model<IMatch>('Match', MatchSchema);
export default Match;

// Export the MatchSchema and FeedbackSchema for potential use in other schemas
export { MatchSchema, FeedbackSchema };
