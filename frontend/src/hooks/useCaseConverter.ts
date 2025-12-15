import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { CaseConverterResponse, CaseType } from '../types/api';

export const useCaseConverter = () => {
  return useMutation<CaseConverterResponse, Error, { text: string; caseType: CaseType }>({
    mutationFn: async ({ text, caseType }) => {
      return ApiService.convertCase(text, caseType);
    },
  });
};

