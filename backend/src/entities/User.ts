import {
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsString
} from "class-validator";
import { Column, Entity, OneToMany } from "typeorm";
import { sign } from "jsonwebtoken";
import { Discardable } from "./Discardable";
import { PaperUser } from "./PaperUser";
import {
  BearerTokenType,
  EntityTokenPayload,
  Credentials,
  RefreshTokenPayload,
  AccessTokenPayload
} from "../types/tokens";

@Entity()
export class User extends Discardable {
  entityName = "User";
  
  @Column({ unique: true })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Column({ select: false })
  @IsNotEmpty()
  password?: string;

  @Column({ default: false })
  @IsNotEmpty()
  emailVerified: boolean = false;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

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
  paperUsers!: Promise<PaperUser[]>;
}
