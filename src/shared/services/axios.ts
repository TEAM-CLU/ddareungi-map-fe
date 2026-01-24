import axios from 'axios';
import { SERVER_URL } from '../model/shared.constants';

export const api = axios.create({
  baseURL: SERVER_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. 메모리에 토큰 보관할 변수
let cachedToken: string | null = null;

// 2. 외부 AuthProvider에서 변수에 값을 넣어줌
export const setClientToken = (token: string | null) => {
  cachedToken = token;
};

api.interceptors.request.use(
  async config => {
    if (cachedToken) {
      config.headers.Authorization = `Bearer ${cachedToken}`;
    }
    return config;
  },
  error => Promise.reject(error),
);
