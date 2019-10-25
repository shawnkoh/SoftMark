const ACCESS_TOKEN = "ACCESS_TOKEN";
const REFRESH_TOKEN = "REFRESH_TOKEN";

export function getStorageAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN);
}
  
export function setStorageAccessToken(newToken: string): void {
    localStorage.setItem(ACCESS_TOKEN, newToken);
}

export function getStorageRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN);
}
  
export function setStorageRefreshToken(newToken: string): void {
    localStorage.setItem(REFRESH_TOKEN, newToken);
}