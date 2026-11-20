import React, { useState } from 'react';
import { Building2, ImageOff } from 'lucide-react';
import { getRoomImage } from './roomImages';

export default function RoomImage({ room, className = '' }) {
  const image = getRoomImage(room);
  const [usingFallback, setUsingFallback] = useState(false);
  const [fallbackUnavailable, setFallbackUnavailable] = useState(false);

  const source = usingFallback ? image.fallbackSrc : image.src;

  return (
    <div className={`room-photo ${className}`}>
      {!fallbackUnavailable ? (
        <img
          src={source}
          alt={`${room?.name || 'School facility'}${image.isPlaceholder || usingFallback ? ' — illustrative placeholder, not an actual room photograph' : ''}`}
          loading="lazy"
          onError={() => {
            if (!usingFallback && image.src !== image.fallbackSrc) {
              setUsingFallback(true);
            } else {
              setFallbackUnavailable(true);
            }
          }}
        />
      ) : (
        <div
          className="room-photo-fallback"
          role="img"
          aria-label="Temporary school facility image placeholder"
        >
          <ImageOff aria-hidden="true"/>
          <span>Room image placeholder</span>
        </div>
      )}

      {(image.isPlaceholder || usingFallback) && !fallbackUnavailable && (
        <span className="room-photo-label">Illustrative placeholder</span>
      )}

      {fallbackUnavailable && (
        <span className="room-photo-label">Image unavailable</span>
      )}

      <span className="room-photo-watermark" aria-hidden="true">
        <Building2/>
      </span>
    </div>
  );
}