import { useState } from 'react';
import './App.css';
import Login from './Component/Login/login.jsx';
import Dashboard from './Page/Dashboard/dashboard.jsx';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import useToken from './Component/APP/useToken.js';
import ProtectedRoute from './Component/Protected_Routes/protectedRoute.jsx';
import { AuthProvider } from './Component/Context/authContext.jsx';

//Revoir la convention pour les routes -> simplon = index.js (main)
function App() {
  
  const { token, setToken, removeToken } = useToken();

  return (
    <AuthProvider>
    <div>
    <h1 className="text-3xl font-bold underline">APP Tablette Musée</h1>
      <BrowserRouter>
        <Routes>
          <Route path='/login' 
            element={
            <Login setToken={setToken}/>
            } 
          />
          <Route path="/dashboard" 
            element={
              <ProtectedRoute token={token}>
                <Dashboard removeToken={removeToken} />
              </ProtectedRoute>
            }
            />   
        </Routes>
      </BrowserRouter>
    </div>
    </AuthProvider>
  );
}

export default App
