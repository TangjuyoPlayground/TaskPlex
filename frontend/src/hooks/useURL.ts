import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { URLResponse } from '../types/api';

export const useEncodeURL = () => {
  return useMutation<URLResponse, Error, string>({
    mutationFn: async (text) => ApiService.encodeURL(text),
  });
};

export const useDecodeURL = () => {
  return useMutation<URLResponse, Error, string>({
    mutationFn: async (text) => ApiService.decodeURL(text),
  });
};

