import {
  PaginationRequestDto,
  PaginationFilterDto,
  FilterType,
} from '../dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { SearchHelper } from 'src/components/swagger/search/search-helper';
import { SelectQueryBuilder } from 'typeorm';

export class PaginationHelper {
  /**
   * Build search query from pagination request
   */
  static buildWhereClause(
    queryBuilder: SelectQueryBuilder<any>,
    paginationDto: PaginationRequestDto,
    allowedFields: string[],
    alias: string = 'entity'
  ): SelectQueryBuilder<any> {
    // Convert PaginationRequestDto to QueryRequestBodyDto format
    const searchQuery = {
      filters: paginationDto.filters || [],
      sort_by: paginationDto.sort_by,
      sort_order: paginationDto.sort_order,
    };

    return SearchHelper.buildSearchQuery(queryBuilder, searchQuery, allowedFields, alias);
  }

  /**
   * Build order clause from pagination request
   */
  static buildOrderClause(
    queryBuilder: SelectQueryBuilder<any>,
    paginationDto: PaginationRequestDto,
    allowedSortFields: string[],
    alias: string = 'entity'
  ): SelectQueryBuilder<any> {
    // Convert PaginationRequestDto to QueryRequestBodyDto format
    const searchQuery = {
      sort_by: paginationDto.sort_by,
      sort_order: paginationDto.sort_order,
    };

    return SearchHelper.buildSortQuery(queryBuilder, searchQuery, allowedSortFields, alias);
  }

  /**
   * Get pagination limits with validation
   */
  static getPaginationLimits(
    paginationDto: PaginationRequestDto,
    configService?: ConfigService,
  ): { limit: number; offset: number; page: number } {
    const defaultPageSize =
      configService?.get('pagination.defaultPageSize') || 10;
    const maxPageSize = configService?.get('pagination.maxPageSize') || 100;

    // Validate and normalize page number
    let page = paginationDto.page;
    if (!page || isNaN(page) || page < 1) {
      page = 1;
    }
    page = Math.max(1, Math.floor(page));

    // Validate and normalize limit/per_page
    let limit = paginationDto.per_page || defaultPageSize;
    if (!limit || isNaN(limit) || limit < 1) {
      limit = defaultPageSize;
    }

    // Ensure limit doesn't exceed maximum
    limit = Math.min(Math.floor(limit), maxPageSize);
    limit = Math.max(1, limit);

    const offset = (page - 1) * limit;

    return { limit, offset, page };
  }

  /**
   * Validate pagination filters
   */
  static validateFilters(
    filters: PaginationFilterDto[],
    allowedFields: string[],
  ): string[] {
    const errors: string[] = [];

    filters.forEach((filter, index) => {
      if (!allowedFields.includes(filter.search_by)) {
        errors.push(
          `Filter ${index + 1}: '${filter.search_by}' is not an allowed search field`,
        );
      }

      switch (filter.filter_type) {
        // Filters that require search_query
        case FilterType.EQUAL:
        case FilterType.NOT_EQUAL:
        case FilterType.LIKE:
        case FilterType.ILIKE:
        case FilterType.NOT_LIKE:
        case FilterType.NOT_ILIKE:
        case FilterType.GREATER_THAN:
        case FilterType.GREATER_EQUAL:
        case FilterType.LESS_THAN:
        case FilterType.LESS_EQUAL:
        case FilterType.STARTS_WITH:
        case FilterType.ENDS_WITH:
        case FilterType.CONTAINS:
        case FilterType.ICONTAINS:
        case FilterType.REGEXP:
        case FilterType.IREGEXP:
        case FilterType.JSON_CONTAINS:
        case FilterType.JSON_CONTAINED:
        case FilterType.JSON_EXTRACT:
        case FilterType.JSON_EXTRACT_TEXT:
        case FilterType.ARRAY_CONTAINS:
          if (!filter.search_query) {
            errors.push(
              `Filter ${index + 1}: 'search_query' is required for ${filter.filter_type} filter`,
            );
          }
          break;

        // Filters that require start_value and end_value
        case FilterType.BETWEEN:
        case FilterType.NOT_BETWEEN:
          if (!filter.start_value || !filter.end_value) {
            errors.push(
              `Filter ${index + 1}: 'start_value' and 'end_value' are required for ${filter.filter_type} filter`,
            );
          }
          break;

        // Filters that require values_list
        case FilterType.IN:
        case FilterType.NOT_IN:
        case FilterType.ARRAY_OVERLAP:
          if (!filter.values_list) {
            errors.push(
              `Filter ${index + 1}: 'values_list' is required for ${filter.filter_type} filter`,
            );
          }
          break;

        // Filters that don't require any value
        case FilterType.IS_NULL:
        case FilterType.IS_NOT_NULL:
          // These don't need any additional values
          break;

        default:
          errors.push(
            `Filter ${index + 1}: Unknown filter type '${filter.filter_type}'`,
          );
      }
    });

    return errors;
  }

  /**
   * Calculate pagination metadata
   */
  static calculateMeta(
    total: number,
    page: number,
    limit: number,
  ): {
    totalPages: number;
    currentPage: number;
    perPage: number;
    from: number;
    to: number;
  } {
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const from = total > 0 ? (currentPage - 1) * limit + 1 : 0;
    const to = Math.min(currentPage * limit, total);

    return {
      totalPages,
      currentPage,
      perPage: limit,
      from,
      to,
    };
  }

  /**
   * Paginate with TypeORM repository
   */
  static async paginateWithTypeORM(
    queryBuilder: SelectQueryBuilder<any>,
    paginationDto: PaginationRequestDto,
    configService?: ConfigService,
  ) {
    const { limit, offset, page } = this.getPaginationLimits(paginationDto, configService);

    // Apply pagination
    queryBuilder
      .skip(offset)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const from = total > 0 ? offset + 1 : 0;
    const to = Math.min(offset + limit, total);

    return {
      data,
      meta: {
        current_page: page,
        last_page: totalPages,
        per_page: limit,
        total,
        from,
        to,
      },
    };
  }

  /**
   * Legacy paginate method for backward compatibility (Sequelize style)
   * @deprecated Use paginateWithTypeORM instead
   */
  static async paginate(
    repository: any,
    paginationDto: PaginationRequestDto,
    whereClause: any = {},
    orderClause: any[] = [],
    defaultPageSize: number = 10,
  ) {
    const page = paginationDto.page || 1;
    const perPage = paginationDto.per_page || defaultPageSize;
    const offset = (page - 1) * perPage;

    const { count, rows } = await repository.findAndCountAll({
      where: whereClause,
      order: orderClause,
      limit: perPage,
      offset: offset,
    });

    const totalPages = Math.ceil(count / perPage);
    const from = count > 0 ? offset + 1 : 0;
    const to = Math.min(offset + perPage, count);

    return {
      data: rows,
      meta: {
        current_page: page,
        last_page: totalPages,
        per_page: perPage,
        total: count,
        from,
        to,
      },
    };
  }
}
