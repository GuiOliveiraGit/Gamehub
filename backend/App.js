import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'https://seu-dominio.com'
    : 'http://localhost:3000',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend rodando na porta 5000!');
});

app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});
