import React, { useState, useCallback, useMemo } from 'react';
import { Palette, Droplets, ArrowRight, ImageMinus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useExtractColors } from '../hooks/useImage';
import {
  FileDropzone,
  ProcessButton,
  ErrorAlert,
} from '../components/ui';

export const ExtractColorsScreen: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [maxColors, setMaxColors] = useState<number>(6);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const extractMutation = useExtractColors();

  const loading = extractMutation.isPending;
  const result = extractMutation.data;
  const error = extractMutation.error;

  const handleFileChange = useCallback(
    (newFile: File | null) => {
      setFile(newFile);
      if (newFile) {
        setPreviewUrl(URL.createObjectURL(newFile));
      } else {
        setPreviewUrl(null);
      }
      extractMutation.reset();
    },
    [extractMutation]
  );

  const handleSubmit = useCallback(() => {
    if (!file) return;
    extractMutation.mutate({ file, maxColors });
  }, [file, maxColors, extractMutation]);

  const handleCopy = useCallback(async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex((prev) => (prev === hex ? null : prev)), 1500);
    } catch (err) {
      console.warn('Copy to clipboard failed', err);
    }
  }, []);

  const errorMessage = useMemo(() => {
    if (error instanceof Error) return error.message;
    if (result && !result.success) return result.message;
    return null;
  }, [error, result]);

  const canSubmit = useMemo(() => file && maxColors > 0 && maxColors <= 12, [file, maxColors]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        <Palette className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        {t('extractColors.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CONTROLS (Left) */}
        <div className="lg:col-span-4 space-y-6">
          <FileDropzone
            file={file}
            onFileChange={handleFileChange}
            accept="image/*"
            fileType="image"
            labelKey="extractColors.imageFile"
            dropLabelKey="extractColors.dragDrop"
            color="blue"
          />

          <div className="space-y-2">
            <label htmlFor="maxColors" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('extractColors.maxColors')}
            </label>
            <input
              id="maxColors"
              type="number"
              min={1}
              max={12}
              value={maxColors}
              onChange={(e) => setMaxColors(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('extractColors.maxColorsHint')}
            </p>
          </div>

          <ProcessButton
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={loading}
            labelKey="extractColors.extractButton"
            loadingLabelKey="extractColors.processing"
            color="blue"
          />

          <ErrorAlert message={errorMessage} />
        </div>

        {/* PREVIEW + RESULTS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Image */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('extractColors.original')}
              </h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden aspect-square flex items-center justify-center relative">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt={t('extractColors.original')} 
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

            {/* Palette */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                {t('extractColors.palette')}
              </h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 min-h-[200px] flex items-center justify-center">
                {result?.colors?.length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                    {result.colors.map((c, idx) => (
                      <div
                        key={`${c.hex}-${idx}`}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 transition"
                        role="button"
                        tabIndex={0}
                        onClick={() => handleCopy(c.hex)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleCopy(c.hex);
                          }
                        }}
                        aria-label={t('extractColors.copyHex', { hex: c.hex })}
                      >
                        <div
                          className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
                          style={{ backgroundColor: c.hex }}
                        />
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-sm text-gray-900 dark:text-white">{c.hex}</span>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {(c.ratio * 100).toFixed(1)}%
                            </span>
                            <span
                              className="w-6 h-6 rounded border border-gray-200 dark:border-gray-700"
                              style={{ backgroundColor: c.hex }}
                              aria-label={c.hex}
                            />
                          </div>
                          {copiedHex === c.hex && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                              {t('extractColors.copied')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : loading ? (
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full mb-2" />
                    <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded" />
                  </div>
                ) : (
                  <div className="text-gray-400 dark:text-gray-600 flex flex-col items-center">
                    <ArrowRight className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-sm text-center">{t('extractColors.palettePlaceholder')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


