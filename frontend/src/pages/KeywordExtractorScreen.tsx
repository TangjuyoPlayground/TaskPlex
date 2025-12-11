import React, { useState, useCallback, useMemo } from 'react';
import { Hash, RefreshCw, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useKeywordExtractor } from '../hooks/useTextExtractor';
import { ProcessButton } from '../components/ui/ProcessButton';
import { ErrorAlert } from '../components/ui/ErrorAlert';

export const KeywordExtractorScreen: React.FC = () => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const { mutate, data: result, isPending: loading, error, reset } = useKeywordExtractor();

  const handleExtract = useCallback(() => {
    if (!text.trim()) return;
    mutate({ text });
  }, [text, mutate]);

  const handleReset = useCallback(() => {
    setText('');
    reset();
    setCopied(false);
  }, [reset]);

  const handleCopy = useCallback(() => {
    if (result?.keywords && result.keywords.length > 0) {
      navigator.clipboard.writeText(result.keywords.join(', '));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const errorMessage = useMemo(() => {
    if (error instanceof Error) return error.message;
    if (result && !result.success) return result.message;
    return null;
  }, [error, result]);

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <Hash className="text-purple-600 dark:text-purple-400" size={32} />
          {t('keywordExtractor.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('keywordExtractor.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Text Input */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('keywordExtractor.inputLabel')}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('keywordExtractor.inputPlaceholder')}
              className="w-full min-h-[400px] p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent font-mono text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('keywordExtractor.inputHint')}</p>
          </div>

          <div className="flex items-center gap-3">
            <ProcessButton
              onClick={handleExtract}
              disabled={!text.trim() || loading}
              loading={loading}
              labelKey="keywordExtractor.extract"
              loadingLabelKey="keywordExtractor.extracting"
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

        {/* RIGHT: Results */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('keywordExtractor.results')} {result?.count !== undefined && `(${result.count})`}
              </label>
              {result?.keywords && result.keywords.length > 0 && (
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
              )}
            </div>
            <div className="min-h-[400px] p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
              {result?.keywords && result.keywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 text-sm">{t('keywordExtractor.placeholder')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

