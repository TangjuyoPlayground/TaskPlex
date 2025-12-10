import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Grid3x3, Upload, X, Image as ImageIcon, Shuffle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../services/api';
import { useCreateCollage } from '../hooks/useImage';
import { ProcessButton, ErrorAlert, ResultCard } from '../components/ui';

const GRID_OPTIONS = [
  { rows: 1, cols: 2, label: '1x2' },
  { rows: 2, cols: 2, label: '2x2' },
  { rows: 2, cols: 3, label: '2x3' },
  { rows: 3, cols: 3, label: '3x3' },
  { rows: 3, cols: 4, label: '3x4' },
  { rows: 4, cols: 4, label: '4x4' },
];

export const CreateCollageScreen: React.FC = () => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [rows, setRows] = useState<number>(2);
  const [cols, setCols] = useState<number>(2);
  const [imageOrder, setImageOrder] = useState<number[]>([]);

  const collageMutation = useCreateCollage();

  const result = collageMutation.data;
  const loading = collageMutation.isPending;
  const error = collageMutation.error;

  // Calculate initial image order when grid or files change
  const calculateInitialOrder = useCallback((totalCells: number, fileCount: number): number[] => {
    const newOrder: number[] = [];
    for (let i = 0; i < totalCells; i++) {
      if (fileCount > 0) {
        newOrder.push(Math.min(i, fileCount - 1));
      } else {
        newOrder.push(0);
      }
    }
    return newOrder;
  }, []);

  // Use current order if valid, otherwise use initial order
  const currentOrder = useMemo(() => {
    const totalCells = rows * cols;
    if (imageOrder.length === totalCells) {
      return imageOrder;
    }
    return calculateInitialOrder(totalCells, files.length);
  }, [rows, cols, files.length, imageOrder, calculateInitialOrder]);


  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      const newFileCount = updated.length;
      
      // Update preview URLs
      setPreviewUrls((prevUrls) => {
        URL.revokeObjectURL(prevUrls[index]);
        return prevUrls.filter((_, i) => i !== index);
      });
      
      // Update image order to handle deleted image
      setImageOrder((prevOrder) => {
        if (newFileCount === 0) {
          // No images left, reset order
          const totalCells = rows * cols;
          return calculateInitialOrder(totalCells, 0);
        }
        
        // Map old indices to new indices and handle invalid references
        return prevOrder.map((idx) => {
          if (idx === index) {
            // This cell was pointing to the deleted image, reassign to first available (0)
            return 0;
          } else if (idx > index) {
            // Shift indices down for images after the deleted one
            return idx - 1;
          } else {
            // Keep indices before the deleted image as is
            return idx;
          }
        }).map((idx) => {
          // Ensure all indices are valid (in case we have fewer images than cells)
          return Math.min(idx, newFileCount - 1);
        });
      });
      
      return updated;
    });
    collageMutation.reset();
  }, [collageMutation, rows, cols, calculateInitialOrder]);

  const handleGridChange = useCallback((newRows: number, newCols: number) => {
    setRows(newRows);
    setCols(newCols);
    // Initialize image order for new grid size
    const totalCells = newRows * newCols;
    const newOrder = calculateInitialOrder(totalCells, files.length);
    setImageOrder(newOrder);
    collageMutation.reset();
  }, [collageMutation, files.length, calculateInitialOrder]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);
  const [showImageSelector, setShowImageSelector] = useState(false);

  const handleCellClick = useCallback((gridIndex: number) => {
    setSelectedCellIndex(gridIndex);
    if (files.length > 0) {
      // Show selector to choose from existing images or add new
      setShowImageSelector(true);
    } else {
      // No images yet, directly open file selector
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  }, [files.length]);

  const handleSelectExistingImage = useCallback((imageIndex: number) => {
    if (selectedCellIndex !== null) {
      setImageOrder((prevOrder) => {
        const newOrder = [...prevOrder];
        newOrder[selectedCellIndex] = imageIndex;
        return newOrder;
      });
      setSelectedCellIndex(null);
      setShowImageSelector(false);
      collageMutation.reset();
    }
  }, [selectedCellIndex, collageMutation]);

  const handleAddNewImage = useCallback(() => {
    setShowImageSelector(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleCellFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedCellIndex !== null) {
      const newFile = e.target.files[0];
      const newFiles = [...files, newFile];
      const newPreviewUrls = [...previewUrls, URL.createObjectURL(newFile)];
      
      setFiles(newFiles);
      setPreviewUrls(newPreviewUrls);
      
      // Assign the new image to the selected cell
      setImageOrder((prevOrder) => {
        const newOrder = [...prevOrder];
        newOrder[selectedCellIndex] = newFiles.length - 1;
        return newOrder;
      });
      
      setSelectedCellIndex(null);
      collageMutation.reset();
    }
    // Reset input value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  }, [files, previewUrls, selectedCellIndex, collageMutation]);

  const handleShuffle = useCallback(() => {
    if (files.length === 0) return;
    const totalCells = rows * cols;
    const shuffled: number[] = [];
    for (let i = 0; i < totalCells; i++) {
      shuffled.push(Math.floor(Math.random() * files.length));
    }
    setImageOrder(shuffled);
  }, [files.length, rows, cols]);

  const handleSubmit = useCallback(() => {
    if (files.length === 0) return;
    const totalCells = rows * cols;
    if (currentOrder.length !== totalCells) {
      return;
    }
    collageMutation.mutate({ files, rows, cols, imageOrder: currentOrder });
  }, [files, rows, cols, currentOrder, collageMutation]);

  const errorMessage = useMemo(() => {
    if (error instanceof Error) return error.message;
    if (result && !result.success) return result.message;
    return null;
  }, [error, result]);

  const totalCells = rows * cols;
  const canCreate = files.length > 0 && imageOrder.length === totalCells;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Grid3x3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('createCollage.title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('createCollage.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          {/* Grid Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('createCollage.selectGrid')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GRID_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleGridChange(option.rows, option.cols)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    rows === option.rows && cols === option.cols
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('createCollage.gridInfo', { rows, cols, total: totalCells })}
            </p>
          </div>

          {/* Hidden file input for cell selection */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleCellFileSelect}
            className="hidden"
          />

          {/* Uploaded Files List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('createCollage.uploadedImages', { count: files.length })}
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                      {file.name}
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    >
                      <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shuffle Button */}
          {files.length > 0 && (
            <button
              onClick={handleShuffle}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Shuffle className="w-4 h-4" />
              {t('createCollage.shuffle')}
            </button>
          )}

          {/* Create Button */}
          <ProcessButton
            onClick={handleSubmit}
            disabled={!canCreate}
            loading={loading}
            labelKey="createCollage.createCollage"
            loadingLabelKey="createCollage.processing"
            color="blue"
          />

          <ErrorAlert message={errorMessage ?? undefined} />
        </div>

        {/* Grid Preview */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('createCollage.preview')}
            </h3>
            <div
              className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: '8px',
              }}
            >
              {Array.from({ length: totalCells }).map((_, gridIndex) => {
                const imageIndex = currentOrder[gridIndex] ?? 0;
                const previewUrl = previewUrls[imageIndex];
                return (
                  <div
                    key={gridIndex}
                    onClick={() => handleCellClick(gridIndex)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      previewUrl
                        ? 'border-gray-300 dark:border-gray-600 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400'
                        : 'border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900'
                    } transition-colors flex items-center justify-center`}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={`Image ${imageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('createCollage.clickToChange')}
            </p>
          </div>

          {/* Result */}
          {result && result.success && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('createCollage.result')}
                </h3>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {result.download_url && (
                    <img
                      src={ApiService.getDownloadUrl(result.download_url)}
                      alt="Collage"
                      className="w-full h-auto"
                    />
                  )}
                </div>
              </div>

              <ResultCard
                success={result.success}
                message={result.message}
                downloadUrl={result.download_url}
                filename={result.filename}
                downloadLabelKey="createCollage.downloadResult"
                color="blue"
              />
            </div>
          )}
        </div>
      </div>

      {/* Image Selector Modal */}
      {showImageSelector && selectedCellIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowImageSelector(false);
            setSelectedCellIndex(null);
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('createCollage.selectImage')}
              </h3>
              <button
                onClick={() => {
                  setShowImageSelector(false);
                  setSelectedCellIndex(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('createCollage.existingImages')}
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectExistingImage(index)}
                      className="aspect-square rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                    >
                      <img
                        src={previewUrls[index]}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleAddNewImage}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  {t('createCollage.addNewImage')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

