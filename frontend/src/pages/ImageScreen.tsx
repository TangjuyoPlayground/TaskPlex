import React, { useState, useCallback, useMemo } from 'react';
import { Image as ImageIcon, ArrowRight, ImageMinus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../services/api';
import { useCompressImage, useConvertImage } from '../hooks/useImage';
import {
  FileDropzone,
  QualitySelector,
  OperationToggle,
  ProcessButton,
  ErrorAlert,
  ResultCard,
  FormatSelector,
  type QualityLevel,
} from '../components/ui';

const IMAGE_OPERATIONS = [
  { id: 'compress', labelKey: 'image.compress' },
  { id: 'convert', labelKey: 'image.convert' },
];

const IMAGE_FORMATS = ['png', 'jpeg', 'webp', 'gif', 'bmp', 'ico', 'tiff'];

export const ImageScreen: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [operation, setOperation] = useState<string>('compress');
  const [quality, setQuality] = useState<QualityLevel>('medium');
  const [format, setFormat] = useState('png');

  const compressMutation = useCompressImage();
  const convertMutation = useConvertImage();

  const loading = compressMutation.isPending || convertMutation.isPending;
  const result = compressMutation.data || convertMutation.data;
  const error = compressMutation.error || convertMutation.error;

  // Memoized handlers to fix eslint-disable issue
  const handleFileChange = useCallback((newFile: File | null) => {
    setFile(newFile);
    if (newFile) {
      setPreviewUrl(URL.createObjectURL(newFile));
    } else {
      setPreviewUrl(null);
    }
    compressMutation.reset();
    convertMutation.reset();
  }, [compressMutation, convertMutation]);

  const handleOperationChange = useCallback((newOperation: string) => {
    setOperation(newOperation);
    compressMutation.reset();
    convertMutation.reset();
  }, [compressMutation, convertMutation]);

  const handleSubmit = useCallback(() => {
    if (!file) return;
    
    if (operation === 'compress') {
      convertMutation.reset();
      compressMutation.mutate({ file, quality });
    } else {
      compressMutation.reset();
      convertMutation.mutate({ file, outputFormat: format, quality });
    }
  }, [file, operation, quality, format, compressMutation, convertMutation]);

  const errorMessage = useMemo(() => {
    if (error instanceof Error) return error.message;
    if (result && !result.success) return result.message;
    return null;
  }, [error, result]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        <ImageIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        {t('image.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CONTROLS (Left) */}
        <div className="lg:col-span-4 space-y-6">
          <OperationToggle
            operations={IMAGE_OPERATIONS}
            value={operation}
            onChange={handleOperationChange}
            labelKey="image.operation"
            color="blue"
          />

          <FileDropzone
            file={file}
            onFileChange={handleFileChange}
            accept="image/*"
            fileType="image"
            labelKey="image.imageFile"
            dropLabelKey="image.dragDrop"
            color="blue"
          />

          <QualitySelector
            value={quality}
            onChange={setQuality}
            labelKey="image.quality"
            color="blue"
          />

          {operation === 'convert' && (
            <FormatSelector
              formats={IMAGE_FORMATS}
              value={format}
              onChange={setFormat}
              labelKey="image.outputFormat"
            />
          )}

          <ProcessButton
            onClick={handleSubmit}
            disabled={!file}
            loading={loading}
            labelKey={operation === 'compress' ? 'image.compressImage' : 'image.convertImage'}
            loadingLabelKey="image.processing"
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
                {t('image.original')}
              </h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden aspect-square flex items-center justify-center relative">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt={t('image.original')} 
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

            {/* Processed Image */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-between">
                {t('image.result')}
                {result && result.success && (
                  <span className="text-green-600 dark:text-green-400 font-bold">{t('common.success')}!</span>
                )}
              </h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden aspect-square flex items-center justify-center relative">
                {result?.download_url ? (
                  <img 
                    src={ApiService.getDownloadUrl(result.download_url)} 
                    alt="Processed" 
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
                    <span className="text-sm">{t('image.preview')}</span>
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
              compressionRatio={result.compression_ratio}
              downloadLabelKey="image.downloadResult"
              color="green"
            />
          )}
        </div>
      </div>
    </div>
  );
};
