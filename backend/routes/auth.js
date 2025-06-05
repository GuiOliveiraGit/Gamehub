import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Validação de entrada
const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Todos os campos são obrigatórios",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "A senha deve ter pelo menos 6 caracteres",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Email inválido",
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email e senha são obrigatórios",
    });
  }

  next();
};

// Registro de usuário
router.post("/register", validateRegistration, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message:
          existingUser.email === email
            ? "Email já está em uso"
            : "Nome de usuário já está em uso",
      });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Criar usuário
    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    await newUser.save();

    // Criar token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "Usuário criado com sucesso",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("Erro no registro:", err);
    res.status(500).json({
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Login de usuário
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(400).json({
        message: "Credenciais inválidas",
      });
    }

    // Verificar senha
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Credenciais inválidas",
      });
    }

    // Criar token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({
      message: "Erro interno do servidor",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});

// Verificar token
router.get("/verify", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: "Token inválido" });
  }
});

export default router;
