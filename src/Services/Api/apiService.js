import { BASE_URL, USERNAME, PASSWORD } from '../../config.js';

// Token technique pour l'app React -> API
let appAuthToken = null;
let appRefreshToken = null;

// Token membre (utilisateur connecté)
let membreAuthToken = null;
let membreRefreshToken = null;

// ============================================
// AUTHENTIFICATION TECHNIQUE (APP -> API)
// ============================================
const authenticateApp = async () => {
  try {
    console.log('Authentification technique app -> API avec:', USERNAME);
    
    const response = await fetch(`${BASE_URL}/api/login_check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: USERNAME,
        password: PASSWORD,
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur authentification technique');
    }

    const data = await response.json();
    appAuthToken = data.token;
    appRefreshToken = data.refresh_token;
    console.log('Authentification technique réussie');
    return appAuthToken;
  } catch (error) {
    console.error('Erreur authentification technique:', error.message);
    throw error;
  }
};

// ============================================
// AUTHENTIFICATION MEMBRE (UTILISATEUR)
// ============================================
export const loginMembre = async (username, password) => {
  try {
    console.log('Login membre avec:', username);
    
    const response = await fetch(`${BASE_URL}/api/login_check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) throw new Error('Identifiants membre invalides');

    const data = await response.json();
    membreAuthToken = data.token;
    membreRefreshToken = data.refresh_token;

    // Stocker dans localStorage
    localStorage.setItem('token', membreAuthToken);
    localStorage.setItem('refresh_token', membreRefreshToken);

    console.log('Login membre réussi');
    return membreAuthToken;
  } catch (error) {
    console.error('Erreur login membre:', error);
    throw error;
  }
};

export const logoutMembre = () => {
  membreAuthToken = null;
  membreRefreshToken = null;
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  console.log('Membre déconnecté');
};

export const getMembreToken = () => {
  if (!membreAuthToken) {
    membreAuthToken = localStorage.getItem('token');
  }
  return membreAuthToken;
};

// ============================================
// REFRESH TOKEN
// ============================================
const refreshMembreToken = async () => {
  if (!membreRefreshToken) {
    membreRefreshToken = localStorage.getItem('refresh_token');
  }
  
  if (!membreRefreshToken) {
    throw new Error('Pas de refresh_token disponible');
  }

  const response = await fetch(`${BASE_URL}/api/token/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: membreRefreshToken }),
  });

  if (!response.ok) {
    throw new Error('Impossible de rafraîchir le token');
  }

  const data = await response.json();
  membreAuthToken = data.token;
  membreRefreshToken = data.refresh_token;
  
  localStorage.setItem('token', membreAuthToken);
  localStorage.setItem('refresh_token', membreRefreshToken);
  
  return membreAuthToken;
};

// ============================================
// WRAPPER POUR LES REQUÊTES AUTHENTIFIÉES
// ============================================
const fetchWithAuth = async (url, options = {}) => {
  // Priorité 1 : Token membre (si utilisateur connecté)
  let token = getMembreToken();
  
  // Priorité 2 : Token technique app (si pas de membre connecté)
  if (!token) {
    if (!appAuthToken) {
      await authenticateApp();
    }
    token = appAuthToken;
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  // Gérer le 401
  if (response.status === 401) {
    try {
      // Si on avait un token membre, essayer de le rafraîchir
      if (membreAuthToken) {
        await refreshMembreToken();
      } else {
        // Sinon rafraîchir le token technique
        await authenticateApp();
      }
      // Relancer la requête
      return fetchWithAuth(url, options);
    } catch (refreshError) {
      console.error('Échec refresh token:', refreshError);
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
      `${BASE_URL}/api/themes?archived=false&page=${page}&order[name]=asc`
    );

    if (!response.ok) {
      throw new Error(`Erreur de récupération de la liste des thèmes`);
    }

    const data = await response.json();
    console.log('Données brutes de l\'API:', data);

    const themesArray = data.member || data['hydra:member'] || [];
    const total = data.totalItems || data['hydra:totalItems'] || 0;

    return {
      themes: themesArray,
      totalItems: total,
      currentPage: page,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des themes:', error.message);
    throw error;
  }
};

export const getThemeById = async (id) => {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/themes/${id}`);

    if (!response.ok) {
      throw new Error(`Erreur de récupération du thème ${id}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du thème ${id}:`, error.message);
    throw error;
  }
};

// ============================================
// APPELS API - CARDS
// ============================================
export const getCards = async () => {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/cards`);

    if (!response.ok) {
      throw new Error('Erreur de récupération de la liste des cartes');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des cartes:', error.message);
    throw error;
  }
};

export const getCardById = async (id) => {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/api/cards/${id}`);

    if (!response.ok) {
      throw new Error(`Erreur de récupération de la carte ${id}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la carte ${id}:`, error.message);
    throw error;
  }
};