import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getThemeById, getCardById } from '../../Services/Api/apiService.js';
import { getTabletLayout } from '../../Services/TabletConfig/tabletConfigService.js';
import { UPLOAD_URL } from '../../config.js';
import MediaPlayer from '../../Component/MediaPlayer/mediaPlayer.jsx';
import MuseumCard from '../../Component/Cards/cards.jsx';

function VisitorDisplay() {
  const navigate = useNavigate();
  const [themeData, setThemeData] = useState(null);
  const [layout, setLayout] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrichedElements, setEnrichedElements] = useState([]);
  const [modalConfigs, setModalConfigs] = useState({});
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    loadTabletConfiguration();
  }, []);

  // Détection d'activité utilisateur
  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
    };

    // Écouter toutes les interactions
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);

  // Timer d'inactivité - refresh après 1m30
  useEffect(() => {
    const inactivityTimer = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      if (timeSinceLastActivity >= 90000) { // 90 secondes = 1m30
        window.location.reload();
      }
    }, 1000); // Vérifier toutes les secondes

    return () => clearInterval(inactivityTimer);
  }, [lastActivity]);

  const loadTabletConfiguration = async () => {
    try {
      setIsLoading(true);
      
      const tabletConfig = getTabletLayout();
      
      if (!tabletConfig || !tabletConfig.themeId) {
        setError('Cette tablette n\'est pas encore configurée');
        return;
      }

      const elements = Array.isArray(tabletConfig.elements) ? tabletConfig.elements : [];
      setLayout(elements);

      if (tabletConfig.modalConfigs) {
        setModalConfigs(tabletConfig.modalConfigs);
      }

      if (tabletConfig.themeData) {
        setThemeData(tabletConfig.themeData);
      } else {
        const data = await getThemeById(tabletConfig.themeId);
        setThemeData(data);
      }

      await enrichCardElements(elements);
      
    } catch (err) {
      const tabletConfig = getTabletLayout();
      if (tabletConfig && tabletConfig.themeData) {
        setThemeData(tabletConfig.themeData);
        const elements = Array.isArray(tabletConfig.elements) ? tabletConfig.elements : [];
        setLayout(elements);
        
        if (tabletConfig.modalConfigs) {
          setModalConfigs(tabletConfig.modalConfigs);
        }
        
        await enrichCardElements(elements);
      } else {
        setError('Impossible de charger la configuration');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const enrichCardElements = async (elements) => {
    try {
      const enriched = await Promise.all(
        elements.map(async (element) => {
          if (element.type === 'card') {
            const cardId = typeof element.data === 'number' ? element.data : element.data?.id;
            
            if (cardId) {
              try {
                const fullCardData = await getCardById(cardId);
                return {
                  ...element,
                  data: fullCardData
                };
              } catch (error) {
                return element;
              }
            }
          }
          return element;
        })
      );
      
      setEnrichedElements(enriched);
    } catch (error) {
      setEnrichedElements(elements);
    }
  };

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

  const getBackgroundImage = () => {
    if (!themeData) return null;

    if (!themeData.backgroundImage || themeData.backgroundImage.length === 0) {
      return null;
    }

    const bgPath = themeData.backgroundImage.publicPath;
    if (bgPath) {
      const cleanPath = bgPath.replace(/^\/uploads\/media\//, '');
      const fullUrl = `${UPLOAD_URL}/${cleanPath}`;
      return fullUrl;
    }

    return null;
  };

  const backgroundImage = getBackgroundImage();

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 border-8 border-blue-100 border-t-blue-800 rounded-full animate-spin mx-auto mb-8 shadow-2xl"></div>
          <h1 className="text-4xl font-black text-blue-800 mb-4">Chargement</h1>
          <h2 className="text-2xl font-bold text-blue-500 mb-2">Préparation de l'exposition</h2>
          <p className="text-lg text-zinc-950 opacity-60">Veuillez patienter...</p>
        </div>
      </div>
    );
  }

  if (error || !themeData) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center p-12">
        <div className="text-center max-w-lg mx-auto">
          <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100 border-4 border-blue-200 flex items-center justify-center shadow-2xl">
            <span className="text-6xl font-black text-blue-800">!</span>
          </div>
          <h2 className="text-5xl font-black text-blue-800 mb-4">Configuration requise</h2>
          <h3 className="text-2xl font-bold text-blue-500 mb-6">Tablette non configurée</h3>
          <p className="text-xl text-zinc-950 opacity-75 mb-8 leading-relaxed">
            {error || 'Aucune configuration trouvée pour cette tablette'}
          </p>
          <p className="text-lg text-zinc-950 opacity-60 mb-12">
            Contactez l'administrateur pour configurer l'expérience musée
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-black text-xl px-12 py-6 rounded-2xl shadow-2xl hover:shadow-3xl active:scale-95 transition-all duration-300"
          >
            Accès Administrateur
          </button>
        </div>
      </div>
    );
  }

  const elementsToDisplay = enrichedElements.length > 0 ? enrichedElements : layout;

  return (
    <div 
      className="w-full h-screen overflow-hidden relative"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: backgroundImage ? 'transparent' : 'white'
      }}
    >
      {/* Overlay pour améliorer la lisibilité si image de fond */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/30"></div>
      )}

      <header className="absolute top-0 left-0 right-0 z-20 px-8 py-6">
        <h2 className="text-4xl md:text-5xl font-black text-white text-center leading-tight mb-2"
            style={{ 
              textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.7)',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))'
            }}>
          {themeData.name}
        </h2>
      </header>

      {/* Container avec scroll horizontal */}
      <div className="w-full h-full pt-30 lg:pt-35 pb-12 relative z-10 overflow-x-auto overflow-y-hidden">
        {Array.isArray(elementsToDisplay) && elementsToDisplay.length > 0 ? (
          <div className="inline-flex h-full gap-6 px-8 items-center">
            {elementsToDisplay.map((element, index) => (
              <VisitorElement
                key={`${element.id}-${index}`}
                element={element}
                themeData={themeData}
                modalConfigs={modalConfigs}
                getMediaUrl={getMediaUrl}
                getMediaType={getMediaType}
                getMimeType={getMimeType}
                zIndex={10 + index}
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <h2 className="text-3xl font-bold text-blue-500 mb-4">Aucun élément à afficher</h2>
              <p className="text-lg text-zinc-950 opacity-75">Le thème est configuré mais ne contient aucun élément</p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => navigate('/login')}
        className="fixed bottom-6 right-6 w-16 h-16 bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-2xl shadow-2xl hover:shadow-3xl active:scale-95 transition-all duration-300 border-4 border-white flex items-center justify-center z-50 group"
        title="Mode administrateur"
      >
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
}

function VisitorElement({ element, themeData, modalConfigs, getMediaUrl, getMediaType, getMimeType, zIndex }) {
  const renderContent = () => {
    switch (element.type) {
      case 'card':
        const cardId = element.data?.id;
        const modalLayout = cardId && modalConfigs[cardId] ? modalConfigs[cardId] : [];
        
        return (
          <div>
            <MuseumCard 
              cardData={element.data}
              themeData={themeData}
              isConfigMode={false}
              modalLayout={modalLayout}
            />
          </div>
        );
      
      case 'media':
        const mediaType = getMediaType(element.data);
        const mediaUrl = getMediaUrl(element.data);
        const mimeType = getMimeType(element.data);
        
        return (
          <div className="w-full h-full p-6 bg-white rounded-3xl shadow-2xl border-4 border-blue-100 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-hidden rounded-2xl bg-zinc-50">
              {mediaType === 'image' && (
                <img 
                  src={mediaUrl} 
                  alt={element.data.userGivenName}
                  className="w-full h-full object-cover rounded-2xl"
                />
              )}
              {(mediaType === 'video' || mediaType === 'audio') && (
                <div className="w-full h-full flex items-center justify-center">
                  <MediaPlayer 
                    mediaSource={mediaUrl}
                    mediaType={mimeType}
                    width="100%"
                    height={mediaType === 'audio' ? '80px' : '100%'}
                  />
                </div>
              )}
              {mediaType === 'unknown' && (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                  <div className="text-center p-8">
                    <h3 className="text-2xl font-black text-zinc-950 mb-2">{element.data.userGivenName}</h3>
                    <p className="text-lg text-blue-500 font-mono font-bold">{element.data.extensionFile}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t-4 border-blue-100">
              <h3 className="font-black text-xl text-zinc-950 truncate">{element.data.userGivenName}</h3>
              {element.data.description && (
                <p className="text-sm text-zinc-950 opacity-75 mt-2 leading-relaxed line-clamp-2">{element.data.description}</p>
              )}
            </div>
          </div>
        );
      
      case 'color':
        return (
          <div className="w-full h-full p-8 bg-white rounded-3xl shadow-2xl border-4 border-blue-100 flex flex-col items-center justify-center">
            <div 
              className="w-4/5 h-4/5 rounded-3xl shadow-2xl mx-auto mb-6 border-4 border-white"
              style={{ backgroundColor: element.data.colorCode }}
            />
            <h3 className="text-2xl font-black text-zinc-950 mb-2 text-center">{element.data.name}</h3>
            <p className="text-lg font-mono text-blue-500 font-bold text-center">{element.data.colorCode}</p>
          </div>
        );
      
      default:
        return (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl shadow-2xl border-4 border-blue-200 flex items-center justify-center">
            <div className="text-center px-8">
              <h3 className="text-3xl font-black text-blue-800 mb-2">Élément</h3>
              <h2 className="text-xl font-bold text-blue-500">{element.type}</h2>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className="flex-shrink-0 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl"
      style={{
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
        zIndex: zIndex,
      }}
    >
      {renderContent()}
    </div>
  );
}

export default VisitorDisplay;