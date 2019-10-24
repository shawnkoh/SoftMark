import BaseAPI from "./base";
import { AxiosResponse } from "axios";
import { UserData } from "backend/src/types/users";

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

  logout(): Promise<AxiosResponse> {
    return this.getClient().delete(`${this.getUrl()}`, {
      withCredentials: true
    });
  }

  silentSignIn(): Promise<AxiosResponse<SignInResponseData>> {
    return this.getClient().get(`${this.getUrl()}`, { withCredentials: true });
  }

  private getUrl() {
    return "/auth";
  }
}

export default AuthAPI;
