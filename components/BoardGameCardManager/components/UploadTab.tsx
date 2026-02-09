// components/UploadTab.tsx
import React from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
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
    type: 'recto' | 'verso',
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

  const ImageSection = ({
    type,
    images,
  }: {
    type: 'recto' | 'verso';
    images: ImageFile[];
  }) => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {type === 'recto'
              ? 'Faces avant (Rectos)'
              : 'Faces arrière (Versos)'}
          </h2>
          <p className="text-sm text-gray-600 mt-0.5">
            {images.length} image{images.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {images.length === 0 ? (
        <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors group">
          <div className="flex flex-col items-center">
            <div className="p-3 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors mb-3">
              <ImageIcon className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              Ajouter des images
            </p>
            <p className="text-xs text-gray-500">
              Cliquez ou glissez-déposez vos fichiers
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={(e) => handleFileUpload(e, type)}
          />
        </label>
      ) : (
        <div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
            {images.map((img) => (
              <ImageCard
                key={img.id}
                img={img}
                type={type}
                onDelete={() => deleteImage(img.id, type)}
              />
            ))}
          </div>
          <label className="flex items-center justify-center gap-2 mt-4 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Ajouter d'autres images
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e, type)}
            />
          </label>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <ImageSection type="recto" images={rectos} />
      <div className="border-t border-gray-200" />
      <ImageSection type="verso" images={versos} />
    </div>
  );
};
