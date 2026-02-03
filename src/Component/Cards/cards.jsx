import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings } from 'lucide-react';
import { getCompleteLayout } from '../../Services/TabletConfig/tabletConfigService.js';
import { UPLOAD_URL } from '../../config.js';
import ModalConfigurable from '../Modal/modalConfigurable.jsx';

function MuseumCard({ cardData, themeData, isConfigMode = false, onConfigureModal }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isConfiguringModal, setIsConfiguringModal] = useState(false);
  const [modalLayout, setModalLayout] = useState([]);


  const getActualCardData = () => {
    // Si cardData a directement un id et title, c'est déjà la bonne structure
    if (cardData?.id && cardData?.title) {
      return cardData;
    }
    return null;
  };
  
  const actualCard = getActualCardData();

  useEffect(() => {
    if (actualCard) {
      const completeConfig = getCompleteLayout();
      if (completeConfig?.modalConfigs?.[actualCard.id]) {
        setModalLayout(completeConfig.modalConfigs[actualCard.id]);
      }
    }
  }, [cardData]);

  const handleCardClick = (e) => {
    if (!isConfigMode && !showModal && e.target === e.currentTarget) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleOpenModal = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowModal(true);
    setIsFlipped(false); // Remettre la carte face avant quand on ouvre la modale
  };

  const handleConfigureModal = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onConfigureModal) {
      onConfigureModal(actualCard || cardData);
    } else {
      setIsConfiguringModal(true);
      setShowModal(true);
      setIsFlipped(false); // Remettre la carte face avant quand on ouvre la modale
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsConfiguringModal(false);
  };

  // Fonction pour obtenir l'image principale de la carte
  const getCardImage = () => {
    if (!actualCard) {
      return null;
    }

    const firstImage = actualCard.medias.find((m) => {
      const ext = m.extensionFile?.toLowerCase();
      const isImage = ext && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
      return m.type === 'image' && isImage;
    });

    if (firstImage?.publicPath) {
      const cleanPath = firstImage.publicPath.replace(/^\/uploads\/media\//, '');
      const fullUrl = `${UPLOAD_URL}/${cleanPath}`;
      return fullUrl;
    }

    return null;
  };

  const getBackgroundImage = () => {
    if (!actualCard) return null;

    if (!actualCard.backgroundImageUrls || !Array.isArray(actualCard.backgroundImageUrls) || actualCard.backgroundImageUrls.length === 0) {
      return null;
    }

    const bgPath = actualCard.backgroundImageUrls[0];
    if (bgPath) {
      const cleanPath = bgPath.replace(/^\/uploads\/media\//, '');
      const fullUrl = `${UPLOAD_URL}/${cleanPath}`;
      return fullUrl;
    }

    return null;
  };

 const getBackgroundColor = () => {
  if (!actualCard) return '#1e40af';

  // actualCard.backgroundColor est un objet Color ou null
  const colorObj = actualCard.backgroundColor;
  if (!colorObj || !colorObj.colorCode) {
    return '#1e40af';
  }

  return colorObj.colorCode;
};

const getTextColor = () => {
  if (!actualCard) return '#ffffff';
  const colorObj = actualCard.textColor;
  if (!colorObj || !colorObj.colorCode) {
    return '#ffffff';
  }
  return colorObj.colorCode;
}

  // Si pas de carte valide, ne rien afficher
  if (!actualCard) {
    return (
      <div className="h-[28rem] w-[22rem] flex items-center justify-center bg-red-100 rounded-3xl">
        <p className="text-red-600 font-bold">Erreur : données de carte invalides</p>
      </div>
    );
  }

  const cardImage = getCardImage();
  const backgroundColor = getBackgroundColor();
  const textColor = getTextColor();

  return (
    <>
<div className="h-[38rem] w-[25rem] relative overflow-hidden" style={{ perspective: '2000px' }}>        <div
          className="relative w-full h-full transition-all duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
          }}
        >
          {/* FACE AVANT */}
          <div
            className="absolute inset-0 cursor-pointer"
            style={{ backfaceVisibility: 'hidden' }}
            onClick={handleCardClick}
          >
            <div 
              className="h-full w-full rounded-3xl shadow-2xl overflow-hidden pointer-events-none border-4 border-white/50 relative"
              style={{
                backgroundImage: cardImage ? `url(${cardImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: cardImage ? 'transparent' : backgroundColor
              }}
            >
            {cardImage && (
              <div className="absolute inset-0 bg-black/20"></div>
            )}
    
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center">
                <h3 
                  className="font-black text-3xl" 
                  style={{ 
                    color: textColor || 'white',
                    textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))'
                  }}
                >
                  {actualCard.title}
                </h3>
              </div>
            </div>
          </div>
        </div>


          {/* FACE ARRIÈRE */}
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div
              className="h-full w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border-4 border-white/50"
              style={{
                backgroundImage: cardImage ? `url(${cardImage})` : 'none',
                backgroundColor: cardImage ? 'transparent' : backgroundColor,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Overlay pour améliorer la lisibilité */}
              {cardImage && (
                <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"></div>
              )}

              <div className="relative z-10 h-full flex flex-col" >

                {/* Titre */}
                <div
                  className="px-6 cursor-pointer backdrop-blur-md"
                  onClick={handleCardClick}
                  >
                    <h3 className="font-black text-xl text-white "
                    style={{ color: textColor || 'white' }}>
                    {actualCard.title}
                  </h3>
                </div>

                {/*détails */}
                <div
                  className="flex-1 overflow-y-auto cursor-pointer"
                  onClick={handleCardClick}
                >
                  <div
                    className="text-sm leading-relaxed p-5 rounded-2xl shadow-lg"
                   
                  >
                    <p style={{ color: textColor || 'white' }}>
                      {actualCard.detail?.substring(0, 250) || 'Détails...'}
                      {actualCard.detail && actualCard.detail}
                    </p>
                  </div>
                </div>

                {/* Boutons en bas */}
                <div className="flex justify-center gap-2 p-4">
                  {!isConfigMode && (
                    <button
                      onClick={handleOpenModal}
                      className="w-full py-3 px-6 rounded-2xl font-black transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] border-2 border-blue-500/30 !bg-blue-500 hover:!bg-blue-600 active:!bg-blue-700 !text-white text-lg"
                    >
                      Plus d'informations
                    </button>
                  )}

                  {isConfigMode && (
                    <button
                      onClick={handleConfigureModal}
                      className="w-full py-3 px-4 rounded-2xl font-black transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] border-2 border-orange-500/30 !bg-orange-500 hover:!bg-orange-600 active:!bg-orange-700 !text-white text-lg"
                    >
                      <Settings size={20} />
                      <span>Configurer la modal</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALE - Rendue via Portal pour être au-dessus de tout */}
      {showModal && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm"
          style={{ zIndex: 999999 }}
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ 
              width: '22in',
              height: '22in',
              maxWidth: '95vw',
              maxHeight: '95vh',
              zIndex: 1000000
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalConfigurable
              cardData={actualCard}
              themeData={themeData}
              layout={modalLayout}
              setLayout={setModalLayout}
              isConfiguring={isConfiguringModal}
              onClose={handleCloseModal}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default MuseumCard;