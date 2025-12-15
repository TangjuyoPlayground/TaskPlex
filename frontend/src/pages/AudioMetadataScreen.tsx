import React, { useState, useCallback, useMemo } from 'react';
import { Info, Music } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAudioMetadata } from '../hooks/useAudio';
import { FileDropzone, ProcessButton, ErrorAlert } from '../components/ui';

export const AudioMetadataScreen: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const { mutate, data, isPending, isError, error, reset } = useAudioMetadata();

  const handleFileChange = useCallback((newFile: File | null) => {
    setFile(newFile);
    setLocalError(null);
    reset();
  }, [reset]);

  const handleExtract = useCallback(() => {
    if (!file) {
      setLocalError(t('audioMetadata.validation.fileRequired'));
      return;
    }
    setLocalError(null);
    mutate({ file });
  }, [file, mutate, t]);

  const errorMessage = useMemo(() => {
    if (localError) return localError;
    if (isError && error instanceof Error) return error.message;
    if (data && !data.success) return data.message;
    return null;
  }, [localError, isError, error, data]);

  // Group metadata by category
  const groupedMetadata = useMemo(() => {
    if (!data?.metadata) return null;

    const metadata = data.metadata;
    const groups: Record<string, Record<string, string>> = {
      basic: {},
      technical: {},
      tags: {},
    };

    // Basic info
    if (metadata.file_size) groups.basic['File Size'] = `${metadata.file_size_mb || 0} MB`;
    if (metadata.duration_formatted) groups.basic['Duration'] = metadata.duration_formatted;
    if (metadata.format) groups.basic['Format'] = metadata.format;

    // Technical info
    if (metadata.bitrate_formatted) groups.technical['Bitrate'] = metadata.bitrate_formatted;
    if (metadata.sample_rate_formatted) groups.technical['Sample Rate'] = metadata.sample_rate_formatted;
    if (metadata.channels_formatted) groups.technical['Channels'] = metadata.channels_formatted;
    if (metadata.codec) groups.technical['Codec'] = metadata.codec;

    // ID3 Tags
    if (metadata.title) groups.tags['Title'] = metadata.title;
    if (metadata.artist) groups.tags['Artist'] = metadata.artist;
    if (metadata.album) groups.tags['Album'] = metadata.album;
    if (metadata.album_artist) groups.tags['Album Artist'] = metadata.album_artist;
    if (metadata.genre) groups.tags['Genre'] = metadata.genre;
    if (metadata.date) groups.tags['Date'] = metadata.date;
    if (metadata.track) groups.tags['Track'] = metadata.track;
    if (metadata.composer) groups.tags['Composer'] = metadata.composer;
    if (metadata.publisher) groups.tags['Publisher'] = metadata.publisher;
    if (metadata.copyright) groups.tags['Copyright'] = metadata.copyright;
    if (metadata.comment) groups.tags['Comment'] = metadata.comment;

    return groups;
  }, [data]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2">
          <Info className="w-8 h-8 text-pink-600 dark:text-pink-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('audioMetadata.title')}</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{t('audioMetadata.description')}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <FileDropzone
          file={file}
          onFileChange={handleFileChange}
          accept="audio/*"
          fileType="audio"
          color="pink"
          labelKey="audioMetadata.selectFile"
          dropLabelKey="audioMetadata.dropFile"
        />

        {errorMessage && <ErrorAlert message={errorMessage} className="mt-4" />}

        <div className="mt-6">
          <ProcessButton
            onClick={handleExtract}
            disabled={!file || isPending}
            loading={isPending}
            labelKey="audioMetadata.extractBtn"
            loadingLabelKey="audioMetadata.extracting"
            color="pink"
          />
        </div>

        {data && data.success && groupedMetadata && (
          <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
              <Music className="w-6 h-6" />
              <h2 className="text-xl font-bold">{t('audioMetadata.metadataTitle')}</h2>
            </div>

            {/* Basic Information */}
            {Object.keys(groupedMetadata.basic).length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {t('audioMetadata.basicInfo')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(groupedMetadata.basic).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{key}:</span>
                      <span className="text-sm text-gray-900 dark:text-white font-mono">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Information */}
            {Object.keys(groupedMetadata.technical).length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {t('audioMetadata.technicalInfo')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(groupedMetadata.technical).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{key}:</span>
                      <span className="text-sm text-gray-900 dark:text-white font-mono">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ID3 Tags */}
            {Object.keys(groupedMetadata.tags).length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {t('audioMetadata.tags')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(groupedMetadata.tags).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{key}:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(groupedMetadata.basic).length === 0 &&
              Object.keys(groupedMetadata.technical).length === 0 &&
              Object.keys(groupedMetadata.tags).length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {t('audioMetadata.noMetadata')}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

