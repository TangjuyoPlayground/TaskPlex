import React, { useState, useCallback } from 'react';
import { QrCode, Download, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQRCode } from '../hooks/useQRCode';
import { ApiService } from '../services/api';
import { useDownload } from '../hooks/useDownload';

export const QRCodeScreen: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState('');
  const [size, setSize] = useState(10);
  const [border, setBorder] = useState(4);
  const [errorCorrection, setErrorCorrection] = useState('M');

  const { mutate, data: result, isPending: loading, error, reset } = useQRCode();
  const { downloadDirect } = useDownload();

  const handleGenerate = useCallback(() => {
    if (!data.trim()) return;
    mutate({ data: data.trim(), size, border, errorCorrection });
  }, [data, size, border, errorCorrection, mutate]);

  const handleDownload = useCallback(() => {
    if (result?.qr_code_url) {
      const url = ApiService.getDownloadUrl(result.qr_code_url);
      const filename = result.filename || 'qrcode.png';
      downloadDirect(url, filename);
    }
  }, [result, downloadDirect]);

  const handleReset = useCallback(() => {
    setData('');
    reset();
  }, [reset]);

  const errorMessage = error instanceof Error ? error.message : (result && !result.success ? result.message : null);

  const errorCorrectionOptions = [
    { value: 'L', label: t('qrcode.errorCorrection.low'), desc: t('qrcode.errorCorrection.lowDesc') },
    { value: 'M', label: t('qrcode.errorCorrection.medium'), desc: t('qrcode.errorCorrection.mediumDesc') },
    { value: 'Q', label: t('qrcode.errorCorrection.quartile'), desc: t('qrcode.errorCorrection.quartileDesc') },
    { value: 'H', label: t('qrcode.errorCorrection.high'), desc: t('qrcode.errorCorrection.highDesc') },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <QrCode className="text-yellow-600 dark:text-yellow-400" size={32} />
          {t('qrcode.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('qrcode.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: INPUTS */}
        <div className="space-y-6">
          {/* Data Input */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label htmlFor="qrcode-data" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('qrcode.data')}
            </label>
            <textarea
              id="qrcode-data"
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder={t('qrcode.dataPlaceholder')}
              className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {data.length} / 2953 {t('qrcode.characters')}
            </p>
          </div>

          {/* Size */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label htmlFor="qrcode-size" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('qrcode.size')} ({size}px)
            </label>
            <input
              id="qrcode-size"
              type="range"
              min="1"
              max="50"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-600 dark:accent-yellow-400"
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1px</span>
              <span>50px</span>
            </div>
          </div>

          {/* Border */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label htmlFor="qrcode-border" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('qrcode.border')} ({border})
            </label>
            <input
              id="qrcode-border"
              type="range"
              min="0"
              max="10"
              value={border}
              onChange={(e) => setBorder(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-600 dark:accent-yellow-400"
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0</span>
              <span>10</span>
            </div>
          </div>

          {/* Error Correction */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('qrcode.errorCorrection.title')}
            </label>
            <div className="space-y-2">
              {errorCorrectionOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-start gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="errorCorrection"
                    value={option.value}
                    checked={errorCorrection === option.value}
                    onChange={(e) => setErrorCorrection(e.target.value)}
                    className="w-4 h-4 text-yellow-600 border-gray-300 dark:border-gray-600 focus:ring-yellow-500 mt-1 bg-white dark:bg-gray-700"
                    disabled={loading}
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white group-hover:text-yellow-700 dark:group-hover:text-yellow-400 transition-colors">
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!data.trim() || loading}
            className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-500 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed hover:shadow-xl transform hover:-translate-y-0.5"
            data-testid="generate-qrcode-button"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('qrcode.generating')}
              </>
            ) : (
              <>
                <QrCode className="w-5 h-5" />
                {t('qrcode.generate')}
              </>
            )}
          </button>

          {/* Reset Button */}
          {result && (
            <button
              onClick={handleReset}
              className="w-full py-3 px-4 rounded-lg font-medium border-2 border-yellow-600 text-yellow-600 dark:text-yellow-400 dark:border-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors cursor-pointer"
            >
              {t('common.reset')}
            </button>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              {t('qrcode.preview')}
            </h2>

            {loading ? (
              <div className="h-64 bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-yellow-600 dark:text-yellow-400 animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-400">{t('qrcode.generating')}</p>
              </div>
            ) : result && result.success && result.qr_code_url ? (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
                  <img
                    src={ApiService.getDownloadUrl(result.qr_code_url)}
                    alt="QR Code"
                    className="max-w-full h-auto"
                  />
                </div>
                <button
                  onClick={handleDownload}
                  className="w-full py-3 px-4 rounded-lg font-medium bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-500 text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  {t('qrcode.download')}
                </button>
              </div>
            ) : (
              <div className="h-64 bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <QrCode className="w-12 h-12 mb-2 opacity-20" />
                <p>{t('qrcode.noPreview')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

