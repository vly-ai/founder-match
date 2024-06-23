import mongoose, { Document, Schema } from 'mongoose';

/**
 * Statistics Model
 * 
 * Stores aggregate platform statistics for display on the homepage and admin dashboard.
 * This model helps in tracking the overall growth and success of the platform, providing
 * key metrics that can be used for marketing purposes and to attract new users to the service.
 * 
 * The Statistics model is designed to be a singleton, with only one document in the collection
 * that gets updated regularly. This approach ensures efficient querying and updating of
 * platform-wide statistics.
 */

// Define the interface for the Statistics document
export interface IStatistics extends Document {
  totalUsers: number;
  totalMatches: number;
  successfulMatches: number;
  activeUsers: {
    last24Hours: number;
    last7Days: number;
    last30Days: number;
  };
  lastUpdated: Date;
}

// Create the Mongoose schema
const StatisticsSchema: Schema = new Schema({
  // Total number of users registered on the platform
  totalUsers: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },

  // Total number of matches made
  totalMatches: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },

  // Number of successful matches (accepted and ongoing)
  successfulMatches: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },

  // Number of active users within specific time frames
  activeUsers: {
    last24Hours: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    last7Days: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    last30Days: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    }
  },

  // Timestamp of the last update to ensure data freshness
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// Add a pre-save hook to update the lastUpdated field
StatisticsSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to get or create the singleton statistics document
StatisticsSchema.statics.getStatistics = async function() {
  let stats = await this.findOne();
  if (!stats) {
    stats = await this.create({});
  }
  return stats;
};

// Static method to update statistics
StatisticsSchema.statics.updateStatistics = async function(update: Partial<IStatistics>) {
  const stats = await this.getStatistics();
  Object.assign(stats, update);
  return stats.save();
};

// Create and export the Statistics model
const Statistics = mongoose.model<IStatistics>('Statistics', StatisticsSchema);
export default Statistics;

// Export the StatisticsSchema for potential use in other schemas
export { StatisticsSchema };
