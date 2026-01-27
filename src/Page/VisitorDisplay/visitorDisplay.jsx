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
  const [enrichedElements, setEnrichedElements] = useState([]); // ⭐ NOUVEAU

  useEffect(() => {
    loadTabletConfiguration();
  }, []);

  const loadTabletConfiguration = async () => {
    try {
      setIsLoading(true);
      
      const tabletConfig = getTabletLayout();
      console.log('📦 Configuration localStorage:', tabletConfig);
      
      if (!tabletConfig || !tabletConfig.themeId) {
        setError('Cette tablette n\'est pas encore configurée');
        return;
      }

      const elements = Array.isArray(tabletConfig.elements) ? tabletConfig.elements : [];
      setLayout(elements);
      console.log('📐 Layout chargé:', elements.length, 'éléments');

      // Charger le thème
      if (tabletConfig.themeData) {
        console.log('✅ Utilisation du thème depuis localStorage');
        setThemeData(tabletConfig.themeData);
      } else {
        console.log('🌐 Chargement du thème depuis l\'API...');
        const data = await getThemeById(tabletConfig.themeId);
        setThemeData(data);
      }

      // ⭐ NOUVEAU : Enrichir les éléments de type 'card' avec les données complètes
      await enrichCardElements(elements);
      
      console.log('✓ Configuration chargée pour les visiteurs');
    } catch (err) {
      console.error('❌ Erreur chargement configuration:', err);
      
      const tabletConfig = getTabletLayout();
      if (tabletConfig && tabletConfig.themeData) {
        console.log('⚠️ Utilisation des données localStorage malgré l\'erreur API');
        setThemeData(tabletConfig.themeData);
        const elements = Array.isArray(tabletConfig.elements) ? tabletConfig.elements : [];
        setLayout(elements);
        await enrichCardElements(elements);
      } else {
        setError('Impossible de charger la configuration');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ⭐ NOUVELLE FONCTION : Enrichir les cartes avec les données complètes de l'API
  const enrichCardElements = async (elements) => {
    try {
      const enriched = await Promise.all(
        elements.map(async (element) => {
          if (element.type === 'card') {
            console.log('🔄 Chargement carte complète:', element.data?.id || element.id);
            
            // Si element.data est juste un ID
            const cardId = typeof element.data === 'number' ? element.data : element.data?.id;
            
            if (cardId) {
              try {
                const fullCardData = await getCardById(cardId);
                console.log('✅ Carte chargée:', fullCardData);
                return {
                  ...element,
                  data: fullCardData // Remplacer par les données complètes
                };
              } catch (error) {
                console.error(`❌ Erreur chargement carte ${cardId}:`, error);
                return element; // Garder l'élément tel quel en cas d'erreur
              }
            }
          }
          return element;
        })
      );
      
      setEnrichedElements(enriched);
      console.log('✅ Éléments enrichis:', enriched);
    } catch (error) {
      console.error('❌ Erreur enrichissement des cartes:', error);
      setEnrichedElements(elements); // Utiliser les éléments non enrichis en cas d'erreur
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
          <h1 className="text-5xl font-black text-blue-800 mb-4">Configuration requise</h1>
          <h2 className="text-2xl font-bold text-blue-500 mb-6">Tablette non configurée</h2>
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

  // ⭐ Utiliser enrichedElements au lieu de layout
  const elementsToDisplay = enrichedElements.length > 0 ? enrichedElements : layout;

  return (
    <div className="w-full h-screen bg-white overflow-hidden relative">
      {/* Header avec h1 blue-800 */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-xl border-b-4 border-blue-200 shadow-xl px-8 py-6">
        <h1 className="text-4xl md:text-5xl font-black text-blue-800 text-center leading-tight mb-2">
          {themeData.name}
        </h1>
        <h2 className="text-xl font-bold text-blue-500 text-center">
          Musée des Transmissions
        </h2>
      </header>

      {/* Contenu principal */}
      <div className="w-full h-full pt-36 lg:pt-40 pb-6 relative overflow-hidden">
        {Array.isArray(elementsToDisplay) && elementsToDisplay.length > 0 ? (
          elementsToDisplay.map((element, index) => (
            <VisitorElement
              key={`${element.id}-${index}`}
              element={element}
              themeData={themeData}
              getMediaUrl={getMediaUrl}
              getMediaType={getMediaType}
              getMimeType={getMimeType}
              zIndex={elementsToDisplay.length - index}
            />
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <h2 className="text-3xl font-bold text-blue-500 mb-4">Aucun élément à afficher</h2>
              <p className="text-lg text-zinc-950 opacity-75">Le thème est configuré mais ne contient aucun élément</p>
            </div>
          </div>
        )}
      </div>

      {/* Bouton admin discret */}
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

function VisitorElement({ element, themeData, getMediaUrl, getMediaType, getMimeType, zIndex }) {
  const renderContent = () => {
    switch (element.type) {
      case 'card':
        console.log('🎴 Rendu carte avec data:', element.data);
        return (
          <div className="w-full h-full shadow-2xl rounded-3xl overflow-hidden border-4 border-blue-100">
            <MuseumCard 
              cardData={element.data}
              themeData={themeData}
              isConfigMode={false}
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
                    <div className="text-6xl mb-4">📄</div>
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
      className="absolute shadow-2xl transition-all duration-300 hover:scale-105 hover:z-50 hover:shadow-3xl"
      style={{
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
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