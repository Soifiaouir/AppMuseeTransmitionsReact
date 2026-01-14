import React, { useState } from 'react';
import { loginMembre, getMembreToken } from '../../API/apiService.js'; 
import { useAuth } from '../Context/authContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Login() {

    //local state to capture the Username and Password 
  const { setToken, isAuthentifacted} = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  //redirection si connecter
  if(isAuthentifacted){
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
 
    try {
      const token = await loginMembre(username, password);
      setToken({token: token});
      console.log('token :' + token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }  

  // Check si déjà connecté
  const currentToken = getMembreToken();
  if (currentToken) {
    return (
      <div>
        <p>Bonjour {username}</p>
      </div>
    );
  }

   return (
    <div className="login-container">
      <h2 className="text-3xl">Connexion Membre Musée</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Pseudo</label>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label>Mot de passe</label>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );

}