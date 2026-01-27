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
  
  const addElement = (type, data) => {
    const sizes = {
      text: { width: 400, height: 200 },
      moreInfo: { width: 450, height: 250 },
      media: { width: 300, height: 250 },
      themeBackgroundImage: { width: 400, height: 300 },
      themeColor: { width: 200, height: 150 },
      color: { width: 150, height: 100 }
    };

    const newElement = {
      id: `${type}-${data.id}-${Date.now()}`,
      type,
      data,
      position: { x: 50 + (layout.length * 20), y: 50 + (layout.length * 20) },
      size: sizes[type] || { width: 300, height: 200 }
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
      className="w-full h-full flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="px-4 py-3 flex justify-between items-center flex-shrink-0 transition-colors duration-300"
        style={{
          background: backgroundColor ? 
            `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}dd 100%)` :
            'linear-gradient(to-r, from-blue-500 to-blue-600)',
          color: textColor || '#ffffff'
        }}
      >
        <h3 className="font-bold text-lg truncate pr-2" style={{ color: textColor || '#ffffff' }}>
          {isConfiguring ? '⚙️ Configuration' : '📖 Informations'} - {cardData.title}
        </h3>
        
        <div className="flex gap-2">
          {isConfiguring && (
            <button
              onClick={saveConfiguration}
              className="px-3 py-1 !bg-green-500 hover:!bg-green-600 !text-white rounded-lg flex items-center gap-1 text-sm font-semibold transition-all duration-200"
              title="Sauvegarder la configuration"
            >
              <Save size={16} />
              Sauvegarder
            </button>
          )}
          
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200"
            style={{ color: textColor || '#ffffff' }}
            title="Fermer (ESC)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

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
        />
      </div>
    </div>
  );
}

export default ModalConfigurable;