import BaseAPI from "./base";
import { AxiosResponse } from "axios";
import { getStorageAccessToken, getStorageRefreshToken } from "../db/selectors";

export interface SignInResponseData {
  accessToken: string | undefined;
  refreshToken: string | undefined;
}

class AuthAPI extends BaseAPI {
  signIn(
    email: string,
    password: string
  ): Promise<AxiosResponse<SignInResponseData>> {
    const decodedCredentials = `${email}:${password}`;
    const encodedCredentials = btoa(decodedCredentials);
    return this.getClient().post(`${this.getUrl()}/token`, null, {
      headers: { Authorization: `Basic ${encodedCredentials}` }
    });
  }

  silentSignIn(): Promise<AxiosResponse<SignInResponseData>> {
    const accessToken = getStorageAccessToken();
    const refreshToken = getStorageRefreshToken();
    return this.getClient().post(`${this.getUrl()}/token`, null, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    });
  }

  private getUrl() {
    return "/auth";
  }
}

export default AuthAPI;
