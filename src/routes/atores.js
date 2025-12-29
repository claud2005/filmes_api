// src/routes/atores.js
import express from "express";
import * as atoresController from "../controllers/atoresController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Atores
 *     description: Gestão de atores (PostgreSQL e MongoDB)
 */

/**
 * @swagger
 * /atores/importar:
 *   post:
 *     summary: Importa atores de um filme da OMDb
 *     tags: [Atores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Inception"
 *               atualizarMongo:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Atores importados com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */
router.post(
  "/importar",
  authMiddleware("Edit"),
  atoresController.importarAtores
);

/**
 * @swagger
 * /atores:
 *   get:
 *     summary: Listar todos os atores (PostgreSQL)
 *     tags: [Atores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de atores
 */
router.get(
  "/",
  authMiddleware("View"),
  atoresController.listarAtoresPostgres
);

/**
 * @swagger
 * /atores/mongo:
 *   get:
 *     summary: Listar todos os atores (MongoDB)
 *     tags: [Atores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de atores no MongoDB
 */
router.get(
  "/mongo",
  authMiddleware("View"),
  atoresController.listarAtoresMongo
);

/**
 * @swagger
 * /atores/mongo/{id}:
 *   get:
 *     summary: Obter ator pelo ID (MongoDB)
 *     tags: [Atores]
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
 *         description: Ator encontrado
 *       404:
 *         description: Ator não encontrado
 */
router.get(
  "/mongo/:id",
  authMiddleware("View"),
  atoresController.obterAtorMongo
);

/**
 * @swagger
 * /atores/{id}:
 *   get:
 *     summary: Obter ator pelo ID (PostgreSQL)
 *     tags: [Atores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Ator encontrado
 *       404:
 *         description: Ator não encontrado
 */
router.get(
  "/:id",
  authMiddleware("View"),
  atoresController.obterAtorPostgres
);

/**
 * @swagger
 * /atores/mongo/{id}:
 *   delete:
 *     summary: Apagar ator pelo ID (MongoDB)
 *     tags: [Atores]
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
 *         description: Ator apagado
 *       404:
 *         description: Ator não encontrado
 */
router.delete(
  "/mongo/:id",
  authMiddleware("Edit"),
  atoresController.apagarAtorMongo
);

/**
 * @swagger
 * /atores/{id}:
 *   delete:
 *     summary: Apagar ator pelo ID (PostgreSQL)
 *     tags: [Atores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Ator apagado
 *       404:
 *         description: Ator não encontrado
 */
router.delete(
  "/:id",
  authMiddleware("Edit"),
  atoresController.apagarAtorPostgres
);

/**
 * @swagger
 * /atores/mongo/{id}:
 *   put:
 *     summary: Atualizar ator pelo ID (MongoDB)
 *     tags: [Atores]
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
 *               nome:
 *                 type: string
 *               idade:
 *                 type: integer
 *               nacionalidade:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ator atualizado
 *       404:
 *         description: Ator não encontrado
 */
router.put(
  "/mongo/:id",
  authMiddleware("Edit"),
  atoresController.atualizarAtorMongo
);

export default router;
