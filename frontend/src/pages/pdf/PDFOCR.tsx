import React, { useState, useCallback } from 'react';
import { Scan, Upload, Download, FileText, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../../services/api';
import { useTaskProgress } from '../../hooks/useTaskProgress';
import { useDownload } from '../../hooks/useDownload';
import { ProgressBar } from '../../components/ui';

const OCR_LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'fra', name: 'Français' },
  { code: 'spa', name: 'Español' },
  { code: 'deu', name: 'Deutsch' },
  { code: 'ita', name: 'Italiano' },
  { code: 'por', name: 'Português' },
  { code: 'rus', name: 'Русский' },
  { code: 'chi_sim', name: '中文 (简体)' },
  { code: 'chi_tra', name: '中文 (繁體)' },
  { code: 'jpn', name: '日本語' },
  { code: 'kor', name: '한국어' },
  { code: 'ara', name: 'العربية' },
];

// Result type from SSE
interface OCRResult {
  success: boolean;
  download_url?: string;
  filename?: string;
  total_pages?: number;
  processed_size?: number;
  message?: string;
}

export const PDFOCR: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>('eng');
  
  // Use SSE-based task progress tracking
  const {
    status,
    progress,
    message,
    result,
    error,
    isLoading,
    isProcessing,
    isCompleted,
    isError,
    startTask,
    cancel,
    reset,
  } = useTaskProgress<OCRResult>();

  const { downloadDirect } = useDownload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      reset();
    }
  };

  const handleExtract = useCallback(async () => {
    if (!file) return;
    await startTask((signal) => 
      ApiService.extractTextOCRAsync(file, language, signal)
    );
  }, [file, language, startTask]);

  const handleDownload = useCallback(() => {
    if (result?.download_url) {
      const url = ApiService.getDownloadUrl(result.download_url);
      const filename = result.download_url.split('/').pop() || 'extracted_text.txt';
      downloadDirect(url, filename);
    }
  }, [result, downloadDirect]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <Scan className="text-purple-600 dark:text-purple-400" size={32} />
          {t('pdf.ocr.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('pdf.ocr.description')}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        {!file ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative group cursor-pointer">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            />
            <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <Upload className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('pdf.ocr.selectFile')}</h3>
            <p className="text-gray-500 dark:text-gray-400">{t('pdf.ocr.dropFile')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{file.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button 
                onClick={() => { setFile(null); reset(); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                {t('pdf.ocr.change')}
              </button>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('pdf.ocr.language')}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent cursor-pointer"
              >
                {OCR_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t('pdf.ocr.languageHint')}
              </p>
            </div>

            {/* Progress Bar */}
            {(isLoading || isProcessing) && (
              <div className="space-y-4">
                <ProgressBar
                  progress={progress}
                  status={status}
                  message={message || t('pdf.ocr.extracting')}
                />
                {isProcessing && (
                  <button
                    onClick={cancel}
                    className="w-full py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <X size={16} />
                    {t('common.cancel')}
                  </button>
                )}
              </div>
            )}

            {/* Error Message */}
            {isError && error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-800">
                {error}
              </div>
            )}

            {/* Extract Button */}
            {!isLoading && !isProcessing && !isCompleted && (
              <button
                onClick={handleExtract}
                disabled={!file}
                className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-200 dark:hover:shadow-purple-900/30 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {t('pdf.ocr.extractBtn')}
              </button>
            )}

            {/* Success Result */}
            {isCompleted && result && result.success && (
              <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 rounded-xl p-6 text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-purple-900 dark:text-purple-200 mb-2">{t('common.success')}!</h3>
                {result.total_pages && (
                  <p className="text-purple-700 dark:text-purple-300 mb-6">
                    {t('pdf.ocr.extractedFrom', { count: result.total_pages }) || `Text extracted from ${result.total_pages} page(s)`}
                  </p>
                )}
                {result.download_url && (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-md cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    {t('pdf.ocr.downloadResult')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

