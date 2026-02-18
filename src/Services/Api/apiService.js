import { BASE_URL, USERNAME, PASSWORD } from '../../config.js';

let authToken = null;
let refreshToken = null;

// ============================================
// AUTHENTIFICATION TECHNIQUE (APP -> API)
// ============================================
export const authenticate = async (user, pass) => {
  try {
    const response = await fetch(`${BASE_URL}/login_check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass }),
    });

    if (!response.ok) throw new Error('Erreur authentification technique');

    const data = await response.json();
    authToken = data.token;
    refreshToken = data.refresh_token;
    console.log('Authentification technique reussie');
    return authToken;
  } catch (error) {
    console.error('Erreur authentification:', error.message);
    throw error;
  }
};

// ============================================
// AUTHENTIFICATION MEMBRE
// ============================================
export const loginMembre = async (username, password) => {
  try {
    const response = await fetch(`${BASE_URL}/login_check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) throw new Error('Identifiants membre invalides');

    const data = await response.json();

    // Stocke uniquement le refresh_token
    // Le token JWT est géré par useToken via setToken dans Login.jsx
    localStorage.setItem('refresh_token', data.refresh_token);

    console.log('Login membre reussi');
    return data.token;
  } catch (error) {
    console.error('Erreur login membre:', error);
    throw error;
  }
};

export const logoutMembre = () => {
  authToken = null;
  refreshToken = null;
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  console.log('Membre deconnecte');
};

export const getMembreToken = () => {
  return localStorage.getItem('token');
};

// ============================================
// REFRESH TOKEN
// ============================================
const refreshAuthToken = async () => {
  const storedRefresh = refreshToken || localStorage.getItem('refresh_token');
  if (!storedRefresh) throw new Error('Pas de refresh_token disponible');

  const response = await fetch(`${BASE_URL}/token/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: storedRefresh }),
  });

  if (!response.ok) {
    logoutMembre();
    throw new Error('Impossible de rafraichir le token');
  }

  const data = await response.json();
  authToken = data.token;
  refreshToken = data.refresh_token;
  localStorage.setItem('token', authToken);
  localStorage.setItem('refresh_token', refreshToken);
  return authToken;
};

// ============================================
// WRAPPER REQUETES AUTHENTIFIEES
// ============================================
const fetchWithAuth = async (url, options = {}) => {
  if (!authToken) {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      authToken = storedToken;
    } else {
      await authenticate(USERNAME, PASSWORD);
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    try {
      await refreshAuthToken();
      return fetchWithAuth(url, options);
    } catch (refreshError) {
      authToken = null;
      refreshToken = null;
      throw refreshError;
    }
  }

  return response;
};

// ============================================
// APPELS API - THEMES
// ============================================
export const getThemes = async (page = 1) => {
  try {
    const response = await fetchWithAuth(
      `${BASE_URL}/themes?archived=false&page=${page}&order[name]=asc`
    );
    if (!response.ok) throw new Error('Erreur recuperation themes');

    const data = await response.json();
    const themesArray = data.member || data['hydra:member'] || [];
    const total = data.totalItems || data['hydra:totalItems'] || 0;

    return { themes: themesArray, totalItems: total, currentPage: page };
  } catch (error) {
    console.error('Erreur themes:', error.message);
    throw error;
  }
};

export const getThemeById = async (id) => {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/themes/${id}`);
    if (!response.ok) throw new Error(`Erreur recuperation theme ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Erreur theme ${id}:`, error.message);
    throw error;
  }
};

// ============================================
// APPELS API - CARDS
// ============================================
export const getCards = async () => {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/cards`);
    if (!response.ok) throw new Error('Erreur recuperation cartes');
    return await response.json();
  } catch (error) {
    console.error('Erreur cartes:', error.message);
    throw error;
  }
};

export const getCardById = async (id) => {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/cards/${id}`);
    if (!response.ok) throw new Error(`Erreur recuperation carte ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Erreur carte ${id}:`, error.message);
    throw error;
  }
};