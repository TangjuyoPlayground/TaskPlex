import React, { useState, useCallback, useMemo } from 'react';
import { Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEncryptFile, useDecryptFile } from '../hooks/useSecurity';
import {
  FileDropzone,
  ProcessButton,
  ErrorAlert,
  ResultCard,
} from '../components/ui';

type Mode = 'encrypt' | 'decrypt';

export const FileEncryptionScreen: React.FC = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('encrypt');
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const encryptMutation = useEncryptFile();
  const decryptMutation = useDecryptFile();

  const activeMutation = mode === 'encrypt' ? encryptMutation : decryptMutation;
  const loading = activeMutation.isPending;
  const result = activeMutation.data;
  const error = activeMutation.error;

  const handleFileChange = useCallback((newFile: File | null) => {
    setFile(newFile);
    activeMutation.reset();
  }, [activeMutation]);

  const handleSubmit = useCallback(() => {
    if (!file || !password) return;
    
    if (mode === 'encrypt') {
      encryptMutation.mutate({ file, password });
    } else {
      decryptMutation.mutate({ file, password });
    }
  }, [file, password, mode, encryptMutation, decryptMutation]);

  const errorMessage = useMemo(() => {
    if (error instanceof Error) return error.message;
    if (result && !result.success) return result.message;
    return null;
  }, [error, result]);

  const canSubmit = useMemo(() => {
    return file && password.length > 0;
  }, [file, password]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        {mode === 'encrypt' ? (
          <Lock className="w-8 h-8 text-green-600 dark:text-green-400" />
        ) : (
          <Unlock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        )}
        {t('fileEncryption.title')}
      </h1>

      <div className="space-y-6">
        {/* Mode Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setMode('encrypt');
                setFile(null);
                setPassword('');
                activeMutation.reset();
              }}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                mode === 'encrypt'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Lock className="w-5 h-5 inline-block mr-2" />
              {t('fileEncryption.encrypt')}
            </button>
            <button
              onClick={() => {
                setMode('decrypt');
                setFile(null);
                setPassword('');
                activeMutation.reset();
              }}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                mode === 'decrypt'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Unlock className="w-5 h-5 inline-block mr-2" />
              {t('fileEncryption.decrypt')}
            </button>
          </div>
        </div>

        {/* File Upload */}
        <FileDropzone
          file={file}
          onFileChange={handleFileChange}
          accept="*/*"
          fileType="any"
          labelKey={mode === 'encrypt' ? 'fileEncryption.selectFile' : 'fileEncryption.selectEncryptedFile'}
          dropLabelKey={mode === 'encrypt' ? 'fileEncryption.dropFile' : 'fileEncryption.dropEncryptedFile'}
          color={mode === 'encrypt' ? 'green' : 'blue'}
        />

        {/* Password Input */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('fileEncryption.password')}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('fileEncryption.passwordPlaceholder')}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 pr-10 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('fileEncryption.passwordHint')}
          </p>
        </div>

        {/* Process Button */}
        <ProcessButton
          onClick={handleSubmit}
          disabled={!canSubmit}
          loading={loading}
          labelKey={mode === 'encrypt' ? 'fileEncryption.encryptBtn' : 'fileEncryption.decryptBtn'}
          loadingLabelKey={mode === 'encrypt' ? 'fileEncryption.encrypting' : 'fileEncryption.decrypting'}
          color={mode === 'encrypt' ? 'green' : 'blue'}
        />

        {/* Error Alert */}
        <ErrorAlert message={errorMessage} />

        {/* Results */}
        {result && result.success && (
          <ResultCard
            success={result.success}
            message={result.message}
            downloadUrl={result.download_url}
            filename={result.filename}
            downloadLabelKey="fileEncryption.downloadResult"
            color={mode === 'encrypt' ? 'green' : 'blue'}
          />
        )}

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
            {t('fileEncryption.infoTitle')}
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>{t('fileEncryption.info1')}</li>
            <li>{t('fileEncryption.info2')}</li>
            <li>{t('fileEncryption.info3')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

