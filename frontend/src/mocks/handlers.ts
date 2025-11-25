/**
 * MSW Request Handlers
 * Define mock API responses for testing and development
 */
import { http, HttpResponse, delay } from 'msw';

// Match any API URL pattern (localhost or other)
const API_PATTERN = '*/api/v1';

// Helper to create successful response
const successResponse = <T extends object>(data: T) => ({
  success: true,
  ...data,
});

// Helper to create error response
const errorResponse = (message: string, status = 400) =>
  HttpResponse.json({ success: false, error: message }, { status });

// ============================================
// VIDEO HANDLERS
// ============================================
export const videoHandlers = [
  // Compress video
  http.post(`${API_PATTERN}/video/compress`, async () => {
    await delay(50); // Simulate network delay
    return HttpResponse.json(
      successResponse({
        download_url: '/api/v1/download/compressed_video.mp4',
        filename: 'compressed_video.mp4',
        original_size: 10485760, // 10MB
        processed_size: 5242880, // 5MB
        compression_ratio: 50,
      })
    );
  }),

  // Convert video
  http.post(`${API_PATTERN}/video/convert`, async () => {
    await delay(50);
    return HttpResponse.json(
      successResponse({
        download_url: '/api/v1/download/converted_video.webm',
        filename: 'converted_video.webm',
        original_size: 10485760,
        processed_size: 8388608,
      })
    );
  }),
];

// ============================================
// IMAGE HANDLERS
// ============================================
export const imageHandlers = [
  // Compress image
  http.post(`${API_PATTERN}/image/compress`, async () => {
    await delay(50);
    return HttpResponse.json(
      successResponse({
        download_url: '/api/v1/download/compressed_image.jpg',
        filename: 'compressed_image.jpg',
        original_size: 2097152, // 2MB
        processed_size: 524288, // 512KB
        compression_ratio: 75,
      })
    );
  }),

  // Convert image
  http.post(`${API_PATTERN}/image/convert`, async () => {
    await delay(50);
    return HttpResponse.json(
      successResponse({
        download_url: '/api/v1/download/converted_image.webp',
        filename: 'converted_image.webp',
        original_size: 2097152,
        processed_size: 1048576,
      })
    );
  }),
];

// ============================================
// PDF HANDLERS
// ============================================
export const pdfHandlers = [
  // Compress PDF
  http.post(`${API_PATTERN}/pdf/compress`, async () => {
    await delay(50);
    return HttpResponse.json(
      successResponse({
        download_url: '/api/v1/download/compressed.pdf',
        filename: 'compressed.pdf',
        original_size: 5242880, // 5MB
        processed_size: 2621440, // 2.5MB
      })
    );
  }),

  // Merge PDFs
  http.post(`${API_PATTERN}/pdf/merge`, async () => {
    await delay(50);
    return HttpResponse.json(
      successResponse({
        download_url: '/api/v1/download/merged.pdf',
        filename: 'merged.pdf',
      })
    );
  }),

  // Split PDF
  http.post(`${API_PATTERN}/pdf/split`, async () => {
    await delay(50);
    return HttpResponse.json(
      successResponse({
        filenames: ['page_1.pdf', 'page_2.pdf', 'page_3.pdf'],
        download_urls: [
          '/api/v1/download/page_1.pdf',
          '/api/v1/download/page_2.pdf',
          '/api/v1/download/page_3.pdf',
        ],
      })
    );
  }),

  // Reorganize PDF
  http.post(`${API_PATTERN}/pdf/reorganize`, async () => {
    await delay(50);
    return HttpResponse.json(
      successResponse({
        download_url: '/api/v1/download/reorganized.pdf',
        filename: 'reorganized.pdf',
      })
    );
  }),
];

// ============================================
// REGEX HANDLERS
// ============================================
export const regexHandlers = [
  http.post(`${API_PATTERN}/regex/validate`, async ({ request }) => {
    await delay(30);
    
    const body = await request.json() as { pattern: string; text: string; flags: string };
    const { pattern, text, flags } = body;

    try {
      const regex = new RegExp(pattern, flags);
      const matches: Array<{ start: number; end: number; match: string; groups: string[] }> = [];
      let match;

      if (flags.includes('g')) {
        while ((match = regex.exec(text)) !== null) {
          matches.push({
            start: match.index,
            end: match.index + match[0].length,
            match: match[0],
            groups: match.slice(1),
          });
        }
      } else {
        match = regex.exec(text);
        if (match) {
          matches.push({
            start: match.index,
            end: match.index + match[0].length,
            match: match[0],
            groups: match.slice(1),
          });
        }
      }

      return HttpResponse.json({
        success: true,
        matches,
        count: matches.length,
      });
    } catch {
      return errorResponse('Invalid regex pattern');
    }
  }),
];

// ============================================
// UNITS HANDLERS
// ============================================
export const unitsHandlers = [
  http.post(`${API_PATTERN}/units/convert`, async ({ request }) => {
    await delay(30);
    
    const body = await request.json() as { value: number; from_unit: string; to_unit: string };
    const { value, from_unit, to_unit } = body;

    // Simple conversion logic for testing
    type ConversionValue = number | ((v: number) => number);
    const conversions: Record<string, Record<string, ConversionValue>> = {
      meter: { kilometer: 0.001, centimeter: 100, millimeter: 1000, mile: 0.000621371, foot: 3.28084 },
      kilometer: { meter: 1000, mile: 0.621371 },
      kilogram: { gram: 1000, pound: 2.20462 },
      degC: { degF: (v: number) => v * 9/5 + 32, kelvin: (v: number) => v + 273.15 },
    };

    let converted_value = value;
    
    const conversion = conversions[from_unit]?.[to_unit];
    if (conversion !== undefined) {
      converted_value = typeof conversion === 'function' ? conversion(value) : value * conversion;
    } else if (from_unit === to_unit) {
      converted_value = value;
    }

    return HttpResponse.json({
      success: true,
      original_value: value,
      converted_value,
      from_unit,
      to_unit,
    });
  }),
];

// ============================================
// DOWNLOAD HANDLER
// ============================================
export const downloadHandlers = [
  http.get(`${API_PATTERN}/download/:filename`, async ({ params }) => {
    await delay(30);
    const { filename } = params;
    
    // Return a mock blob for downloads
    return new HttpResponse(new Blob(['mock file content']), {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }),
];

// ============================================
// ERROR SCENARIOS (for testing error handling)
// ============================================
export const errorHandlers = {
  // Server error
  serverError: http.post(`${API_PATTERN}/*`, () => {
    return HttpResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }),

  // Network timeout
  timeout: http.post(`${API_PATTERN}/*`, async () => {
    await delay(30000); // 30 second delay
    return HttpResponse.json({ success: true });
  }),

  // Validation error
  validationError: http.post(`${API_PATTERN}/*`, () => {
    return HttpResponse.json(
      { success: false, error: 'Invalid file format' },
      { status: 400 }
    );
  }),
};

// ============================================
// ALL HANDLERS
// ============================================
export const handlers = [
  ...videoHandlers,
  ...imageHandlers,
  ...pdfHandlers,
  ...regexHandlers,
  ...unitsHandlers,
  ...downloadHandlers,
];

