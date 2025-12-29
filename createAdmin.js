import { MongoClient } from "mongodb";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;
const dbName = "filmes_api";

async function createAdmin() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection("users");

    const hash = crypto.createHash("sha256").update("admin123").digest("hex");
    const adminUser = { email: "claudiofreitas@ipvc.com", password: hash, role: "admin" };

    const existing = await users.findOne({ email: adminUser.email });
    if (existing) {
      console.log("Admin já existe:", existing.email);
    } else {
      await users.insertOne(adminUser);
      console.log("Admin criado com sucesso:", adminUser.email);
    }
  } finally {
    await client.close();
  }
}

createAdmin();
