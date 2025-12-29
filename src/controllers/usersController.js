// src/controllers/usersController.js
import crypto from "crypto";
import { mongoInsertUser, buscarUsuarioPorEmail, getMongoDB } from "../db/mongo.js";
import { gerarToken } from "../middleware/auth.js";

/**
 * Registo público de utilizador
 */
export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ erro: "Email e password são obrigatórios" });
    }

    const user = await mongoInsertUser(email.toLowerCase(), password, "view");
    res.status(201).json({ 
      mensagem: "Conta criada com sucesso", 
      user: { email: user.email, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao criar conta", detalhes: err.message });
  }
};

/**
 * Login de utilizador
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ erro: "Email e password são obrigatórios" });

    const user = await buscarUsuarioPorEmail(email.toLowerCase());
    if (!user) return res.status(404).json({ erro: "Utilizador não encontrado" });

    const hash = crypto.createHash("sha256").update(password).digest("hex");
    if (user.password !== hash) return res.status(401).json({ erro: "Password incorreta" });

    const token = gerarToken(user);
    res.json({ mensagem: "Login bem-sucedido", token });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao efetuar login", detalhes: err.message });
  }
};

/**
 * Registrar novo utilizador (apenas admin)
 */
export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ erro: "Email e password são obrigatórios" });

    const user = await mongoInsertUser(email.toLowerCase(), password, role?.toLowerCase() || "view");
    res.status(201).json({ 
      mensagem: "Utilizador criado com sucesso", 
      user: { email: user.email, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao criar utilizador", detalhes: err.message });
  }
};

/**
 * Listar todos os utilizadores (apenas admin)
 */
export const listarUsuarios = async (req, res) => {
  try {
    const collection = getMongoDB().collection("users");
    const users = await collection.find({}, { projection: { password: 0 } }).toArray();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar usuários", detalhes: err.message });
  }
};

/**
 * Atualizar role de um utilizador (apenas admin)
 * Busca email de forma case-insensitive
 */
export const atualizarRole = async (req, res) => {
  try {
    const emailParam = req.params.email;
    const { role } = req.body;
    if (!role) return res.status(400).json({ erro: "Role é obrigatória" });

    const collection = getMongoDB().collection("users");

    // Atualiza e tenta retornar o documento atualizado
    const result = await collection.findOneAndUpdate(
      { email: { $regex: `^${emailParam}$`, $options: "i" } },
      { $set: { role: role.toLowerCase() } },
      { returnDocument: "after" } // retorna documento atualizado
    );

    // Se result.value undefined, busca manualmente
    const updatedUser = result.value || await collection.findOne({ email: { $regex: `^${emailParam}$`, $options: "i" } });

    if (!updatedUser) return res.status(404).json({ erro: "Utilizador não encontrado" });

    res.json({ 
      mensagem: "Role atualizada com sucesso", 
      user: { email: updatedUser.email, role: updatedUser.role } 
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao atualizar utilizador", detalhes: err.message });
  }
};

/**
 * Apagar utilizador (apenas admin)
 * Busca email de forma case-insensitive
 */
export const apagarUsuario = async (req, res) => {
  try {
    const emailParam = req.params.email;
    const collection = getMongoDB().collection("users");

    const result = await collection.deleteOne({ email: { $regex: `^${emailParam}$`, $options: "i" } });

    if (result.deletedCount === 0) return res.status(404).json({ erro: "Utilizador não encontrado" });

    res.json({ mensagem: "Utilizador apagado com sucesso", email: emailParam });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao apagar utilizador", detalhes: err.message });
  }
};
