import { PaginationRequestDto } from 'src/components/swagger/dto/pagination.dto';

export class UserPaginationRequestDto extends PaginationRequestDto {
  // Override with user-specific examples
  static getExamples() {
    return {
      basic_pagination: {
        summary: 'Basic pagination',
        description: 'Simple pagination without filters',
        value: {
          page: 1,
          per_page: 10,
          sort_by: 'createdAt',
          sort_order: 'desc',
        },
      },
      filter_by_name: {
        summary: 'Filter by name',
        description: 'Get users with name containing specific text',
        value: {
          page: 1,
          per_page: 10,
          filters: [
            {
              search_by: 'name',
              filter_type: 'ilike',
              search_query: 'john',
            },
          ],
        },
      },
      filter_by_email_domain: {
        summary: 'Filter by email domain',
        description: 'Get users with email from specific domain',
        value: {
          page: 1,
          per_page: 10,
          filters: [
            {
              search_by: 'email',
              filter_type: 'ends_with',
              search_query: '@example.com',
            },
          ],
        },
      },
      filter_by_date_range: {
        summary: 'Filter by creation date range',
        description: 'Get users created within specific date range',
        value: {
          page: 1,
          per_page: 10,
          filters: [
            {
              search_by: 'createdAt',
              filter_type: 'between',
              start_value: '2025-01-01',
              end_value: '2025-12-31',
            },
          ],
        },
      },
      multiple_filters: {
        summary: 'Multiple filters combined',
        description: 'Get users with multiple conditions (AND logic)',
        value: {
          page: 1,
          per_page: 10,
          filters: [
            {
              search_by: 'name',
              filter_type: 'ilike',
              search_query: 'john',
            },
            {
              search_by: 'email',
              filter_type: 'ilike',
              search_query: 'example.com',
            },
            {
              search_by: 'createdAt',
              filter_type: 'between',
              start_value: '2025-01-01',
              end_value: '2025-12-31',
            },
          ],
          sort_by: 'createdAt',
          sort_order: 'desc',
        },
      },
      advanced_text_search: {
        summary: 'Advanced text search',
        description: 'Search users by name or email using various text operators',
        value: {
          page: 1,
          per_page: 10,
          filters: [
            {
              search_by: 'name',
              filter_type: 'starts_with',
              search_query: 'John',
            },
            {
              search_by: 'email',
              filter_type: 'contains',
              search_query: 'admin',
            },
          ],
        },
      },
    };
  }
}