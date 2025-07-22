import {
  IsNumber,
  IsOptional,
  Min,
  IsString,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FilterType {
  // Equality Operators
  EQUAL = 'equal', // = (exact match)
  NOT_EQUAL = 'not_equal', // <> or != (not equal)

  // Text Search Operators
  LIKE = 'like', // LIKE (case sensitive pattern)
  ILIKE = 'ilike', // ILIKE (case insensitive pattern)
  NOT_LIKE = 'not_like', // NOT LIKE
  NOT_ILIKE = 'not_ilike', // NOT ILIKE

  // Comparison Operators
  GREATER_THAN = 'greater_than', // > (greater than)
  GREATER_EQUAL = 'greater_equal', // >= (greater than or equal)
  LESS_THAN = 'less_than', // < (less than)
  LESS_EQUAL = 'less_equal', // <= (less than or equal)

  // Range Operators
  BETWEEN = 'between', // BETWEEN (inclusive range)
  NOT_BETWEEN = 'not_between', // NOT BETWEEN

  // Array/List Operators
  IN = 'in', // IN (value in list)
  NOT_IN = 'not_in', // NOT IN (value not in list)

  // Null Checks
  IS_NULL = 'is_null', // IS NULL
  IS_NOT_NULL = 'is_not_null', // IS NOT NULL

  // String Pattern Matching
  STARTS_WITH = 'starts_with', // String starts with
  ENDS_WITH = 'ends_with', // String ends with
  CONTAINS = 'contains', // String contains (case sensitive)
  ICONTAINS = 'icontains', // String contains (case insensitive)

  // Advanced Text Search
  REGEXP = 'regexp', // Regular expression match
  IREGEXP = 'iregexp', // Case insensitive regex

  // JSON Operators (for JSONB fields)
  JSON_CONTAINS = 'json_contains', // @> (JSON contains)
  JSON_CONTAINED = 'json_contained', // <@ (JSON is contained by)
  JSON_EXTRACT = 'json_extract', // -> (JSON extract)
  JSON_EXTRACT_TEXT = 'json_extract_text', // ->> (JSON extract as text)

  // Array Operators
  ARRAY_CONTAINS = 'array_contains', // Array contains value
  ARRAY_OVERLAP = 'array_overlap', // Arrays have common elements
}

export class PaginationFilterDto {
  @ApiProperty({
    description: 'Field name to search by (e.g., name, email, createdAt)',
    example: 'name',
    examples: {
      name: { value: 'name', description: 'Search by user name' },
      email: { value: 'email', description: 'Search by user email' },
      createdAt: { value: 'createdAt', description: 'Search by creation date' },
      id: { value: 'id', description: 'Search by user ID' },
    },
  })
  @IsString()
  search_by: string;

  @ApiProperty({
    description: 'Type of filter operation to perform',
    enum: FilterType,
    example: FilterType.LIKE,
    examples: {
      // Equality
      equal: { value: FilterType.EQUAL, description: 'Exact match (=)' },
      not_equal: { value: FilterType.NOT_EQUAL, description: 'Not equal (!=)' },

      // Text Search
      like: {
        value: FilterType.LIKE,
        description: 'Case sensitive pattern (%text%)',
      },
      ilike: {
        value: FilterType.ILIKE,
        description: 'Case insensitive pattern (%text%)',
      },

      // Comparisons
      greater_than: {
        value: FilterType.GREATER_THAN,
        description: 'Greater than (>)',
      },
      less_than: { value: FilterType.LESS_THAN, description: 'Less than (<)' },
      greater_equal: {
        value: FilterType.GREATER_EQUAL,
        description: 'Greater than or equal (>=)',
      },
      less_equal: {
        value: FilterType.LESS_EQUAL,
        description: 'Less than or equal (<=)',
      },

      // Range
      between: {
        value: FilterType.BETWEEN,
        description: 'Between start_value and end_value (inclusive)',
      },
      not_between: {
        value: FilterType.NOT_BETWEEN,
        description: 'Not between start_value and end_value',
      },

      // Array/List
      in: { value: FilterType.IN, description: 'Value in provided array' },
      not_in: {
        value: FilterType.NOT_IN,
        description: 'Value not in provided array',
      },

      // Null checks
      is_null: { value: FilterType.IS_NULL, description: 'Field is NULL' },
      is_not_null: {
        value: FilterType.IS_NOT_NULL,
        description: 'Field is NOT NULL',
      },

      // String patterns
      starts_with: {
        value: FilterType.STARTS_WITH,
        description: 'String starts with value',
      },
      ends_with: {
        value: FilterType.ENDS_WITH,
        description: 'String ends with value',
      },
      contains: {
        value: FilterType.CONTAINS,
        description: 'String contains value (case sensitive)',
      },
      icontains: {
        value: FilterType.ICONTAINS,
        description: 'String contains value (case insensitive)',
      },
    },
  })
  @IsEnum(FilterType)
  filter_type: FilterType;

  @ApiPropertyOptional({
    description:
      'Search value (required for most filter types except IS_NULL, IS_NOT_NULL)',
    examples: {
      text_search: {
        value: 'admin',
        description: 'For text searches (like, ilike, equal)',
      },
      number_search: { value: '25', description: 'For numeric comparisons' },
      date_search: { value: '2025-01-01', description: 'For date comparisons' },
    },
  })
  @IsOptional()
  @IsString()
  search_query?: string;

  @ApiPropertyOptional({
    description: 'Start value for BETWEEN, NOT_BETWEEN filters',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsString()
  start_value?: string;

  @ApiPropertyOptional({
    description: 'End value for BETWEEN, NOT_BETWEEN filters',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsString()
  end_value?: string;

  @ApiPropertyOptional({
    description:
      'Array of values for IN, NOT_IN filters (comma-separated string)',
    example: 'admin,user,moderator',
  })
  @IsOptional()
  @IsString()
  values_list?: string;
}

export class PaginationRequestDto {
  @ApiPropertyOptional({
    description: 'Page number (starting from 1)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  per_page?: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdAt',
    enum: ['name', 'email', 'createdAt', 'id'],
  })
  @IsOptional()
  @IsString()
  sort_by?: string;

  @ApiPropertyOptional({
    description: 'Sort direction',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  sort_order?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description:
      'Array of dynamic filters. Support multiple filter types: like, equal, between. All filters are combined with AND logic.',
    type: [PaginationFilterDto],
    examples: {
      like_filter: {
        value: [
          {
            search_by: 'name',
            filter_type: 'like',
            search_query: 'admin',
          },
        ],
        description: 'LIKE filter for partial text search',
      },
      equal_filter: {
        value: [
          {
            search_by: 'email',
            filter_type: 'equal',
            search_query: 'admin@gmail.com',
          },
        ],
        description: 'EQUAL filter for exact match',
      },
      between_filter: {
        value: [
          {
            search_by: 'createdAt',
            filter_type: 'between',
            start_value: '2025-01-01',
            end_value: '2025-12-31',
          },
        ],
        description: 'BETWEEN filter for date/number ranges',
      },
      multiple_filters: {
        value: [
          {
            search_by: 'name',
            filter_type: 'like',
            search_query: 'admin',
          },
          {
            search_by: 'email',
            filter_type: 'like',
            search_query: 'gmail.com',
          },
          {
            search_by: 'createdAt',
            filter_type: 'between',
            start_value: '2025-01-01',
            end_value: '2025-12-31',
          },
        ],
        description: 'Multiple filters combined with AND logic',
      },
    },
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaginationFilterDto)
  filters?: PaginationFilterDto[];
}

export class PaginationResponseDto {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}
