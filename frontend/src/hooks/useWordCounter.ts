import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { WordCounterResponse } from '../services/api';

export const useWordCounter = () => {
  return useMutation<WordCounterResponse, Error, { text: string }>({
    mutationFn: async ({ text }) => {
      return ApiService.countWords(text);
    },
  });
};

