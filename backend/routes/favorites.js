import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Middleware de autenticação melhorado
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Token de acesso requerido" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    req.userId = decoded.id;
    req.user = user;
    next();
  } catch (err) {
    console.error("Erro na autenticação:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado" });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token inválido" });
    }

    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// Validação de dados do jogo
const validateGame = (req, res, next) => {
  const { id, title } = req.body;

  if (!id || !title) {
    return res.status(400).json({
      message: "ID e título do jogo são obrigatórios",
    });
  }

  next();
};

// Buscar favoritos do usuário
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("favorites");

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json({
      favorites: user.favorites || [],
      count: user.favorites?.length || 0,
    });
  } catch (err) {
    console.error("Erro ao buscar favoritos:", err);
    res.status(500).json({
      message: "Erro ao buscar favoritos",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Adicionar jogo aos favoritos
router.post("/", authMiddleware, validateGame, async (req, res) => {
  try {
    const game = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Verificar se o jogo já está nos favoritos
    const isAlreadyFavorite = user.favorites.some(
      (fav) => fav.id.toString() === game.id.toString()
    );

    if (isAlreadyFavorite) {
      return res.status(400).json({
        message: "Jogo já está nos favoritos",
      });
    }

    // Limitar número de favoritos (opcional)
    if (user.favorites.length >= 50) {
      return res.status(400).json({
        message: "Limite máximo de 50 jogos favoritos atingido",
      });
    }

    // Adicionar timestamp
    const gameWithTimestamp = {
      ...game,
      addedAt: new Date(),
    };

    user.favorites.push(gameWithTimestamp);
    await user.save();

    res.status(201).json({
      message: "Jogo adicionado aos favoritos",
      favorites: user.favorites,
      count: user.favorites.length,
    });
  } catch (err) {
    console.error("Erro ao adicionar favorito:", err);
    res.status(500).json({
      message: "Erro ao adicionar aos favoritos",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Remover jogo dos favoritos
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const gameId = req.params.id;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const initialLength = user.favorites.length;
    user.favorites = user.favorites.filter(
      (game) => game.id.toString() !== gameId.toString()
    );

    if (user.favorites.length === initialLength) {
      return res.status(404).json({
        message: "Jogo não encontrado nos favoritos",
      });
    }

    await user.save();

    res.json({
      message: "Jogo removido dos favoritos",
      favorites: user.favorites,
      count: user.favorites.length,
    });
  } catch (err) {
    console.error("Erro ao remover favorito:", err);
    res.status(500).json({
      message: "Erro ao remover dos favoritos",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Limpar todos os favoritos
router.delete("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    user.favorites = [];
    await user.save();

    res.json({
      message: "Todos os favoritos foram removidos",
      favorites: [],
      count: 0,
    });
  } catch (err) {
    console.error("Erro ao limpar favoritos:", err);
    res.status(500).json({
      message: "Erro ao limpar favoritos",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

export default router;
