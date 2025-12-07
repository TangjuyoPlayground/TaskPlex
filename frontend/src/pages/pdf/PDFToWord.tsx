import React, { useCallback, useMemo, useState } from 'react';
import { FileType, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePDFToWord } from '../../hooks/usePDF';
import { FileDropzone, ProcessButton, ErrorAlert, ResultCard } from '../../components/ui';

export const PDFToWord: React.FC = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);

  const mutation = usePDFToWord();
  const result = mutation.data;
  const loading = mutation.isPending;
  const error = mutation.error;

  const handleFileChange = useCallback(
    (newFile: File | null) => {
      setFile(newFile);
      mutation.reset();
    },
    [mutation]
  );

  const handleSubmit = useCallback(() => {
    if (!file) return;
    mutation.mutate({ file });
  }, [file, mutation]);

  const errorMessage = useMemo(() => {
    if (error instanceof Error) return error.message;
    if (result && !result.success) return result.message;
    return null;
  }, [error, result]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <FileType className="w-8 h-8 text-red-600 dark:text-red-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('pdfToWord.title')}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('pdfToWord.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <FileDropzone
            file={file}
            onFileChange={handleFileChange}
            accept=".pdf"
            fileType="document"
            labelKey="pdfToWord.selectFile"
            dropLabelKey="pdfToWord.dragDrop"
            color="red"
          />

          <ProcessButton
            onClick={handleSubmit}
            disabled={!file}
            loading={loading}
            labelKey="pdfToWord.convertButton"
            loadingLabelKey="pdfToWord.processing"
            color="red"
          />

          <ErrorAlert message={errorMessage ?? undefined} />
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
              <ArrowRight className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('pdfToWord.info')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{t('pdfToWord.note')}</p>
            </div>
          </div>

          {result && result.success && (
            <ResultCard
              success={result.success}
              message={result.message}
              downloadUrl={result.download_url}
              filename={result.filename}
              downloadLabelKey="pdfToWord.downloadResult"
              color="red"
            />
          )}
        </div>
      </div>
    </div>
  );
};


