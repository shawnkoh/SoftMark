export type BearerToken = string;

export enum BearerTokenType {
  AccessToken,
  InviteToken,
  PasswordlessToken,
  RefreshToken,
  ResetPasswordToken,
  VerifyEmailToken
}

type Payload<BearerTokenType> = {
  tokenType: BearerTokenType;
};

type TokenLifespan = {
  iat: number;
  exp: number;
};

export type AccessTokenPayload = Payload<BearerTokenType.AccessToken> & {
  userId: number;
};
export type AccessTokenSignedPayload = AccessTokenPayload & TokenLifespan;

export type InviteTokenPayload = Payload<BearerTokenType.InviteToken> & {
  paperUserId: number;
};

export type InviteTokenSignedPayload = InviteTokenPayload & TokenLifespan;

export type PasswordlessTokenPayload = Payload<
  BearerTokenType.PasswordlessToken
> & { userId: number };
export type PasswordlessTokenSignedPayload = PasswordlessTokenPayload &
  TokenLifespan;

export type RefreshTokenPayload = Payload<BearerTokenType.RefreshToken> & {
  userId: number;
};
export type RefreshTokenSignedPayload = RefreshTokenPayload & TokenLifespan;

export type ResetPasswordTokenPayload = Payload<
  BearerTokenType.ResetPasswordToken
> & { userId: number };
export type ResetPasswordTokenSignedPayload = ResetPasswordTokenPayload &
  TokenLifespan;

export type VerifyEmailTokenPayload = Payload<
  BearerTokenType.VerifyEmailToken
> & { userId: number };
export type VerifyEmailTokenSignedPayload = VerifyEmailTokenPayload &
  TokenLifespan;

// Type checkers

export function isBearerToken(token: string | undefined): token is BearerToken {
  if (!token) {
    return false;
  }
  const words = token.split(" ");
  return words[0] === "Bearer" && !!words[1];
}

function isPayload<T>(
  payload: any,
  tokenType: BearerTokenType
): payload is Payload<T> {
  return (
    payload.tokenType in BearerTokenType && payload.tokenType === tokenType
  );
}

function hasTokenLifespan(payload: any) {
  return typeof payload.iat === "number" && typeof payload.exp === "number";
}

export function isAccessTokenPayload(
  payload: any
): payload is AccessTokenPayload {
  return (
    typeof payload.userId === "number" &&
    isPayload(payload, BearerTokenType.AccessToken)
  );
}

export function isAccessTokenSignedPayload(
  payload: any
): payload is AccessTokenSignedPayload {
  return isAccessTokenPayload(payload) && hasTokenLifespan(payload);
}

export function isInviteTokenPayload(
  payload: any
): payload is InviteTokenPayload {
  return (
    typeof payload.paperUserId === "number" &&
    isPayload(payload, BearerTokenType.InviteToken)
  );
}

export function isInviteTokenSignedPayload(
  payload: any
): payload is InviteTokenSignedPayload {
  return isInviteTokenPayload(payload) && hasTokenLifespan(payload);
}

export function isPasswordlessTokenPayload(
  payload: any
): payload is PasswordlessTokenPayload {
  return (
    typeof payload.userId === "number" &&
    isPayload(payload, BearerTokenType.PasswordlessToken)
  );
}

export function isPasswordlessTokenSignedPayload(
  payload: any
): payload is PasswordlessTokenSignedPayload {
  return isPasswordlessTokenPayload(payload) && hasTokenLifespan(payload);
}

export function isRefreshTokenPayload(
  payload: any
): payload is RefreshTokenPayload {
  return (
    typeof payload.userId === "number" &&
    isPayload(payload, BearerTokenType.RefreshToken)
  );
}

export function isRefreshTokenSignedPayload(
  payload: any
): payload is RefreshTokenSignedPayload {
  return isRefreshTokenPayload(payload) && hasTokenLifespan(payload);
}

export function isResetPasswordTokenPayload(
  payload: any
): payload is ResetPasswordTokenPayload {
  return isPayload(payload, BearerTokenType.ResetPasswordToken);
}

export function isResetPasswordTokenSignedPayload(
  payload: any
): payload is ResetPasswordTokenSignedPayload {
  return isResetPasswordTokenPayload(payload) && hasTokenLifespan(payload);
}

export function isVerifyEmailTokenPayload(
  payload: any
): payload is VerifyEmailTokenPayload {
  return isPayload(payload, BearerTokenType.VerifyEmailToken);
}

export function isVerifyEmailTokenSignedPayload(
  payload: any
): payload is VerifyEmailTokenSignedPayload {
  return isVerifyEmailTokenPayload(payload) && hasTokenLifespan(payload);
}
