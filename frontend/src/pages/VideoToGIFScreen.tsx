import React, { useMemo, useState } from 'react';
import { Film, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../services/api';
import { useVideoToGif } from '../hooks/useVideo';
import { FileDropzone, ProcessButton, ErrorAlert, ResultCard } from '../components/ui';
import type { VideoToGifOptions } from '../types/api';

export const VideoToGIFScreen: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [startTime, setStartTime] = useState<string>('0');
  const [duration, setDuration] = useState<string>('');
  const [width, setWidth] = useState<string>('480');
  const [fps, setFps] = useState<number>(12);
  const [loop, setLoop] = useState<boolean>(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const { mutate, data, isPending, isSuccess, isError, error, reset } = useVideoToGif();

  const parsedOptions: VideoToGifOptions = useMemo(() => {
    const opts: VideoToGifOptions = {};
    const start = parseFloat(startTime);
    if (!Number.isNaN(start) && start >= 0) opts.start_time = start;
    const dur = parseFloat(duration);
    if (!Number.isNaN(dur) && dur > 0) opts.duration = dur;
    const w = parseInt(width, 10);
    if (!Number.isNaN(w) && w > 0) opts.width = w;
    if (fps) opts.fps = fps;
    opts.loop = loop;
    return opts;
  }, [startTime, duration, width, fps, loop]);

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
    setLocalError(null);
    reset();
  };

  const handleSubmit = () => {
    if (!file) {
      setLocalError(t('videoToGif.validation.fileRequired'));
      return;
    }
    setLocalError(null);
    mutate({ file, options: parsedOptions });
  };

  const downloadUrl = data?.download_url ? ApiService.getDownloadUrl(data.download_url) : null;
  const errorMessage = localError || (isError ? error?.message : undefined) || (!data?.success && data?.message);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-2">
          <Film className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('videoToGif.title')}</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{t('videoToGif.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <FileDropzone
            file={file}
            onFileChange={handleFileChange}
            accept="video/*"
            fileType="video"
            labelKey="videoToGif.videoFile"
            dropLabelKey="videoToGif.dragDrop"
            color="purple"
            disabled={isPending}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('videoToGif.startTime')}
              </label>
              <input
                type="number"
                min={0}
                step="0.1"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('videoToGif.duration')}
              </label>
              <input
                type="number"
                min={0}
                step="0.1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 3.5"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('videoToGif.width')}
              </label>
              <input
                type="number"
                min={32}
                step="1"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="480"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('videoToGif.fps')}
              </label>
              <input
                type="number"
                min={1}
                max={60}
                step="1"
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="loop-checkbox"
              type="checkbox"
              checked={loop}
              onChange={(e) => setLoop(e.target.checked)}
              className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              disabled={isPending}
            />
            <label htmlFor="loop-checkbox" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('videoToGif.loop')}
            </label>
          </div>

          <ProcessButton
            onClick={handleSubmit}
            disabled={isPending}
            loading={isPending}
            labelKey="videoToGif.convert"
            loadingLabelKey="videoToGif.processing"
            color="purple"
          />

          <ErrorAlert message={errorMessage || undefined} />
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('videoToGif.result')}</h2>

          {isPending && (
            <div className="h-64 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-purple-500 dark:text-purple-400 animate-spin" />
              <p className="text-purple-700 dark:text-purple-300 font-medium">{t('videoToGif.processing')}</p>
            </div>
          )}

          {isSuccess && data?.success && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in duration-500">
              <div className="aspect-video bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                {downloadUrl ? (
                  <img src={downloadUrl} alt="GIF preview" className="h-full w-full object-contain" />
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 text-sm">{t('videoToGif.previewPlaceholder')}</p>
                )}
              </div>

              <ResultCard
                success={data.success}
                message={data.message}
                downloadUrl={data.download_url}
                downloadLabelKey="video.downloadResult"
                color="green"
              />
            </div>
          )}

          {!isPending && (!data || !data.success) && (
            <div className="h-64 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
              <Film className="w-12 h-12 mb-2 opacity-30" />
              <p className="text-sm">{t('videoToGif.previewPlaceholder')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

