import knex from "../db/knex.js";
import { fetchMovieFromOMDb } from "../services/omdbService.js";
import { getMongoDB, mongoInsertFilme } from "../db/mongo.js";
import crypto from "crypto";
import { ObjectId } from "mongodb";

// -------------------
// Listar filmes PostgreSQL
// -------------------
export async function listarFilmesPostgres(req, res) {
  try {
    const filmes = await knex("filmes")
      .select(
        "filmes.id",
        "filmes.titulo",
        "filmes.ano",
        "filmes.descricao",
        "generos.nome as genero"
      )
      .leftJoin("generos", "filmes.genero_id", "generos.id");

    res.json(filmes);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao listar filmes", detalhes: erro.message });
  }
}

// -------------------
// Listar filmes MongoDB
// -------------------
export async function listarFilmesMongo(req, res) {
  try {
    const db = getMongoDB();
    const filmes = await db.collection("filmes").find({}).sort({ id: 1 }).toArray();
    res.json(filmes);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao listar filmes do MongoDB", detalhes: erro.message });
  }
}

// -------------------
// Importar filme da OMDb para PostgreSQL e MongoDB
// -------------------
export async function importarFilme(req, res) {
  try {
    const { titulo } = req.body;

    if (!titulo)
      return res.status(400).json({ erro: "É necessário indicar o título do filme." });

    const movie = await fetchMovieFromOMDb(titulo);
    if (!movie || movie.Response === "False") {
      return res.status(404).json({ erro: "Filme não encontrado na OMDb." });
    }

    const generoNome = movie.Genre?.split(",")[0].trim() || "Desconhecido";
    const atoresNomes = movie.Actors?.split(",").map(a => a.trim()) || [];

    const resultado = { postgres: null, mongo: null };

    // Inserir no PostgreSQL
    const filmeExistentePG = await knex("filmes").where({ titulo: movie.Title }).first();
    let novoFilmePG;
    if (!filmeExistentePG) {
      let genero = await knex("generos").where({ nome: generoNome }).first();
      const generoId = genero
        ? genero.id
        : (await knex("generos").insert({ nome: generoNome }).returning("*"))[0].id;

      [novoFilmePG] = await knex("filmes")
        .insert({
          titulo: movie.Title,
          ano: parseInt(movie.Year),
          descricao: movie.Plot || "Sem descrição",
          genero_id: generoId,
        })
        .returning("*");

      const atoresInseridos = [];
      for (const nome of atoresNomes) {
        let ator = await knex("atores").where({ nome }).first();
        if (!ator) {
          ator = (await knex("atores")
            .insert({ id: crypto.randomUUID(), nome })
            .returning("*"))[0];
        }
        await knex("filmes_atores").insert({ filme_id: novoFilmePG.id, ator_id: ator.id });
        atoresInseridos.push(ator);
      }

      resultado.postgres = { filme: novoFilmePG, atores: atoresInseridos };
    } else {
      resultado.postgres = { mensagem: "Filme já existe no PostgreSQL", filme: filmeExistentePG };
      novoFilmePG = filmeExistentePG;
    }

    // Inserir no MongoDB
    try {
      const filmeMongo = await mongoInsertFilme({
        titulo: movie.Title,
        ano: parseInt(movie.Year),
        descricao: movie.Plot || "Sem descrição",
        genero: generoNome,
        atores: atoresNomes
      });
      resultado.mongo = filmeMongo;
    } catch (erroMongo) {
      console.error("Erro ao inserir filme no MongoDB:", erroMongo);
      resultado.mongo = { erro: "Falha ao inserir no MongoDB", detalhes: erroMongo.message };
    }

    res.status(201).json({ mensagem: "Importação concluída", resultado });

  } catch (erro) {
    console.error("Erro ao importar filme:", erro);
    res.status(500).json({ erro: "Erro ao importar filme.", detalhes: erro.message });
  }
}

// -------------------
// Deletar filme PostgreSQL
// -------------------
export async function deletarFilmePostgres(req, res) {
  try {
    const { id } = req.params;
    await knex("filmes_atores").where({ filme_id: id }).del();
    const deletado = await knex("filmes").where({ id }).del();

    if (!deletado) return res.status(404).json({ erro: "Filme não encontrado." });

    res.json({ mensagem: "Filme deletado do PostgreSQL com sucesso!" });
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao deletar filme.", detalhes: erro.message });
  }
}

// -------------------
// Deletar filme MongoDB
// -------------------
export async function deletarFilmeMongo(req, res) {
  try {
    const { id } = req.params;
    const db = getMongoDB();

    const resultado = await db.collection("filmes").deleteOne({ id: parseInt(id) });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({ erro: "Filme não encontrado no MongoDB." });
    }

    res.json({ mensagem: "Filme deletado do MongoDB com sucesso!" });
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao deletar filme do MongoDB.", detalhes: erro.message });
  }
}

// -------------------
// Atualizar filme MongoDB
// -------------------
export async function atualizarFilmeMongo(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const db = getMongoDB();

    let filtro;
    if (ObjectId.isValid(id)) {
      filtro = { _id: new ObjectId(id) };
    } else if (!isNaN(id)) {
      filtro = { id: parseInt(id) };
    } else {
      return res.status(400).json({ erro: "ID inválido." });
    }

    const filmeAtual = await db.collection("filmes").findOne(filtro);
    if (!filmeAtual) return res.status(404).json({ erro: "Filme não encontrado." });

    const novosDados = { ...filmeAtual, ...updateData };

    const resultado = await db.collection("filmes").findOneAndUpdate(
      filtro,
      { $set: novosDados },
      { returnDocument: "after" }
    );

    res.json({ mensagem: "Filme atualizado com sucesso!", filme: resultado.value });
  } catch (erro) {
    console.error("Erro ao atualizar filme no MongoDB:", erro);
    res.status(500).json({ erro: "Erro ao atualizar filme no MongoDB.", detalhes: erro.message });
  }
}

// -------------------
// Obter gênero de um filme
// -------------------
export async function obterGenero(req, res) {
  try {
    const { titulo } = req.params;
    const db = getMongoDB();

    const filme = await db.collection("filmes").findOne({ titulo });

    if (!filme) {
      return res.status(404).json({ erro: "Filme não encontrado" });
    }

    res.json({ titulo: filme.titulo, genero: filme.genero });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar filme", detalhes: err.message });
  }
}
