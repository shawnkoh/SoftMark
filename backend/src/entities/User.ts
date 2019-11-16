import { hashSync } from "bcryptjs";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate
} from "class-validator";
import { sign } from "jsonwebtoken";
import { Column, Entity, OneToMany } from "typeorm";
import IsUniqueEmail from "../constraints/IsUniqueEmail";
import { BearerTokenType } from "../types/tokens";
import { UserData } from "../types/users";
import { Discardable } from "./Discardable";
import { PaperUser } from "./PaperUser";

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
  @Validate(IsUniqueEmail)
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

  private createBearerToken = (
    tokenType: BearerTokenType,
    expiresIn: string
  ) => {
    const payload = {
      tokenType,
      userId: this.id
    };
    const token = sign(payload, process.env.JWT_SECRET!, { expiresIn });
    return token;
  };

  createAuthenticationTokens = () => {
    const accessToken = this.createBearerToken(
      BearerTokenType.AccessToken,
      "5m"
    );
    const refreshToken = this.createBearerToken(
      BearerTokenType.RefreshToken,
      "7 days"
    );
    return { accessToken, refreshToken };
  };

  createPasswordlessToken = () =>
    this.createBearerToken(BearerTokenType.PasswordlessToken, "3h");

  createResetPasswordToken = () =>
    this.createBearerToken(BearerTokenType.ResetPasswordToken, "3h");

  createVerifyEmailToken = () =>
    this.createBearerToken(BearerTokenType.VerifyEmailToken, "14d");

  @OneToMany(type => PaperUser, paperUser => paperUser.user)
  paperUsers?: PaperUser[];

  getData = (): UserData => ({
    ...this.getBase(),
    email: this.email,
    emailVerified: this.emailVerified,
    name: this.name
  });
}
