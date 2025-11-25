/**
 * API Response Types
 * Centralized type definitions for all API responses
 */

// Base response interface
export interface ApiResponse {
  success: boolean;
  message: string;
}

// Video Processing
export interface VideoProcessingResponse extends ApiResponse {
  filename: string;
  download_url?: string;
  original_size?: number;
  processed_size?: number;
  compression_ratio?: number;
}

// PDF Processing
export interface PDFProcessingResponse extends ApiResponse {
  filename?: string;
  download_url?: string;
  filenames?: string[];
  download_urls?: string[];
  total_pages?: number;
  original_size?: number;
  processed_size?: number;
}

// Image Processing
export interface ImageProcessingResponse extends ApiResponse {
  filename: string;
  download_url?: string;
  original_size?: number;
  processed_size?: number;
  compression_ratio?: number;
  dimensions?: ImageDimensions;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

// Regex
export interface RegexMatch {
  match: string;
  start: number;
  end: number;
  groups: string[];
  named_groups: Record<string, string>;
}

export interface RegexResponse extends ApiResponse {
  matches: RegexMatch[];
  count: number;
  error?: string;
}

// Unit Conversion
export interface UnitConversionResponse extends ApiResponse {
  converted_value: number;
  converted_unit: string;
  original_value?: number;
  original_unit?: string;
  conversion_formula?: string;
  error?: string;
}

// Generic file processing result (useful for UI components)
export interface ProcessingResult {
  success: boolean;
  message?: string;
  downloadUrl?: string;
  filename?: string;
  originalSize?: number;
  processedSize?: number;
  compressionRatio?: number;
}

// Helper function to convert API response to ProcessingResult
export function toProcessingResult(
  response: VideoProcessingResponse | ImageProcessingResponse | PDFProcessingResponse
): ProcessingResult {
  return {
    success: response.success,
    message: response.message,
    downloadUrl: response.download_url,
    filename: response.filename,
    originalSize: response.original_size,
    processedSize: response.processed_size,
    compressionRatio: 'compression_ratio' in response ? response.compression_ratio : undefined,
  };
}

