import { ArrayMaxSize, ArrayUnique, IsArray, IsBoolean, IsDateString, IsEmail, IsIn, IsInt, IsIP, IsObject, IsOptional, IsString, IsUrl, IsUUID, Length, Matches, Max, Min, ValidateNested } from 'class-validator';
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
export class BusinessUnitCreateDto {
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,120) name!:string;
 @IsIn(['DIVISION','SUBSIDIARY','FUNCTION','OTHER']) type!:'DIVISION'|'SUBSIDIARY'|'FUNCTION'|'OTHER';
 @IsOptional() @IsUUID() parentUnitId?:string|null;
}
export class BusinessUnitPatchDto {
 @IsInt() @Min(1) version!:number;
 @IsOptional() @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,120) name?:string;
 @IsOptional() @IsIn(['DIVISION','SUBSIDIARY','FUNCTION','OTHER']) type?:'DIVISION'|'SUBSIDIARY'|'FUNCTION'|'OTHER';
 @IsOptional() @IsUUID() parentUnitId?:string|null;
}
export class DepartmentCreateDto {
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,120) name!:string;
 @IsOptional() @IsUUID() businessUnitId?:string|null;
 @IsOptional() @IsUUID() headMembershipId?:string|null;
}
export class DepartmentPatchDto { @IsInt() @Min(1) version!:number; @IsOptional() @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,120) name?:string; @IsOptional() @IsUUID() businessUnitId?:string|null; @IsOptional() @IsUUID() headMembershipId?:string|null; }
export class LocationAddressDto {
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,200) line1!:string;
 @IsOptional() @IsString() @Length(1,200) line2?:string;
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,100) city!:string;
 @IsOptional() @IsString() @Length(1,100) state?:string;
 @IsOptional() @IsString() @Length(1,30) postalCode?:string;
}
export class LocationCreateDto { @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,120) name!:string; @ValidateNested() @Type(()=>LocationAddressDto) address!:LocationAddressDto; @IsString() @Matches(/^[A-Z]{2}$/) country!:string; @IsString() @Length(1,80) @Matches(/^[A-Za-z_]+(?:\/[A-Za-z_+-]+)+$|^UTC$/) timezone!:string; }
export class LocationPatchDto { @IsInt() @Min(1) version!:number; @IsOptional() @IsString() @Length(2,120) name?:string; @IsOptional() @ValidateNested() @Type(()=>LocationAddressDto) address?:LocationAddressDto; @IsOptional() @IsString() @Matches(/^[A-Z]{2}$/) country?:string; @IsOptional() @IsString() @Length(1,80) @Matches(/^[A-Za-z_]+(?:\/[A-Za-z_+-]+)+$|^UTC$/) timezone?:string; }
export class FrameworkCreateDto { @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,160) name!:string; @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,160) publisher!:string; @IsOptional() @IsString() @Length(1,2000) description?:string; @IsIn(['GLOBAL','CUSTOM']) ownership!:'GLOBAL'|'CUSTOM'; }
export class FrameworkPatchDto { @IsInt() @Min(1) version!:number; @IsOptional() @IsString() @Length(2,160) name?:string; @IsOptional() @IsString() @Length(2,160) publisher?:string; @IsOptional() @IsString() @Length(1,2000) description?:string; }
export class UnifiedControlCreateDto { @IsString() @Length(1,80) reference!:string; @IsString() @Length(2,240) title!:string; @IsString() @Length(2,4000) objective!:string; @IsIn(['PREVENTIVE','DETECTIVE','CORRECTIVE','DIRECTIVE']) type!:'PREVENTIVE'|'DETECTIVE'|'CORRECTIVE'|'DIRECTIVE'; @IsString() @Length(2,120) category!:string; @IsOptional() @IsString() @Length(1,8000) guidance?:string; @IsOptional() @IsString() @Length(1,8000) testProcedure?:string; @IsIn(['CONTINUOUS','DAILY','WEEKLY','MONTHLY','QUARTERLY','ANNUALLY','EVENT_DRIVEN']) frequency!:'CONTINUOUS'|'DAILY'|'WEEKLY'|'MONTHLY'|'QUARTERLY'|'ANNUALLY'|'EVENT_DRIVEN'; }
export class UnifiedControlPatchDto { @IsInt() @Min(1) version!:number; @IsOptional() @IsString() @Length(1,80) reference?:string; @IsOptional() @IsString() @Length(2,240) title?:string; @IsOptional() @IsString() @Length(2,4000) objective?:string; @IsOptional() @IsIn(['PREVENTIVE','DETECTIVE','CORRECTIVE','DIRECTIVE']) type?:'PREVENTIVE'|'DETECTIVE'|'CORRECTIVE'|'DIRECTIVE'; @IsOptional() @IsString() @Length(2,120) category?:string; @IsOptional() @IsString() @Length(1,8000) guidance?:string; @IsOptional() @IsString() @Length(1,8000) testProcedure?:string; @IsOptional() @IsIn(['CONTINUOUS','DAILY','WEEKLY','MONTHLY','QUARTERLY','ANNUALLY','EVENT_DRIVEN']) frequency?:'CONTINUOUS'|'DAILY'|'WEEKLY'|'MONTHLY'|'QUARTERLY'|'ANNUALLY'|'EVENT_DRIVEN'; }
export class FrameworkVersionCreateDto { @IsString() @Length(1,80) versionIdentifier!:string; @IsString() @Matches(/^\d{4}-\d{2}-\d{2}$/) effectiveDate!:string; @IsOptional() @IsString() @Matches(/^\d{4}-\d{2}-\d{2}$/) retirementDate?:string; @IsOptional() @IsObject() provenance?:object; }
export class FrameworkRequirementDto { @IsOptional() @IsUUID() id?:string; @IsString() @Length(1,80) domainReference!:string; @IsString() @Length(1,200) domainName!:string; @IsString() @Length(1,120) reference!:string; @IsString() @Length(1,10000) description!:string; @Min(0.0001) @Max(1000000) weight!:number; @IsOptional() @IsInt() @Min(1) version?:number; }
export class FrameworkPublishDto { @IsInt() @Min(0) @Max(100000) expectedRequirementCount!:number; }
export class MigrationPreviewDto { @IsUUID() sourceVersionId!:string; @IsUUID() targetVersionId!:string; }
export class ControlOwnerDto { @IsUUID() membershipId!:string; @IsIn(['PRIMARY','SECONDARY','REVIEWER','APPROVER']) role!:'PRIMARY'|'SECONDARY'|'REVIEWER'|'APPROVER'; }
export class ImplementationNotesDto { @IsString() @Length(1,20000) notes!:string; @IsInt() @Min(1) version!:number; }
export class ReviewDecisionDto { @IsIn(['APPROVED','REJECTED']) decision!:'APPROVED'|'REJECTED'; @IsString() @Length(2,4000) comment!:string; }
export class MappingSaveDto { @IsOptional() @IsUUID() id?:string; @IsUUID() controlImplementationId!:string; @IsUUID() requirementId!:string; @IsIn(['DIRECT','PARTIAL','SUPPORTING','INHERITED','COMPENSATING','NOT_APPLICABLE']) mappingType!:string; @IsInt() @Min(0) @Max(100) coverage!:number; @IsString() @Length(2,4000) rationale!:string; @IsObject() provenance!:object; @IsOptional() @IsInt() @Min(1) version?:number; }
export class MappingDecisionDto { @IsIn(['APPROVED','REJECTED']) decision!:'APPROVED'|'REJECTED'; @IsString() @Length(2,4000) comment!:string; }
export class RequirementPackImportDto { @IsObject() pack!:object; }
export class MigrationApplyDto extends MigrationPreviewDto { @IsUUID() programId!:string; }
export class OperationalStateDto { @IsIn(['PLANNED','PARTIAL','IMPLEMENTED','NOT_APPLICABLE']) status!:'PLANNED'|'PARTIAL'|'IMPLEMENTED'|'NOT_APPLICABLE'; }

