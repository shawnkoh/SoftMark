export type BearerToken = string;

export enum BearerTokenType {
  AccessToken,
  RefreshToken,
  EntityToken,
  ResetPasswordToken
}

type Payload<BearerTokenType> = {
  type: BearerTokenType;
};

type TokenLifespan = {
  iat: number;
  exp: number;
};

export type Credentials = {
  id: number;
  email: string;
  emailVerified: boolean;
};

export type AccessTokenPayload = Payload<BearerTokenType.AccessToken> &
  Credentials;
export type AccessTokenSignedPayload = AccessTokenPayload & TokenLifespan;

export type RefreshTokenPayload = Payload<BearerTokenType.RefreshToken> &
  Credentials;
export type RefreshTokenSignedPayload = RefreshTokenPayload & TokenLifespan;

export type EntityTokenPayload<Entity> = Payload<BearerTokenType.EntityToken> &
  Partial<Entity> & { id: number; entityName: string };
export type EntityTokenSignedPayload<Entity> = EntityTokenPayload<Entity> &
  TokenLifespan;

export type ResetPasswordTokenPayload = Payload<
  BearerTokenType.ResetPasswordToken
> &
  Credentials;
export type ResetPasswordTokenSignedPayload = ResetPasswordTokenPayload &
  TokenLifespan;

// Type checkers

export function isBearerToken(token: string): token is BearerToken {
  const words = token.split(" ");
  return words[0] === "Bearer" && !!words[1];
}

function isPayload<T>(payload: any): payload is Payload<T> {
  return payload.type in BearerTokenType;
}

function hasTokenLifespan(payload: any) {
  return typeof payload.iat === "number" && typeof payload.exp === "number";
}

function hasCredentials(payload: any) {
  return (
    typeof payload.id === "number" &&
    typeof payload.email === "string" &&
    typeof payload.emailVerified === "boolean"
  );
}

export function isAccessTokenPayload(
  payload: any
): payload is AccessTokenPayload {
  return (
    isPayload(payload) &&
    payload.type === BearerTokenType.AccessToken &&
    hasCredentials(payload)
  );
}

export function isAccessTokenSignedPayload(
  payload: any
): payload is AccessTokenSignedPayload {
  return isAccessTokenPayload(payload) && hasTokenLifespan(payload);
}

export function isRefreshTokenPayload(
  payload: any
): payload is RefreshTokenPayload {
  return (
    isPayload(payload) &&
    payload.type === BearerTokenType.RefreshToken &&
    hasCredentials(payload)
  );
}

export function isRefreshTokenSignedPayload(
  payload: any
): payload is RefreshTokenSignedPayload {
  return isRefreshTokenPayload(payload) && hasTokenLifespan(payload);
}

export function isEntityTokenPayload<Entity>(
  payload: any
): payload is EntityTokenPayload<Entity> {
  return isPayload(payload) && payload.type === BearerTokenType.EntityToken;
}

export function isEntityTokenSignedPayload<Entity>(
  payload: any
): payload is EntityTokenSignedPayload<Entity> {
  return isEntityTokenPayload(payload) && hasTokenLifespan(payload);
}

export function isResetPasswordTokenPayload(
  payload: any
): payload is ResetPasswordTokenPayload {
  return (
    isPayload(payload) && payload.type === BearerTokenType.ResetPasswordToken
  );
}

export function isResetPasswordTokenSignedPayload(
  payload: any
): payload is ResetPasswordTokenSignedPayload {
  return isResetPasswordTokenPayload(payload) && hasTokenLifespan(payload);
}
