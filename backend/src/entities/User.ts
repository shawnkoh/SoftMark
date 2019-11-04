import { hashSync } from "bcryptjs";
import { IsNotEmpty, IsEmail, IsOptional, IsString } from "class-validator";
import { Column, Entity, OneToMany } from "typeorm";
import { sign } from "jsonwebtoken";

import { Discardable } from "./Discardable";
import { PaperUser } from "./PaperUser";
import {
  BearerTokenType,
  EntityTokenPayload,
  Credentials,
  RefreshTokenPayload,
  AccessTokenPayload,
  AuthorizationTokenPayload
} from "../types/tokens";
import { UserData } from "../types/users";

@Entity()
export class User extends Discardable {
  entityName = "User";

  constructor(email: string, password?: string, name?: string) {
    super();
    this.email = email;
    this.password = password ? hashSync(password) : null;
    this.name = name || null;
  }

  @Column({ unique: true })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Column({ type: "character varying", nullable: true, select: false })
  password?: string | null;

  @Column({ default: false })
  @IsNotEmpty()
  emailVerified: boolean = false;

  @Column({ type: "character varying", nullable: true })
  @IsOptional()
  @IsString()
  name!: string | null;

  createPayload = (): EntityTokenPayload<User> => ({
    type: BearerTokenType.EntityToken,
    entityName: this.entityName,
    id: this.id,
    email: this.email
  });

  getCredentials = (): Credentials => ({
    id: this.id,
    email: this.email,
    emailVerified: this.emailVerified
  });

  createAuthorizationToken = () => {
    const payload: AuthorizationTokenPayload = {
      type: BearerTokenType.AuthorizationToken,
      id: this.id
    };
    const token = sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "30d"
    });
    return token;
  };

  createAuthenticationTokens = () => {
    const credentials = this.getCredentials();
    const accessTokenPayload: AccessTokenPayload = {
      type: BearerTokenType.AccessToken,
      ...credentials
    };
    const accessToken = sign(accessTokenPayload, process.env.JWT_SECRET!, {
      expiresIn: "15m"
    });
    const refreshTokenPayload: RefreshTokenPayload = {
      type: BearerTokenType.RefreshToken,
      ...credentials
    };
    const refreshToken = sign(refreshTokenPayload, process.env.JWT_SECRET!, {
      expiresIn: "7 days"
    });

    return { accessToken, refreshToken };
  };

  @OneToMany(type => PaperUser, paperUser => paperUser.user)
  paperUsers?: PaperUser[];

  getData = (): UserData => ({
    ...this.getBase(),
    email: this.email,
    emailVerified: this.emailVerified,
    name: this.name
  });
}
