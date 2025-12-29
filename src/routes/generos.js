// src/routes/generos.js
import express from "express";
import * as generosController from "../controllers/generosController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Generos
 *   description: Consulta de gêneros a partir dos filmes (MongoDB)
 */

/**
 * @swagger
 * /generos:
 *   get:
 *     summary: Lista todos os gêneros disponíveis
 *     tags: [Generos]
 *     responses:
 *       200:
 *         description: Lista de gêneros existentes
 *       500:
 *         description: Erro ao listar gêneros
 */
router.get("/", authMiddleware("View"), generosController.listarGeneros);

/**
 * @swagger
 * /generos/{nome}/filmes:
 *   get:
 *     summary: Lista filmes por gênero
 *     tags: [Generos]
 */
router.get(
  "/:nome/filmes",
  authMiddleware("View"),
  generosController.listarFilmesPorGenero
);

/**
 * @swagger
 * /filmes/genero/{titulo}:
 *   get:
 *     summary: Obtém o gênero de um filme específico pelo título
 *     tags: [Generos]
 */
router.get(
  "/filmes/genero/:titulo",
  authMiddleware("View"),
  generosController.obterGeneroPorTitulo
);

export default router;
