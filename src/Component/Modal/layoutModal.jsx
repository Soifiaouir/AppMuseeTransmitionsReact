import { Type, Palette, Image, FileText } from 'lucide-react';
import DraggableElement from '../DragAndDrop/dragAndDrop.jsx';
import { UPLOAD_URL } from '../../config.js';


function ModalLayoutManager({ 
  cardData, 
  themeData, 
  layout, 
  isConfiguring, 
  onAddText, 
  onAddElement, 
  onUpdatePosition,
  onUpdateSize,
  onRemove,
  onBringToFront // Nouvelle prop
}) {
  
  // Fonction pour obtenir l'URL de l'image de fond du thème
  const getThemeBackgroundUrl = () => {
    if (!themeData?.backgroundImage?.publicPath) return null;
    const cleanPath = themeData.backgroundImage.publicPath.replace(/^\/uploads\/media\//, '');
    return `${UPLOAD_URL}/${cleanPath}`;
  };

  const themeBackgroundUrl = getThemeBackgroundUrl();
  const themeBackgroundColor = themeData?.themeBackgroundColor?.colorCode;
  const cardBackgroundColor = cardData?.backgroundColor?.colorCode;
  const cardTextColor = cardData?.textColor?.colorCode;

  // L'image prime sur la couleur
  const finalBackground = themeBackgroundUrl 
    ? `url(${themeBackgroundUrl})` 
    : (themeBackgroundColor 
        ? `linear-gradient(135deg, ${themeBackgroundColor}ee 0%, ${themeBackgroundColor} 100%)` 
        : (cardBackgroundColor 
            ? `linear-gradient(135deg, ${cardBackgroundColor}ee 0%, ${cardBackgroundColor} 100%)` 
            : 'linear-gradient(to-br, #f4f4f5, #e4e4e7)'));
  
  return (
    <div className="flex-1 flex overflow-hidden">
      {isConfiguring && (
        <div className="w-64 bg-zinc-50 border-r border-zinc-200 overflow-y-auto p-4">
          <h4 className="font-bold mb-3 text-sm uppercase text-zinc-950">Éléments disponibles</h4>
          
          {/* Bloc texte principal de la carte */}
          <div className="mb-4">
            <h5 className="font-semibold text-xs text-zinc-950 mb-2 flex items-center gap-2">
              <Type size={14} />
              Texte principal
            </h5>
            <button
              onClick={onAddText}
              className="w-full p-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg text-sm transition"
            >
              <div className="font-medium text-blue-900">Détails de la carte</div>
              <div className="text-xs text-zinc-600 opacity-75 line-clamp-2 mt-1">
                {cardData?.detail?.substring(0, 50) || 'Texte principal'}
                {cardData?.detail && cardData.detail.length > 50 && '...'}
              </div>
            </button>
          </div>

          {/* Sections supplémentaires (MoreInfo) */}
          {cardData?.moreInfos && cardData.moreInfos.length > 0 && (
            <div className="mb-4">
              <h5 className="font-semibold text-xs text-zinc-950 mb-2 flex items-center gap-2">
                <FileText size={14} />
                Sections supplémentaires ({cardData.moreInfos.length})
              </h5>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {cardData.moreInfos.map(moreInfo => (
                  <button
                    key={moreInfo.id}
                    onClick={() => onAddElement('moreInfo', moreInfo)}
                    className="w-full p-3 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 rounded-lg text-sm transition text-left"
                  >
                    <div className="font-medium text-emerald-900 text-xs truncate">
                      📄 {moreInfo.Title || moreInfo.title || 'Section sans titre'}
                    </div>
                    <div className="text-xs text-zinc-600 opacity-75 line-clamp-2 mt-1">
                      {(moreInfo.details || moreInfo.Details)?.substring(0, 60) || 'Aucun détail'}
                      {(moreInfo.details || moreInfo.Details) && (moreInfo.details || moreInfo.Details).length > 60 && '...'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Médias du thème */}
          {themeData?.medias && themeData.medias.length > 0 && (
            <div className="mb-4">
              <h5 className="font-semibold text-xs text-zinc-950 mb-2 flex items-center gap-2">
                <Image size={14} />
                Médias du thème ({themeData.medias.length})
              </h5>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {themeData.medias.map(media => (
                  <button
                    key={media.id}
                    onClick={() => onAddElement('media', media)}
                    className="w-full p-2 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-lg text-sm transition"
                  >
                    <div className="font-medium text-purple-900 text-xs truncate">
                      {media.userGivenName || 'Média du thème'}
                    </div>
                    <div className="text-xs text-zinc-600 opacity-75">{media.extensionFile}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image de fond du thème */}
          {themeData?.backgroundImage && (
            <div className="mb-4">
              <h5 className="font-semibold text-xs text-zinc-950 mb-2 flex items-center gap-2">
                <Image size={14} />
                Image de fond du thème
              </h5>
              <button
                onClick={() => onAddElement('media', themeData.backgroundImage)}
                className="w-full p-3 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 rounded-lg text-sm transition"
              >
                <div className="font-medium text-indigo-900 text-xs truncate">
                   {themeData.backgroundImage.userGivenName || 'Image du thème'}
                </div>
                <div className="text-xs text-zinc-600 opacity-75">
                  {themeData.backgroundImage.extensionFile}
                </div>
              </button>
            </div>
          )}

          {/* Couleur du thème */}
          {themeData?.themeBackgroundColor && (
            <div className="mb-4">
              <h5 className="font-semibold text-xs text-zinc-950 mb-2 flex items-center gap-2">
                <Palette size={14} />
                Couleur du thème
              </h5>
              <button
                onClick={() => onAddElement('color', themeData.themeBackgroundColor)}
                className="w-full p-2 bg-zinc-50 hover:bg-zinc-100 border-2 border-zinc-200 rounded-lg text-sm transition flex items-center gap-2"
              >
                <div 
                  className="w-8 h-8 rounded border-2 border-zinc-300 flex-shrink-0"
                  style={{ backgroundColor: themeData.themeBackgroundColor.colorCode }}
                />
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-medium text-xs truncate text-zinc-950">
                    {themeData.themeBackgroundColor.name || 'Couleur du thème'}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {themeData.themeBackgroundColor.colorCode}
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Canvas principal */}
      <div 
        className="flex-1 relative overflow-auto transition-colors duration-300"
        style={{ 
          backgroundColor: themeBackgroundUrl ? '#18181b' : (themeBackgroundColor || cardBackgroundColor || '#f4f4f5'),
          backgroundImage: themeBackgroundUrl ? finalBackground : (themeBackgroundColor || cardBackgroundColor ? finalBackground : 'linear-gradient(to-br, #f4f4f5, #e4e4e7)'),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay pour améliorer la lisibilité si image de fond */}
        {themeBackgroundUrl && (
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        )}

        {layout.length === 0 && isConfiguring && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center bg-white p-6 rounded-lg shadow backdrop-blur-sm">
              <p className="text-zinc-500 mb-2">Cliquez sur les éléments à gauche</p>
              <p className="text-sm text-zinc-400">pour personnaliser cette modal</p>
            </div>
          </div>
        )}

        {layout.length === 0 && !isConfiguring && (
          <div className="absolute inset-0 flex items-center justify-center p-6 z-10">
            <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-2xl backdrop-blur-sm">
              <h4 className="font-bold text-xl mb-4 text-zinc-950">{cardData?.title}</h4>
              <div className="text-zinc-950 opacity-75 leading-relaxed whitespace-pre-wrap">
                {cardData?.detail || "Aucune information disponible"}
              </div>
            </div>
          </div>
        )}

        {layout.map(element => (
          <DraggableElement
            key={element.id}
            element={element}
            isConfiguring={isConfiguring}
            onPositionChange={onUpdatePosition}
            onSizeChange={onUpdateSize}
            onRemove={onRemove}
            onBringToFront={onBringToFront}
          />
        ))}
      </div>
    </div>
  );
}

export default ModalLayoutManager;