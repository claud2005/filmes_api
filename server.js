// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./src/db/knex.js";

import filmesRoutes from "./src/routes/filmes.js";
import atoresRoutes from "./src/routes/atores.js";
import generosRoutes from "./src/routes/generos.js";
import usersRoutes from "./src/routes/users.js";
import filmesAtoresRoutes from "./src/routes/filmes_atores.js";

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { connectMongo } from "./src/db/mongo.js";

import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ------------------------------
// Conexões às bases de dados
// ------------------------------

// MongoDB
await connectMongo();

// PostgreSQL
db.raw("SELECT 1")
  .then(() =>
    console.log("✅ Ligação à base de dados PostgreSQL bem-sucedida!")
  )
  .catch((err) =>
    console.error("❌ Erro ao ligar à base de dados PostgreSQL:", err.message)
  );

// ------------------------------
// Rotas
// ------------------------------

// ⚠️ IMPORTANTE: Filmes ↔ Atores primeiro
app.use("/", filmesAtoresRoutes);

// Rotas principais
app.use("/filmes", filmesRoutes);
app.use("/atores", atoresRoutes);
app.use("/generos", generosRoutes);
app.use("/users", usersRoutes);

// ------------------------------
// Swagger
// ------------------------------

// __dirname equivalente no ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Filmes e Atores",
      version: "1.0.0",
      description:
        "API REST para gerir Filmes, Atores, Gêneros e Usuários (MongoDB + PostgreSQL)",
    },

    // 🔐 JWT AUTH (isto faz aparecer o botão Authorize)
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    // aplica JWT por defeito a todas as rotas
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [path.join(__dirname, "./src/routes/*.js")],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// ------------------------------
// Endpoint de teste
// ------------------------------
app.get("/", (req, res) => {
  res.send("🎬 API de Filmes e Atores a funcionar!");
});

// ------------------------------
// Servidor
// ------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Servidor a correr em http://localhost:${PORT}`)
);
