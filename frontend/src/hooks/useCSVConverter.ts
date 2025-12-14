import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { CSVToJSONResponse, JSONToCSVResponse } from '../services/api';

export const useCSVToJSON = () => {
  return useMutation<CSVToJSONResponse, Error, File>({
    mutationFn: async (file: File) => {
      return ApiService.csvToJSON(file);
    },
  });
};

export const useJSONToCSV = () => {
  return useMutation<JSONToCSVResponse, Error, File>({
    mutationFn: async (file: File) => {
      return ApiService.jsonToCSV(file);
    },
  });
};

