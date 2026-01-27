import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getThemes } from '../../Services/Api/apiService.js';
import { getTabletLayout } from '../../Services/TabletConfig/tabletConfigService.js';

function Dashboard({ removeToken }) {
  const navigate = useNavigate();
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('themes');
  const [currentLayout, setCurrentLayout] = useState(null);

  useEffect(() => {
    fetchThemes();
    loadCurrentLayout();
  }, []);

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const data = await getThemes();
      const themesArray = data['hydra:member'] || data.member || data;
      setThemes(Array.isArray(themesArray) ? themesArray : []);
    } catch (error) {
      console.error('Erreur:', error);
      setThemes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentLayout = () => {
    const layout = getTabletLayout();
    setCurrentLayout(layout);
  };

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const configureTheme = (themeId) => {
    navigate(`/configure/${themeId}`);
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center p-8">
        <div className="text-2xl font-bold text-zinc-950">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 shrink-0">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl md:text-4xl font-bold text-blue-800 mb-2 leading-tight">
                Tableau de bord
              </h2>
              {currentLayout && (
                <p className="text-sm text-zinc-950 opacity-80">
                  Tablette configurée : thème #{currentLayout.themeId}
                </p>
              )}
            </div>

            <button 
              onClick={handleLogout}
              className="!bg-red-500 hover:!bg-blue-600 active:!bg-blue-700 !text-white font-bold px-8 py-4 rounded-xl !shadow-lg hover:!shadow-2xl active:scale-[0.97] transition-all duration-200 flex-shrink-0 whitespace-nowrap"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main content - flex-1 pour remplir l'espace */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 h-full">
          {activeTab === 'themes' && (
            <div className="h-full">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-4">
                <h2 className="text-3xl font-bold text-blue-500 flex-1">Liste des Thèmes</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                {themes.map((theme) => (
                  <div 
                    key={theme.id} 
                    className="bg-white border-2 border-zinc-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 p-8 group"
                  >
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-zinc-950 mb-4 group-hover:text-blue-800 transition-colors">
                          {theme.name}
                        </h3>
                        <p className="text-lg text-zinc-950 opacity-75 mb-6">
                          Créé le {new Date(theme.dateOfCreation).toLocaleDateString('fr-FR')}
                        </p>
                        <div className="flex flex-wrap gap-6 text-lg text-zinc-950 opacity-75 mb-6">
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            {theme.cards?.length || 0} cartes
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                            {theme.colors?.length || 0} couleurs
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            {theme.medias?.length || 0} médias
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {theme.archived && (
                            <span className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-bold rounded-lg border-2 border-yellow-200">
                              Archivé
                            </span>
                          )}
                          {currentLayout?.themeId === theme.id && (
                            <span className="px-4 py-2 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-lg border-2 border-emerald-200">
                              Actif sur tablette
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 pt-2 lg:pt-0 min-w-fit">
                        <button 
                          onClick={() => navigate(`/detail/${theme.id}`)}
                          className="!bg-blue-500 hover:!bg-blue-600 active:!bg-blue-700 !text-white font-bold px-8 py-4 rounded-xl !shadow-lg hover:!shadow-xl active:scale-[0.97] transition-all duration-200 whitespace-nowrap"
                        >
                          Détails
                        </button>
                        <button 
                          onClick={() => configureTheme(theme.id)}
                          className="!bg-red-500 hover:!bg-blue-600 active:!bg-blue-700 !text-white font-bold px-8 py-4 rounded-xl !shadow-lg hover:!shadow-xl active:scale-[0.97] transition-all duration-200 whitespace-nowrap"
                        >
                          Configurer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {themes.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-24 bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-3xl text-center">
                    <h3 className="text-3xl font-bold text-zinc-950 mb-4">Aucun thème</h3>
                    <p className="text-xl text-zinc-950 opacity-75 max-w-md mb-8">
                      Commencez par créer votre premier thème pour cette tablette musée
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="h-full flex flex-col">
              <h2 className="text-3xl font-bold text-blue-500 mb-12">Statistiques</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-4 border-blue-200 p-10 rounded-3xl text-center shadow-2xl">
                  <div className="text-5xl font-black text-blue-800 mb-4">
                    {themes.length}
                  </div>
                  <div className="text-2xl font-bold text-zinc-950">Thèmes</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-4 border-emerald-200 p-10 rounded-3xl text-center shadow-2xl">
                  <div className="text-5xl font-black text-emerald-800 mb-4">
                    {themes.reduce((acc, t) => acc + (t.cards?.length || 0), 0)}
                  </div>
                  <div className="text-2xl font-bold text-zinc-950">Cartes</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-4 border-purple-200 p-10 rounded-3xl text-center shadow-2xl">
                  <div className="text-5xl font-black text-purple-800 mb-4">
                    {themes.reduce((acc, t) => acc + (t.medias?.length || 0), 0)}
                  </div>
                  <div className="text-2xl font-bold text-zinc-950">Médias</div>
                </div>
              </div>
              
              {currentLayout && (
                <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 border-4 border-zinc-200 p-10 rounded-3xl shadow-xl">
                  <h3 className="text-2xl font-bold text-zinc-950 mb-6">Configuration actuelle</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-lg">
                    <div className="text-zinc-950">
                      <span className="font-bold text-2xl">{currentLayout.themeId}</span><br/>
                      <span className="opacity-75">Thème ID</span>
                    </div>
                    <div className="text-zinc-950">
                      <span className="font-bold text-2xl">{currentLayout.elements?.length || 0}</span><br/>
                      <span className="opacity-75">Éléments</span>
                    </div>
                    <div className="text-zinc-950">
                      <span className="font-bold text-2xl">{new Date(currentLayout.savedAt).toLocaleDateString('fr-FR')}</span><br/>
                      <span className="opacity-75">Dernière modification</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
