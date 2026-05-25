import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import api from './api';

const initialLogin = { email: '', password: '' };
const initialRegister = { username: '', email: '', password: '' };

function getStoredSession() {
  const token = localStorage.getItem('gamehub_token');
  const user = localStorage.getItem('gamehub_user');

  if (!token || !user) {
    return { token: '', user: null };
  }

  try {
    return { token, user: JSON.parse(user) };
  } catch {
    localStorage.removeItem('gamehub_token');
    localStorage.removeItem('gamehub_user');
    return { token: '', user: null };
  }
}

function GameCard({ game, isFavorite, isLoggedIn, onAddFavorite, onRemoveFavorite }) {
  return (
    <article className="game-card">
      <div className="game-cover">
        {game.thumbnail ? <img src={game.thumbnail} alt={game.title} /> : <span>{game.title}</span>}
      </div>

      <div className="game-content">
        <div className="game-heading">
          <h3>{game.title}</h3>
          <span>{game.genre || 'Jogo'}</span>
        </div>

        <p>{game.short_description || 'Sem descricao disponivel.'}</p>

        <div className="meta-row">
          {game.platform && <span>{game.platform}</span>}
          {game.publisher && <span>{game.publisher}</span>}
          {game.release_date && <span>{new Date(game.release_date).getFullYear()}</span>}
        </div>
      </div>

      <div className="card-actions">
        {game.game_url && (
          <a className="button button-ghost" href={game.game_url} target="_blank" rel="noreferrer">
            Jogar
          </a>
        )}

        {isLoggedIn && (
          <button
            className={isFavorite ? 'button button-danger' : 'button button-primary'}
            type="button"
            onClick={() => (isFavorite ? onRemoveFavorite(game.id) : onAddFavorite(game))}
          >
            {isFavorite ? 'Remover' : 'Favoritar'}
          </button>
        )}
      </div>
    </article>
  );
}

function App() {
  const storedSession = getStoredSession();
  const [user, setUser] = useState(storedSession.user);
  const [token, setToken] = useState(storedSession.token);
  const [authMode, setAuthMode] = useState('login');
  const [loginData, setLoginData] = useState(initialLogin);
  const [registerData, setRegisterData] = useState(initialRegister);
  const [games, setGames] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('Todos');
  const [status, setStatus] = useState({ loading: true, auth: false, message: '' });

  const authHeaders = useMemo(
    () => (token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    [token]
  );

  const favoriteIds = useMemo(
    () => new Set(favorites.map((game) => String(game.id))),
    [favorites]
  );

  const genres = useMemo(() => {
    const uniqueGenres = new Set(games.map((game) => game.genre).filter(Boolean));
    return ['Todos', ...Array.from(uniqueGenres).sort()];
  }, [games]);

  const filteredGames = useMemo(() => {
    const search = query.trim().toLowerCase();

    return games.filter((game) => {
      const matchesSearch = [game.title, game.genre, game.publisher, game.platform]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(search));
      const matchesGenre = genre === 'Todos' || game.genre === genre;
      return matchesSearch && matchesGenre;
    });
  }, [games, genre, query]);

  const stats = [
    { label: 'Jogos no catalogo', value: games.length },
    { label: 'Favoritos salvos', value: favorites.length },
    { label: 'Generos disponiveis', value: Math.max(genres.length - 1, 0) },
  ];

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    if (!token) return;

    api
      .get('/api/auth/verify', authHeaders)
      .then((response) => {
        persistSession(token, response.data.user);
        setUser(response.data.user);
        loadFavorites(token);
      })
      .catch(() => logout('Sua sessao expirou. Entre novamente.'));
  }, [authHeaders, token]);

  async function loadGames() {
    setStatus((current) => ({ ...current, loading: true, message: '' }));

    try {
      const response = await api.get('/api/games');
      setGames(response.data.games || []);
    } catch {
      setStatus((current) => ({
        ...current,
        message: 'Nao foi possivel carregar o catalogo agora.',
      }));
    } finally {
      setStatus((current) => ({ ...current, loading: false }));
    }
  }

  async function loadFavorites(activeToken = token) {
    if (!activeToken) return;

    try {
      const response = await api.get('/api/favorites', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      setFavorites(response.data.favorites || []);
    } catch {
      setStatus((current) => ({
        ...current,
        message: 'Nao foi possivel carregar seus favoritos.',
      }));
    }
  }

  function persistSession(nextToken, nextUser) {
    localStorage.setItem('gamehub_token', nextToken);
    localStorage.setItem('gamehub_user', JSON.stringify(nextUser));
  }

  function logout(message = '') {
    localStorage.removeItem('gamehub_token');
    localStorage.removeItem('gamehub_user');
    setUser(null);
    setToken('');
    setFavorites([]);
    setStatus((current) => ({ ...current, message }));
  }

  async function handleAuth(event) {
    event.preventDefault();
    const payload = authMode === 'login' ? loginData : registerData;

    setStatus((current) => ({ ...current, auth: true, message: '' }));

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await api.post(endpoint, payload);
      setUser(response.data.user);
      setToken(response.data.token);
      persistSession(response.data.token, response.data.user);
      setLoginData(initialLogin);
      setRegisterData(initialRegister);
      loadFavorites(response.data.token);
    } catch (error) {
      setStatus((current) => ({
        ...current,
        message: error.response?.data?.message || 'Nao foi possivel autenticar.',
      }));
    } finally {
      setStatus((current) => ({ ...current, auth: false }));
    }
  }

  async function addFavorite(game) {
    try {
      const response = await api.post('/api/favorites', game, authHeaders);
      setFavorites(response.data.favorites || []);
    } catch (error) {
      setStatus((current) => ({
        ...current,
        message: error.response?.data?.message || 'Nao foi possivel favoritar esse jogo.',
      }));
    }
  }

  async function removeFavorite(gameId) {
    try {
      const response = await api.delete(`/api/favorites/${gameId}`, authHeaders);
      setFavorites(response.data.favorites || []);
    } catch (error) {
      setStatus((current) => ({
        ...current,
        message: error.response?.data?.message || 'Nao foi possivel remover esse favorito.',
      }));
    }
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <nav className="topbar" aria-label="Navegacao principal">
          <strong>GameHub</strong>
          {user ? (
            <div className="user-menu">
              <span>{user.username}</span>
              <button className="button button-ghost" type="button" onClick={() => logout()}>
                Sair
              </button>
            </div>
          ) : (
            <a href="#entrar">Entrar</a>
          )}
        </nav>

        <section className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Biblioteca de jogos gratis</span>
            <h1>Descubra, filtre e guarde seus proximos jogos favoritos.</h1>
            <p>
              Um painel direto para explorar jogos, separar favoritos e voltar rapido ao que
              realmente vale jogar.
            </p>
          </div>

          <div className="hero-panel" aria-label="Resumo do GameHub">
            {stats.map((item) => (
              <div className="stat" key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      </header>

      <main>
        {status.message && (
          <div className="notice" role="status">
            <span>{status.message}</span>
            <button type="button" onClick={() => setStatus((current) => ({ ...current, message: '' }))}>
              Fechar
            </button>
          </div>
        )}

        {!user && (
          <section className="auth-section" id="entrar">
            <div>
              <span className="eyebrow">Conta GameHub</span>
              <h2>{authMode === 'login' ? 'Entre para salvar favoritos' : 'Crie sua conta'}</h2>
              <p>Seu catalogo continua visivel, mas os favoritos ficam guardados na sua conta.</p>
            </div>

            <form className="auth-form" onSubmit={handleAuth}>
              <div className="mode-switch" role="tablist" aria-label="Modo de autenticacao">
                <button
                  className={authMode === 'login' ? 'active' : ''}
                  type="button"
                  onClick={() => setAuthMode('login')}
                >
                  Login
                </button>
                <button
                  className={authMode === 'register' ? 'active' : ''}
                  type="button"
                  onClick={() => setAuthMode('register')}
                >
                  Cadastro
                </button>
              </div>

              {authMode === 'register' && (
                <label>
                  Nome de usuario
                  <input
                    value={registerData.username}
                    onChange={(event) =>
                      setRegisterData((current) => ({ ...current, username: event.target.value }))
                    }
                    minLength="3"
                    required
                  />
                </label>
              )}

              <label>
                Email
                <input
                  type="email"
                  value={authMode === 'login' ? loginData.email : registerData.email}
                  onChange={(event) =>
                    authMode === 'login'
                      ? setLoginData((current) => ({ ...current, email: event.target.value }))
                      : setRegisterData((current) => ({ ...current, email: event.target.value }))
                  }
                  required
                />
              </label>

              <label>
                Senha
                <input
                  type="password"
                  value={authMode === 'login' ? loginData.password : registerData.password}
                  onChange={(event) =>
                    authMode === 'login'
                      ? setLoginData((current) => ({ ...current, password: event.target.value }))
                      : setRegisterData((current) => ({ ...current, password: event.target.value }))
                  }
                  minLength="6"
                  required
                />
              </label>

              <button className="button button-primary" type="submit" disabled={status.auth}>
                {status.auth ? 'Enviando...' : authMode === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            </form>
          </section>
        )}

        {user && (
          <section className="content-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Sua selecao</span>
                <h2>Favoritos</h2>
              </div>
              <span>{favorites.length}/50 salvos</span>
            </div>

            {favorites.length ? (
              <div className="games-grid compact">
                {favorites.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isFavorite
                    isLoggedIn
                    onRemoveFavorite={removeFavorite}
                    onAddFavorite={addFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">Favorite um jogo do catalogo para montar sua lista.</div>
            )}
          </section>
        )}

        <section className="content-section">
          <div className="section-heading catalog-heading">
            <div>
              <span className="eyebrow">Catalogo</span>
              <h2>Todos os jogos</h2>
            </div>

            <div className="filters">
              <input
                type="search"
                placeholder="Buscar por titulo, genero ou plataforma"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <select value={genre} onChange={(event) => setGenre(event.target.value)}>
                {genres.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          {status.loading ? (
            <div className="empty-state">Carregando catalogo...</div>
          ) : filteredGames.length ? (
            <div className="games-grid">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  isFavorite={favoriteIds.has(String(game.id))}
                  isLoggedIn={Boolean(user)}
                  onAddFavorite={addFavorite}
                  onRemoveFavorite={removeFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">Nenhum jogo encontrado para essa busca.</div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
