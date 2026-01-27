import { useState } from 'react';
import './App.css';
import Login from './Component/Login/login.jsx';
import Dashboard from './Page/Dashboard/dashboard.jsx';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import useToken from './Component/APP/useToken/useToken.js';
import ProtectedRoute from './Component/Protected_Routes/protectedRoute.jsx';
import { AuthProvider } from './Component/Context/authContext.jsx';
import ThemeDetail from './Page/Themes/detail.jsx';
import LayoutConfigurator from './Page/LayoutConfigurator/layoutConfigurator.jsx';
import VisitorDisplay from './Page/VisitorDisplay/visitorDisplay.jsx';

function App() {
  const { token, setToken, removeToken } = useToken();

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="w-screen h-screen flex flex-col bg-zinc-50 overflow-hidden">
          <Routes>
            <Route path="/" element={<VisitorDisplay/>} />
            <Route 
              path='/login' 
              element={<Login setToken={setToken}/>} 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute token={token}>
                  <Dashboard removeToken={removeToken} />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/detail/:id" 
              element={
                <ProtectedRoute token={token}>
                  <ThemeDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/configure/:themeId" 
              element={
                <ProtectedRoute token={token}>
                  <LayoutConfigurator />
                </ProtectedRoute>
              } 
            />
          </Routes>   
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;