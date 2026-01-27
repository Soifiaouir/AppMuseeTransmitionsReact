import { BASE_URL, USERNAME, PASSWORD } from '../../config.js';

// Variable pour stocker le token
let authToken = null;
let membreToken = null;

 // Fonction pour s'authentifier et obtenir le token
export const authenticate = async (USERNAME, PASSWORD) => {
  try{  
    const response = await fetch(`${BASE_URL}/login_check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: USERNAME,
          password: PASSWORD,
        })
      });

      if (!response.ok) {
        throw new Error('Erreur d\'authentification');
      }

      const data = await response.json();
      authToken = data.token;
      console.log('Authentification réussie');
      return authToken;

  }catch (error) {
    console.error('Erreur lors de l\'authentification:', error.message);
    throw error;
  }
  }

export const loginMembre = async (username, password) => {
  try {

    const response = await fetch(`${BASE_URL}/login_check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) throw new Error('Identifiants membre invalides');

    const data = await response.json();
    return data.token;

  }catch (error) {
    console.error('Erreur login membre:', error);
    throw error;
  }
};

export const logoutMembre = () => {
  membreToken = null;
};

//recupere le token pour le membre dans le localStorage
export const getMembreToken = () => {
  const tokenString = localStorage.getItem('token');
  if(!tokenString) return null;

  try{
    const userToken = JSON.parse(tokenString);
    return userToken?.token;
  } catch {
    return null;
  }
};

/*****************************************************APPEL THEME ***********************************/

//Fonction pour recuperer la liste des themes 
export const getThemes = async () => {
  try{
   // S'authentifier si pas de token
    if (!authToken) {
      await authenticate(USERNAME, PASSWORD);
    }

    const response = await fetch(`${BASE_URL}/themes`, {
      method: 'GET',
      headers: {  
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      // Si 401, réessayer l'authentification
      if (response.status === 401) {
        authToken = null;
        await authenticate(USERNAME, PASSWORD);
        return getThemes();
      }
      throw new Error(`Erreur de récupération de la liste des thèmes`);
    }

    const data = await response.json();
    console.log(`Thème récupéré:`, data);
    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des themes:`, error.message);
    throw error;
  }
}

// Fonction pour récupérer un thème par ID
export const getThemeById = async (id) => {
  try {
    // S'authentifier si pas de token
    if (!authToken) {
      await authenticate(USERNAME, PASSWORD);
    }

    const response = await fetch(`${BASE_URL}/themes/${id}`, {
      method: 'GET',
      headers: {  
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      // Si 401, réessayer l'authentification
      if (response.status === 401) {
        authToken = null;
        await authenticate(USERNAME, PASSWORD);
        return getThemeById(id);
      }
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

// Dans apiService.js

/*****************************************************APPEL CARDS ***********************************/

// Fonction pour récupérer toutes les cartes
export const getCards = async () => {
  try {
    if (!authToken) {
      await authenticate(USERNAME, PASSWORD);
    }

    const response = await fetch(`${BASE_URL}/cards`, {
      method: 'GET',
      headers: {  
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        authToken = null;
        await authenticate(USERNAME, PASSWORD);
        return getCards();
      }
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

// Fonction pour récupérer une carte par ID
export const getCardById = async (id) => {
  try {
    if (!authToken) {
      await authenticate(USERNAME, PASSWORD);
    }

    const response = await fetch(`${BASE_URL}/cards/${id}`, {
      method: 'GET',
      headers: {  
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        authToken = null;
        await authenticate(USERNAME, PASSWORD);
        return getCardById(id);
      }
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