export const programAssessmentTypes = ['INTERNAL','EXTERNAL','SELF_ASSESSMENT','CERTIFICATION'] as const;
export const programStages = ['PLANNING','READINESS','ASSESSMENT','REMEDIATION','COMPLETE'] as const;
export const programStatuses = ['DRAFT','ACTIVE','ON_HOLD','COMPLETED','ARCHIVED'] as const;
type ProgramAssessmentType = typeof programAssessmentTypes[number];
type ProgramStage = typeof programStages[number];
type ProgramStatus = typeof programStatuses[number];

export class ComplianceProgramScopeDto {
 @IsOptional() @IsArray() @ArrayMaxSize(500) @ArrayUnique() @IsUUID('4',{each:true}) businessUnitIds?:string[];
 @IsOptional() @IsArray() @ArrayMaxSize(500) @ArrayUnique() @IsUUID('4',{each:true}) vendorIds?:string[];
 @IsOptional() @IsArray() @ArrayMaxSize(500) @ArrayUnique() @IsString({each:true}) @Length(1,200,{each:true}) systems?:string[];
 @IsOptional() @IsArray() @ArrayMaxSize(500) @ArrayUnique() @IsString({each:true}) @Length(1,200,{each:true}) applications?:string[];
 @IsOptional() @IsArray() @ArrayMaxSize(500) @ArrayUnique() @IsString({each:true}) @Length(1,200,{each:true}) networks?:string[];
 @IsOptional() @IsArray() @ArrayMaxSize(500) @ArrayUnique() @IsString({each:true}) @Length(1,200,{each:true}) processes?:string[];
 @IsOptional() @IsArray() @ArrayMaxSize(100) @ArrayUnique() @IsString({each:true}) @Length(1,120,{each:true}) dataTypes?:string[];
}

