import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import favoriteRoutes from './routes/favorites.js';

dotenv.config();

const app = express();

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'https://seu-dominio.com'
    : 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions)); // ✅ Use apenas essa linha
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.send('API está funcionando!');
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    message: 'Algo deu errado!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor',
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado ao MongoDB');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error.message);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer().catch((error) => {
  console.error('Erro ao iniciar servidor:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, encerrando servidor...');
  mongoose.connection.close(() => {
    console.log('Conexão MongoDB fechada.');
    process.exit(0);
  });
});
