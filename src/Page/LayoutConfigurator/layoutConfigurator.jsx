import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getThemeById } from '../../Services/Api/apiService.js';
import { saveCompleteLayout, getCompleteLayout } from '../../Services/TabletConfig/tabletConfigService.js';
import { UPLOAD_URL } from '../../config.js';
import MuseumCard from '../../Component/Cards/cards.jsx';
import DraggableElement from '../../Component/DragAndDrop/dragAndDrop.jsx';
import ModalConfigurable from '../../Component/Modal/modalConfigurable.jsx';
import { Edit, Trash2 } from 'lucide-react';

function LayoutConfigurator() {
  const { themeId } = useParams();
  const navigate = useNavigate();
  const [themeData, setThemeData] = useState(null);
  const [layout, setLayout] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCardModal, setEditingCardModal] = useState(null);
  const [modalLayout, setModalLayout] = useState([]);

  useEffect(() => {
    loadThemeAndLayout();
  }, [themeId]);

  const loadThemeAndLayout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getThemeById(themeId);
      setThemeData(data);

      const savedLayout = getCompleteLayout();
      if (savedLayout && savedLayout.themeId == themeId) {
        const elements = Array.isArray(savedLayout.elements) ? savedLayout.elements : [];
        setLayout(elements);
      } else {
        setLayout([]);
      }
    } catch (err) {
      setError('Impossible de charger le thème');
    } finally {
      setIsLoading(false);
    }
  };

  const saveLayout = () => {
    try {
      if (!themeData) {
        alert('Erreur: Aucun thème chargé');
        return;
      }

      const completeConfig = getCompleteLayout();
      const modalConfigs = completeConfig?.modalConfigs || {};
      
      const success = saveCompleteLayout(themeId, themeData, layout, modalConfigs);
      
      if (success) {
        alert('Configuration sauvegardée pour cette tablette !');
      } else {
        alert('Erreur sauvegarde');
      }
    } catch (err) {
      alert('Erreur sauvegarde');
    }
  };

  const addElementToLayout = (type, data) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let width, height;
    
    if (type === 'card') {
      width = windowWidth * 0.26;
      height = windowHeight * 0.78;
    } else if (type === 'media') {
      width = windowWidth * 0.28;
      height = windowHeight * 0.45;
    } else {
      width = 250;
      height = 200;
    }

    // Calculer la position X automatique pour l'alignement horizontal
    const baseX = 80;
    const baseY = 80;
    const spacingX = width + 24; // gap-6 = 24px
    const totalX = layout.length * spacingX;
    
    const newElement = {
      id: `${type}-${data.id}-${Date.now()}`,
      type: type,
      data: data,
      position: { 
        x: baseX + totalX,
        y: baseY 
      },
      size: { width, height }
    };
    setLayout([...layout, newElement]);
  };

  const updateElementPosition = (elementId, x, y) => {
    setLayout(layout.map(el => el.id === elementId ? { ...el, position: { x, y } } : el));
  };

  const removeElement = (elementId) => {
    setLayout(layout.filter(el => el.id !== elementId));
  };

  const openModalConfig = (cardData) => {
    const completeConfig = getCompleteLayout();
    const savedModalLayout = completeConfig?.modalConfigs?.[cardData.id] || [];
    
    setEditingCardModal(cardData);
    setModalLayout(savedModalLayout);
  };

  const closeModalConfig = () => {
    setEditingCardModal(null);
    setModalLayout([]);
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

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center p-12">
        <div className="text-center max-w-md mx-auto">
          <div className="w-24 h-24 border-8 border-blue-100 border-t-blue-800 rounded-full animate-spin mx-auto mb-8 shadow-2xl"></div>
          <h1 className="text-4xl font-black text-blue-800 mb-4">Chargement</h1>
          <p className="text-lg text-zinc-950 opacity-60">Veuillez patienter...</p>
        </div>
      </div>
    );
  }

  if (error || !themeData) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center p-12">
        <div className="text-center max-w-lg">
          <div className="w-28 h-28 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center shadow-2xl border-4 border-zinc-200">
            <span className="text-4xl font-black text-zinc-950">!</span>
          </div>
          <h1 className="text-4xl font-black text-zinc-950 mb-6">{error || 'Thème introuvable'}</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="!bg-red-500 hover:!bg-blue-600 !text-white font-black text-xl px-12 py-6 rounded-3xl !shadow-2xl hover:!shadow-3xl active:scale-[0.98] transition-all duration-300 border-2 border-red-600/30"
          >
            Retour Dashboard
          </button>
        </div>
      </div>
    );
  }

  const backgroundImage = getBackgroundImage();

  return (
    <div className="w-full h-screen bg-white flex flex-col overflow-hidden">
      {/* Header toolbar */}
      <header className="bg-white/90 backdrop-blur-xl border-b-2 border-zinc-200 shadow-2xl shrink-0">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="!bg-zinc-950 hover:!bg-zinc-800 active:!scale-95 !text-white font-bold w-14 h-14 rounded-2xl !shadow-xl hover:!shadow-2xl transition-all duration-200 flex items-center justify-center"
                title="Retour dashboard"
              >
                <span className="text-xl">←</span>
              </button>
              <div>
                <h1 className="text-3xl font-black text-blue-800 mb-1 leading-tight">
                  Configuration Tablette
                </h1>
                <p className="text-lg text-zinc-950 opacity-75 font-semibold">
                  Thème: <span className="text-blue-500">{themeData.name}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={saveLayout}
                className="!bg-emerald-500 hover:!bg-emerald-600 active:!bg-emerald-700 !text-white font-black text-lg px-12 py-4 rounded-2xl !shadow-2xl hover:!shadow-3xl active:scale-[0.98] transition-all duration-300 border-2 border-emerald-600/30 flex items-center gap-3"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar éléments - gauche */}
        <aside className="w-96 bg-white/90 backdrop-blur-xl border-r-2 border-zinc-200 shadow-2xl overflow-y-auto">
          <div className="p-8">
            <h2 className="text-2xl font-black text-zinc-950 mb-8 border-b-2 border-zinc-200 pb-6">
              Éléments disponibles
            </h2>

            {/* Cartes */}
            {themeData.cards?.length > 0 && (
              <section className="mb-12">
                <h3 className="text-lg font-black text-blue-500 mb-6 flex items-center gap-3 pb-4 border-b-2 border-blue-200/50">
                  📋 Cartes ({themeData.cards.length})
                </h3>
                <div className="space-y-4">
                  {themeData.cards.map(card => (
                    <div key={card.id} className="group">
                      <div
                        onClick={() => addElementToLayout('card', card)}
                        className="p-6 bg-gradient-to-r from-blue-50 to-blue-100/50 border-2 border-blue-200/60 hover:border-blue-400/80 rounded-2xl cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:bg-blue-100/80 transition-all duration-300 shadow-md"
                      >
                        <h4 className="font-black text-lg text-blue-900 mb-2 line-clamp-1 group-hover:text-blue-800">
                          {card.title}
                        </h4>
                        <p className="text-sm text-zinc-950/75 leading-relaxed line-clamp-2">
                          {card.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Médias */}
            {themeData.medias?.length > 0 && (
              <section className="mb-12">
                <h3 className="text-lg font-black text-purple-500 mb-6 flex items-center gap-3 pb-4 border-b-2 border-purple-200/50">
                  🎬 Médias ({themeData.medias.length})
                </h3>
                <div className="space-y-4">
                  {themeData.medias.map(media => (
                    <div
                      key={media.id}
                      onClick={() => addElementToLayout('media', media)}
                      className="p-6 bg-gradient-to-r from-purple-50 to-purple-100/50 border-2 border-purple-200/60 hover:border-purple-400/80 rounded-2xl cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:bg-purple-100/80 transition-all duration-300 shadow-md"
                    >
                      <h4 className="font-black text-lg text-purple-900 mb-2 truncate">
                        {media.userGivenName}
                      </h4>
                      <p className="text-sm text-zinc-950/75 capitalize">{media.type}</p>
                      <p className="text-xs text-zinc-950/50 font-mono mt-1">{media.extensionFile}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(!themeData.cards?.length && !themeData.medias?.length) && (
              <div className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-3xl opacity-50">
                <h3 className="text-2xl font-black text-zinc-950 mb-4">Aucun élément</h3>
                <p className="text-lg text-zinc-950/75">Ajoutez des cartes ou médias à ce thème</p>
              </div>
            )}
          </div>
        </aside>

        {/* Canvas principal - MODE CONFIGURATION uniquement */}
        <div 
          className="flex-1 relative overflow-hidden"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: backgroundImage ? 'transparent' : '#fafafa'
          }}
        >
          {backgroundImage && (
            <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
          )}

          <div className="relative z-10 w-full h-full overflow-auto">
            <div className="relative min-w-[200vw] min-h-[200vh]">
              {layout.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center bg-white/80 backdrop-blur-sm p-12 rounded-4xl shadow-2xl border-4 border-dashed border-zinc-300 max-w-2xl mx-8">
                    <h3 className="text-3xl font-black text-zinc-950 mb-6">Glissez-déposez</h3>
                    <p className="text-xl text-zinc-950/75 mb-8 leading-relaxed">
                      Cliquez sur les éléments à gauche pour les ajouter au canvas
                    </p>
                    <p className="text-lg text-zinc-950/50">Faites glisser pour repositionner</p>
                  </div>
                </div>
              ) : (
                layout.map((element, index) => (
                  <ConfigElement
                    key={element.id}
                    element={element}
                    themeData={themeData}
                    onPositionChange={updateElementPosition}
                    onRemove={removeElement}
                    onConfigureModal={openModalConfig}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal configuration carte */}
      {editingCardModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-center z-50 p-8">
          <div className="w-full max-w-6xl max-h-[95vh] bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white/20">
            <ModalConfigurable
              cardData={editingCardModal}
              themeData={themeData}
              layout={modalLayout}
              setLayout={setModalLayout}
              isConfiguring={true}
              onClose={closeModalConfig}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Composant pour les éléments en mode CONFIG
function ConfigElement({ element, themeData, onPositionChange, onRemove, onConfigureModal }) {
  if (element.type === 'card') {
    return (
      <CardWrapper
        element={element}
        themeData={themeData}
        onPositionChange={onPositionChange}
        onRemove={onRemove}
        onConfigureModal={onConfigureModal}
      />
    );
  }

  return (
    <DraggableElement
      element={element}
      isConfiguring={true}
      onPositionChange={onPositionChange}
      onRemove={onRemove}
    />
  );
}

function CardWrapper({ element, themeData, onPositionChange, onRemove, onConfigureModal }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - element.position.x,
      y: e.clientY - element.position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    onPositionChange(
      element.id, 
      Math.max(0, newX), 
      Math.max(0, newY)
    );
  };

  const handleMouseUp = (e) => {
    if (e) e.preventDefault();
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
        zIndex: isDragging ? 9999 : 10,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      className={`transition-all duration-200 ${
        isDragging 
          ? 'shadow-3xl !scale-105 opacity-90 ring-4 ring-blue-500/50' 
          : 'hover:shadow-3xl hover:scale-[1.02] ring-2 ring-transparent hover:ring-blue-400/50 shadow-2xl'
      }`}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(element.id);
        }}
        className="!bg-red-500 hover:!bg-red-600 active:!scale-90 !text-white w-12 h-12 rounded-3xl absolute -top-6 -right-6 z-50 shadow-2xl hover:shadow-3xl border-4 border-white/50 flex items-center justify-center font-black text-xl transition-all duration-200"
        title="Supprimer"
      >
        <Trash2 size={20} />
      </button>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onConfigureModal(element.data);
        }}
        className="!bg-orange-500 hover:!bg-orange-600 active:!scale-90 !text-white w-12 h-12 rounded-3xl absolute -top-6 -left-6 z-50 shadow-2xl hover:shadow-3xl border-4 border-white/50 flex items-center justify-center font-black text-xl transition-all duration-200"
        title="Configurer modal"
      >
        <Edit size={20} />
      </button>
      
      <div className="h-full w-full rounded-3xl overflow-hidden border-4 border-white/50 shadow-2xl">
        <MuseumCard 
          cardData={element.data}
          themeData={themeData}
          isConfigMode={true}
        />
      </div>
    </div>
  );
}

export default LayoutConfigurator;