import React, { useState, useCallback } from 'react';
import { Barcode, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBarcode } from '../hooks/useBarcode';
import { ApiService } from '../services/api';
import { ProcessButton, ErrorAlert, ResultCard } from '../components/ui';

export const BarcodeGeneratorScreen: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState('');
  const [barcodeType, setBarcodeType] = useState<'ean13' | 'ean8' | 'upca' | 'upce' | 'code128' | 'code39' | 'isbn13' | 'isbn10'>('code128');
  const [width, setWidth] = useState(1.0);
  const [height, setHeight] = useState(50.0);
  const [addChecksum, setAddChecksum] = useState(true);

  const { mutate, data: result, isPending: loading, error } = useBarcode();
  const handleGenerate = useCallback(() => {
    if (!data.trim()) return;
    mutate({ data: data.trim(), barcodeType, width, height, addChecksum });
  }, [data, barcodeType, width, height, addChecksum, mutate]);

  const errorMessage = error instanceof Error ? error.message : (result && !result.success ? result.message : null);

  const barcodeTypeOptions = [
    { value: 'code128', label: t('barcode.types.code128'), desc: t('barcode.types.code128Desc') },
    { value: 'code39', label: t('barcode.types.code39'), desc: t('barcode.types.code39Desc') },
    { value: 'ean13', label: t('barcode.types.ean13'), desc: t('barcode.types.ean13Desc') },
    { value: 'ean8', label: t('barcode.types.ean8'), desc: t('barcode.types.ean8Desc') },
    { value: 'upca', label: t('barcode.types.upca'), desc: t('barcode.types.upcaDesc') },
    { value: 'upce', label: t('barcode.types.upce'), desc: t('barcode.types.upceDesc') },
    { value: 'isbn13', label: t('barcode.types.isbn13'), desc: t('barcode.types.isbn13Desc') },
    { value: 'isbn10', label: t('barcode.types.isbn10'), desc: t('barcode.types.isbn10Desc') },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <Barcode className="text-yellow-600 dark:text-yellow-400" size={32} />
          {t('barcode.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('barcode.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: INPUTS */}
        <div className="space-y-6">
          {/* Data Input */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label htmlFor="barcode-data" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('barcode.data')}
            </label>
            <input
              id="barcode-data"
              type="text"
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder={t('barcode.dataPlaceholder')}
              className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              disabled={loading}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t('barcode.dataHint')}
            </p>
          </div>

          {/* Barcode Type */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label htmlFor="barcode-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('barcode.type')}
            </label>
            <select
              id="barcode-type"
              value={barcodeType}
              onChange={(e) => setBarcodeType(e.target.value as typeof barcodeType)}
              className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent text-gray-900 dark:text-white"
              disabled={loading}
            >
              {barcodeTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {barcodeTypeOptions.find(opt => opt.value === barcodeType)?.desc}
            </p>
          </div>

          {/* Width */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label htmlFor="barcode-width" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('barcode.width')} ({width}mm)
            </label>
            <input
              id="barcode-width"
              type="range"
              min="0.5"
              max="10"
              step="0.1"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-600 dark:accent-yellow-400"
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0.5mm</span>
              <span>10mm</span>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t('barcode.widthHint')}
            </p>
          </div>

          {/* Height */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label htmlFor="barcode-height" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('barcode.height')} ({height}mm)
            </label>
            <input
              id="barcode-height"
              type="range"
              min="10"
              max="200"
              step="5"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-600 dark:accent-yellow-400"
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>10mm</span>
              <span>200mm</span>
            </div>
          </div>

          {/* Add Checksum */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={addChecksum}
                onChange={(e) => setAddChecksum(e.target.checked)}
                className="w-5 h-5 text-yellow-600 dark:text-yellow-400 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-yellow-500 dark:focus:ring-yellow-400"
                disabled={loading}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('barcode.addChecksum')}
              </span>
            </label>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 ml-8">
              {t('barcode.addChecksumHint')}
            </p>
          </div>

          {/* Generate Button */}
          <ProcessButton
            onClick={handleGenerate}
            disabled={!data.trim() || loading}
            loading={loading}
            labelKey="barcode.generate"
            loadingLabelKey="barcode.generating"
            color="purple"
          />

          <ErrorAlert message={errorMessage ?? undefined} />
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('barcode.preview')}
            </h2>
            {loading ? (
              <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Loader2 className="w-8 h-8 text-yellow-600 dark:text-yellow-400 animate-spin" />
              </div>
            ) : result?.barcode_url ? (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-center">
                  <img
                    src={ApiService.getDownloadUrl(result.barcode_url)}
                    alt="Barcode"
                    className="max-w-full h-auto"
                  />
                </div>
                <ResultCard
                  success={result.success}
                  message={result.message}
                  downloadUrl={result.barcode_url}
                  filename={result.filename}
                  downloadLabelKey="barcode.download"
                  color="purple"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-gray-400 dark:text-gray-500">{t('barcode.noPreview')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

