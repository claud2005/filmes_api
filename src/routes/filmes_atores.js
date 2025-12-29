// src/routes/filmes_atores.js
import express from "express";
import * as filmesAtoresController from "../controllers/filmesAtoresController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: FilmesAtores
 *   description: Gestão do relacionamento Filmes ↔ Atores (MongoDB)
 */

/**
 * @swagger
 * /filmes/{id}/atores:
 *   get:
 *     summary: Lista o título do filme e todos os atores
 *     tags: [FilmesAtores]
 */
router.get(
  "/filmes/:id/atores",
  authMiddleware("View"),
  filmesAtoresController.listarAtoresDoFilme
);

/**
 * @swagger
 * /atores/{id}/filmes:
 *   get:
 *     summary: Lista todos os filmes de um ator
 *     tags: [FilmesAtores]
 */
router.get(
  "/atores/:id/filmes",
  authMiddleware("View"),
  filmesAtoresController.listarFilmesDoAtor
);

/**
 * @swagger
 * /filmes/{filmeId}/atores/{atorNome}:
 *   post:
 *     summary: Adiciona um ator a um filme (MongoDB)
 *     tags: [FilmesAtores]
 */
router.post(
  "/filmes/:filmeId/atores/:atorNome",
  authMiddleware("Edit"),
  filmesAtoresController.adicionarAtorAoFilme
);

/**
 * @swagger
 * /filmes/{filmeId}/atores/{atorNome}:
 *   delete:
 *     summary: Remove um ator de um filme (MongoDB)
 *     tags: [FilmesAtores]
 */
router.delete(
  "/filmes/:filmeId/atores/:atorNome",
  authMiddleware("Edit"),
  filmesAtoresController.removerAtorDoFilme
);

export default router;
