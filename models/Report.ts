import mongoose, { Document, Schema } from 'mongoose';

/**
 * Report Model
 * 
 * Handles user reports for inappropriate behavior or content. This model is essential for
 * maintaining community standards and safety on the platform. It stores information about
 * reported incidents, allowing administrators to review and take necessary actions to
 * resolve issues between users.
 */

// Define the interface for the Report document
export interface IReport extends Document {
  reporter: mongoose.Types.ObjectId;
  reported: mongoose.Types.ObjectId;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
}

// Define the enum for report reasons
export enum ReportReason {
  HARASSMENT = 'harassment',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  SPAM = 'spam',
  FAKE_PROFILE = 'fake_profile',
  OTHER = 'other'
}

// Create the Mongoose schema
const ReportSchema: Schema = new Schema({
  // User ID of the user submitting the report
  reporter: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // User ID of the user being reported
  reported: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // Predefined category of the report
  reason: { 
    type: String, 
    enum: Object.values(ReportReason),
    required: true 
  },

  // Detailed explanation of the issue
  description: { 
    type: String, 
    required: true,
    maxlength: 1000 // Limit description to 1000 characters
  },

  // Current state of the report
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  },

  // Automatically set the creation timestamp
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Add index for faster queries on status and createdAt
ReportSchema.index({ status: 1, createdAt: -1 });

// Add any pre-save hooks, methods, or statics here

// Create and export the Report model
const Report = mongoose.model<IReport>('Report', ReportSchema);
export default Report;

// Export the ReportSchema for potential use in other schemas
export { ReportSchema };
