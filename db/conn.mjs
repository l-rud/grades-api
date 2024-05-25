import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

// Variable for storing the connection string from our .env file
const connectionString = process.env.ATLAS_URI || '';
// Creating a new instance of the MongoClient
const client = new MongoClient(connectionString);

let conn;
try {
  // Connecting to your cluster
  conn = await client.connect();
  console.log('Successfully connected to Mongo!');
} catch (e) {
  console.log(e);
}

// choosing and storing the db we will be using from our cluster
let db = conn.db('sample_training');

export default db;