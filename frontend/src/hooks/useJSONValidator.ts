import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { JSONValidationResponse } from '../services/api';

export const useJSONValidator = () => {
  return useMutation<JSONValidationResponse, Error, { json: string }>({
    mutationFn: async ({ json }) => {
      return ApiService.validateJSON(json);
    },
  });
};

