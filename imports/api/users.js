import { Mongo } from 'meteor/mongo';

export const UsersCollection = new Mongo.Collection('users');

// Define the structure for user documents:
// {
//   _id: ObjectId,
//   username: String,
//   password: String,  // In production, this should be hashed
//   role: String,      // 'Admin' or 'User'
//   createdAt: Date,
//   updatedAt: Date,
//   isActive: Boolean
// }
