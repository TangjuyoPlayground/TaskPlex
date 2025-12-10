import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { PyValidationResponse } from '../services/api';

export const usePyValidator = () => {
  return useMutation<PyValidationResponse, Error, { python: string }>({
    mutationFn: async ({ python }) => {
      return ApiService.validatePython(python);
    },
  });
};

