import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { XMLValidationResponse } from '../services/api';

export const useXMLValidator = () => {
  return useMutation<XMLValidationResponse, Error, { xml: string }>({
    mutationFn: async ({ xml }) => {
      return ApiService.validateXML(xml);
    },
  });
};

