import React, { useState, useCallback, useMemo } from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWordCounter } from '../hooks/useWordCounter';
import { ProcessButton } from '../components/ui/ProcessButton';
import { ErrorAlert } from '../components/ui/ErrorAlert';

export const WordCounterScreen: React.FC = () => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const { mutate, data: result, isPending: loading, error, reset } = useWordCounter();

  const handleCount = useCallback(() => {
    if (!text.trim()) return;
    mutate({ text });
  }, [text, mutate]);

  const handleReset = useCallback(() => {
    setText('');
    reset();
  }, [reset]);

  const errorMessage = useMemo(() => {
    if (error instanceof Error) return error.message;
    if (result && !result.success) return result.message;
    return null;
  }, [error, result]);

  const stats = [
    {
      label: t('wordCounter.words'),
      value: result?.word_count ?? 0,
      icon: '📝',
    },
    {
      label: t('wordCounter.characters'),
      value: result?.character_count ?? 0,
      icon: '🔤',
    },
    {
      label: t('wordCounter.charactersNoSpaces'),
      value: result?.character_count_no_spaces ?? 0,
      icon: '🔡',
    },
    {
      label: t('wordCounter.sentences'),
      value: result?.sentence_count ?? 0,
      icon: '💬',
    },
    {
      label: t('wordCounter.paragraphs'),
      value: result?.paragraph_count ?? 0,
      icon: '📄',
    },
    {
      label: t('wordCounter.lines'),
      value: result?.line_count ?? 0,
      icon: '📋',
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
          <FileText className="text-blue-600 dark:text-blue-400" size={32} />
          {t('wordCounter.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('wordCounter.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Text Input */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('wordCounter.inputLabel')}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('wordCounter.inputPlaceholder')}
              className="w-full min-h-[400px] p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent font-mono text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{t('wordCounter.inputHint')}</p>
          </div>

          <div className="flex items-center gap-3">
            <ProcessButton
              onClick={handleCount}
              disabled={!text.trim() || loading}
              loading={loading}
              labelKey="wordCounter.count"
              loadingLabelKey="wordCounter.counting"
              color="blue"
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

        {/* RIGHT: Statistics */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('wordCounter.statistics')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stat.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stat.value}</div>
                </div>
              ))}
            </div>
            {!result && (
              <div className="mt-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                {t('wordCounter.placeholder')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

