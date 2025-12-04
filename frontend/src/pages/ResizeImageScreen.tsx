import React, { useState, useCallback, useMemo } from 'react';
import { Maximize2, ArrowRight, ImageMinus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../services/api';
import { useResizeImage } from '../hooks/useImage';
import {
  FileDropzone,
  ProcessButton,
  ErrorAlert,
  ResultCard,
} from '../components/ui';

const RESAMPLE_OPTIONS = [
  { value: 'lanczos', label: 'Lanczos (Best Quality)' },
  { value: 'bicubic', label: 'Bicubic' },
  { value: 'bilinear', label: 'Bilinear' },
  { value: 'nearest', label: 'Nearest (Fastest)' },
];

export const ResizeImageScreen: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [resample, setResample] = useState<string>('lanczos');

  const resizeMutation = useResizeImage();

  const loading = resizeMutation.isPending;
  const result = resizeMutation.data;
  const error = resizeMutation.error;

  const handleFileChange = useCallback((newFile: File | null) => {
    setFile(newFile);
    if (newFile) {
      setPreviewUrl(URL.createObjectURL(newFile));
      // Try to get image dimensions to suggest initial values
      const img = new Image();
      img.onload = () => {
        if (maintainAspectRatio && !width && !height) {
          // Suggest a reasonable size (e.g., 50% of original)
          setWidth(Math.round(img.width * 0.5).toString());
        }
      };
      img.src = URL.createObjectURL(newFile);
    } else {
      setPreviewUrl(null);
    }
    resizeMutation.reset();
  }, [resizeMutation, maintainAspectRatio, width, height]);

  const handleSubmit = useCallback(() => {
    if (!file) return;
    const widthNum = width ? parseInt(width, 10) : undefined;
    const heightNum = height ? parseInt(height, 10) : undefined;
    
    if (!widthNum && !heightNum) {
      return; // Should be validated by UI
    }
    
    resizeMutation.mutate({ 
      file, 
      width: widthNum, 
      height: heightNum, 
      maintainAspectRatio,
      resample 
    });
  }, [file, width, height, maintainAspectRatio, resample, resizeMutation]);

  const errorMessage = useMemo(() => {
    if (error instanceof Error) return error.message;
    if (result && !result.success) return result.message;
    return null;
  }, [error, result]);

  const canSubmit = useMemo(() => {
    return file && (width || height) && 
           (!width || parseInt(width, 10) > 0) && 
           (!height || parseInt(height, 10) > 0);
  }, [file, width, height]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        <Maximize2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        {t('resizeImage.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CONTROLS (Left) */}
        <div className="lg:col-span-4 space-y-6">
          <FileDropzone
            file={file}
            onFileChange={handleFileChange}
            accept="image/*"
            fileType="image"
            labelKey="resizeImage.imageFile"
            dropLabelKey="resizeImage.dragDrop"
            color="blue"
          />

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="width" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('resizeImage.width')} (px)
                </label>
                <input
                  id="width"
                  type="number"
                  min="1"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Width"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('resizeImage.height')} (px)
                </label>
                <input
                  id="height"
                  type="number"
                  min="1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Height"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="maintain-aspect"
                type="checkbox"
                checked={maintainAspectRatio}
                onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="maintain-aspect" className="text-sm text-gray-700 dark:text-gray-300">
                {t('resizeImage.maintainAspectRatio')}
              </label>
            </div>

            <div className="space-y-2">
              <label htmlFor="resample" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('resizeImage.resample')}
              </label>
              <select
                id="resample"
                value={resample}
                onChange={(e) => setResample(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {RESAMPLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ProcessButton
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={loading}
            labelKey="resizeImage.resizeImage"
            loadingLabelKey="resizeImage.processing"
            color="blue"
          />

          <ErrorAlert message={errorMessage} />
        </div>

        {/* PREVIEW AREA (Right) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Image */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('resizeImage.original')}
              </h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden aspect-square flex items-center justify-center relative">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt={t('resizeImage.original')} 
                    className="max-w-full max-h-full object-contain" 
                  />
                ) : (
                  <ImageMinus className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                )}
                {file && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                )}
              </div>
            </div>

            {/* Resized Image */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-between">
                {t('resizeImage.result')}
                {result && result.success && (
                  <span className="text-green-600 dark:text-green-400 font-bold">{t('common.success')}!</span>
                )}
              </h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden aspect-square flex items-center justify-center relative">
                {result?.download_url ? (
                  <img 
                    src={ApiService.getDownloadUrl(result.download_url)} 
                    alt="Resized" 
                    className="max-w-full max-h-full object-contain" 
                  />
                ) : loading ? (
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mb-2" />
                    <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
                  </div>
                ) : (
                  <div className="text-gray-300 dark:text-gray-600 flex flex-col items-center">
                    <ArrowRight className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-sm">{t('resizeImage.preview')}</span>
                  </div>
                )}
                {result?.processed_size && (
                  <div className="absolute bottom-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded font-bold shadow-sm">
                    {(result.processed_size / 1024).toFixed(1)} KB
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results & Download */}
          {result && result.success && (
            <ResultCard
              success={result.success}
              message={result.message}
              downloadUrl={result.download_url}
              filename={result.filename}
              downloadLabelKey="resizeImage.downloadResult"
              color="green"
            />
          )}
        </div>
      </div>
    </div>
  );
};

