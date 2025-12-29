// src/controllers/filmesAtoresController.js
import { ObjectId } from "mongodb";
import { getMongoDB } from "../db/mongo.js";

// -------------------
// Lista atores de um filme
// -------------------
export async function listarAtoresDoFilme(req, res) {
  try {
    const { id } = req.params;
    const db = getMongoDB();

    const filtro = ObjectId.isValid(id)
      ? { _id: new ObjectId(id) }
      : { id: Number(id) };

    const filme = await db.collection("filmes").findOne(filtro);

    if (!filme) {
      return res.status(404).json({ erro: "Filme não encontrado no MongoDB" });
    }

    res.json({
      titulo: filme.titulo,
      atores: filme.atores || []
    });
  } catch (err) {
    res.status(500).json({
      erro: "Erro ao buscar atores do filme",
      detalhes: err.message
    });
  }
}

// -------------------
// Lista filmes de um ator
// -------------------
export async function listarFilmesDoAtor(req, res) {
  try {
    const { id } = req.params;
    const db = getMongoDB();

    const filmes = await db
      .collection("filmes")
      .find({ atores: id })
      .toArray();

    if (!filmes.length) {
      return res.status(404).json({
        erro: "Ator não encontrado em nenhum filme"
      });
    }

    res.json(
      filmes.map(f => ({
        id: f._id,
        titulo: f.titulo,
        ano: f.ano,
        descricao: f.descricao,
        genero: f.genero
      }))
    );
  } catch (err) {
    res.status(500).json({
      erro: "Erro ao buscar filmes do ator",
      detalhes: err.message
    });
  }
}

// -------------------
// Adicionar ator a um filme
// -------------------
export async function adicionarAtorAoFilme(req, res) {
  try {
    const { filmeId, atorNome } = req.params;
    const db = getMongoDB();

    const filtro = ObjectId.isValid(filmeId)
      ? { _id: new ObjectId(filmeId) }
      : { id: Number(filmeId) };

    const filme = await db.collection("filmes").findOne(filtro);

    if (!filme) {
      return res.status(404).json({ erro: "Filme não encontrado no MongoDB" });
    }

    if (filme.atores?.includes(atorNome)) {
      return res.status(400).json({ erro: "Ator já está no filme" });
    }

    await db
      .collection("filmes")
      .updateOne(filtro, { $push: { atores: atorNome } });

    res.status(201).json({
      mensagem: `Ator "${atorNome}" adicionado ao filme "${filme.titulo}"`
    });
  } catch (err) {
    res.status(500).json({
      erro: "Erro ao adicionar ator ao filme",
      detalhes: err.message
    });
  }
}

// -------------------
// Remover ator de um filme
// -------------------
export async function removerAtorDoFilme(req, res) {
  try {
    const { filmeId, atorNome } = req.params;
    const db = getMongoDB();

    const filtro = ObjectId.isValid(filmeId)
      ? { _id: new ObjectId(filmeId) }
      : { id: Number(filmeId) };

    const filme = await db.collection("filmes").findOne(filtro);

    if (!filme) {
      return res.status(404).json({ erro: "Filme não encontrado no MongoDB" });
    }

    if (!filme.atores || !filme.atores.includes(atorNome)) {
      return res.status(404).json({
        erro: "Ator não encontrado neste filme"
      });
    }

    await db
      .collection("filmes")
      .updateOne(filtro, { $pull: { atores: atorNome } });

    res.json({
      mensagem: `Ator "${atorNome}" removido do filme "${filme.titulo}"`
    });
  } catch (err) {
    res.status(500).json({
      erro: "Erro ao remover ator do filme",
      detalhes: err.message
    });
  }
}
