import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';

/**
 * Conversation Model
 * 
 * Manages the messaging system between users. This model stores all messages
 * exchanged between two users, including text content and file attachments.
 * It supports the real-time messaging feature, tracks read status of messages,
 * and helps in organizing conversations on the user's dashboard and messaging interface.
 */

// Define the interface for the Message subdocument
export interface IMessage {
  sender: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
  readStatus: boolean;
  attachments?: Array<{
    fileUrl: string;
    fileName: string;
    fileType: string;
  }>;
}

// Define the interface for the Conversation document
export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  messages: IMessage[];
  lastMessageTimestamp: Date;
}

// Create the Message subdocument schema
const MessageSchema: Schema = new Schema({
  // Reference to the User who sent the message
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // The text content of the message
  content: { type: String, required: true },
  // Timestamp of when the message was sent
  timestamp: { type: Date, default: Date.now },
  // Whether the message has been read by the recipient
  readStatus: { type: Boolean, default: false },
  // Array of file attachments
  attachments: [{
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true }
  }]
});

// Create the Conversation schema
const ConversationSchema: Schema = new Schema({
  // Array of User IDs involved in the conversation
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  // Array of message objects
  messages: [MessageSchema],
  // Timestamp of the last message for sorting and preview purposes
  lastMessageTimestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Add index for faster querying of conversations by participants
ConversationSchema.index({ participants: 1 });

// Add index for sorting conversations by last message timestamp
ConversationSchema.index({ lastMessageTimestamp: -1 });

// Method to add a new message to the conversation
ConversationSchema.methods.addMessage = function(senderId: mongoose.Types.ObjectId, content: string, attachments?: IMessage['attachments']) {
  const newMessage: IMessage = {
    sender: senderId,
    content,
    timestamp: new Date(),
    readStatus: false,
    attachments
  };
  this.messages.push(newMessage);
  this.lastMessageTimestamp = newMessage.timestamp;
  return this.save();
};

// Static method to find or create a conversation between two users
ConversationSchema.statics.findOrCreateConversation = async function(participantIds: mongoose.Types.ObjectId[]) {
  let conversation = await this.findOne({ participants: { $all: participantIds } });
  if (!conversation) {
    conversation = new this({ participants: participantIds });
    await conversation.save();
  }
  return conversation;
};

// Create and export the Conversation model
const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
export default Conversation;

// Export the ConversationSchema and MessageSchema for potential use in other schemas
export { ConversationSchema, MessageSchema };
