import React, { useState, useCallback, useMemo } from 'react';
import { FileText, Copy, Check, RefreshCw, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLoremIpsum } from '../hooks/useLoremIpsum';
import { ProcessButton } from '../components/ui/ProcessButton';
import { ErrorAlert } from '../components/ui/ErrorAlert';

type LoremIpsumType = 'paragraphs' | 'words' | 'sentences';

export const LoremIpsumScreen: React.FC = () => {
  const { t } = useTranslation();
  const [type, setType] = useState<LoremIpsumType>('paragraphs');
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [copied, setCopied] = useState(false);

  const { mutate, data: result, isPending: loading, error, reset } = useLoremIpsum();

  // Helper to get translated type name
  const getTranslatedType = useCallback((type: string | undefined) => {
    if (!type) return '';
    return t(`loremIpsum.${type}`);
  }, [t]);

  const handleGenerate = useCallback(() => {
    mutate({ type, count, startWithLorem });
  }, [type, count, startWithLorem, mutate]);

  const handleCopy = useCallback(() => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const handleDownload = useCallback(() => {
    if (result?.text) {
      const blob = new Blob([result.text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lorem-ipsum-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [result]);

  const handleReset = useCallback(() => {
    setType('paragraphs');
    setCount(3);
    setStartWithLorem(true);
    reset();
    setCopied(false);
  }, [reset]);

  const errorMessage = useMemo(() => {
    if (error instanceof Error) return error.message;
    if (result && !result.success) return result.message;
    return null;
  }, [error, result]);

  const maxCount = useMemo(() => {
    return type === 'paragraphs' ? 100 : 1000;
  }, [type]);

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <FileText className="text-purple-600 dark:text-purple-400" size={32} />
          {t('loremIpsum.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('loremIpsum.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Options */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              {t('loremIpsum.type')}
            </label>
            <div className="space-y-2">
              {(['paragraphs', 'words', 'sentences'] as LoremIpsumType[]).map((typeOption) => (
                <label
                  key={typeOption}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <input
                    type="radio"
                    name="type"
                    value={typeOption}
                    checked={type === typeOption}
                    onChange={(e) => setType(e.target.value as LoremIpsumType)}
                    className="w-4 h-4 text-purple-600 dark:text-purple-400 focus:ring-purple-500 dark:focus:ring-purple-400"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t(`loremIpsum.${typeOption}`)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('loremIpsum.count')} ({count})
            </label>
            <input
              type="range"
              min="1"
              max={maxCount}
              step="1"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600 dark:accent-purple-400"
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1</span>
              <span>{maxCount}</span>
            </div>
            <input
              type="number"
              min="1"
              max={maxCount}
              value={count}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 1 && val <= maxCount) setCount(val);
              }}
              className="mt-3 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              disabled={loading}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="w-4 h-4 text-purple-600 dark:text-purple-400 focus:ring-purple-500 dark:focus:ring-purple-400 rounded"
                disabled={loading}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('loremIpsum.startWithLorem')}</span>
            </label>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('loremIpsum.startWithLoremHint')}</p>
          </div>

          <div className="flex items-center gap-3">
            <ProcessButton
              onClick={handleGenerate}
              disabled={loading}
              loading={loading}
              labelKey="loremIpsum.generate"
              loadingLabelKey="loremIpsum.generating"
              color="purple"
            />
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              <RefreshCw size={16} />
              {t('common.reset')}
            </button>
          </div>

          <ErrorAlert message={errorMessage} />
        </div>

        {/* RIGHT: Generated Text */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('loremIpsum.generatedText')}
              </label>
              <div className="flex items-center gap-2">
                {result?.text && (
                  <>
                    <button
                      onClick={handleCopy}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1 cursor-pointer"
                      title={t('common.copy')}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      {t('common.copy')}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1 cursor-pointer"
                      title={t('common.download')}
                    >
                      <Download className="w-4 h-4" />
                      {t('common.download')}
                    </button>
                  </>
                )}
              </div>
            </div>
            <textarea
              value={result?.text || ''}
              readOnly
              placeholder={t('loremIpsum.placeholder')}
              className="w-full min-h-[400px] p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
            />
            {result?.count !== undefined && result?.type && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {t('loremIpsum.generatedCount', { 
                  count: result.count, 
                  type: getTranslatedType(result.type)
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

