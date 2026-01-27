import { describe, it, expect, vi } from 'vitest';
import { getMembreToken } from './apiService.js';

// Simuler localStorage
global.localStorage = {
  getItem: vi.fn()
};

describe('API', () => {
  
  it('récupère le token', () => {
    localStorage.getItem.mockReturnValue('{"token":"abc123"}');
    
    const token = getMembreToken();
    
    expect(token).toBe('abc123');
  });

  it('retourne null si pas de token', () => {
    localStorage.getItem.mockReturnValue(null);
    
    const token = getMembreToken();
    
    expect(token).toBe(null);
  });
});