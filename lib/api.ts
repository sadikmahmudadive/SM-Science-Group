/**
 * API Utilities
 * Centralized API request handling with environment-based configuration
 */

import { APP_CONFIG } from "./config";

/**
 * Get the API base URL
 * Uses APP_URL from environment or localhost for development
 */
export function getApiBaseUrl(): string {
  return APP_CONFIG.appUrl;
}

/**
 * Fetch wrapper with error handling and default options
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string; status: number }> {
  try {
    const baseUrl = getApiBaseUrl();
    const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    const data = (await response.json()) as T;

    if (!response.ok) {
      return {
        error: `API Error: ${response.statusText}`,
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      error: errorMessage,
      status: 0,
    };
  }
}

/**
 * GET request helper
 */
export function apiGet<T = any>(endpoint: string, options?: RequestInit) {
  return apiFetch<T>(endpoint, {
    method: "GET",
    ...options,
  });
}

/**
 * POST request helper
 */
export function apiPost<T = any>(endpoint: string, body?: any, options?: RequestInit) {
  return apiFetch<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });
}

/**
 * PUT request helper
 */
export function apiPut<T = any>(endpoint: string, body?: any, options?: RequestInit) {
  return apiFetch<T>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });
}

/**
 * PATCH request helper
 */
export function apiPatch<T = any>(endpoint: string, body?: any, options?: RequestInit) {
  return apiFetch<T>(endpoint, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });
}

/**
 * DELETE request helper
 */
export function apiDelete<T = any>(endpoint: string, options?: RequestInit) {
  return apiFetch<T>(endpoint, {
    method: "DELETE",
    ...options,
  });
}

/**
 * Upload file to API
 */
export async function apiUploadFile(
  endpoint: string,
  file: File,
  additionalData?: Record<string, string>
): Promise<{ data?: any; error?: string; status: number }> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    // Add additional data if provided
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const baseUrl = getApiBaseUrl();
    const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: `Upload Error: ${response.statusText}`,
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Upload failed";
    return {
      error: errorMessage,
      status: 0,
    };
  }
}

const apiHelpers = {
  getApiBaseUrl,
  apiFetch,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  apiUploadFile,
};

export default apiHelpers;
