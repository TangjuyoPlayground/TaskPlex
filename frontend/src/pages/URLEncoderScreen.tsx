import React, { useState } from 'react';
import { Link2, Copy, Check, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEncodeURL, useDecodeURL } from '../hooks/useURL';
import { ErrorAlert, ProcessButton } from '../components/ui';

export const URLEncoderScreen: React.FC = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [text, setText] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const {
    mutate: encode,
    data: encodeData,
    isPending: isEncoding,
    isError: encodeErr,
    error: encodeError,
    reset: resetEncode,
  } = useEncodeURL();

  const {
    mutate: decode,
    data: decodeData,
    isPending: isDecoding,
    isError: decodeErr,
    error: decodeError,
    reset: resetDecode,
  } = useDecodeURL();

  const isPending = isEncoding || isDecoding;
  const result = mode === 'encode' ? encodeData?.result : decodeData?.result;
  const errorMessage = (mode === 'encode' && encodeErr ? encodeError?.message : undefined) ||
    (mode === 'decode' && decodeErr ? decodeError?.message : undefined);

  const handleSubmit = () => {
    setCopied(false);
    if (mode === 'encode') {
      resetDecode();
      encode(text);
    } else {
      resetEncode();
      decode(text);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('urlEncoder.title')}</h1>
          <p className="text-gray-600 dark:text-gray-300">{t('urlEncoder.description')}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {(['encode', 'decode'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setCopied(false); }}
            className={`px-4 py-2 rounded-lg border text-sm font-medium ${
              mode === m
                ? 'bg-purple-600 text-white border-purple-600'
                : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-400'
            }`}
            disabled={isPending}
          >
            {m === 'encode' ? t('urlEncoder.encodeTab') : t('urlEncoder.decodeTab')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {mode === 'encode' ? t('urlEncoder.toEncode') : t('urlEncoder.toDecode')}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-48 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder={mode === 'encode' ? t('urlEncoder.encodePlaceholder') || '' : t('urlEncoder.decodePlaceholder') || ''}
            disabled={isPending}
          />

          <ProcessButton
            onClick={handleSubmit}
            disabled={!text || isPending}
            loading={isPending}
            labelKey={mode === 'encode' ? 'urlEncoder.encode' : 'urlEncoder.decode'}
            loadingLabelKey="urlEncoder.processing"
            color="purple"
          />

          <ErrorAlert message={errorMessage} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('urlEncoder.result')}</h2>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 min-h-[192px]">
            {result ? (
              <div className="flex flex-col h-full gap-3">
                <div className="flex-1 font-mono text-sm text-gray-900 dark:text-white break-all">
                  {result}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-purple-500 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? t('passwordGenerator.copied') : t('passwordGenerator.copy')}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 text-sm">{t('urlEncoder.placeholder')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

