import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { Base64Response } from '../types/api';

type Mode = 'encode' | 'decode';

export const useBase64 = (mode: Mode = 'encode') => {
  return useMutation<Base64Response, Error, { text: string }>({
    mutationFn: async ({ text }) =>
      mode === 'encode' ? ApiService.encodeBase64(text) : ApiService.decodeBase64(text),
  });
};

