import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { EncryptionResponse } from '../types/api';

export const useEncryptFile = () => {
  return useMutation<EncryptionResponse, Error, { file: File; password: string }>({
    mutationFn: async ({ file, password }) => {
      return ApiService.encryptFile(file, password);
    },
  });
};

export const useDecryptFile = () => {
  return useMutation<EncryptionResponse, Error, { file: File; password: string }>({
    mutationFn: async ({ file, password }) => {
      return ApiService.decryptFile(file, password);
    },
  });
};

