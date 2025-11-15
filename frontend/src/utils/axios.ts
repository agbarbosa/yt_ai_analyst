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
    // Add any auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      code: error.response?.data?.code || error.code,
      details: error.response?.data?.details,
    };

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized access');
    } else if (error.response?.status === 403) {
      // Handle forbidden
      console.error('Forbidden access');
    } else if (error.response?.status === 404) {
      // Handle not found
      console.error('Resource not found');
    } else if (error.response?.status === 500) {
      // Handle server error
      console.error('Server error');
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
