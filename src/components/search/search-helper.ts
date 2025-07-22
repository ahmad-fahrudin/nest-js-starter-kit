import { QueryRequestBodyDto } from '../dto/search-query.dto';
import { FilterType } from '../dto/pagination.dto';
import { SelectQueryBuilder } from 'typeorm';

export class SearchHelper {
  static buildSearchQuery(
    queryBuilder: SelectQueryBuilder<any>,
    query: QueryRequestBodyDto,
    allowedFields: string[],
    alias: string = 'entity'
  ) {
    if (query.filters && Array.isArray(query.filters)) {
      query.filters.forEach((filter, index) => {
        // Validate field name before processing
        if (
          filter.search_by &&
          typeof filter.search_by === 'string' &&
          filter.search_by.trim() !== '' &&
          filter.search_by !== 'NaN' &&
          filter.search_by !== 'undefined' &&
          filter.search_by !== 'null' &&
          allowedFields.includes(filter.search_by)
        ) {
          const fieldName = `${alias}.${filter.search_by}`;
          const paramName = `param_${index}`;

          switch (filter.filter_type) {
            // Equality Operators
            case FilterType.EQUAL:
              queryBuilder.andWhere(`${fieldName} = :${paramName}`, {
                [paramName]: filter.search_query,
              });
              break;
            case FilterType.NOT_EQUAL:
              queryBuilder.andWhere(`${fieldName} != :${paramName}`, {
                [paramName]: filter.search_query,
              });
              break;

            // Text Search Operators
            case FilterType.LIKE:
              queryBuilder.andWhere(`${fieldName} LIKE :${paramName}`, {
                [paramName]: `%${filter.search_query}%`,
              });
              break;
            case FilterType.ILIKE:
              queryBuilder.andWhere(`LOWER(${fieldName}) LIKE LOWER(:${paramName})`, {
                [paramName]: `%${filter.search_query}%`,
              });
              break;
            case FilterType.NOT_LIKE:
              queryBuilder.andWhere(`${fieldName} NOT LIKE :${paramName}`, {
                [paramName]: `%${filter.search_query}%`,
              });
              break;
            case FilterType.NOT_ILIKE:
              queryBuilder.andWhere(`LOWER(${fieldName}) NOT LIKE LOWER(:${paramName})`, {
                [paramName]: `%${filter.search_query}%`,
              });
              break;

            // String Pattern Matching
            case FilterType.STARTS_WITH:
              queryBuilder.andWhere(`${fieldName} LIKE :${paramName}`, {
                [paramName]: `${filter.search_query}%`,
              });
              break;
            case FilterType.ENDS_WITH:
              queryBuilder.andWhere(`${fieldName} LIKE :${paramName}`, {
                [paramName]: `%${filter.search_query}`,
              });
              break;
            case FilterType.CONTAINS:
              queryBuilder.andWhere(`${fieldName} LIKE :${paramName}`, {
                [paramName]: `%${filter.search_query}%`,
              });
              break;
            case FilterType.ICONTAINS:
              queryBuilder.andWhere(`LOWER(${fieldName}) LIKE LOWER(:${paramName})`, {
                [paramName]: `%${filter.search_query}%`,
              });
              break;

            // Comparison Operators
            case FilterType.GREATER_THAN:
              queryBuilder.andWhere(`${fieldName} > :${paramName}`, {
                [paramName]: filter.search_query,
              });
              break;
            case FilterType.GREATER_EQUAL:
              queryBuilder.andWhere(`${fieldName} >= :${paramName}`, {
                [paramName]: filter.search_query,
              });
              break;
            case FilterType.LESS_THAN:
              queryBuilder.andWhere(`${fieldName} < :${paramName}`, {
                [paramName]: filter.search_query,
              });
              break;
            case FilterType.LESS_EQUAL:
              queryBuilder.andWhere(`${fieldName} <= :${paramName}`, {
                [paramName]: filter.search_query,
              });
              break;

            // Range Operators
            case FilterType.BETWEEN:
              if (filter.start_value && filter.end_value) {
                queryBuilder.andWhere(`${fieldName} BETWEEN :start_${paramName} AND :end_${paramName}`, {
                  [`start_${paramName}`]: filter.start_value,
                  [`end_${paramName}`]: filter.end_value,
                });
              }
              break;
            case FilterType.NOT_BETWEEN:
              if (filter.start_value && filter.end_value) {
                queryBuilder.andWhere(`${fieldName} NOT BETWEEN :start_${paramName} AND :end_${paramName}`, {
                  [`start_${paramName}`]: filter.start_value,
                  [`end_${paramName}`]: filter.end_value,
                });
              }
              break;

            // Array/List Operators
            case FilterType.IN:
              if (filter.values_list) {
                const values = filter.values_list
                  .split(',')
                  .map((val) => val.trim());
                queryBuilder.andWhere(`${fieldName} IN (:...${paramName})`, {
                  [paramName]: values,
                });
              }
              break;
            case FilterType.NOT_IN:
              if (filter.values_list) {
                const values = filter.values_list
                  .split(',')
                  .map((val) => val.trim());
                queryBuilder.andWhere(`${fieldName} NOT IN (:...${paramName})`, {
                  [paramName]: values,
                });
              }
              break;

            // Null Checks
            case FilterType.IS_NULL:
              queryBuilder.andWhere(`${fieldName} IS NULL`);
              break;
            case FilterType.IS_NOT_NULL:
              queryBuilder.andWhere(`${fieldName} IS NOT NULL`);
              break;

            // Advanced Text Search
            case FilterType.REGEXP:
              queryBuilder.andWhere(`${fieldName} REGEXP :${paramName}`, {
                [paramName]: filter.search_query,
              });
              break;
            case FilterType.IREGEXP:
              queryBuilder.andWhere(`LOWER(${fieldName}) REGEXP LOWER(:${paramName})`, {
                [paramName]: filter.search_query,
              });
              break;

            // JSON Operators (for JSONB fields) - PostgreSQL specific
            case FilterType.JSON_CONTAINS:
              try {
                const jsonValue = JSON.parse(filter.search_query || '{}');
                queryBuilder.andWhere(`${fieldName} @> :${paramName}`, {
                  [paramName]: JSON.stringify(jsonValue),
                });
              } catch {
                console.error(`Invalid JSON in filter: ${filter.search_query}`);
              }
              break;
            case FilterType.JSON_CONTAINED:
              try {
                const jsonValue = JSON.parse(filter.search_query || '{}');
                queryBuilder.andWhere(`${fieldName} <@ :${paramName}`, {
                  [paramName]: JSON.stringify(jsonValue),
                });
              } catch {
                console.error(`Invalid JSON in filter: ${filter.search_query}`);
              }
              break;

            // Array Operators - PostgreSQL specific
            case FilterType.ARRAY_CONTAINS:
              if (filter.search_query) {
                queryBuilder.andWhere(`${fieldName} @> ARRAY[:${paramName}]`, {
                  [paramName]: filter.search_query,
                });
              }
              break;
            case FilterType.ARRAY_OVERLAP:
              if (filter.values_list) {
                const values = filter.values_list
                  .split(',')
                  .map((val) => val.trim());
                queryBuilder.andWhere(`${fieldName} && ARRAY[:...${paramName}]`, {
                  [paramName]: values,
                });
              }
              break;

            // JSON Path Extraction - PostgreSQL specific
            case FilterType.JSON_EXTRACT:
            case FilterType.JSON_EXTRACT_TEXT:
              console.warn(
                `JSON path extraction (${filter.filter_type}) not fully implemented. Needs database-specific handling.`,
              );
              break;
          }
        }
      });
    }

    return queryBuilder;
  }

