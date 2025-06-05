import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  short_description: { type: String },
  thumbnail: { type: String },
  game_url: { type: String },
  genre: { type: String },
  platform: { type: String },
  publisher: { type: String },
  developer: { type: String },
  release_date: { type: String },
  addedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: [true, 'Nome de usuário é obrigatório'],
    unique: true,
    trim: true,
    minlength: [3, 'Nome de usuário deve ter pelo menos 3 caracteres'],
    maxlength: [30, 'Nome de usuário deve ter no máximo 30 caracteres']
  },
  email: { 
    type: String, 
    required: [true, 'Email é obrigatório'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email inválido']
  },
  password: { 
    type: String, 
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres']
  },
  favorites: {
    type: [gameSchema],
    default: [],
    validate: {
      validator: function(array) {
        return array.length <= 50;
      },
      message: 'Máximo de 50 jogos favoritos permitidos'
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Middleware para atualizar updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para adicionar favorito (evita duplicados)
userSchema.methods.addFavorite = function(game) {
  const isAlreadyFavorite = this.favorites.some(
    fav => fav.id.toString() === game.id.toString()
  );
  
  if (!isAlreadyFavorite && this.favorites.length < 50) {
    this.favorites.push({
      ...game,
      addedAt: new Date()
    });
  }
  
  return this.save();
};

// Método para remover favorito
userSchema.methods.removeFavorite = function(gameId) {
  this.favorites = this.favorites.filter(
    game => game.id.toString() !== gameId.toString()
  );
  return this.save();
};

// Método para limpar favoritos
userSchema.methods.clearFavorites = function() {
  this.favorites = [];
  return this.save();
};

// Índices para melhor performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.model('User', userSchema);