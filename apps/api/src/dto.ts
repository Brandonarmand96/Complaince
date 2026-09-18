import { IsEmail, IsInt, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';
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
