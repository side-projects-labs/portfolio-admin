import { type ToastOptions, type ApiResult, type CustomAxiosRequestConfig } from '@/types/api';
import axiosInstance from './axiosInstance';

// 브라우저에서 API로 직접 보낼 때만 공개 주소를 요청별로 지정한다.
// 공유 인스턴스의 기본 주소(서버용 API_URL)를 바꾸면 이후 요청이 모두 영향을 받는다.
const baseUrlOf = (client: boolean = false) => (client ? `${process.env.NEXT_PUBLIC_API_URL}` : undefined);

export const getData = async <T = any>(
  url: string,
  params?: Record<string, unknown>,
  client?: boolean,
  options?: ToastOptions,
): Promise<ApiResult<T>> => {
  try {
    const config: CustomAxiosRequestConfig = {
      baseURL: baseUrlOf(client),
      params,
      metadata: {
        disableToast: options?.disableToast,
        loadingMsg: options?.loadingMsg,
        successMsg: options?.successMsg,
        errorMsg: options?.errorMsg,
      },
    };
    const { data } = await axiosInstance.get<T>(url, config);
    return { status: true, data };
  } catch (error) {
    return { status: false, error, data: undefined };
  }
};

export const postData = async (url: string, data?: Record<string, any>, client?: boolean, options?: ToastOptions) => {
  try {
    const config: CustomAxiosRequestConfig = {
      baseURL: baseUrlOf(client),
      metadata: {
        disableToast: options?.disableToast,
        loadingMsg: options?.loadingMsg,
        successMsg: options?.successMsg,
        errorMsg: options?.errorMsg,
      },
    };
    const response = await axiosInstance.post(url, data, config);
    return response.data;
  } catch (error) {
    return { status: false, error };
  }
};

export const patchData = async (url: string, data?: Record<string, any>, client?: boolean, options?: ToastOptions) => {
  try {
    const config: CustomAxiosRequestConfig = {
      baseURL: baseUrlOf(client),
      metadata: {
        disableToast: options?.disableToast,
        loadingMsg: options?.loadingMsg,
        successMsg: options?.successMsg,
        errorMsg: options?.errorMsg,
      },
    };
    const response = await axiosInstance.patch(url, data, config);
    return response.data;
  } catch (error) {
    return { status: false, error };
  }
};

export const putData = async (url: string, data?: Record<string, any>, client?: boolean, options?: ToastOptions) => {
  try {
    const config: CustomAxiosRequestConfig = {
      baseURL: baseUrlOf(client),
      metadata: {
        disableToast: options?.disableToast,
        loadingMsg: options?.loadingMsg,
        successMsg: options?.successMsg,
        errorMsg: options?.errorMsg,
      },
    };
    const response = await axiosInstance.put(url, data, config);
    return response.data;
  } catch (error) {
    return { status: false, error };
  }
};

export const deleteData = async (url: string, data?: Record<string, any>, client?: boolean, options?: ToastOptions) => {
  try {
    const config: CustomAxiosRequestConfig = {
      baseURL: baseUrlOf(client),
      data,
      metadata: {
        disableToast: options?.disableToast,
        loadingMsg: options?.loadingMsg,
        successMsg: options?.successMsg,
        errorMsg: options?.errorMsg,
      },
    };
    const response = await axiosInstance.delete(url, config);
    return response.data;
  } catch (error) {
    return { status: false, error };
  }
};
