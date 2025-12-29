// migratePostgresToMongo.js
import dotenv from "dotenv";
import db from "./src/db/knex.js";
import { connectMongo, mongoInsertFilme, mongoInsertAtor } from "./src/db/mongo.js";

dotenv.config();

async function migrate() {
  try {
    // Conectar ao MongoDB
    await connectMongo();

    console.log("🚀 Iniciando migração do PostgreSQL para MongoDB...");

    // =========================
    // Migrar Filmes
    // =========================
    const filmes = await db("filmes")
      .select(
        "filmes.id",
        "filmes.titulo",
        "filmes.ano",
        "filmes.descricao",
        "generos.nome as genero"
      )
      .leftJoin("generos", "filmes.genero_id", "generos.id");

    for (const filme of filmes) {
      await mongoInsertFilme({
        id: filme.id,
        titulo: filme.titulo,
        ano: filme.ano,
        descricao: filme.descricao,
        genero: filme.genero,
        atores: [] // os atores ainda podem ser adicionados depois
      });
    }
    console.log(`✅ ${filmes.length} filmes migrados com sucesso!`);

    // =========================
    // Migrar Atores
    // =========================
    const atores = await db("atores").select("*");

    for (const ator of atores) {
      await mongoInsertAtor(ator);
    }
    console.log(`✅ ${atores.length} atores migrados com sucesso!`);

    console.log("🎉 Migração concluída!");
    process.exit(0);

  } catch (erro) {
    console.error("❌ Erro durante a migração:", erro);
    process.exit(1);
  }
}

migrate();
