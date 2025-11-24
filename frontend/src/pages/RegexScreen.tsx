import React, { useState, useEffect } from 'react';
import { Regex, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRegex } from '../hooks/useRegex';

export const RegexScreen: React.FC = () => {
  const { t } = useTranslation();
  const [pattern, setPattern] = useState('');
  const [text, setText] = useState('');
  const [flags, setFlags] = useState<string[]>(['g']); // Default Global

  // Custom Hook
  const { mutate, data: apiData, isPending: loading, error: apiError, reset } = useRegex();

  // Derived state
  const result = apiData?.success ? apiData : null;
  const error = apiError 
    ? (apiError instanceof Error ? apiError.message : 'An error occurred') 
    : (apiData && !apiData.success ? (apiData.error || 'Invalid regex pattern') : null);

  // Debounce pattern testing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pattern && text) {
        mutate({ pattern, text, flags: flags.join('') });
      } else {
        reset();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [pattern, text, flags, mutate, reset]);

  const toggleFlag = (flag: string) => {
    setFlags(prev => 
      prev.includes(flag) 
        ? prev.filter(f => f !== flag)
        : [...prev, flag]
    );
  };

  const availableFlags = [
    { id: 'g', label: t('regex.global'), desc: t('regex.globalDesc') },
    { id: 'i', label: t('regex.insensitive'), desc: t('regex.insensitiveDesc') },
    { id: 'm', label: t('regex.multiline'), desc: t('regex.multilineDesc') },
    { id: 's', label: t('regex.dotall'), desc: t('regex.dotallDesc') },
  ];

  const renderHighlightedText = () => {
    if (!result || !result.matches || result.matches.length === 0) {
      return <div className="text-gray-500 italic p-4">{t('regex.noMatches')}</div>;
    }

    // Create segments of text (matched vs unmatched)
    // Sort matches by start index
    const sortedMatches = [...result.matches].sort((a, b) => a.start - b.start);
    
    let lastIndex = 0;
    const elements: React.ReactNode[] = [];

    sortedMatches.forEach((match, i) => {
      // Text before match
      if (match.start > lastIndex) {
        elements.push(
          <span key={`text-${i}`}>{text.substring(lastIndex, match.start)}</span>
        );
      }

      // The match itself
      elements.push(
        <span key={`match-${i}`} className="bg-yellow-200 text-yellow-900 px-0.5 rounded font-medium relative group cursor-help border-b-2 border-yellow-400">
          {text.substring(match.start, match.end)}
          {/* Tooltip for groups */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 z-10 whitespace-nowrap shadow-lg">
            {t('regex.match')} #{i + 1}
            {match.groups.length > 0 && (
              <div className="mt-1 pt-1 border-t border-gray-700">
                {match.groups.map((g, gi) => (
                  <div key={gi}>{t('regex.group')} {gi + 1}: {g}</div>
                ))}
              </div>
            )}
          </div>
        </span>
      );

      lastIndex = match.end;
    });

    // Remaining text
    if (lastIndex < text.length) {
      elements.push(
        <span key="text-end">{text.substring(lastIndex)}</span>
      );
    }

    return <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{elements}</div>;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
          <Regex className="text-yellow-600" size={32} />
          {t('regex.title')}
        </h1>
        <p className="text-gray-600">{t('regex.textPlaceholder')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Pattern Input */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('regex.pattern')}</label>
            <div className={`flex items-center bg-gray-50 border rounded-lg overflow-hidden ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500'}`}>
              <span className="pl-3 text-gray-400 font-mono">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder={t('regex.patternPlaceholder')}
                className="flex-1 bg-transparent border-none focus:ring-0 py-2.5 px-1 font-mono text-gray-900 placeholder-gray-400"
              />
              <span className="pr-3 text-gray-400 font-mono">/</span>
            </div>
            {error && (
              <div className="mt-2 text-sm text-red-600 flex items-start gap-1.5">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          {/* Flags */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-4">{t('regex.flags')}</label>
            <div className="space-y-3">
              {availableFlags.map(flag => (
                <label key={flag.id} className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={flags.includes(flag.id)}
                      onChange={() => toggleFlag(flag.id)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1"
                    />
                  </div>
                  <div>
                    <div className="font-mono text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                      {flag.id} - {flag.label}
                    </div>
                    <div className="text-xs text-gray-500">{flag.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Test String & Results */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Test String */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('regex.text')}</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('regex.textPlaceholder')}
              className="flex-1 w-full h-40 p-4 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm resize-none"
            />
          </div>

          {/* Results */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 min-h-[200px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">{t('regex.match')}</label>
              {loading && <div className="flex items-center gap-2 text-purple-600"><Loader2 size={16} className="animate-spin" /><span className="text-xs font-medium">{t('common.loading')}</span></div>}
              {result && !loading && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle2 size={12} />
                  {result.count} {t('regex.matches')}
                </span>
              )}
            </div>
            
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto max-h-[400px]">
              {pattern && text ? (
                renderHighlightedText()
              ) : (
                <div className="text-gray-400 text-center py-8">
                  {t('regex.enterPattern')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
