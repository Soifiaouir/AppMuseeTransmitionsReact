//listes des bornes
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Component/Context/authContext.jxs';

export default function Dashboard({removeToken}) {
const navigate = useNavigate();
const {logout} = useAuth();

const handleLogout = () => {
  removeToken();
  navigate('/login')
}
  return(
  <div>
    <h2>Dashboard</h2>
        <button onClick={handleLogout}>Logout</button>
  </div>
  );
}