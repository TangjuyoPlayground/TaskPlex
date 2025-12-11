import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { LoremIpsumResponse } from '../services/api';

interface UseLoremIpsumParams {
  type: 'paragraphs' | 'words' | 'sentences';
  count: number;
  startWithLorem?: boolean;
}

export const useLoremIpsum = () => {
  return useMutation<LoremIpsumResponse, Error, UseLoremIpsumParams>({
    mutationFn: async ({ type, count, startWithLorem }) => {
      return ApiService.generateLoremIpsum(type, count, startWithLorem);
    },
  });
};

