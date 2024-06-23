import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      return mongoose;
    }).catch(error => {
      if (error instanceof Error) {
        console.error('Error connecting to MongoDB:', error.message, error.stack);
      } else {
        console.error('Unknown error connecting to MongoDB:', error);
      }
      throw error;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;

declare global {
  // Allow global `var` declarations
  // eslint-disable-next-line no-var
  var mongoose: any;
}
