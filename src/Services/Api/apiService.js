import { BASE_URL, USERNAME, PASSWORD } from '../../config.js';

// Variables pour stocker les tokens
let authToken = null;
let refreshToken = null;

// Fonction pour s'authentifier et obtenir les tokens
export const authenticate = async (USERNAME, PASSWORD) => {
  try {
    const response = await fetch(`${BASE_URL}/login_check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: USERNAME,
        password: PASSWORD,
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur d\'authentification');
    }

    const data = await response.json();
    authToken = data.token;
    refreshToken = data.refresh_token;
    console.log('Authentification réussie');
    return authToken;
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error.message);
    throw error;
  }
};

export const loginMembre = async (username, password) => {
  try {
    const response = await fetch(`${BASE_URL}/login_check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) throw new Error('Identifiants membre invalides');

    const data = await response.json();
    const token = data.token;
    const refresh = data.refresh_token;

    // On stocke dans localStorage avec les deux tokens séparés
    localStorage.setItem('token', token);
    localStorage.setItem('refresh_token', refresh);

    return token;
  } catch (error) {
    console.error('Erreur login membre:', error);
    throw error;
  }
};

export const logoutMembre = () => {
  membreToken = null;
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
};

// Récupère le token membre depuis localStorage
export const getMembreToken = () => {
  return localStorage.getItem('token');
};

// Fonction interne pour rafraîchir le token
const refreshAuthToken = async () => {
  if (!refreshToken) throw new Error('Pas de refresh_token disponible');

  const response = await fetch(`${BASE_URL}/api/token/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Impossible de rafraîchir le token');
  }

  const data = await response.json();
  authToken = data.token;
  refreshToken = data.refresh_token; // nouveau refresh_token si single_use
  return authToken;
};

// Wrapper pour toutes les requêtes authentifiées
const fetchWithAuth = async (url, options = {}) => {
  if (!authToken) {
    await authenticate(USERNAME, PASSWORD);
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // On tente de rafraîchir le token
    try {
      await refreshAuthToken();
      // On relance la même requête avec le nouveau token
      return fetchWithAuth(url, options);
    } catch (refreshError) {
      // Si le refresh échoue, on invalide tout
      authToken = null;
      refreshToken = null;
      throw refreshError;
    }
  }

  return response;
};

/*****************************************************APPEL THEME ***********************************/

export const getThemes = async (page = 1) => {
  try {
    const response = await fetchWithAuth(
      `${BASE_URL}/themes?archived=false&page=${page}&order[name]=asc`
    );

    if (!response.ok) {
      throw new Error(`Erreur de récupération de la liste des thèmes`);
    }

    const data = await response.json();
    console.log(`✅ Données brutes de l'API:`, data);

    const themesArray = data.member || data['hydra:member'] || [];
    const total = data.totalItems || data['hydra:totalItems'] || 0;

    console.log(`📊 Après traitement:`, {
      themes: themesArray,
      totalItems: total,
      currentPage: page,
      nombreDeThemes: themesArray.length,
    });

    return {
      themes: themesArray,
      totalItems: total,
      currentPage: page,
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération des themes:`, error.message);
    throw error;
  }
};

export const getThemeById = async (id) => {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/themes/${id}`);

    if (!response.ok) {
      throw new Error(`Erreur de récupération du thème ${id}`);
    }

    const data = await response.json();
    console.log(`Thème ${id} récupéré:`, data);
    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du thème ${id}:`, error.message);
    throw error;
  }
};

/*****************************************************APPEL CARDS ***********************************/

export const getCards = async () => {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/cards`);

    if (!response.ok) {
      throw new Error(`Erreur de récupération de la liste des cartes`);
    }

    const data = await response.json();
    console.log('Cartes récupérées:', data);
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des cartes:', error.message);
    throw error;
  }
};

export const getCardById = async (id) => {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/cards/${id}`);

    if (!response.ok) {
      throw new Error(`Erreur de récupération de la carte ${id}`);
    }

    const data = await response.json();
    console.log(`Carte ${id} récupérée:`, data);
    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la carte ${id}:`, error.message);
    throw error;
  }
};