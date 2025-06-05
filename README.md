# 🎮 GameHub

Sistema de descoberta e organização de jogos favoritos com autenticação de usuários.

## 🚀 Funcionalidades

- 🔐 **Autenticação completa** - Registro e login de usuários
- 🎯 **Descoberta de jogos** - Integração com API FreeToGame
- ⭐ **Sistema de favoritos** - Salve e organize seus jogos favoritos
- 📱 **Interface responsiva** - Funciona em desktop e mobile
- 🛡️ **Segurança** - Senhas criptografadas e autenticação JWT

## 🛠️ Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação
- **bcryptjs** - Criptografia de senhas

### Frontend
- **React** - Biblioteca JavaScript
- **HTML5/CSS3** - Interface moderna
- **Axios** - Cliente HTTP

## 📋 Pré-requisitos

- Node.js (≥ 14.0.0)
- MongoDB Atlas ou instância local
- npm ou yarn

## ⚙️ Instalação

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/gamehub.git
cd gamehub
```

### 2. Configurar Backend
```bash
cd backend
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

### 4. Iniciar o servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

### 5. Configurar Frontend
```bash
cd ../frontend
# Abra o arquivo public/index.html em seu navegador
# Ou sirva via servidor web local
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```env
MONGO_URI=sua_string_conexao_mongodb
JWT_SECRET=seu_jwt_secret_seguro
PORT=5000
NODE_ENV=development
```

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token

### Favoritos
- `GET /api/favorites` - Listar favoritos
- `POST /api/favorites` - Adicionar favorito
- `DELETE /api/favorites/:id` - Remover favorito
- `DELETE /api/favorites` - Limpar todos os favoritos

## 🚀 Deploy

### Heroku (Backend)
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login e criar app
heroku login
heroku create gamehub-api

# Configurar variáveis
heroku config:set MONGO_URI=sua_string_mongodb
heroku config:set JWT_SECRET=seu_jwt_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Netlify (Frontend)
1. Faça build do frontend
2. Conecte seu repositório ao Netlify
3. Configure as variáveis de ambiente

## 🧪 Testes

```bash
cd backend
npm test
```

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Contato

Seu Nome - [seu-email@email.com](mailto:seu-email@email.com)

Link do Projeto: [https://github.com/seu-usuario/gamehub](https://github.com/seu-usuario/gamehub)