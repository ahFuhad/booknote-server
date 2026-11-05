const { MongoClient } = require("mongodb");

let client;
let db;

async function connectDB() {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing");

  client = new MongoClient(uri);
  await client.connect();

  db = client.db(process.env.DB_NAME || "booknook");

  await db.collection("books").createIndex({ createdAt: -1 });
  await db.collection("books").createIndex({ addedByEmail: 1, createdAt: -1 });
  await db.collection("borrows").createIndex(
    { bookId: 1, userEmail: 1 },
    { unique: true, name: "one_active_borrow_per_user_and_book" }
  );
  await db.collection("borrows").createIndex({ userEmail: 1, borrowedAt: -1 });

  console.log(`MongoDB connected: ${db.databaseName}`);
  return db;
}

function getDB() {
  if (!db) throw new Error("Database is not connected yet");
  return db;
}

module.exports = { connectDB, getDB };
