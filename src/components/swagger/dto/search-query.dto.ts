import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationFilterDto } from './pagination.dto';

export class QueryRequestBodyDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sort_by?: string;

  @IsOptional()
  @IsString()
  sort_order?: 'asc' | 'desc';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaginationFilterDto)
  filters?: PaginationFilterDto[];
}
