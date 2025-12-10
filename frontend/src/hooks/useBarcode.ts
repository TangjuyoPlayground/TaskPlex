import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { BarcodeResponse } from '../services/api';

interface UseBarcodeParams {
  data: string;
  barcodeType?: 'ean13' | 'ean8' | 'upca' | 'upce' | 'code128' | 'code39' | 'isbn13' | 'isbn10';
  width?: number;
  height?: number;
  addChecksum?: boolean;
}

export const useBarcode = () => {
  return useMutation<BarcodeResponse, Error, UseBarcodeParams>({
    mutationFn: async ({ data, barcodeType, width, height, addChecksum }) => {
      return ApiService.generateBarcode(data, barcodeType, width, height, addChecksum);
    },
  });
};

