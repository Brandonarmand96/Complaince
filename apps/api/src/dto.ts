import { IsInt, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';
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
