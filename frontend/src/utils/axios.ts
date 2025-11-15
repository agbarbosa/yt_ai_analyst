import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../config/constants';
import type { ApiResponse, ApiError } from '../types';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Log outgoing requests
    console.log('[Axios] Outgoing request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      params: config.params,
      data: config.data
    });

    // Add any auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    console.error('[Axios] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses
    console.log('[Axios] Response received:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      dataSize: JSON.stringify(response.data).length
    });
    return response;
  },
  (error: AxiosError<ApiError>) => {
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      code: error.response?.data?.code || error.code,
      details: error.response?.data?.details,
    };

    // Enhanced error logging
    console.error('[Axios] Response error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: apiError.message,
      code: apiError.code,
      details: apiError.details
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      console.error('[Axios] Unauthorized access - authentication required');
    } else if (error.response?.status === 403) {
      console.error('[Axios] Forbidden access - insufficient permissions');
    } else if (error.response?.status === 404) {
      console.error('[Axios] Resource not found');
    } else if (error.response?.status === 500) {
      console.error('[Axios] Server error - internal server error');
    }

    return Promise.reject(apiError);
  }
);

// Helper function for making requests with typed responses
export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  try {
    const response = await axiosInstance.request<ApiResponse<T>>(config);
    return response.data;
  } catch (error) {
    throw error as ApiError;
  }
}

export default axiosInstance;
