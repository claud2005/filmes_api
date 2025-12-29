// src/controllers/generosController.js
import { getMongoDB } from "../db/mongo.js";

// -------------------
// Listar todos os géneros
// -------------------
export async function listarGeneros(req, res) {
  try {
    const db = getMongoDB();

    const generos = await db
      .collection("filmes")
      .distinct("genero");

    res.json({
      total: generos.length,
      generos
    });
  } catch (err) {
    res.status(500).json({
      erro: "Erro ao listar gêneros",
      detalhes: err.message
    });
  }
}

// -------------------
// Listar filmes por género
// -------------------
export async function listarFilmesPorGenero(req, res) {
  try {
    const { nome } = req.params;
    const db = getMongoDB();

    const filmes = await db
      .collection("filmes")
      .find({ genero: nome })
      .toArray();

    if (!filmes.length) {
      return res.status(404).json({
        erro: "Nenhum filme encontrado para este gênero"
      });
    }

    res.json({
      genero: nome,
      total: filmes.length,
      filmes: filmes.map(f => ({
        id: f._id,
        titulo: f.titulo,
        ano: f.ano
      }))
    });
  } catch (err) {
    res.status(500).json({
      erro: "Erro ao buscar filmes por gênero",
      detalhes: err.message
    });
  }
}

// -------------------
// Obter género de um filme pelo título
// -------------------
export async function obterGeneroPorTitulo(req, res) {
  try {
    const { titulo } = req.params;
    const db = getMongoDB();

    const filme = await db.collection("filmes").findOne({ titulo });

    if (!filme) {
      return res.status(404).json({ erro: "Filme não encontrado" });
    }

    res.json({
      titulo: filme.titulo,
      genero: filme.genero
    });
  } catch (err) {
    res.status(500).json({
      erro: "Erro ao buscar filme",
      detalhes: err.message
    });
  }
}
