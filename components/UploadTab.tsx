// components/UploadTab.tsx
import React, { useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { ImageFile } from '@/utils/types';
import { ImageCard } from '@/components/ImageCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { processImagesInBatches } from '@/utils/utils';

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
  const [uploadingRecto, setUploadingRecto] = useState(false);
  const [uploadingVerso, setUploadingVerso] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'recto' | 'verso',
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const setLoading = type === 'recto' ? setUploadingRecto : setUploadingVerso;

    setLoading(true);
    setUploadProgress(0);

    try {
      const processedImages = await processImagesInBatches(
        fileArray,
        type,
        (current, total) => {
          setUploadProgress((current / total) * 100);
        },
      );

      if (type === 'recto') {
        setRectos((prev) => [...prev, ...processedImages]);
      } else {
        setVersos((prev) => [...prev, ...processedImages]);
      }
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
      e.target.value = ''; // Reset input
    }
  };

  const ImageSection = ({
    type,
    images,
    isUploading,
  }: {
    type: 'recto' | 'verso';
    images: ImageFile[];
    isUploading: boolean;
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

      {isUploading && (
        <div className="mb-6">
          <LoadingSpinner
            message={`Traitement des images ${type === 'recto' ? 'recto' : 'verso'}...`}
            progress={uploadProgress}
          />
        </div>
      )}

      {images.length === 0 && !isUploading ? (
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
            disabled={isUploading}
          />
        </label>
      ) : images.length > 0 ? (
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
          <label className="flex items-center justify-center gap-2 mt-4 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
            <Upload className="w-4 h-4" />
            Ajouter d&apos;autres images
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e, type)}
              disabled={isUploading}
            />
          </label>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <ImageSection type="recto" images={rectos} isUploading={uploadingRecto} />
      <div className="border-t border-gray-200" />
      <ImageSection type="verso" images={versos} isUploading={uploadingVerso} />
    </div>
  );
};
