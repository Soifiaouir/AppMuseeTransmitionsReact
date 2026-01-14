import { jwtDecode } from 'jwt-decode';
import { useState } from 'react';

/**
 * hook personnalié
 * réultilisable dans plusieurs composant
 */
export default function useToken() {
//recupere tout token existant
  const getToken = () => {
    const tokenString = localStorage.getItem('token');
    if (!tokenString) {
      return null;
    }
    const userToken = JSON.parse(tokenString);
    const token = userToken?.token;
    
    if (!token){
      return null;
    }

    //try{}
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;//convertis en seconde

    //suprime le toen du local storage si la date est expiré
    if (decoded.exp < currentTime) {
      localStorage.removeItem('token')
      return null;
    }

    return token;
    //} catch (error){
    //localStorage.removeItem('token');
      //return null;    
    //}    
  };
  //The getToken function now decodes the JWT and checks the exp claim 

  const [token, setToken] = useState(getToken());

  //enregistre le token dans localStorage, c'est plus secur que session storage et react state
  const saveToken = userToken => {
    localStorage.setItem('token', JSON.stringify(userToken));
    setToken(userToken.token);
  };

  const removeToken = () =>{
    localStorage.removeItem('token');
    setToken(null)
  };

    return {
    setToken: saveToken,
    token,
    removeToken
  }

}