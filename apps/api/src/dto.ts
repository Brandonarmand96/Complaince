import { ArrayMaxSize, ArrayUnique, IsArray, IsBoolean, IsEmail, IsIn, IsInt, IsObject, IsOptional, IsString, IsUrl, IsUUID, Length, Matches, Max, Min, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
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
export class DisableOrganizationDto { @IsString() @Length(3, 500) reason!: string; }
export class SubscriptionDto { @IsString() @Length(2, 80) plan!: string; @IsIn(['TRIAL','ACTIVE','PAST_DUE','CANCELED']) status!: string; @IsOptional() @IsInt() @Min(1) @Max(1000000) seatLimit?: number; }
export class WorkflowDefinitionDto { @IsOptional() @IsUUID() id?: string; @IsString() @Length(2,120) name!: string; @IsString() @Length(2,100) trigger!: string; @IsArray() conditions!: unknown[]; @IsArray() actors!: unknown[]; @IsOptional() @IsInt() @Min(1) @Max(31536000) deadlineSeconds?: number; @IsOptional() @IsObject() escalation?: object; @IsObject() outcomes!: object; @IsOptional() @IsBoolean() active?: boolean; }
export class WorkflowTransitionDto { @IsString() @Length(1,80) fromState!: string; @IsString() @Length(1,80) toState!: string; @IsOptional() @IsString() @Length(1,1000) comment?: string; }
export class CommentCreateDto { @IsString() @Length(1,80) resourceType!: string; @IsUUID() resourceId!: string; @IsOptional() @IsUUID() parentId?: string; @IsIn(['INTERNAL','EXTERNAL']) visibility!: 'INTERNAL'|'EXTERNAL'; @IsString() @Length(1,5000) body!: string; @IsOptional() @IsArray() @ArrayUnique() @IsUUID(undefined,{each:true}) mentionIds?: string[]; }
export class CommentEditDto { @IsString() @Length(1,5000) body!: string; }
export class ReactionDto { @IsString() @Length(1,16) emoji!: string; }
export class OrganizationContactDto { @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,100) name!:string; @IsOptional() @IsEmail() @Length(3,254) email?:string; @IsOptional() @IsString() @Length(5,40) phone?:string; }
export class OrganizationCreateDto {
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,120) name!:string;
 @IsOptional() @IsString() @Length(2,100) industry?:string;
 @IsOptional() @IsString() @Length(2,100) registrationNumber?:string;
 @IsOptional() @IsString() @Matches(/^[A-Z]{2}$/) country?:string;
 @IsString() @Length(1,80) @Matches(/^[A-Za-z_]+(?:\/[A-Za-z_+-]+)+$|^UTC$/) timezone!:string;
 @IsOptional() @IsInt() @Min(0) @Max(10000000) employeeCount?:number;
 @IsOptional() @IsUrl({require_protocol:true,protocols:['http','https']}) @Length(8,500) website?:string;
 @IsOptional() @IsArray() @ArrayMaxSize(20) @ValidateNested({each:true}) @Type(()=>OrganizationContactDto) contacts?:OrganizationContactDto[];
}
export class OrganizationPatchDto {
 @IsInt() @Min(1) version!:number;
 @IsOptional() @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,120) name?:string;
 @IsOptional() @IsString() @Length(2,100) industry?:string;
 @IsOptional() @IsString() @Length(2,100) registrationNumber?:string;
 @IsOptional() @IsString() @Matches(/^[A-Z]{2}$/) country?:string;
 @IsOptional() @IsString() @Length(1,80) @Matches(/^[A-Za-z_]+(?:\/[A-Za-z_+-]+)+$|^UTC$/) timezone?:string;
 @IsOptional() @IsInt() @Min(0) @Max(10000000) employeeCount?:number;
 @IsOptional() @IsUrl({require_protocol:true,protocols:['http','https']}) @Length(8,500) website?:string;
 @IsOptional() @IsArray() @ArrayMaxSize(20) @ValidateNested({each:true}) @Type(()=>OrganizationContactDto) contacts?:OrganizationContactDto[];
}