  static buildSortQuery(
    queryBuilder: SelectQueryBuilder<any>,
    query: QueryRequestBodyDto,
    allowedSortFields: string[],
    alias: string = 'entity'
  ) {
    console.log('=== SEARCH HELPER DEBUG ===');
    console.log('Input query:', JSON.stringify(query, null, 2));
    console.log('Allowed sort fields:', allowedSortFields);

    // Validate sort_by field
    if (
      query.sort_by &&
      typeof query.sort_by === 'string' &&
      query.sort_by.trim() !== '' &&
      query.sort_by !== 'NaN' &&
      query.sort_by !== 'undefined' &&
      query.sort_by !== 'null' &&
      allowedSortFields.includes(query.sort_by)
    ) {
      // Validate and normalize sort_order
      const validSortOrders = ['asc', 'desc', 'ASC', 'DESC'];
      let sortOrder = 'ASC'; // Default to ASC

      if (query.sort_order && validSortOrders.includes(query.sort_order)) {
        sortOrder = query.sort_order.toUpperCase();
      }

      console.log('Valid sort field detected:', query.sort_by);
      console.log('Final sort order:', sortOrder);

      queryBuilder.orderBy(`${alias}.${query.sort_by}`, sortOrder as 'ASC' | 'DESC');
    } else {
      console.log('Using default sort order: created_at DESC');
      queryBuilder.orderBy(`${alias}.created_at`, 'DESC');
    }

    return queryBuilder;
  }
}
