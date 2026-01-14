// src/Component/themeList.jsx
import React, { useState, useEffect } from 'react';
import { getThemes } from '../../API/themeService';

const ThemesList = () => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const data = await getThemes();
        console.log('Data reçue:', data);
        
        // Accéder à data.member ou data['hydra:member']
        setThemes(data.member || data['hydra:member'] || []);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, []);

  if (loading) return <div>Chargement des thèmes...</div>;

  return (
    <div className="themes-list">
      <h2>Thèmes du Musée</h2>
      <p>Nombre de thèmes : {themes.length}</p>
      <div className="themes-grid">
        {themes.map((theme) => (
          <div key={theme.id || theme['@id']} className="theme-card">
            <h3>{theme.name || theme.title}</h3>
            {/* Affichez les autres propriétés */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemesList;