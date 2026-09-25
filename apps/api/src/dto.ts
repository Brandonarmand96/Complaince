import { ArrayUnique, IsArray, IsEmail, IsInt, IsOptional, IsString, IsUUID, Length, Matches, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
export class HealthJobDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(2, 80)
  @Matches(/\S/, { message: 'label must contain text' })
  label!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  failUntil?: number;
}

export class RegisterDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsEmail()
  @Length(3, 254)
  email!: string;

  @IsString()
  @Length(12, 128)
  password!: string;

  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(2, 100)
  displayName!: string;

  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(2, 120)
  organizationName!: string;
}

export class LoginDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsEmail()
  @Length(3, 254)
  email!: string;

  @IsString()
  @Length(1, 128)
  password!: string;
}

export class RefreshDto {
  @IsString()
  @Length(20, 200)
  refreshToken!: string;
}
export class EmailVerificationRequestDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsEmail()
  @Length(3, 254)
  email!: string;
}
export class EmailVerificationConsumeDto {
  @IsString()
  @Length(20, 200)
  token!: string;
}
export class PasswordResetRequestDto extends EmailVerificationRequestDto {}
export class PasswordResetCompleteDto {
  @IsString() @Length(20, 200) token!: string;
  @IsString() @Length(12, 128) password!: string;
}
export class InvitationCreateDto {
  @IsUUID() organizationId!: string;
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsEmail() @Length(3, 254) email!: string;
  @IsArray() @ArrayUnique() @IsUUID(undefined, { each: true }) roleIds!: string[];
}
export class InvitationAcceptDto {
  @IsString() @Length(20, 200) token!: string;
}
export class InvitationAcceptNewDto extends InvitationAcceptDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @Length(2, 100) displayName!: string;
  @IsString() @Length(12, 128) password!: string;
}
export class MfaCodeDto { @IsString() @Matches(/^(\d{6}|[A-Fa-f0-9]{5}-?[A-Fa-f0-9]{5})$/) code!: string; }
export class MfaChallengeDto extends MfaCodeDto { @IsString() @Length(20, 200) challengeToken!: string; }
export class MfaResetRequestDto { @IsUUID() organizationId!: string; }
export class UserStatusDto { @IsUUID() organizationId!: string; @IsString() @Matches(/^(ACTIVE|INACTIVE|LOCKED|SUSPENDED)$/) status!: string; }
export class SwitchOrganizationDto { @IsUUID() organizationId!: string; }
