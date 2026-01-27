import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getThemeById } from '../../Services/Api/apiService.js';
import { UPLOAD_URL } from '../../config.js';
import MediaPlayer from '../../Component/MediaPlayer/mediaPlayer.jsx';

function ThemeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(null);
  const [activeTab, setActiveTab] = useState('cards');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        setLoading(true);
        const data = await getThemeById(id);
        setTheme(data);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTheme();
  }, [id]);

  const getMediaUrl = (media) => {
    const path = media.publicPath.replace('/uploads/media/', '');
    return `${UPLOAD_URL}/${path}`;
  };

  const getMediaType = (media) => {
    const ext = media.extensionFile.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['mp4', 'webm', 'ogg', 'mpeg'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'm4a'].includes(ext)) return 'audio';
    return 'unknown';
  };

  const getMimeType = (media) => {
    const types = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
      mp4: 'video/mp4', webm: 'video/webm',
      mp3: 'audio/mpeg', wav: 'audio/wav'
    };
    return types[media.extensionFile.toLowerCase()] || 'application/octet-stream';
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center p-8">
        <div className="text-2xl font-bold text-zinc-950">Chargement...</div>
      </div>
    );
  }

  if (!theme) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-zinc-950 mb-4">Thème introuvable</h1>
          <button 
            onClick={() => navigate('/dashboard')}
            className="!bg-red-500 hover:!bg-blue-600 active:!bg-blue-700 !text-white font-bold px-8 py-4 rounded-xl !shadow-lg hover:!shadow-xl active:scale-[0.97] transition-all duration-200"
          >
            Retour Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 shrink-0">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="!bg-zinc-950 hover:!bg-zinc-800 active:scale-95 !text-white font-bold w-14 h-14 rounded-2xl !shadow-xl hover:!shadow-2xl transition-all duration-200 flex items-center justify-center"
              >
                <span className="text-xl">←</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold text-blue-800 mb-1 leading-tight">
                  Détail Thème
                </h1>
                <p className="text-lg text-zinc-950 opacity-75 font-semibold">
                  {theme.name}
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate(`/configure/${theme.id}`)}
              className="!bg-red-500 hover:!bg-blue-600 active:!bg-blue-700 !text-white font-bold px-12 py-4 rounded-xl !shadow-lg hover:!shadow-xl active:scale-[0.97] transition-all duration-200 whitespace-nowrap"
            >
              Configurer
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 py-8 h-full">
          {/* Stats rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-4 border-blue-200 p-8 rounded-3xl text-center shadow-2xl">
              <div className="text-4xl font-black text-blue-800 mb-2">{theme.cards?.length || 0}</div>
              <div className="text-xl font-bold text-zinc-950">Cartes</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-4 border-purple-200 p-8 rounded-3xl text-center shadow-2xl">
              <div className="text-4xl font-black text-purple-800 mb-2">{theme.medias?.length || 0}</div>
              <div className="text-xl font-bold text-zinc-950">Médias</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-4 border-emerald-200 p-8 rounded-3xl text-center shadow-2xl">
              <div className="text-4xl font-black text-emerald-800 mb-2">{theme.colors?.length || 0}</div>
              <div className="text-xl font-bold text-zinc-950">Couleurs</div>
            </div>
          </div>

          {/* Navigation onglets */}
          <nav className="bg-white/90 backdrop-blur-xl border-b-2 border-zinc-200 rounded-t-2xl mb-0">
            <div className="flex space-x-1 px-6">
              <button 
                onClick={() => setActiveTab('cards')}
                className={`px-8 py-4 rounded-t-lg font-bold text-lg transition-all flex-1 ${
                  activeTab === 'cards' 
                    ? '!bg-blue-500 !text-white shadow-blue-500/25 !shadow-2xl border-b-2 border-blue-400' 
                    : 'text-zinc-950 hover:bg-blue-50 hover:text-blue-800'
                }`}
              >
                Cartes ({theme.cards?.length || 0})
              </button>
              <button 
                onClick={() => setActiveTab('medias')}
                className={`px-8 py-4 rounded-t-lg font-bold text-lg transition-all flex-1 ${
                  activeTab === 'medias' 
                    ? '!bg-purple-500 !text-white shadow-purple-500/25 !shadow-2xl border-b-2 border-purple-400' 
                    : 'text-zinc-950 hover:bg-purple-50 hover:text-purple-800'
                }`}
              >
                Médias ({theme.medias?.length || 0})
              </button>
              <button 
                onClick={() => setActiveTab('colors')}
                className={`px-8 py-4 rounded-t-lg font-bold text-lg transition-all flex-1 ${
                  activeTab === 'colors' 
                    ? '!bg-emerald-500 !text-white shadow-emerald-500/25 !shadow-2xl border-b-2 border-emerald-400' 
                    : 'text-zinc-950 hover:bg-emerald-50 hover:text-emerald-800'
                }`}
              >
                Couleurs ({theme.colors?.length || 0})
              </button>
            </div>
          </nav>

          {/* Contenu onglets */}
          <div className="bg-white border border-zinc-200 rounded-b-2xl shadow-xl overflow-hidden">
            {activeTab === 'cards' && (
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {theme.cards?.map(card => (
                    <div 
                      key={card.id} 
                      className="group bg-gradient-to-br from-zinc-50 to-zinc-100 border-2 border-zinc-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-400 hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      <h3 className="text-xl font-bold text-zinc-950 mb-3 group-hover:text-blue-800 line-clamp-2">
                        {card.title}
                      </h3>
                      <p className="text-zinc-950 opacity-75 text-sm leading-relaxed line-clamp-3 mb-4">
                        {card.detail}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-zinc-950 opacity-60 font-mono bg-white px-3 py-1 rounded-lg">
                        ID: {card.id}
                      </div>
                    </div>
                  )) || (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-300 rounded-3xl text-center">
                      <h3 className="text-2xl font-bold text-zinc-950 mb-2">Aucune carte</h3>
                      <p className="text-lg text-zinc-950 opacity-75">Ce thème n'a pas encore de cartes</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'medias' && (
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {theme.medias?.map(media => (
                    <div key={media.id} className="group bg-white border-2 border-zinc-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-purple-400 hover:-translate-y-1 transition-all duration-300">
                      {getMediaType(media) === 'image' && (
                        <img 
                          src={getMediaUrl(media)} 
                          alt={media.userGivenName} 
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      {(getMediaType(media) === 'video' || getMediaType(media) === 'audio') && (
                        <div className="h-48 bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center p-4">
                          <MediaPlayer 
                            mediaSource={getMediaUrl(media)} 
                            mediaType={getMimeType(media)} 
                            width={280} 
                            height={200}
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="font-bold text-zinc-950 text-lg mb-1 truncate group-hover:text-purple-800">
                          {media.userGivenName}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-zinc-950 opacity-60">
                          <span className="px-2 py-1 bg-zinc-100 rounded font-mono text-xs">
                            {media.extensionFile?.toUpperCase()}
                          </span>
                          <span>{getMediaType(media)}</span>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-300 rounded-3xl text-center">
                      <h3 className="text-2xl font-bold text-zinc-950 mb-2">Aucun média</h3>
                      <p className="text-lg text-zinc-950 opacity-75">Ce thème n'a pas encore de médias</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'colors' && (
              <div className="p-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {theme.colors?.map(color => (
                    <div key={color.id} className="group text-center hover:scale-105 transition-all duration-300">
                      <div 
                        className="w-full h-32 rounded-2xl border-4 border-white/50 shadow-xl group-hover:shadow-2xl group-hover:border-emerald-400 mx-auto mb-4 overflow-hidden relative"
                        style={{ backgroundColor: color.colorCode }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                          <span className="text-white font-mono text-sm opacity-90">{color.colorCode}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-zinc-950 text-lg mb-1">{color.name}</h3>
                      <p className="text-xs text-zinc-950 opacity-60 font-mono bg-zinc-100 px-2 py-1 rounded inline-block">
                        {color.colorCode}
                      </p>
                    </div>
                  )) || (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-300 rounded-3xl text-center">
                      <h3 className="text-2xl font-bold text-zinc-950 mb-2">Aucune couleur</h3>
                      <p className="text-lg text-zinc-950 opacity-75">Ce thème n'a pas encore de couleurs</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ThemeDetail;
