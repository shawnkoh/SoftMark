import BaseAPI from "./base";
import { AxiosResponse } from "axios";
import { UserData, UserPatchData } from "backend/src/types/users";

class UsersAPI extends BaseAPI {
  createNewUser(
    name: string,
    email: string,
    password: string
  ): Promise<AxiosResponse> {
    return this.getClient().post(`${this.getUrl()}`, {
      name: name,
      email: email,
      password: password
    });
  }

  requestResetPassword(email: string): Promise<AxiosResponse> {
    return this.getClient().post(`${this.getUrl()}/resetverification`, {
      email: email
    });
  }

  resetPassword(
    email: string,
    verificationCode: string,
    newPassword: string
  ): Promise<AxiosResponse> {
    return this.getClient().post(`${this.getUrl()}/reset`, {
      email: email,
      verification_code: verificationCode,
      password: newPassword
    });
  }

  verifyAccount(
    email: string,
    verificationCode: string
  ): Promise<AxiosResponse> {
    return this.getClient().post(`${this.getUrl()}/verify`, {
      email: email,
      verification_code: verificationCode
    });
  }

  async getUser(id: number): Promise<AxiosResponse<UserData>> {
    return this.getClient().get(`${this.getUrl()}/${id}`);
  }

  patchOwnUser(
    userData: UserPatchData
  ): Promise<AxiosResponse<{ user: UserData }>> {
    return this.getClient().patch(`${this.getUrl()}/self`, userData);
  }

  getOwnUser(): Promise<AxiosResponse<{ user: UserData }>> {
    return this.getClient().get(`${this.getUrl()}/self`);
  }

  private getUrl() {
    return "/users";
  }
}

export default UsersAPI;
