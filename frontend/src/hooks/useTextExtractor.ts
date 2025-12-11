import { useMutation } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type {
  KeywordExtractorResponse,
  EmailExtractorResponse,
  URLExtractorResponse,
} from '../services/api';

export const useKeywordExtractor = () => {
  return useMutation<KeywordExtractorResponse, Error, { text: string }>({
    mutationFn: async ({ text }) => {
      return ApiService.extractKeywords(text);
    },
  });
};

export const useEmailExtractor = () => {
  return useMutation<EmailExtractorResponse, Error, { text: string }>({
    mutationFn: async ({ text }) => {
      return ApiService.extractEmails(text);
    },
  });
};

export const useURLExtractor = () => {
  return useMutation<URLExtractorResponse, Error, { text: string }>({
    mutationFn: async ({ text }) => {
      return ApiService.extractURLs(text);
    },
  });
};

