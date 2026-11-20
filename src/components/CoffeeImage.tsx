import React, { useState } from 'react';
import { Coffee } from 'lucide-react';

interface CoffeeImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const CoffeeImage: React.FC<CoffeeImageProps> = ({ src, alt, className = '' }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#231A14] to-[#140F0C] text-[#A89688] p-4 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Coffee className="w-8 h-8 mb-2 opacity-60" strokeWidth={1.5} />
        <span className="text-xs text-center font-medium line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={`object-cover w-full h-full ${className}`}
    />
  );
};
