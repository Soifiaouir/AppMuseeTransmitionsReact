const STORAGE_KEY = 'museumLayout';

/**
 * Sauvegarder la configuration COMPLÈTE avec les données du thème
 */
export const saveCompleteLayout = (themeId, themeData, layoutElements, modalConfigs) => {
  try {
    const config = {
      themeId, // ID du thème
      themeData, 
      elements: layoutElements,
      modalConfigs: modalConfigs || {},
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    console.log('Configuration complète sauvegardée avec thème');
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde:', error);
    return false;
  }
};

/**
 * Récupérer la configuration complète
 */
export const getCompleteLayout = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    
    const parsed = JSON.parse(saved);
    console.log('Configuration lue du localStorage:', parsed);
    return parsed;
  } catch (error) {
    console.error('Erreur lecture:', error);
    return null;
  }
};

/**
 * Récupérer juste le layout (pour rétrocompatibilité)
 */
export const getTabletLayout = () => {
  return getCompleteLayout();
};

/**
 * Vérifier si une configuration existe et est valide
 */
export const hasValidConfiguration = () => {
  const config = getCompleteLayout();
  return config && config.themeId && config.elements;
};

/**
 * Mettre à jour SEULEMENT la config d'une modal spécifique
 */
export const updateModalConfig = (cardId, modalElements) => {
  try {
    const current = getCompleteLayout();
    if (!current) return false;
    
    current.modalConfigs = current.modalConfigs || {};
    current.modalConfigs[cardId] = modalElements;
    current.savedAt = new Date().toISOString();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    console.log(`Modal config mise à jour pour carte ${cardId}`);
    return true;
  } catch (error) {
    console.error('Erreur mise à jour modal:', error);
    return false;
  }
};

/**
 * Récupérer la config d'une modal spécifique
 */
export const getModalConfig = (cardId) => {
  try {
    const complete = getCompleteLayout();
    if (!complete || !complete.modalConfigs) return null;
    return complete.modalConfigs[cardId] || null;
  } catch (error) {
    console.error('Erreur lecture modal config:', error);
    return null;
  }
};

/**
 * Supprimer la configuration
 */
export const clearTabletLayout = () => {
  localStorage.removeItem(STORAGE_KEY);
  console.log('Configuration supprimée');
};