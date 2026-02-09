// components/ImageCard.tsx
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { ImageFile } from '@/utils/types';

interface ImageCardProps {
  img: ImageFile;
  type: string;
  onDelete: () => void;
}

export const ImageCard: React.FC<ImageCardProps> = React.memo(
  ({ img, type, onDelete }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!imgRef.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.disconnect();
            }
          });
        },
        { rootMargin: '100px' }, // Load images 100px before they enter viewport
      );

      observer.observe(imgRef.current);

      return () => observer.disconnect();
    }, []);

    return (
      <div ref={imgRef} className="relative group">
        <div className="aspect-[2.5/3.5] overflow-hidden rounded-lg border border-gray-200 bg-gray-100 group-hover:shadow-md transition-shadow">
          {isInView ? (
            <>
              {!isLoaded && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              )}
              <img
                src={img.thumbnailUrl}
                alt={img.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setIsLoaded(true)}
                loading="lazy"
              />
            </>
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
        </div>
        <button
          onClick={onDelete}
          className="absolute -top-2 -right-2 p-1 bg-white border border-gray-300 text-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-300"
          aria-label="Supprimer l'image"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <p
          className="text-xs text-gray-500 mt-1.5 truncate text-center"
          title={img.name}
        >
          {img.width} × {img.height}
        </p>
      </div>
    );
  },
);

ImageCard.displayName = 'ImageCard';
