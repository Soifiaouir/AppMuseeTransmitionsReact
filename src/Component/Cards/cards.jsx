import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { getCompleteLayout } from '../../Services/TabletConfig/tabletConfigService.js';
import { UPLOAD_URL } from '../../config.js';
import ModalConfigurable from '../Modal/modalConfigurable.jsx';

function MuseumCard({ cardData, themeData, isConfigMode = false, onConfigureModal }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isConfiguringModal, setIsConfiguringModal] = useState(false);
  const [modalLayout, setModalLayout] = useState([]);

  // ⭐ NOUVEAU : Extraire la vraie carte depuis cardData
  const getActualCardData = () => {
    // Si cardData a directement un id et title, c'est déjà la bonne structure
    if (cardData?.id && cardData?.title) {
      return cardData;
    }
    
    // Sinon, peut-être que c'est dans cardData.card ou cardData.element
    if (cardData?.card) {
      return cardData.card;
    }
    
    if (cardData?.element) {
      return cardData.element;
    }
    
    console.error('❌ Structure de cardData non reconnue:', cardData);
    return null;
  };

  const actualCard = getActualCardData();

  useEffect(() => {
    console.log('🎴 === CARD DATA COMPLET ===');
    console.log('cardData brut:', cardData);
    console.log('actualCard extrait:', actualCard);
    
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
  };

  const handleConfigureModal = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (onConfigureModal) {
      onConfigureModal(actualCard || cardData);
    } else {
      setIsConfiguringModal(true);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsConfiguringModal(false);
  };

  // Fonction pour obtenir l'image principale de la carte
  const getCardImage = () => {
    if (!actualCard) {
      console.error('❌ Pas de carte valide');
      return null;
    }

    console.log('🖼️ Recherche image principale dans medias:', actualCard.medias);
    
    if (!actualCard.medias || !Array.isArray(actualCard.medias) || actualCard.medias.length === 0) {
      console.warn('⚠️ Pas de médias trouvés');
      return null;
    }

    const firstImage = actualCard.medias.find(m => {
      const ext = m.extensionFile?.toLowerCase();
      const isImage = ext && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
      console.log(`  - Media ${m.id}: type=${m.type}, ext=${ext}, isImage=${isImage}`);
      return m.type === 'image' && isImage;
    });

    if (firstImage?.publicPath) {
      const cleanPath = firstImage.publicPath.replace(/^\/uploads\/media\//, '');
      const fullUrl = `${UPLOAD_URL}/${cleanPath}`;
      console.log('✅ Image principale trouvée:', fullUrl);
      return fullUrl;
    }

    console.warn('⚠️ Aucune image valide trouvée dans medias');
    return null;
  };

  const getBackgroundImage = () => {
    if (!actualCard) return null;

    console.log('🎨 Recherche background dans backgroundImageUrls:', actualCard.backgroundImageUrls);
    
    if (!actualCard.backgroundImageUrls || !Array.isArray(actualCard.backgroundImageUrls) || actualCard.backgroundImageUrls.length === 0) {
      console.warn('⚠️ Pas de backgroundImageUrls');
      return null;
    }

    const bgPath = actualCard.backgroundImageUrls[0];
    if (bgPath) {
      const cleanPath = bgPath.replace(/^\/uploads\/media\//, '');
      const fullUrl = `${UPLOAD_URL}/${cleanPath}`;
      console.log('✅ Background trouvé:', fullUrl);
      return fullUrl;
    }

    return null;
  };

  const getBackgroundColor = () => {
    if (!actualCard) return '#1e40af';

    console.log('🎨 Couleurs disponibles:', actualCard.backgroundColor);
    
    if (!actualCard.backgroundColor || !Array.isArray(actualCard.backgroundColor) || actualCard.backgroundColor.length === 0) {
      console.warn('⚠️ Pas de backgroundColor, utilisation couleur par défaut');
      return '#1e40af';
    }

    const color = actualCard.backgroundColor[0];
    const finalColor = color.colorCode || color.hexCode || color.code || '#1e40af';
    console.log('✅ Couleur sélectionnée:', finalColor);
    return finalColor;
  };

  // Si pas de carte valide, ne rien afficher
  if (!actualCard) {
    console.error('❌ Impossible de trouver les données de la carte');
    return (
      <div className="h-[28rem] w-[22rem] flex items-center justify-center bg-red-100 rounded-3xl">
        <p className="text-red-600 font-bold">Erreur : données de carte invalides</p>
      </div>
    );
  }

  const cardImage = getCardImage();
  const backgroundImage = getBackgroundImage();
  const backgroundColor = getBackgroundColor();

  console.log('📊 Résumé:');
  console.log('  - cardImage:', cardImage);
  console.log('  - backgroundImage:', backgroundImage);
  console.log('  - backgroundColor:', backgroundColor);

  return (
    <>
      <div className="h-[28rem] w-[22rem] relative" style={{ perspective: '2000px' }}>
        <div 
          className="relative w-full h-full transition-all duration-700"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'
          }}
        >
          {/* FACE AVANT */}
          <div 
            className="absolute inset-0 cursor-pointer" 
            style={{ backfaceVisibility: 'hidden' }}
            onClick={handleCardClick}
          >
            <div className="h-full w-full rounded-3xl shadow-2xl overflow-hidden pointer-events-none border-4 border-white/50">
              {cardImage ? (
                <img 
                  src={cardImage} 
                  alt={actualCard.title} 
                  className="w-full h-full object-cover" 
                  onLoad={() => console.log('✅ Image chargée avec succès:', cardImage)}
                  onError={(e) => {
                    console.error('❌ Erreur chargement image:', cardImage);
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center p-8"
                  style={{ backgroundColor }}
                >
                  <div className="text-center">
                    <div className="text-5xl mb-4">🖼️</div>
                    <h3 className="font-black text-3xl text-white">
                      {actualCard.title}
                    </h3>
                  </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-zinc-950/70">
                <h3 className="font-black text-lg text-white">
                  {actualCard.title}
                </h3>
              </div>
            </div>
          </div>

          {/* FACE ARRIÈRE */}
          <div 
            className="absolute inset-0" 
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div 
              className="h-full w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border-4 border-white/50 bg-white"
              style={{
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {backgroundImage && (
                <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"></div>
              )}

              <div className="relative z-10 h-full flex flex-col">
                <div 
                  className="px-4 py-3 cursor-pointer"
                  style={{ 
                    backgroundColor: backgroundImage ? 'rgba(0,0,0,0.7)' : backgroundColor
                  }}
                  onClick={handleCardClick}
                >
                  <h3 className="font-black text-lg text-white">
                    {actualCard.title}
                  </h3>
                </div>
                
                <div 
                  className="flex-1 overflow-y-auto p-4 cursor-pointer bg-white"
                  onClick={handleCardClick}
                  style={{ 
                    backgroundColor: backgroundImage ? 'transparent' : 'white' 
                  }}
                >
                  <div 
                    className="text-sm leading-relaxed p-4 rounded-3xl text-zinc-950"
                    style={{ 
                      backgroundColor: backgroundImage ? 'rgba(255,255,255,0.95)' : 'transparent'
                    }}
                  >
                    {actualCard.detail?.substring(0, 200) || "Détails..."}
                    {actualCard.detail && actualCard.detail.length > 200 && '...'}
                  </div>
                </div>
                
                <div 
                  className="p-3 space-y-2 bg-white border-t border-zinc-200"
                  style={{ 
                    backgroundColor: backgroundImage ? 'rgba(0,0,0,0.7)' : 'white',
                    borderTop: backgroundImage ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e5e7eb'
                  }}
                >
                  {!isConfigMode && (
                    <button
                      onClick={handleOpenModal}
                      className="w-full py-2 px-4 rounded-2xl font-black transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] border-2 border-transparent !bg-red-500 hover:!bg-blue-500 !text-white"
                    >
                      <span>📖</span>
                      <span>Informations complémentaires</span>
                    </button>
                  )}
                  
                  {isConfigMode && (
                    <button
                      onClick={handleConfigureModal}
                      className="w-full py-2 px-4 rounded-2xl font-black transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] border-2 border-orange-500/30 !bg-orange-500 hover:!bg-orange-600 active:!bg-orange-700 !text-white"
                    >
                      <Settings size={18} />
                      <span>Configurer la modal</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 bg-zinc-950/60 z-[9999]"
          onClick={handleCloseModal}
        >
          <div 
            className="w-[70vw] h-[70vh] max-w-6xl max-h-[90vh] mx-auto my-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ maxWidth: '1400px' }}
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
        </div>
      )}
    </>
  );
}

export default MuseumCard;