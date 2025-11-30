import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { QRCodeResponse } from '../services/api';

interface UseQRCodeParams {
  data: string;
  size?: number;
  border?: number;
  errorCorrection?: string;
}

export const useQRCode = () => {
  return useMutation<QRCodeResponse, Error, UseQRCodeParams>({
    mutationFn: async ({ data, size, border, errorCorrection }) => {
      return ApiService.generateQRCode(data, size, border, errorCorrection);
    },
  });
};