export class ComplianceProgramCreateDto {
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,160) name!:string;
 @IsUUID('4') frameworkVersionId!:string;
 @IsUUID('4') ownerMembershipId!:string;
 @IsOptional() @ValidateNested() @Type(()=>ComplianceProgramScopeDto) scope?:ComplianceProgramScopeDto;
 @IsOptional() @IsDateString({strict:true}) startDate?:string;
 @IsOptional() @IsDateString({strict:true}) endDate?:string;
 @IsIn(programAssessmentTypes) assessmentType!:ProgramAssessmentType;
 @IsIn(programStages) stage!:ProgramStage;
 @IsIn(programStatuses) status!:ProgramStatus;
}

export class ComplianceProgramPatchDto {
 @IsInt() @Min(1) version!:number;
 @IsOptional() @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,160) name?:string;
 @IsOptional() @IsUUID('4') ownerMembershipId?:string;
 @IsOptional() @ValidateNested() @Type(()=>ComplianceProgramScopeDto) scope?:ComplianceProgramScopeDto;
 @IsOptional() @IsDateString({strict:true}) startDate?:string|null;
 @IsOptional() @IsDateString({strict:true}) endDate?:string|null;
 @IsOptional() @IsIn(programAssessmentTypes) assessmentType?:ProgramAssessmentType;
}

export const riskCategories=['STRATEGIC','OPERATIONAL','FINANCIAL','COMPLIANCE','CYBERSECURITY','PRIVACY','THIRD_PARTY','OTHER'] as const;
type RiskCategory=typeof riskCategories[number];
export class RiskCreateDto {
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(1,80) reference!:string;
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,240) title!:string;
 @IsIn(riskCategories) category!:RiskCategory;
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,4000) threat!:string;
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,4000) vulnerability!:string;
 @IsUUID('4') ownerMembershipId!:string;
 @IsOptional() @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(1,240) process?:string;
 @IsOptional() @IsDateString({strict:true}) reviewDate?:string|null;
}
export class RiskPatchDto {
 @IsInt() @Min(1) version!:number;
 @IsOptional() @IsString() @Length(1,80) reference?:string;
 @IsOptional() @IsString() @Length(2,240) title?:string;
 @IsOptional() @IsIn(riskCategories) category?:RiskCategory;
 @IsOptional() @IsString() @Length(2,4000) threat?:string;
 @IsOptional() @IsString() @Length(2,4000) vulnerability?:string;
 @IsOptional() @IsUUID('4') ownerMembershipId?:string;
 @IsOptional() @IsString() @Length(1,240) process?:string|null;
 @IsOptional() @IsDateString({strict:true}) reviewDate?:string|null;
}

