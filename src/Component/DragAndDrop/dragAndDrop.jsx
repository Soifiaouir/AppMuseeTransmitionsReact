import { useState, useEffect } from 'react';
import { UPLOAD_URL } from '../../config.js';
import MediaPlayer from '../MediaPlayer/mediaPlayer.jsx';

function DraggableElement({ 
  element, 
  isConfiguring, 
  onPositionChange, 
  onSizeChange, 
  onRemove,
  onBringToFront // Nouvelle prop pour gérer le z-index
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (!isConfiguring || e.target.classList.contains('resize-handle')) return;
    e.preventDefault();
    e.stopPropagation();
    
    // Mettre l'élément au premier plan quand on commence à le déplacer
    if (onBringToFront) {
      onBringToFront(element.id);
    }
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - element.position.x,
      y: e.clientY - element.position.y
    });
  };

  const handleResizeMouseDown = (e) => {
    if (!isConfiguring) return;
    e.preventDefault();
    e.stopPropagation();
    
    // Mettre au premier plan aussi lors du resize
    if (onBringToFront) {
      onBringToFront(element.id);
    }
    
    setIsResizing(true);
    setResizeStart({
      width: element.size.width,
      height: element.size.height,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleClick = (e) => {
    // Mettre au premier plan même avec un simple clic (sans drag)
    if (isConfiguring && onBringToFront && !isDragging && !isResizing) {
      e.stopPropagation();
      onBringToFront(element.id);
    }
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e) => {
      if (isDragging) {
        onPositionChange(element.id, e.clientX - dragOffset.x, e.clientY - dragOffset.y);
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newWidth = Math.max(150, resizeStart.width + deltaX);
        const newHeight = Math.max(100, resizeStart.height + deltaY);
        onSizeChange(element.id, newWidth, newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, element.id, onPositionChange, onSizeChange]);

  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div className="h-full p-4 bg-white rounded-lg shadow-lg border-2 border-blue-300 overflow-auto">
            <div className="text-zinc-950 text-sm leading-relaxed whitespace-pre-wrap">
              {element.data.content}
            </div>
          </div>
        );

      case 'moreInfo':
        // Gestion des deux formats de nommage (Title/title, details/Details)
        const title = element.data.Title || element.data.title;
        const details = element.data.details || element.data.Details;
        
        return (
          <div className="h-full p-4 bg-white rounded-lg shadow-lg border-2 border-emerald-300 overflow-auto">
            {title && (
              <h4 className="font-bold text-base mb-2 pb-2 border-b-2 border-emerald-200 text-zinc-950">
                {title}
              </h4>
            )}
            <div className="text-zinc-950 text-sm leading-relaxed whitespace-pre-wrap">
              {details || "Aucun détail"}
            </div>
          </div>
        );

      case 'media':
        const ext = element.data.extensionFile?.toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
        const isVideo = ['mp4', 'webm', 'ogg', 'mpeg'].includes(ext);
        const isAudio = ['mp3', 'wav', 'm4a', 'ogg'].includes(ext);
        
        const path = element.data.publicPath.replace('/uploads/media/', '');
        const url = `${UPLOAD_URL}/${path}`;

        const getMimeType = () => {
          const types = {
            jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
            gif: 'image/gif', webp: 'image/webp',
            mp4: 'video/mp4', webm: 'video/webm', mpeg: 'video/mpeg',
            mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4'
          };
          return types[ext] || 'application/octet-stream';
        };

        return (
          <div className="h-full p-2 bg-white rounded-lg shadow-lg border-2 border-purple-300 overflow-hidden flex flex-col">
            <div className="flex-1 min-h-0 flex items-center justify-center">
              {isImage ? (
                <img 
                  src={url} 
                  alt={element.data.userGivenName} 
                  className="max-w-full max-h-full object-contain rounded" 
                />
              ) : isVideo || isAudio ? (
                <div className="w-full h-full flex items-center justify-center">
                  <MediaPlayer
                    mediaSource={url}
                    mediaType={getMimeType()}
                    width="100%"
                    height={isAudio ? "60px" : "100%"}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-50 rounded">
                  <div className="text-center p-4">
                    <div className="text-4xl mb-2">📄</div>
                    <p className="text-sm font-medium text-zinc-950 mb-1">{element.data.userGivenName}</p>
                    <p className="text-xs text-zinc-500">{element.data.extensionFile}</p>
                  </div>
                </div>
              )}
            </div>
            {/* Petit label en bas pour identifier le média */}
            <div className="text-xs text-center text-zinc-500 mt-1 truncate px-1">
              {element.data.userGivenName}
            </div>
          </div>
        );

      case 'themeBackgroundImage':
        const bgPath = element.data.publicPath.replace('/uploads/media/', '');
        const bgUrl = `${UPLOAD_URL}/${bgPath}`;
        
        return (
          <div className="h-full p-2 bg-white rounded-lg shadow-lg border-2 border-indigo-300 overflow-hidden relative">
            <img 
              src={bgUrl} 
              alt="Image de fond du thème" 
              className="w-full h-full object-cover rounded" 
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs font-semibold">
              🎨 Image du thème
            </div>
          </div>
        );

      case 'themeColor':
      case 'color':
        return (
          <div className="h-full p-3 bg-white rounded-lg shadow-lg border-2 border-zinc-300 flex flex-col">
            <div 
              className="flex-1 rounded mb-2 shadow-inner"
              style={{ backgroundColor: element.data.colorCode }}
            />
            <div className="text-center">
              <p className="font-semibold text-xs text-zinc-950 truncate">{element.data.name}</p>
              <p className="text-xs text-zinc-500 font-mono">{element.data.colorCode}</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full p-4 bg-white rounded-lg shadow-lg border-2 border-zinc-300 flex items-center justify-center">
            <p className="text-sm text-zinc-500">Type inconnu: {element.type}</p>
          </div>
        );
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
        cursor: isConfiguring ? 'move' : 'default',
        zIndex: element.zIndex || 1, // Utiliser le z-index de l'élément
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={`transition-opacity duration-200 ${isDragging || isResizing ? 'opacity-70 ring-2 ring-blue-500' : ''}`}
    >
      {isConfiguring && (
        <>
          {/* Bouton de suppression */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(element.id);
            }}
            className="absolute -top-3 -right-3 w-7 h-7 !bg-red-500 !text-white rounded-full text-sm hover:!bg-red-600 active:scale-90 z-10 flex items-center justify-center shadow-lg font-bold transition-all duration-200"
            title="Supprimer"
          >
            ✕
          </button>
          
          {/* Poignée de redimensionnement */}
          <div
            className="resize-handle absolute bottom-0 right-0 w-5 h-5 bg-blue-500 cursor-se-resize rounded-tl-lg hover:bg-blue-600 active:bg-blue-700 z-10 shadow-lg transition-colors duration-200"
            onMouseDown={handleResizeMouseDown}
            style={{ cursor: 'se-resize' }}
            title="Redimensionner"
          >
            <svg className="w-3 h-3 text-white absolute bottom-0.5 right-0.5" fill="currentColor" viewBox="0 0 16 16">
              <path d="M14 14V8h-2v4H8v2h6zM8 2v2h4v4h2V2H8z"/>
            </svg>
          </div>
        </>
      )}
      
      {renderContent()}
    </div>
  );
}

export default DraggableElement;