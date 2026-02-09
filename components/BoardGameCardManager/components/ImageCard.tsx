// components/ImageCard.tsx
import React from 'react';
import { X } from 'lucide-react';
import { ImageFile } from '../types';

interface ImageCardProps {
  img: ImageFile;
  type: string;
  onDelete: () => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  img,
  type,
  onDelete,
}) => {
  return (
    <div className="relative group">
      <div className="aspect-[2.5/3.5] overflow-hidden rounded-lg border border-gray-200 bg-white group-hover:shadow-md transition-shadow">
        <img
          src={img.previewUrl}
          alt={img.name}
          className="w-full h-full object-cover"
        />
      </div>
      <button
        onClick={onDelete}
        className="absolute -top-2 -right-2 p-1 bg-white border border-gray-300 text-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-300"
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
};
