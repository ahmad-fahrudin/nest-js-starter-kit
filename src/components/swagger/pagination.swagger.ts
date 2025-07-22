import { ApiBodyOptions } from '@nestjs/swagger';
import { FilterType } from './dto/pagination.dto';

/**
 * Standard Swagger documentation for pagination request body
 * Contains detailed examples for all supported filter types
 */
export const PaginationRequestExamples: ApiBodyOptions = {
  description:
    'Pagination request with dynamic filters. Supports all PostgreSQL operators.',
  examples: {
    // BASIC EXAMPLES
    basic_pagination: {
      summary: 'Basic pagination without filters',
      description: 'Simple pagination with sorting',
      value: {
        page: 1,
        per_page: 10,
        sort_by: 'createdAt',
        sort_order: 'desc',
      },
    },

    // EQUALITY OPERATORS
    equal_filter: {
      summary: 'EQUAL filter - exact match',
      description: 'Matches records where field exactly equals value',
      value: {
        page: 1,
        per_page: 10,
        filters: [
          {
            search_by: 'email',
            filter_type: FilterType.EQUAL,
            search_query: 'admin@example.com',
          },
        ],
      },
    },
    not_equal_filter: {
      summary: 'NOT_EQUAL filter',
      description: 'Matches records where field does not equal value',
      value: {
        filters: [
          {
            search_by: 'status',
            filter_type: FilterType.NOT_EQUAL,
            search_query: 'inactive',
          },
        ],
      },
    },

    // TEXT SEARCH OPERATORS
    like_filter: {
      summary: 'LIKE filter - case-sensitive pattern matching',
      description: 'Performs case-sensitive pattern matching with % wildcards',
      value: {
        filters: [
          {
            search_by: 'name',
            filter_type: FilterType.LIKE,
            search_query: 'admin',
          },
        ],
      },
    },
    ilike_filter: {
      summary: 'ILIKE filter - case-insensitive pattern matching',
      description:
        'Performs case-insensitive pattern matching with % wildcards',
      value: {
        filters: [
          {
            search_by: 'email',
            filter_type: FilterType.ILIKE,
            search_query: 'gmail.com',
          },
        ],
      },
    },
    not_like_filter: {
      summary: 'NOT LIKE filter',
      description: 'Case-sensitive pattern not matching',
      value: {
        filters: [
          {
            search_by: 'name',
            filter_type: FilterType.NOT_LIKE,
            search_query: 'test',
          },
        ],
      },
    },

    // COMPARISON OPERATORS
    greater_than_filter: {
      summary: 'GREATER_THAN filter (>)',
      description: 'Matches records where field is greater than value',
      value: {
        filters: [
          {
            search_by: 'age',
            filter_type: FilterType.GREATER_THAN,
            search_query: '25',
          },
        ],
      },
    },
    less_than_filter: {
      summary: 'LESS_THAN filter (<)',
      description: 'Matches records where field is less than value',
      value: {
        filters: [
          {
            search_by: 'price',
            filter_type: FilterType.LESS_THAN,
            search_query: '100',
          },
        ],
      },
    },
    greater_equal_filter: {
      summary: 'GREATER_EQUAL filter (>=)',
      description:
        'Matches records where field is greater than or equal to value',
      value: {
        filters: [
          {
            search_by: 'rating',
            filter_type: FilterType.GREATER_EQUAL,
            search_query: '4.5',
          },
        ],
      },
    },

    // RANGE OPERATORS
    between_filter: {
      summary: 'BETWEEN filter - inclusive range',
      description:
        'Matches records where field is between start and end values (inclusive)',
      value: {
        filters: [
          {
            search_by: 'createdAt',
            filter_type: FilterType.BETWEEN,
            start_value: '2025-01-01',
            end_value: '2025-12-31',
          },
        ],
      },
    },
    not_between_filter: {
      summary: 'NOT BETWEEN filter',
      description:
        'Matches records where field is not between start and end values',
      value: {
        filters: [
          {
            search_by: 'price',
            filter_type: FilterType.NOT_BETWEEN,
            start_value: '100',
            end_value: '200',
          },
        ],
      },
    },

    // ARRAY/LIST OPERATORS
    in_filter: {
      summary: 'IN filter - match any in list',
      description: 'Matches records where field equals any value in the list',
      value: {
        filters: [
          {
            search_by: 'status',
            filter_type: FilterType.IN,
            values_list: 'active,pending,reviewing',
          },
        ],
      },
    },
    not_in_filter: {
      summary: 'NOT IN filter',
      description:
        'Matches records where field does not equal any value in the list',
      value: {
        filters: [
          {
            search_by: 'category',
            filter_type: FilterType.NOT_IN,
            values_list: 'archived,deleted,draft',
          },
        ],
      },
    },

    // NULL CHECKS
    is_null_filter: {
      summary: 'IS_NULL filter',
      description: 'Matches records where field is NULL',
      value: {
        filters: [
          {
            search_by: 'deletedAt',
            filter_type: FilterType.IS_NULL,
          },
        ],
      },
    },
    is_not_null_filter: {
      summary: 'IS_NOT_NULL filter',
      description: 'Matches records where field is NOT NULL',
      value: {
        filters: [
          {
            search_by: 'verifiedAt',
            filter_type: FilterType.IS_NOT_NULL,
          },
        ],
      },
    },

    // STRING PATTERN MATCHING
    starts_with_filter: {
      summary: 'STARTS_WITH filter',
      description: 'Matches records where string field starts with value',
      value: {
        filters: [
          {
            search_by: 'name',
            filter_type: FilterType.STARTS_WITH,
            search_query: 'Admin',
          },
        ],
      },
    },
    ends_with_filter: {
      summary: 'ENDS_WITH filter',
      description: 'Matches records where string field ends with value',
      value: {
        filters: [
          {
            search_by: 'email',
            filter_type: FilterType.ENDS_WITH,
            search_query: '@gmail.com',
          },
        ],
      },
    },

    // MULTIPLE FILTERS
    multiple_filters: {
      summary: 'Multiple filters combined (AND logic)',
      description: 'All filters must match for records to be returned',
      value: {
        page: 1,
        per_page: 5,
        filters: [
          {
            search_by: 'name',
            filter_type: FilterType.ILIKE,
            search_query: 'admin',
          },
          {
            search_by: 'email',
            filter_type: FilterType.ENDS_WITH,
            search_query: '@example.com',
          },
          {
            search_by: 'createdAt',
            filter_type: FilterType.BETWEEN,
            start_value: '2025-01-01',
            end_value: '2025-12-31',
          },
          {
            search_by: 'role',
            filter_type: FilterType.IN,
            values_list: 'admin,manager',
          },
        ],
        sort_by: 'name',
        sort_order: 'asc',
      },
    },

    // ADVANCED EXAMPLES
    complex_example: {
      summary: 'Complex search example',
      description: 'Demonstrates multiple filter types together',
      value: {
        page: 1,
        per_page: 20,
        filters: [
          {
            search_by: 'status',
            filter_type: FilterType.NOT_IN,
            values_list: 'archived,deleted',
          },
          {
            search_by: 'name',
            filter_type: FilterType.ILIKE,
            search_query: 'john',
          },
          {
            search_by: 'lastLogin',
            filter_type: FilterType.GREATER_EQUAL,
            search_query: '2025-01-01',
          },
          {
            search_by: 'verifiedAt',
            filter_type: FilterType.IS_NOT_NULL,
          },
        ],
        sort_by: 'createdAt',
        sort_order: 'desc',
      },
    },
  },
};