export const assetTypes=['HARDWARE','SOFTWARE','DATA','SERVICE','FACILITY','OTHER'] as const;
export const assetEnvironments=['PRODUCTION','STAGING','DEVELOPMENT','TEST','OTHER'] as const;
export const informationClassifications=['PUBLIC','INTERNAL','CONFIDENTIAL','RESTRICTED'] as const;
export const criticalities=['LOW','MEDIUM','HIGH','CRITICAL'] as const;
export class AssetCreateDto {
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,160) name!:string;
 @IsIn(assetTypes) type!:typeof assetTypes[number];
 @IsUUID('4') ownerMembershipId!:string;
 @IsOptional() @IsUUID('4') custodianMembershipId?:string|null;
 @IsOptional() @IsUUID('4') departmentId?:string|null;
 @IsOptional() @IsUUID('4') locationId?:string|null;
 @IsOptional() @IsIP() ipAddress?:string|null;
 @IsOptional() @IsString() @Length(1,253) @Matches(/^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(?:\.(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?))*$/) hostname?:string|null;
 @IsOptional() @IsString() @Length(1,160) serialNumber?:string|null;
 @IsOptional() @IsString() @Length(1,160) operatingSystem?:string|null;
 @IsOptional() @IsIn(assetEnvironments) environment?:typeof assetEnvironments[number]|null;
 @IsIn(informationClassifications) classification!:typeof informationClassifications[number];
 @IsIn(criticalities) criticality!:typeof criticalities[number];
}
export class AssetPatchDto {
 @IsInt() @Min(1) version!:number;
 @IsOptional() @IsString() @Length(2,160) name?:string;
 @IsOptional() @IsIn(assetTypes) type?:typeof assetTypes[number];
 @IsOptional() @IsUUID('4') ownerMembershipId?:string;
 @IsOptional() @IsUUID('4') custodianMembershipId?:string|null;
 @IsOptional() @IsUUID('4') departmentId?:string|null;
 @IsOptional() @IsUUID('4') locationId?:string|null;
 @IsOptional() @IsIP() ipAddress?:string|null;
 @IsOptional() @IsString() @Length(1,253) hostname?:string|null;
 @IsOptional() @IsString() @Length(1,160) serialNumber?:string|null;
 @IsOptional() @IsString() @Length(1,160) operatingSystem?:string|null;
 @IsOptional() @IsIn(assetEnvironments) environment?:typeof assetEnvironments[number]|null;
 @IsOptional() @IsIn(informationClassifications) classification?:typeof informationClassifications[number];
 @IsOptional() @IsIn(criticalities) criticality?:typeof criticalities[number];
}
export class VendorContactDto {
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,100) name!:string;
 @IsOptional() @IsEmail() @Length(3,254) email?:string;
 @IsOptional() @IsString() @Length(5,40) phone?:string;
}
export class VendorCreateDto {
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,160) name!:string;
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,500) service!:string;
 @IsUUID('4') businessOwnerMembershipId!:string;
 @IsArray() @ArrayMaxSize(20) @ValidateNested({each:true}) @Type(()=>VendorContactDto) contacts!:VendorContactDto[];
 @IsArray() @ArrayMaxSize(100) @ArrayUnique() @IsString({each:true}) countries!:string[];
 @IsArray() @ArrayMaxSize(100) @ArrayUnique() @IsString({each:true}) dataAccess!:string[];
 @IsArray() @ArrayMaxSize(100) @ArrayUnique() @IsString({each:true}) systemAccess!:string[];
 @IsOptional() @IsDateString({strict:true}) contractStartDate?:string|null;
 @IsOptional() @IsDateString({strict:true}) contractEndDate?:string|null;
}
export class VendorPatchDto {
 @IsInt() @Min(1) version!:number;
 @IsOptional() @IsString() @Length(2,160) name?:string;
 @IsOptional() @IsString() @Length(2,500) service?:string;
 @IsOptional() @IsUUID('4') businessOwnerMembershipId?:string;
 @IsOptional() @IsArray() @ArrayMaxSize(20) @ValidateNested({each:true}) @Type(()=>VendorContactDto) contacts?:VendorContactDto[];
 @IsOptional() @IsArray() @ArrayMaxSize(100) @ArrayUnique() @IsString({each:true}) countries?:string[];
 @IsOptional() @IsArray() @ArrayMaxSize(100) @ArrayUnique() @IsString({each:true}) dataAccess?:string[];
 @IsOptional() @IsArray() @ArrayMaxSize(100) @ArrayUnique() @IsString({each:true}) systemAccess?:string[];
 @IsOptional() @IsDateString({strict:true}) contractStartDate?:string|null;
 @IsOptional() @IsDateString({strict:true}) contractEndDate?:string|null;
}
export const findingTypes=['AUDIT','ASSESSMENT','INCIDENT','CONTROL_TEST','OTHER'] as const;
export const findingSeverities=['LOW','MEDIUM','HIGH','CRITICAL'] as const;
export class FindingCreateDto {
 @IsIn(findingTypes) type!:typeof findingTypes[number];
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,240) title!:string;
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,8000) description!:string;
 @IsIn(findingSeverities) severity!:typeof findingSeverities[number];
 @IsOptional() @IsString() @Length(1,4000) impact?:string|null;
 @IsUUID('4') ownerMembershipId!:string;
 @IsOptional() @IsDateString({strict:true}) dueDate?:string|null;
 @IsOptional() @IsString() @Length(1,8000) managementResponse?:string|null;
}
export class FindingPatchDto {
 @IsInt() @Min(1) version!:number;
 @IsOptional() @IsIn(findingTypes) type?:typeof findingTypes[number];
 @IsOptional() @IsString() @Length(2,240) title?:string;
 @IsOptional() @IsString() @Length(2,8000) description?:string;
 @IsOptional() @IsIn(findingSeverities) severity?:typeof findingSeverities[number];
 @IsOptional() @IsString() @Length(1,4000) impact?:string|null;
 @IsOptional() @IsUUID('4') ownerMembershipId?:string;
 @IsOptional() @IsDateString({strict:true}) dueDate?:string|null;
 @IsOptional() @IsString() @Length(1,8000) managementResponse?:string|null;
}
export const taskTypes=['REMEDIATION','REVIEW','EVIDENCE','IMPLEMENTATION','OTHER'] as const;
export const taskPriorities=['LOW','MEDIUM','HIGH','URGENT'] as const;
export const taskStatuses=['TODO','IN_PROGRESS','BLOCKED','COMPLETED','CANCELED'] as const;
export class TaskCreateDto {
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,240) title!:string;
 @IsOptional() @IsString() @Length(1,8000) description?:string|null;
 @IsIn(taskTypes) type!:typeof taskTypes[number];
 @IsIn(taskPriorities) priority!:typeof taskPriorities[number];
 @IsUUID('4') ownerMembershipId!:string;
 @IsOptional() @IsDateString({strict:true}) dueDate?:string|null;
 @IsOptional() @IsInt() @Min(0) @Max(100) progress?:number;
 @IsIn(taskStatuses) status!:typeof taskStatuses[number];
}
export class TaskPatchDto {
 @IsInt() @Min(1) version!:number;
 @IsOptional() @IsString() @Length(2,240) title?:string;
 @IsOptional() @IsString() @Length(1,8000) description?:string|null;
 @IsOptional() @IsIn(taskTypes) type?:typeof taskTypes[number];
 @IsOptional() @IsIn(taskPriorities) priority?:typeof taskPriorities[number];
 @IsOptional() @IsUUID('4') ownerMembershipId?:string;
 @IsOptional() @IsDateString({strict:true}) dueDate?:string|null;
 @IsOptional() @IsInt() @Min(0) @Max(100) progress?:number;
 @IsOptional() @IsIn(taskStatuses) status?:typeof taskStatuses[number];
}
export class PolicyCreateDto {
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(1,80) number!:string;
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,240) title!:string;
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,120) category!:string;
 @IsUUID('4') authorMembershipId!:string; @IsUUID('4') ownerMembershipId!:string;
 @IsOptional() @IsUUID('4') approverMembershipId?:string|null;
 @IsIn(informationClassifications) classification!:typeof informationClassifications[number];
 @IsOptional() @IsDateString({strict:true}) effectiveDate?:string|null; @IsOptional() @IsDateString({strict:true}) reviewDate?:string|null;
}
export class PolicyPatchDto {
 @IsInt() @Min(1) version!:number;
 @IsOptional() @IsString() @Length(1,80) number?:string; @IsOptional() @IsString() @Length(2,240) title?:string; @IsOptional() @IsString() @Length(2,120) category?:string;
 @IsOptional() @IsUUID('4') authorMembershipId?:string; @IsOptional() @IsUUID('4') ownerMembershipId?:string; @IsOptional() @IsUUID('4') approverMembershipId?:string|null;
 @IsOptional() @IsIn(informationClassifications) classification?:typeof informationClassifications[number];
 @IsOptional() @IsDateString({strict:true}) effectiveDate?:string|null; @IsOptional() @IsDateString({strict:true}) reviewDate?:string|null;
}
export const auditTypes=['INTERNAL','EXTERNAL','REGULATORY','CERTIFICATION','OTHER'] as const;
export const auditStatuses=['PLANNED','IN_PROGRESS','REPORTING','COMPLETED','CANCELED'] as const;
export class AuditCreateDto {
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,240) title!:string;
 @IsIn(auditTypes) type!:typeof auditTypes[number];
 @IsObject() scope!:Record<string,unknown>;
 @IsArray() @ArrayMaxSize(100) @IsString({each:true}) objectives!:string[];
 @IsArray() @ArrayMaxSize(100) @IsString({each:true}) criteria!:string[];
 @IsUUID('4') leadAuditorMembershipId!:string;
 @IsOptional() @IsDateString({strict:true}) startDate?:string|null; @IsOptional() @IsDateString({strict:true}) endDate?:string|null;
 @IsIn(auditStatuses) status!:typeof auditStatuses[number];
}
export class AuditPatchDto {
 @IsInt() @Min(1) version!:number;
 @IsOptional() @IsString() @Length(2,240) title?:string; @IsOptional() @IsIn(auditTypes) type?:typeof auditTypes[number];
 @IsOptional() @IsObject() scope?:Record<string,unknown>; @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({each:true}) objectives?:string[]; @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({each:true}) criteria?:string[];
 @IsOptional() @IsUUID('4') leadAuditorMembershipId?:string; @IsOptional() @IsDateString({strict:true}) startDate?:string|null; @IsOptional() @IsDateString({strict:true}) endDate?:string|null;
 @IsOptional() @IsIn(auditStatuses) status?:typeof auditStatuses[number];
}
export class RoleCreateDto {@Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value) @IsString() @Length(2,100) name!:string;@IsOptional() @IsString() @Length(1,500) description?:string;@IsArray() @ArrayUnique() @IsString({each:true}) permissions!:string[]}
export class RolePermissionsDto {@IsArray() @ArrayUnique() @IsString({each:true}) permissions!:string[]}
export class MembershipRoleDto {@IsUUID('4') roleId!:string}
export class OrganizationSettingsDto {@IsInt() @Min(1) version!:number;@IsIn(['YYYY-MM-DD','DD/MM/YYYY','MM/DD/YYYY']) dateFormat!:string;@Matches(/^[A-Z]{3}$/) currency!:string;@IsInt() @Min(30) @Max(36500) retentionDays!:number;@Matches(/^#[0-9a-fA-F]{6}$/) brandColor!:string;@IsBoolean() requireMfa!:boolean;@IsBoolean() emailNotifications!:boolean}
export class OrganizationLogoDto {@IsString() @Length(30,700000) logoDataUrl!:string}
export class SupportRequestDto {@IsUUID('4') organizationId!:string;@IsArray() @ArrayUnique() @ArrayMaxSize(50) @IsString({each:true}) resources!:string[];@IsString() @Length(10,2000) reason!:string;@IsDateString() expiresAt!:string}
export class SupportDecisionDto {@IsIn(['APPROVED','REJECTED']) status!:'APPROVED'|'REJECTED'}
export class ProgramStageDto {@IsIn(['READINESS','ASSESSMENT','REMEDIATION','COMPLETE']) stage!:string;@IsInt() @Min(1) version!:number}
export class FileUploadDto {@IsString() @Length(1,255) filename!:string;@IsIn(['application/pdf','image/png','image/jpeg','image/webp','text/plain','text/csv']) mimeType!:string;@IsString() @Length(1,70000000) base64!:string}
export class FileGrantDto {@IsUUID('4') fileId!:string}
