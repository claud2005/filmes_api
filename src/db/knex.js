import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

const db = knex({
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  },
});

// Teste de conexão (opcional)
db.raw("SELECT 1")
  .then(() => console.log("✅ Conexão com DB OK!"))
  .catch((err) => console.error("❌ Erro na conexão com DB:", err));

export default db;
