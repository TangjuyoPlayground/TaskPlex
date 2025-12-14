import React, { useState, useCallback } from 'react';
import { FileSpreadsheet, Upload, Download, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../services/api';
import { useJSONToCSV } from '../hooks/useCSVConverter';
import { useDownload } from '../hooks/useDownload';

export const JSONToCSVScreen: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  
  const { mutate, isPending: loading, data: result, error, reset } = useJSONToCSV();
  const { downloadDirect } = useDownload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      reset();
    }
  };

  const handleConvert = () => {
    if (!file) return;
    mutate(file);
  };

  const errorMessage = error instanceof Error ? error.message : (result && !result.success ? result.message : null);

  const handleDownload = useCallback(() => {
    if (result?.download_url) {
      const url = ApiService.getDownloadUrl(result.download_url);
      const filename = result.download_url.split('/').pop() || 'converted.csv';
      downloadDirect(url, filename);
    }
  }, [result, downloadDirect]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <FileSpreadsheet className="text-teal-600 dark:text-teal-400" size={32} />
          {t('modules.data.jsonToCsv.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('modules.data.jsonToCsv.description')}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        {!file ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative group cursor-pointer">
            <input 
              type="file" 
              accept=".json" 
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            />
            <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <Upload className="w-10 h-10 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('modules.data.jsonToCsv.selectFile')}</h3>
            <p className="text-gray-500 dark:text-gray-400">{t('modules.data.jsonToCsv.dropFile')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <FileText className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{file.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
              <button 
                onClick={() => { setFile(null); reset(); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                {t('modules.data.jsonToCsv.change')}
              </button>
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg border border-red-100 dark:border-red-800">
                {errorMessage}
              </div>
            )}

            {!result || !result.success ? (
              <button
                onClick={handleConvert}
                disabled={loading}
                className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-lg hover:bg-teal-700 transition-all shadow-lg hover:shadow-teal-200 dark:hover:shadow-teal-900/30 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? t('modules.data.jsonToCsv.converting') : t('modules.data.jsonToCsv.convertBtn')}
              </button>
            ) : (
              <div className="bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 rounded-xl p-6 text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-teal-900 dark:text-teal-200 mb-2">{t('common.success')}!</h3>
                {result.rows_count > 0 && (
                  <p className="text-teal-700 dark:text-teal-300 mb-6">
                    {t('modules.data.jsonToCsv.successMessage', { count: result.rows_count })}
                  </p>
                )}
                {result.download_url && (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-colors shadow-md cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    {t('modules.data.jsonToCsv.downloadResult')}
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

