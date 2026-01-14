import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthProvider, useAuth } from './authContext.jsx';

// Simuler useToken pour qu'il retourne un faux token
vi.mock('../../Component/APP/useToken/useToken.js', () => ({
  default: () => ({
    token: 'mon-token',
    setToken: vi.fn(),
    removeToken: vi.fn()
  })
}));

// Un composant simple pour tester
function Bouton() {
  const { isAuthenticated } = useAuth();
  
  return <div>{isAuthenticated ? 'Connecté' : 'Déconnecté'}</div>;
}

describe('AuthContext', () => {
  it('montre que l\'utilisateur est connecté', () => {
    render(
      <AuthProvider>
        <Bouton />
      </AuthProvider>
    );
    
    expect(screen.getByText('Connecté')).toBeInTheDocument();
  });
});