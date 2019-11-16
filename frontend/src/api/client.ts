import axios from "axios";
import { AuthenticationData } from "backend/src/types/auth";
import {
  getRefreshToken,
  setAccessToken,
  setRefreshToken
} from "../localStorage";
import { tokenLogin } from "./auth";
import { csrfToken } from "./helpers/server-context";

const client = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://api.softmark.io/v1"
      : "http://localhost:3001/v1",
  timeout: 20000,
  headers: {
    Accept: "application/json",
    "X-CSRF-Token": csrfToken
  },
  params: {
    format: "json"
  }
});

// TODO: Store a dictionary of incremental refresh ids to fix the race condition
let isRefreshing = false;

client.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (!isRefreshing && error.response.status === 401) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        return Promise.reject(error);
      }
      isRefreshing = true;
      const loggedIn = await tokenLogin(refreshToken);
      isRefreshing = false;
      if (!loggedIn) {
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization =
        client.defaults.headers.common.Authorization;
      return axios(originalRequest);
    }
    return axios(error);
  }
);

export function setAuthenticationTokens(data: AuthenticationData) {
  const { accessToken, refreshToken } = data;
  client.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
}

const clientApi = {
  get: client.get,
  delete: client.delete,
  post: client.post,
  put: client.put,
  patch: client.patch
};

Object.freeze(clientApi);

export default clientApi;
