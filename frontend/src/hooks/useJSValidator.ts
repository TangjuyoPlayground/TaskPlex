import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { JSValidationResponse } from '../services/api';

export const useJSValidator = () => {
  return useMutation<JSValidationResponse, Error, { javascript: string }>({
    mutationFn: async ({ javascript }) => {
      return ApiService.validateJavaScript(javascript);
    },
  });
};

