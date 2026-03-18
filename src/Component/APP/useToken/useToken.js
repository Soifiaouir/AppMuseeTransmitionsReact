import { jwtDecode } from 'jwt-decode';
import { useState } from 'react';

export default function useToken() {

  const getToken = () => {
    const tokenString = localStorage.getItem('token');
    if (!tokenString) return null;

    try {
      const decoded = jwtDecode(tokenString);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        localStorage.removeItem('token');
        return null;
      }

      return tokenString;
    } catch (error) {
      localStorage.removeItem('token');
      return null;
    }
  };

  const [token, setToken] = useState(getToken());

  const saveToken = (userToken) => {
    // Accepte aussi bien une string qu'un objet { token }
    const tokenString = typeof userToken === 'object' ? userToken.token : userToken;
    localStorage.setItem('token', tokenString);
    setToken(tokenString);
  };

  const removeToken = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return {
    setToken: saveToken,
    token,
    removeToken
  };
}