// components/ImageCard.tsx
import React from 'react';
import { Trash2 } from 'lucide-react';
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
      <div className="aspect-[2.5/3.5] overflow-hidden rounded-xl border-2 border-gray-200 shadow-sm bg-white group-hover:shadow-lg transition-all">
        <img
          src={img.previewUrl}
          alt={img.name}
          className="w-full h-full object-cover"
        />
      </div>
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <p className="text-xs text-gray-600 mt-1.5 truncate text-center">
        {img.name}
      </p>
    </div>
  );
};
