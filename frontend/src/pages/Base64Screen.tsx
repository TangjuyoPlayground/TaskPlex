import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Binary, Copy, Check, ArrowLeftRight } from 'lucide-react';
import { useBase64 } from '../hooks/useBase64';
import { ErrorAlert, ProcessButton } from '../components/ui';

type Mode = 'encode' | 'decode';

export const Base64Screen: React.FC = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const mutation = useBase64(mode);
  const result = mutation.data;
  const loading = mutation.isPending;

  const errorMessage = useMemo(() => {
    if (result && !result.success) return result.message;
    if (mutation.error instanceof Error) return mutation.error.message;
    return null;
  }, [mutation.error, result]);

  const handleProcess = useCallback(() => {
    if (!input.trim()) return;
    mutation.mutate({ text: input });
  }, [input, mutation]);

  const handleCopy = useCallback(() => {
    if (!result?.result) return;
    navigator.clipboard.writeText(result.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }, [result]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'encode' ? 'decode' : 'encode'));
    mutation.reset();
    setInput('');
  }, [mutation]);

  const canSubmit = useMemo(() => input.trim().length > 0, [input]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Binary className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('base64.title')}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('base64.subtitle')}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {mode === 'encode' ? t('base64.mode.encode') : t('base64.mode.decode')}
        </span>
        <button
          type="button"
          onClick={toggleMode}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <ArrowLeftRight className="w-4 h-4" />
          {t('base64.switch')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2 h-full flex flex-col">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {mode === 'encode' ? t('base64.inputEncode') : t('base64.inputDecode')}
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {mode === 'encode' ? t('base64.inputHintEncode') : t('base64.inputHintDecode')}
          </p>
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-[320px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500"
              placeholder={mode === 'encode' ? t('base64.placeholderEncode') : t('base64.placeholderDecode')}
            />
          </div>

          <ProcessButton
            onClick={handleProcess}
            disabled={!canSubmit}
            loading={loading}
            labelKey={mode === 'encode' ? 'base64.encode' : 'base64.decode'}
            loadingLabelKey="base64.processing"
            color="blue"
          />

          <ErrorAlert message={errorMessage ?? undefined} />
        </div>

        <div className="space-y-3 h-full flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('base64.output')}
              </label>
              <p className="text-xs text-gray-500">{t('base64.outputHint')}</p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!result?.result}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? t('base64.copied') : t('base64.copy')}
            </button>
          </div>
          <div className="flex-1">
            <textarea
              value={result?.result ?? ''}
              readOnly
              className="w-full h-[320px] rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 text-sm text-gray-900 dark:text-gray-100 shadow-inner"
              placeholder={t('base64.outputPlaceholder')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

