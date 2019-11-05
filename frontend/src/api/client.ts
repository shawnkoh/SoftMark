import axios, { AxiosRequestConfig } from "axios";
import { AuthenticationData } from "backend/src/types/auth";
import { attach, RetryConfig } from "retry-axios";

import { tokenLogin } from "./auth";
import { csrfToken } from "./helpers/server-context";
import {
  getRefreshToken,
  setAccessToken,
  setRefreshToken
} from "../localStorage";

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

// Credit: Liau Jian Jie
// We need to cast the type because the `retry-axios` package does not extend
// the `AxiosRequestConfig` type.
// See: https://github.com/JustinBeckwith/retry-axios/issues/64
(client.defaults as { raxConfig: RetryConfig }).raxConfig = {
  instance: client,
  retry: 1,
  onRetryAttempt: async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      // TODO: Handle this better
      console.log("No refresh token found");
      return;
    }
    await tokenLogin(refreshToken);
  },
  statusCodesToRetry: [[401, 401]]
};

attach(client);

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