/**
 * Standard Swagger response for paginated data
 * This can be extended for specific entity types
 */
export const PaginatedResponseSchema = {
  type: 'object',
  properties: {
    response_code: { type: 'string', example: '2000000' },
    response_message: { type: 'string', example: 'OK' },
    data: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          // Override this in specific implementations
          id: { type: 'number', example: 1 },
        },
      },
    },
    meta: {
      type: 'object',
      properties: {
        current_page: { type: 'number', example: 1 },
        last_page: { type: 'number', example: 10 },
        per_page: { type: 'number', example: 10 },
        total: { type: 'number', example: 100 },
        from: { type: 'number', example: 1 },
        to: { type: 'number', example: 10 },
      },
    },
  },
};

export function getPaginatedResponseSchema(
  entityName: string,
  entitySchema: Record<string, any>,
) {
  return {
    type: 'object',
    properties: {
      response_code: { type: 'string', example: '2000000' },
      response_message: { type: 'string', example: 'OK' },
      data: {
        type: 'array',
        items: {
          type: 'object',
          properties: entitySchema,
        },
      },
      meta: {
        type: 'object',
        properties: {
          current_page: { type: 'number', example: 1 },
          last_page: { type: 'number', example: 10 },
          per_page: { type: 'number', example: 10 },
          total: { type: 'number', example: 100 },
          from: { type: 'number', example: 1 },
          to: { type: 'number', example: 10 },
        },
      },
    },
  };
}
