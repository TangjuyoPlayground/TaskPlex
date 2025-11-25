import React, { useState, useCallback } from 'react';
import { Video, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../services/api';
import { useCompressVideo, useConvertVideo } from '../hooks/useVideo';
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

const VIDEO_OPERATIONS = [
  { id: 'compress', labelKey: 'video.compress' },
  { id: 'convert', labelKey: 'video.convert' },
];

const VIDEO_FORMATS = ['mp4', 'avi', 'mov', 'mkv', 'webm'];

export const VideoScreen: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [operation, setOperation] = useState<string>('compress');
  const [quality, setQuality] = useState<QualityLevel>('medium');
  const [format, setFormat] = useState('mp4');

  const compressMutation = useCompressVideo();
  const convertMutation = useConvertVideo();

  // Unified state
  const loading = compressMutation.isPending || convertMutation.isPending;
  const result = compressMutation.data || convertMutation.data;
  const error = compressMutation.error || convertMutation.error;

  // Memoized handlers to fix eslint-disable issue
  const handleFileChange = useCallback((newFile: File | null) => {
    setFile(newFile);
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

  const errorMessage = error instanceof Error 
    ? error.message 
    : (result && !result.success ? result.message : null);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        <Video className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        {t('video.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: CONTROLS */}
        <div className="space-y-6">
          <OperationToggle
            operations={VIDEO_OPERATIONS}
            value={operation}
            onChange={handleOperationChange}
            labelKey="video.operation"
            color="purple"
          />

          <FileDropzone
            file={file}
            onFileChange={handleFileChange}
            accept="video/*"
            fileType="video"
            labelKey="video.videoFile"
            dropLabelKey="video.dragDrop"
            color="purple"
          />

          <QualitySelector
            value={quality}
            onChange={setQuality}
            labelKey="video.quality"
            color="purple"
          />

          {operation === 'convert' && (
            <FormatSelector
              formats={VIDEO_FORMATS}
              value={format}
              onChange={setFormat}
              labelKey="video.outputFormat"
            />
          )}

          <ProcessButton
            onClick={handleSubmit}
            disabled={!file}
            loading={loading}
            labelKey={operation === 'compress' ? 'video.compressVideo' : 'video.convertVideo'}
            loadingLabelKey="video.processing"
            color="purple"
          />
          
          <ErrorAlert message={errorMessage} />
        </div>

        {/* RIGHT COLUMN: RESULT & PREVIEW */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('video.result')}</h2>
          
          {result && result.success ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in duration-500">
              <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                {result.download_url && (
                  <video 
                    src={ApiService.getDownloadUrl(result.download_url)} 
                    controls 
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <ResultCard
                success={result.success}
                message={result.message}
                downloadUrl={result.download_url}
                compressionRatio={result.compression_ratio}
                downloadLabelKey="video.downloadResult"
                color="green"
              />
            </div>
          ) : (
            <div className="h-64 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
              <Play className="w-12 h-12 mb-2 opacity-20" />
              <p>{t('video.preview')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
