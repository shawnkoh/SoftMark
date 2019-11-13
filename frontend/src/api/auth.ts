import { AuthenticationData } from "backend/src/types/auth";
import client, { setAuthenticationTokens } from "./client";

const URL = "/auth";

export async function tokenLogin(token: string) {
  try {
    const { data } = await client.post<AuthenticationData>(
      `${URL}/token`,
      null,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    setAuthenticationTokens(data);
    return true;
  } catch (error) {
    return false;
  }
}

export async function passwordLogin(email: string, password: string) {
  try {
    const { data } = await client.post<AuthenticationData>(
      `${URL}/token`,
      null,
      {
        auth: { username: email, password }
      }
    );
    setAuthenticationTokens(data);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Attempts to login with only an email.
 * @param email
 * @returns status code
 * @example
 * 201 - Sent email
 * 403 - Require password
 * 404 - Email not found
 * 400 - No email provided
 * ... - Should not happen
 */
export async function passwordlessLogin(email: string): Promise<number> {
  const { status } = await client.post<AuthenticationData>(
    `${URL}/passwordless`,
    { email },
    { validateStatus: status => true }
  );
  return status;
}
