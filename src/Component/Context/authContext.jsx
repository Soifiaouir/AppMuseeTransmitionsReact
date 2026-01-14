import React, {createContext, useContext, useState} from "react";
import useToken from "../../Component/APP/useToken/useToken.js";

/**
 * Now any component can access authentication state using useAuth(),
 */
const AuthContext = createContext(null);

export function AuthProvider({children}){
    const {token, setToken, removeToken} = useToken();
    
    const logout = () => {
        removeToken();
        window.location.href = '/login'; //Redirection 
    }

    //export a travers value des élements et dans les composant appel a travers useAuth()
    const value ={
        token,
        setToken, 
        logout, 
        isAuthenticated: !!token
    }

    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context){
        throw new Error('l\'utilisation de useAuth doir se faire dans AuthProvider');
    }
    return context;
}