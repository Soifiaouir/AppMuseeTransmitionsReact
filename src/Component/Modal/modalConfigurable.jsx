import { Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { updateModalConfig } from '../../Services/TabletConfig/tabletConfigService.js';
import ModalLayoutManager from './layoutModal.jsx';


function ModalConfigurable({ 
  cardData, 
  themeData, 
  layout, 
  setLayout, 
  isConfiguring, 
  onClose 
}) {
  
  const addElement = (type, data, sourceType = null) => {
    const sizes = {
      text: { width: 500, height: 300 },
      moreInfo: { width: 600, height: 400 },
      media: { width: 400, height: 350 },
      color: { width: 200, height: 150 }
    };

    const elementData = type === 'media' ? {
      ...data,
      sourceType: sourceType || 'card'
    } : data;

    const newElement = {
      id: `${type}-${data.id}-${Date.now()}`,
      type,
      data: elementData,
      position: { x: 50 + (layout.length * 20), y: 50 + (layout.length * 20) },
      size: sizes[type] || { width: 300, height: 200 },
      zIndex: layout.length + 1 // Nouveau z-index basé sur l'ordre d'ajout
    };
    setLayout([...layout, newElement]);
  };

  const addTextBlock = () => {
    addElement('text', {
      id: `text-${Date.now()}`,
      content: cardData.detail || 'Texte personnalisé...'
    });
  };

  const updatePosition = (id, x, y) => {
    setLayout(layout.map(el => 
      el.id === id ? { ...el, position: { x, y } } : el
    ));
  };

  const updateSize = (id, width, height) => {
    setLayout(layout.map(el => 
      el.id === id ? { ...el, size: { width, height } } : el
    ));
  };

  // Fonction pour mettre un élément au premier plan quand on clique dessus
  const bringToFront = (id) => {
    const maxZIndex = Math.max(...layout.map(el => el.zIndex || 0), 0);
    setLayout(layout.map(el => 
      el.id === id ? { ...el, zIndex: maxZIndex + 1 } : el
    ));
  };

  const removeElement = (id) => {
    setLayout(layout.filter(el => el.id !== id));
  };

  const saveConfiguration = () => {
    const success = updateModalConfig(cardData.id, layout);
    if (success) {
      alert('✅ Configuration sauvegardée !');
    } else {
      alert('❌ Erreur lors de la sauvegarde');
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const backgroundColor = cardData?.backgroundColor?.colorCode;
  const textColor = cardData?.textColor?.colorCode;

  return (
    <div 
      className="h-full w-full flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
    
    {/* En-tête*/}
  <div 
    className="px-4 py-3 flex justify-between items-center flex-shrink-0 
                backdrop-blur-md bg-white/80 hover:bg-white/90 border-b border-white/50
                transition-all duration-300 shadow-sm"
  >
    {/* Titre */}
    <h3 className="font-bold text-lg text-zinc-900 truncate">
      {isConfiguring ? 'Configuration' : 'Informations'} - {cardData.title}
    </h3>
    
    {/* Boutons à droite */}
    <div className="flex items-center gap-2">
      {isConfiguring && (
        <button
          onClick={saveConfiguration}
          className="px-3 py-1 bg-green-500/90 hover:bg-green-600/90 
                    rounded-lg flex items-center gap-1 
                    text-sm font-semibold transition-all duration-200 shadow-lg 
                    hover:shadow-xl active:scale-95 backdrop-blur-sm"
          title="Sauvegarder"
        >
          Sauvegarder
        </button>
      )}
      
      {/* Croix BLANCHE */}
      <button
        onClick={onClose}
        className="w-10 h-10  
                  rounded-xl flex items-center justify-center 
                  transition-all duration-200 hover:scale-105 active:scale-95 
                  shadow-lg border border-zinc-200"
        title="Fermer (ESC)"
      >
      X
      </button>
    </div>
  </div>


        {/* Contenu principal avec gestion du z-index */}
        <div className="flex-1 overflow-hidden flex bg-zinc-50">
          <ModalLayoutManager 
            cardData={cardData}
            themeData={themeData}
            layout={layout}
            isConfiguring={isConfiguring}
            onAddText={addTextBlock}
            onAddElement={addElement}
            onUpdatePosition={updatePosition}
            onUpdateSize={updateSize}
            onRemove={removeElement}
            onBringToFront={bringToFront} // Nouvelle prop
          />
        </div>
      </div>
  );
}

export default ModalConfigurable;