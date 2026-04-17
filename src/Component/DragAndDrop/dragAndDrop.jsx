import { useState, useEffect } from 'react';
import { UPLOAD_URL } from '../../config.js';
import MediaPlayer from '../MediaPlayer/mediaPlayer.jsx';

/**
 * DraggableElement
 *
 * Composant générique pour afficher et manipuler un élément dans la modale de configuration.
 * Supporte le drag (déplacement) et le resize (redimensionnement),
 * aussi bien à la souris (mouse) que sur tablette (touch).
 *
 * Props :
 * - element       : objet contenant id, type, data, position {x,y}, size {width,height}, zIndex
 * - isConfiguring : boolean — active le drag/resize et affiche les boutons de contrôle
 * - onPositionChange(id, x, y)         : callback appelé à chaque déplacement
 * - onSizeChange(id, width, height)    : callback appelé à chaque redimensionnement
 * - onRemove(id)                       : callback appelé lors de la suppression
 * - onBringToFront(id)                 : callback pour mettre l'élément au premier plan (zIndex)
 */
function DraggableElement({
  element,
  isConfiguring,
  onPositionChange,
  onSizeChange,
  onRemove,
  onBringToFront,
}) {
  // ─── État local ────────────────────────────────────────────────────────────

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  // ─── Utilitaire ───────────────────────────────────────────────────────────

  /**
   * Extrait les coordonnées x/y depuis un événement mouse ou touch.
   * Permet d'utiliser le même handler pour les deux types d'interaction.
   */
  const getCoords = (e) => {
    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }

    return {
      x: e.clientX,
      y: e.clientY,
    };
  };

  // ─── Handlers de démarrage ────────────────────────────────────────────────

  /**
   * Démarre le drag quand on appuie sur l'élément (hors poignée de resize).
   * Calcule l'offset entre le pointeur et la position de l'élément
   * pour que l'élément ne "saute" pas sous le doigt/curseur.
   */
  const handleDragStart = (e) => {
    if (!isConfiguring || e.target.classList.contains('resize-handle')) return;

    e.preventDefault();
    e.stopPropagation();

    if (onBringToFront) onBringToFront(element.id);

    const { x, y } = getCoords(e);

    setIsDragging(true);
    setDragOffset({
      x: x - element.position.x,
      y: y - element.position.y,
    });
  };

  /**
   * Démarre le resize quand on appuie sur la poignée (coin bas-droite).
   * Mémorise la taille initiale et la position du pointeur au démarrage.
   */
  const handleResizeStart = (e) => {
    if (!isConfiguring) return;

    e.preventDefault();
    e.stopPropagation();

    if (onBringToFront) onBringToFront(element.id);

    const { x, y } = getCoords(e);

    setIsResizing(true);
    setResizeStart({
      width: element.size.width,
      height: element.size.height,
      x,
      y,
    });
  };

  /**
   * Gère le clic simple sur l'élément (sans drag ni resize).
   * Sert uniquement à mettre l'élément au premier plan.
   */
  const handleClick = (e) => {
    if (isConfiguring && onBringToFront && !isDragging && !isResizing) {
      e.stopPropagation();
      onBringToFront(element.id);
    }
  };

  // ─── Handlers de mouvement et fin (mouse + touch) ─────────────────────────

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    /**
     * Appelé à chaque mouvement (mousemove ou touchmove).
     * Met à jour la position ou la taille selon le mode actif.
     */
    const handleMove = (e) => {
      const { x, y } = getCoords(e);

      if (isDragging) {
        onPositionChange(element.id, x - dragOffset.x, y - dragOffset.y);
      } else if (isResizing) {
        const newWidth = Math.max(150, resizeStart.width + (x - resizeStart.x));
        const newHeight = Math.max(100, resizeStart.height + (y - resizeStart.y));

        onSizeChange(element.id, newWidth, newHeight);
      }
    };

    /** Termine le drag ou le resize quand on relâche. */
    const handleEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [
    isDragging,
    isResizing,
    dragOffset,
    resizeStart,
    element.id,
    onPositionChange,
    onSizeChange,
  ]);

  // ─── Rendu du contenu selon le type ──────────────────────────────────────

  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div className="w-full h-full rounded-xl bg-white border border-slate-200 shadow-sm p-4 overflow-auto">
            <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
              {element.data.content}
            </p>
          </div>
        );

      case 'moreInfo': {
        const title = element.data.Title || element.data.title;
        const details = element.data.details || element.data.Details;

        return (
          <div className="w-full h-full rounded-xl bg-emerald-50 border border-emerald-200 shadow-sm p-4 overflow-auto">
            {title && (
              <h3 className="text-base font-semibold text-emerald-900 mb-2 pb-2 border-b border-emerald-200">
                {title}
              </h3>
            )}

            <p className="text-sm leading-relaxed text-emerald-950 whitespace-pre-wrap">
              {details || 'Aucun détail'}
            </p>
          </div>
        );
      }

      case 'media': {
        const ext = element.data.extensionFile?.toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
        const isVideo = ['mp4', 'webm', 'ogg', 'mpeg'].includes(ext);
        const isAudio = ['mp3', 'wav', 'm4a', 'ogg'].includes(ext);
        const url = `${UPLOAD_URL}${element.data.publicPath}`;

        const getMimeType = () => {
          const types = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            gif: 'image/gif',
            webp: 'image/webp',
            mp4: 'video/mp4',
            webm: 'video/webm',
            mpeg: 'video/mpeg',
            mp3: 'audio/mpeg',
            wav: 'audio/wav',
            m4a: 'audio/mp4',
          };

          return types[ext] || 'application/octet-stream';
        };

        return (
          <div className="w-full h-full rounded-xl bg-white border border-violet-200 shadow-sm p-2 overflow-hidden flex flex-col">
            <div className="flex-1 min-h-0 flex items-center justify-center rounded-lg bg-violet-50">
              {isImage ? (
                <img
                  src={url}
                  alt={element.data.userGivenName}
                  className="w-full h-full object-contain rounded-lg"
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
                <div className="text-center px-4">
                  <div className="text-4xl mb-2">📄</div>
                  <div className="text-sm font-medium text-slate-800">
                    {element.data.userGivenName}
                  </div>
                  <div className="text-xs text-slate-500">
                    {element.data.extensionFile}
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-center text-slate-500 mt-2 truncate px-1">
              {element.data.userGivenName}
            </p>
          </div>
        );
      }

      case 'themeBackgroundImage': {
        const bgPath = element.data.publicPath.replace('/uploads/media/', '');
        const bgUrl = `${UPLOAD_URL}/${bgPath}`;

        return (
          <div className="w-full h-full rounded-xl bg-white border border-indigo-200 shadow-sm p-2 overflow-hidden relative">
            <img
              src={bgUrl}
              alt="Image du thème"
              className="w-full h-full object-cover rounded-lg"
            />

            <p className="absolute bottom-2 left-2 right-2 text-xs font-medium text-white bg-black/55 rounded-md px-2 py-1">
              🎨 Image du thème
            </p>
          </div>
        );
      }

      case 'themeColor':
      case 'color':
        return (
          <div className="w-full h-full rounded-xl bg-white border border-slate-200 shadow-sm p-3 flex flex-col">
            <div
              style={{ backgroundColor: element.data.colorCode }}
              className="w-full flex-1 rounded-lg border border-slate-200"
            />

            <p className="mt-2 text-sm font-medium text-slate-800 truncate">
              {element.data.name}
            </p>
            <p className="text-xs text-slate-500 font-mono">
              {element.data.colorCode}
            </p>
          </div>
        );

      default:
        return (
          <div className="w-full h-full rounded-xl bg-white border border-slate-200 shadow-sm p-4 flex items-center justify-center">
            <p className="text-sm text-slate-500">
              Type inconnu : {element.type}
            </p>
          </div>
        );
    }
  };

  // ─── Rendu principal ──────────────────────────────────────────────────────

  return (
    <div
      className="absolute"
      style={{
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
        zIndex: element.zIndex,
      }}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      onClick={handleClick}
    >
      {isConfiguring && (
        <>
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

          <div
            className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
          >
            <div className="w-full h-full bg-blue-500 rounded-tl" />
          </div>
        </>
      )}

      {renderContent()}
    </div>
  );
}

export default DraggableElement;