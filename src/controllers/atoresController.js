// src/controllers/atoresController.js
import knex from "../db/knex.js";
import { fetchMovieFromOMDb } from "../services/omdbService.js";
import { mongoInsertAtor, getMongoDB } from "../db/mongo.js";
import { ObjectId } from "mongodb";

export async function importarAtores(req, res) {
  try {
    const { titulo, atualizarMongo } = req.body;
    if (!titulo) return res.status(400).json({ erro: "Título obrigatório" });

    const filme = await fetchMovieFromOMDb(titulo);
    if (!filme || filme.Response === "False") {
      return res.status(404).json({ erro: "Filme não encontrado" });
    }

    const nomes = filme.Actors
      ? filme.Actors.split(",").map(a => a.trim())
      : [];

    const db = getMongoDB();
    const atores = [];

    for (const nome of nomes) {
      let ator = await knex("atores").where({ nome }).first();

      if (!ator) {
        [ator] = await knex("atores")
          .insert({ nome })
          .returning("*");
      }

      if (atualizarMongo) {
        const existeMongo = await db.collection("atores").findOne({ nome });
        if (!existeMongo) await mongoInsertAtor(nome);
      }

      atores.push(ator);
    }

    res.status(201).json({ mensagem: "Atores importados", atores });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

export async function listarAtoresPostgres(req, res) {
  const atores = await knex("atores").orderBy("nome");
  res.json(atores);
}

export async function listarAtoresMongo(req, res) {
  const atores = await getMongoDB().collection("atores").find().toArray();
  res.json(atores);
}

export async function obterAtorPostgres(req, res) {
  const ator = await knex("atores").where({ id: req.params.id }).first();
  if (!ator) return res.status(404).json({ erro: "Ator não encontrado" });
  res.json(ator);
}

export async function obterAtorMongo(req, res) {
  const filtro = ObjectId.isValid(req.params.id)
    ? { _id: new ObjectId(req.params.id) }
    : { id: Number(req.params.id) };

  const ator = await getMongoDB().collection("atores").findOne(filtro);
  if (!ator) return res.status(404).json({ erro: "Ator não encontrado" });
  res.json(ator);
}

export async function apagarAtorPostgres(req, res) {
  const r = await knex("atores").where({ id: req.params.id }).del();
  if (!r) return res.status(404).json({ erro: "Ator não encontrado" });
  res.json({ mensagem: "Ator apagado" });
}

export async function apagarAtorMongo(req, res) {
  const filtro = ObjectId.isValid(req.params.id)
    ? { _id: new ObjectId(req.params.id) }
    : { id: Number(req.params.id) };

  const r = await getMongoDB().collection("atores").deleteOne(filtro);
  if (!r.deletedCount) return res.status(404).json({ erro: "Ator não encontrado" });
  res.json({ mensagem: "Ator apagado" });
}

export async function atualizarAtorMongo(req, res) {
  const filtro = ObjectId.isValid(req.params.id)
    ? { _id: new ObjectId(req.params.id) }
    : { id: Number(req.params.id) };

  const r = await getMongoDB()
    .collection("atores")
    .updateOne(filtro, { $set: req.body });

  if (!r.matchedCount) return res.status(404).json({ erro: "Ator não encontrado" });

  const ator = await getMongoDB().collection("atores").findOne(filtro);
  res.json({ mensagem: "Ator atualizado", ator });
}
