import axios, { AxiosInstance } from "axios";
import { csrfToken } from "./helpers/server-context";

class BaseAPI {
  private readonly client: AxiosInstance;

  constructor() {
    const headers = { Accept: "application/json", "X-CSRF-Token": csrfToken };
    const params = { format: "json" };

    this.client = axios.create({
      baseURL:
        process.env.NODE_ENV === "production"
          ? "https://api.softmark.io/v1"
          : "http://localhost:3001/v1",
      timeout: 20000,
      headers,
      params
    });
  }

  setAuthorizationToken(token: string) {
    this.getClient().defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;
  }

  protected getClient(): AxiosInstance {
    return this.client;
  }
}

export default BaseAPI;
