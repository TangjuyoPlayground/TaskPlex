import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { AccentRemoverResponse } from '../services/api';

export const useAccentRemover = () => {
  return useMutation<AccentRemoverResponse, Error, { text: string }>({
    mutationFn: async ({ text }) => {
      return ApiService.removeAccents(text);
    },
  });
};

