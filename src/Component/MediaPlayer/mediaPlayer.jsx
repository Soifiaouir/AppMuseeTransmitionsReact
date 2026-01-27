import React from 'react';

function MediaPlayer({ 
  mediaSource, 
  mediaType = 'video/mp4',
  width = 560, 
  height = 315 
}) {
  
  if (mediaType.startsWith('video/')) {
    return (
      <video
        width={width}
        height={height}
        controls
        className="max-w-full rounded-lg shadow-lg"
      >
        <source src={mediaSource} type={mediaType} />
        Votre navigateur ne supporte pas la lecture de vidéos.
      </video>
    );
  }

  if (mediaType.startsWith('audio/')) {
    return (
      <div className="w-full bg-zinc-50 p-4 rounded-lg">
        <audio 
          controls 
          className="w-full"
          style={{ maxWidth: width }}
        >
          <source src={mediaSource} type={mediaType} />
          Votre navigateur ne supporte pas la lecture audio.
        </audio>
      </div>
    );
  }

  return (
    <div className="p-4 bg-red-50 text-red-600 rounded-lg">
      <p>Type de média non supporté: {mediaType}</p>
    </div>
  );
}

export default MediaPlayer;