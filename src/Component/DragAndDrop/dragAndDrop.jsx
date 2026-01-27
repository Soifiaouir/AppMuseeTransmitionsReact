import { useState, useEffect } from 'react';
import { UPLOAD_URL } from '../../config.js';
import MediaPlayer from '../MediaPlayer/mediaPlayer.jsx';

function DraggableElement({ element, isConfiguring, onPositionChange, onSizeChange, onRemove }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (!isConfiguring || e.target.classList.contains('resize-handle')) return;
    e.preventDefault();
    e.stopPropagation();
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
    setIsResizing(true);
    setResizeStart({
      width: element.size.width,
      height: element.size.height,
      x: e.clientX,
      y: e.clientY
    });
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
        return (
          <div className="h-full p-4 bg-white rounded-lg shadow-lg border-2 border-emerald-300 overflow-auto">
            {element.data.Title && (
              <h4 className="font-bold text-base mb-2 pb-2 border-b-2 border-emerald-200 text-zinc-950">
                {element.data.Title}
              </h4>
            )}
            <div className="text-zinc-950 text-sm leading-relaxed whitespace-pre-wrap">
              {element.data.details || "Aucun détail"}
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
          <div className="h-full p-2 bg-white rounded-lg shadow-lg border-2 border-purple-300 overflow-hidden">
            {isImage ? (
              <img 
                src={url} 
                alt={element.data.userGivenName} 
                className="w-full h-full object-cover rounded" 
              />
            ) : isVideo || isAudio ? (
              <div className="w-full h-full flex items-center justify-center">
                <MediaPlayer
                  mediaSource={url}
                  mediaType={getMimeType()}
                  width={element.size.width - 20}
                  height={element.size.height - 20}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-50 rounded">
                <div className="text-center">
                  <div className="text-3xl mb-2">📄</div>
                  <p className="text-xs font-medium text-zinc-950">{element.data.userGivenName}</p>
                  <p className="text-xs text-zinc-500">{element.data.extensionFile}</p>
                </div>
              </div>
            )}
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
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs">
              🎨 Image du thème
            </div>
          </div>
        );

      case 'themeColor':
        return (
          <div className="h-full p-3 bg-white rounded-lg shadow-lg border-2 border-zinc-300">
            <div 
              className="w-full h-2/3 rounded mb-2"
              style={{ backgroundColor: element.data.colorCode }}
            />
            <p className="font-semibold text-xs text-center text-zinc-950">{element.data.name}</p>
            <p className="text-xs text-zinc-500 text-center">{element.data.colorCode}</p>
          </div>
        );

      case 'color':
        return (
          <div className="h-full p-3 bg-white rounded-lg shadow-lg border-2 border-zinc-300">
            <div 
              className="w-full h-2/3 rounded mb-2"
              style={{ backgroundColor: element.data.colorCode }}
            />
            <p className="font-semibold text-xs text-center text-zinc-950">{element.data.name}</p>
            <p className="text-xs text-zinc-500 text-center">{element.data.colorCode}</p>
          </div>
        );

      default:
        return null;
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
        zIndex: isDragging ? 1000 : 1,
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
      className={isDragging || isResizing ? 'opacity-70' : ''}
    >
      {isConfiguring && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(element.id);
            }}
            className="absolute -top-2 -right-2 w-6 h-6 !bg-red-500 !text-white rounded-full text-xs hover:!bg-red-600 z-10 flex items-center justify-center shadow-lg"
          >
            ✕
          </button>
          <div
            className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-tl-lg hover:bg-blue-600 z-10"
            onMouseDown={handleResizeMouseDown}
            style={{ cursor: 'se-resize' }}
          />
        </>
      )}
      
      {renderContent()}
    </div>
  );
}

export default DraggableElement;