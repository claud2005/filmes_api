// src/middleware/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("⚠️ JWT_SECRET não definido no .env!");
}

// Middleware para proteger rotas
export function authMiddleware(permRequired = "view") {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ erro: "Token não fornecido" });
      }

      const token = authHeader.split(" ")[1];
      const payload = jwt.verify(token, JWT_SECRET);

      req.user = payload; // { email, role }

      // Verificação de permissões
      const rolesHierarchy = { view: 1, edit: 2, admin: 3 };
      if (rolesHierarchy[payload.role.toLowerCase()] < rolesHierarchy[permRequired.toLowerCase()]) {
        return res.status(403).json({ erro: "Permissão insuficiente" });
      }

      next();
    } catch (err) {
      console.error("Erro no authMiddleware:", err.message);
      res.status(401).json({ erro: "Token inválido ou expirado" });
    }
  };
}

// Gerar token
export function gerarToken(user) {
  return jwt.sign(
    { email: user.email, role: user.role.toLowerCase() },
    JWT_SECRET,
    { expiresIn: "2h" }
  );
}
