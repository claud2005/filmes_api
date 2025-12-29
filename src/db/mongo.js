// src/db/mongo.js
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

// --------------------
// Conexão ao MongoDB
// --------------------
export async function connectMongo() {
  try {
    await client.connect();
    db = client.db("filmes_api"); // Base de dados principal
    console.log("✅ Ligação ao MongoDB bem-sucedida!");
  } catch (err) {
    console.error("❌ Erro ao ligar ao MongoDB:", err);
  }
}

export function getMongoDB() {
  if (!db) throw new Error("MongoDB não conectado!");
  return db;
}

// --------------------
// AUTO-INCREMENT
// --------------------
async function getNextSequence(name, collectionName) {
  const counters = db.collection("counters");

  const result = await counters.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  if (!result.value) {
    let seq = 1;
    if (collectionName) {
      const collection = db.collection(collectionName);
      const maxDoc = await collection.find().sort({ id: -1 }).limit(1).toArray();
      if (maxDoc.length > 0) seq = maxDoc[0].id + 1;
    }

    await counters.updateOne(
      { _id: name },
      { $set: { seq } },
      { upsert: true }
    );
    return seq;
  }

  return result.value.seq;
}

// --------------------
// USERS / LOGIN
// --------------------
export async function mongoInsertUser(email, password, role = "view") {
  const collection = getMongoDB().collection("users");

  const existe = await collection.findOne({ email });
  if (existe) return existe;

  const hash = crypto.createHash("sha256").update(password).digest("hex");

  const user = { email, password: hash, role: role.toLowerCase() };
  await collection.insertOne(user);

  return user;
}

export async function buscarUsuarioPorEmail(email) {
  const collection = getMongoDB().collection("users");
  return await collection.findOne({ email });
}

// --------------------
// FILMES
// --------------------
export async function mongoInsertFilme(filme) {
  const collection = getMongoDB().collection("filmes");

  const existe = await collection.findOne({ titulo: filme.titulo });
  if (existe) return existe;

  const id = await getNextSequence("filmes", "filmes");

  const novoFilme = {
    id,
    titulo: filme.titulo,
    ano: filme.ano,
    descricao: filme.descricao,
    genero: filme.genero,
    atores: filme.atores
  };

  await collection.insertOne(novoFilme);
  return novoFilme;
}

// --------------------
// ATORES
// --------------------
export async function mongoInsertAtor(nome) {
  const collection = getMongoDB().collection("atores");

  const existe = await collection.findOne({ nome });
  if (existe) return existe;

  const id = await getNextSequence("atores", "atores");

  const novoAtor = { id, nome };
  await collection.insertOne(novoAtor);

  return novoAtor;
}

// --------------------
// GÊNEROS
// --------------------
export async function inserirGeneroMongo(nome) {
  const collection = getMongoDB().collection("generos");

  const existe = await collection.findOne({ nome });
  if (existe) return existe;

  const id = await getNextSequence("generos", "generos");

  const genero = { id, nome };
  await collection.insertOne(genero);

  return genero;
}
