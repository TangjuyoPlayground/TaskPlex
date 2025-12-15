import React, { useState, useCallback, useMemo } from 'react';
import { Type, RefreshCw, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCaseConverter } from '../hooks/useCaseConverter';
import { ProcessButton } from '../components/ui/ProcessButton';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import type { CaseType } from '../types/api';

const CASE_TYPES: { value: CaseType; labelKey: string; example: string }[] = [
  { value: 'lowercase', labelKey: 'caseConverter.types.lowercase', example: 'hello world' },
  { value: 'uppercase', labelKey: 'caseConverter.types.uppercase', example: 'HELLO WORLD' },
  { value: 'title_case', labelKey: 'caseConverter.types.titleCase', example: 'Hello World' },
  { value: 'sentence_case', labelKey: 'caseConverter.types.sentenceCase', example: 'Hello world' },
  { value: 'camel_case', labelKey: 'caseConverter.types.camelCase', example: 'helloWorld' },
  { value: 'pascal_case', labelKey: 'caseConverter.types.pascalCase', example: 'HelloWorld' },
  { value: 'snake_case', labelKey: 'caseConverter.types.snakeCase', example: 'hello_world' },
  { value: 'kebab_case', labelKey: 'caseConverter.types.kebabCase', example: 'hello-world' },
];

export const CaseConverterScreen: React.FC = () => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [caseType, setCaseType] = useState<CaseType>('lowercase');
  const [copied, setCopied] = useState(false);
  const { mutate, data: result, isPending: loading, error, reset } = useCaseConverter();

  const handleConvert = useCallback(() => {
    if (!text.trim()) return;
    mutate({ text, caseType });
  }, [text, caseType, mutate]);

  const handleReset = useCallback(() => {
    setText('');
    reset();
    setCopied(false);
  }, [reset]);

  const handleCopy = useCallback(() => {
    if (result?.result_text) {
      navigator.clipboard.writeText(result.result_text);
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
          <Type className="text-orange-600 dark:text-orange-400" size={32} />
          {t('caseConverter.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{t('caseConverter.description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Text Input */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('caseConverter.inputLabel')}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('caseConverter.inputPlaceholder')}
              className="w-full min-h-[300px] p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent font-mono text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('caseConverter.caseTypeLabel')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {CASE_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setCaseType(type.value)}
                  disabled={loading}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    caseType === type.value
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{t(type.labelKey)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                    {type.example}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ProcessButton
              onClick={handleConvert}
              disabled={!text.trim() || loading}
              loading={loading}
              labelKey="caseConverter.convert"
              loadingLabelKey="caseConverter.converting"
              color="orange"
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

        {/* RIGHT: Result */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('caseConverter.result')}
              </h2>
              {result?.result_text && (
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors text-sm"
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      {t('common.copied')}
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      {t('common.copy')}
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 min-h-[300px]">
              {result?.result_text ? (
                <div className="space-y-4">
                  <div className="font-mono text-sm text-gray-900 dark:text-white whitespace-pre-wrap break-words">
                    {result.result_text}
                  </div>
                  {result.case_type && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
                      {t('caseConverter.convertedTo', { type: t(`caseConverter.types.${result.case_type}`) })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 text-sm h-full flex items-center justify-center">
                  {t('caseConverter.placeholder')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

