// components/UploadTab.tsx
import React from 'react';
import { Upload } from 'lucide-react';
import { ImageFile } from '../types';
import { ImageCard } from './ImageCard';
import { createThumbnail, generateId } from '../utils';

interface UploadTabProps {
  rectos: ImageFile[];
  versos: ImageFile[];
  setRectos: React.Dispatch<React.SetStateAction<ImageFile[]>>;
  setVersos: React.Dispatch<React.SetStateAction<ImageFile[]>>;
  deleteImage: (id: string, type: 'recto' | 'verso') => void;
}

export const UploadTab: React.FC<UploadTabProps> = ({
  rectos,
  versos,
  setRectos,
  setVersos,
  deleteImage,
}) => {
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'recto' | 'verso'
  ) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
          const previewUrl = createThumbnail(img, 300, 0.7);
          const layoutPreviewUrl = createThumbnail(img, 100, 0.3);

          const newImage: ImageFile = {
            id: generateId(type),
            name: file.name,
            url: imageUrl,
            previewUrl,
            layoutPreviewUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
          };
          if (type === 'recto') setRectos((prev) => [...prev, newImage]);
          else setVersos((prev) => [...prev, newImage]);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-12">
      {['recto', 'verso'].map((type) => (
        <div key={type}>
          <h2 className="text-2xl font-bold text-indigo-900 mb-6">
            {type === 'recto' ? 'Rectos' : 'Versos'} (
            {type === 'recto' ? rectos.length : versos.length})
          </h2>
          <label className="flex flex-col items-center justify-center w-full h-32 border-4 border-dashed border-indigo-300 rounded-2xl cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-all group">
            <Upload className="w-12 h-12 text-indigo-500 mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-lg text-indigo-700 font-medium text-center px-4">
              Déposer ou cliquer pour ajouter des {type}s
            </p>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e, type as 'recto' | 'verso')}
            />
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-6 mt-8">
            {(type === 'recto' ? rectos : versos).map((img) => (
              <ImageCard
                key={img.id}
                img={img}
                type={type}
                onDelete={() => deleteImage(img.id, type as 'recto' | 'verso')}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
