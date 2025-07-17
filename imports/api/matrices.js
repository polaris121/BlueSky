import { Mongo } from 'meteor/mongo';

export const MatricesCollection = new Mongo.Collection('matrices');

// Matrix document structure:
// {
//   _id: string,
//   name: string,
//   dimensions: { x: number, y: number },
//   data: number[][],
//   selections: string[][][], // Array of arrays of arrays of usernames
//   columnHeaders: number[], // Array of unique random numbers (0-9) for column headers
//   rowHeaders: number[],    // Array of unique random numbers (0-9) for row headers
//   createdBy: string,
//   createdAt: Date,
//   updatedAt: Date,
//   isActive: boolean
// }
