import axios from "axios";
import { ACCESS_TOKEN_KEY, SERVER_URL } from "../model/index.constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const api = axios.create({
    baseURL: SERVER_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);