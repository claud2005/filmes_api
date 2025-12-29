// src/routes/filmes.js
import express from "express";
import * as filmesController from "../controllers/filmesController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Filmes
 *     description: Endpoints para gerir filmes
 */

/**
 * @swagger
 * /filmes:
 *   get:
 *     summary: Lista todos os filmes no PostgreSQL
 *     tags: [Filmes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de filmes
 *       500:
 *         description: Erro ao listar filmes
 */
router.get("/", authMiddleware("View"), filmesController.listarFilmesPostgres);

/**
 * @swagger
 * /filmes/mongo:
 *   get:
 *     summary: Lista todos os filmes no MongoDB
 *     tags: [Filmes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de filmes do MongoDB
 *       500:
 *         description: Erro ao listar filmes do MongoDB
 */
router.get("/mongo", authMiddleware("View"), filmesController.listarFilmesMongo);

/**
 * @swagger
 * /filmes/importar:
 *   post:
 *     summary: Importa um filme da OMDb para PostgreSQL e MongoDB
 *     tags: [Filmes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Logan"
 *             required:
 *               - titulo
 *     responses:
 *       201:
 *         description: Filme importado com sucesso
 *       400:
 *         description: Título não fornecido
 *       404:
 *         description: Filme não encontrado na OMDb
 *       500:
 *         description: Erro ao importar filme
 */
router.post("/importar", authMiddleware("Edit"), filmesController.importarFilme);

/**
 * @swagger
 * /filmes/{id}:
 *   delete:
 *     summary: Deleta um filme do PostgreSQL
 *     tags: [Filmes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Filme deletado com sucesso
 *       404:
 *         description: Filme não encontrado
 */
router.delete("/:id", authMiddleware("Edit"), filmesController.deletarFilmePostgres);

/**
 * @swagger
 * /filmes/mongo/{id}:
 *   delete:
 *     summary: Deleta um filme do MongoDB
 *     tags: [Filmes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Filme deletado do MongoDB com sucesso
 *       404:
 *         description: Filme não encontrado
 */
router.delete("/mongo/:id", authMiddleware("Edit"), filmesController.deletarFilmeMongo);

/**
 * @swagger
 * /filmes/mongo/{id}:
 *   put:
 *     summary: Atualiza um filme no MongoDB
 *     tags: [Filmes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               ano:
 *                 type: integer
 *               descricao:
 *                 type: string
 *               genero:
 *                 type: string
 *               atores:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Filme atualizado com sucesso
 *       404:
 *         description: Filme não encontrado
 */
router.put("/mongo/:id", authMiddleware("Edit"), filmesController.atualizarFilmeMongo);

/**
 * @swagger
 * /filmes/genero/{titulo}:
 *   get:
 *     summary: Obtém o gênero de um filme pelo título
 *     tags: [Filmes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: titulo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Título e gênero do filme
 *       404:
 *         description: Filme não encontrado
 */
router.get("/genero/:titulo", authMiddleware("View"), filmesController.obterGenero);

export default router;
