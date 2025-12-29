// src/routes/users.js
import express from "express";
import * as usersController from "../controllers/usersController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: Gestão de utilizadores e login
 */

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Registo público de utilizador
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@exemplo.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: Conta criada com sucesso
 *       400:
 *         description: Email ou password em falta
 *       500:
 *         description: Erro interno
 */
router.post("/signup", usersController.signup);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login de um utilizador
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@exemplo.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login bem-sucedido, retorna token JWT
 *       400:
 *         description: Email ou password em falta
 *       401:
 *         description: Password incorreta
 *       404:
 *         description: Utilizador não encontrado
 *       500:
 *         description: Erro interno
 */
router.post("/login", usersController.login);

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registar um novo utilizador (apenas admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@exemplo.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               role:
 *                 type: string
 *                 enum: [view, edit, admin]
 *                 example: view
 *     responses:
 *       201:
 *         description: Utilizador criado com sucesso
 *       400:
 *         description: Email ou password em falta
 *       403:
 *         description: Permissão insuficiente
 *       500:
 *         description: Erro interno
 */
router.post("/register", authMiddleware("admin"), usersController.register);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar todos os utilizadores (apenas admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de utilizadores
 *       401:
 *         description: Token inválido ou ausente
 *       403:
 *         description: Permissão insuficiente
 *       500:
 *         description: Erro interno
 */
router.get("/", authMiddleware("admin"), usersController.listarUsuarios);

/**
 * @swagger
 * /users/{email}:
 *   put:
 *     summary: Atualizar a role de um utilizador (apenas admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email do utilizador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [view, edit, admin]
 *                 example: edit
 *     responses:
 *       200:
 *         description: Role atualizada com sucesso
 *       400:
 *         description: Role ausente
 *       404:
 *         description: Utilizador não encontrado
 *       401:
 *         description: Token inválido ou ausente
 *       500:
 *         description: Erro interno
 */
router.put("/:email", authMiddleware("admin"), usersController.atualizarRole);

/**
 * @swagger
 * /users/{email}:
 *   delete:
 *     summary: Apagar um utilizador (apenas admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email do utilizador
 *     responses:
 *       200:
 *         description: Utilizador apagado com sucesso
 *       404:
 *         description: Utilizador não encontrado
 *       401:
 *         description: Token inválido ou ausente
 *       500:
 *         description: Erro interno
 */
router.delete("/:email", authMiddleware("admin"), usersController.apagarUsuario);

export default router;
