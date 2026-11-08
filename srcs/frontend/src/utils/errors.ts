export function getApiErrorMessage(error: any, fallback = 'An unexpected error occurred'): string {
  if (!error) return fallback;

  const data = error.response?.data;
  if (data) {
    if (typeof data === 'string') {
      // If the response is HTML (e.g. Django debug 404 or 500 error page), avoid displaying raw HTML markup
      if (data.trim().startsWith('<') || data.includes('<!DOCTYPE html>') || data.includes('<html')) {
        if (error.response?.status === 404) {
          return 'Requested resource not found (404).';
        }
        if (error.response?.status === 403) {
          return 'You do not have permission to perform this action (403).';
        }
        if (error.response?.status === 500) {
          return 'A server error occurred (500). Please try again later.';
        }
        return fallback;
      }
      return data;
    }
    if (typeof data.detail === 'string') return data.detail;
    if (typeof data.error === 'string') return data.error;
    if (typeof data.message === 'string') return data.message;

    if (typeof data === 'object') {
      const keys = Object.keys(data);
      if (keys.length > 0) {
        const firstKey = keys[0];
        const val = data[firstKey];
        if (Array.isArray(val) && val.length > 0) {
          return typeof val[0] === 'string' ? val[0] : String(val[0]);
        }
        if (typeof val === 'string') {
          return val;
        }
      }
    }
  }

  if (error.message && typeof error.message === 'string') {
    return error.message;
  }

  return fallback;
}

