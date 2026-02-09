// components/SelectableImageCard.tsx
import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { ImageFile } from '@/utils/types';

interface SelectableImageCardProps {
  image: ImageFile;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
}

export const SelectableImageCard: React.FC<SelectableImageCardProps> =
  React.memo(({ image, isSelected, onSelect }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
      <button
        onClick={onSelect}
        className={`relative rounded-lg overflow-hidden border-2 transition-all ${
          isSelected
            ? 'border-green-500 ring-2 ring-green-500 ring-offset-2 shadow-lg'
            : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
        }`}
      >
        <div className="relative w-full aspect-[2.5/3.5]">
          {/* Loading placeholder */}
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          )}

          {/* Image */}
          <img
            src={image.thumbnailUrl}
            alt={image.name}
            className={`w-full h-full object-cover transition-opacity duration-200 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsLoaded(true)}
            loading="lazy"
          />

          {/* Selection indicator - Green check in top right */}
          {isSelected && (
            <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1 shadow-lg animate-in zoom-in duration-200">
              <Check className="w-4 h-4 text-white stroke-[3]" />
            </div>
          )}

          {/* Hover overlay for better feedback */}
          <div
            className={`absolute inset-0 transition-opacity pointer-events-none ${
              isSelected
                ? 'bg-green-500 bg-opacity-10'
                : 'bg-gray-900 bg-opacity-0 hover:bg-opacity-5'
            }`}
          />
        </div>

        {/* Image info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
          <p className="text-xs text-white truncate" title={image.name}>
            {image.width} × {image.height}
          </p>
        </div>
      </button>
    );
  });

SelectableImageCard.displayName = 'SelectableImageCard';
