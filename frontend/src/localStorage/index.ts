const ACCESS_TOKEN = "ACCESS_TOKEN";
const REFRESH_TOKEN = "REFRESH_TOKEN";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN);
}

export function setAccessToken(token: string | null): void {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN);
  }
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN);
}

export function setRefreshToken(token: string | null): void {
  if (token) {
    localStorage.setItem(REFRESH_TOKEN, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN);
  }
}
