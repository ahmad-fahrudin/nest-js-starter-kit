import { FilterType } from './dto/pagination.dto';

/**
 * Helper class for generating Swagger API examples dynamically
 */
export class SwaggerExampleHelper {
  static generateFilterExamples(
    entityName: string,
    fields: Record<
      string,
      {
        value: string | number | boolean;
        description?: string;
        fieldType?: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'json';
      }
    >,
    additionalExamples: Record<string, any> = {},
  ): Record<string, any> {
    const examples: Record<string, any> = {};

    // Add basic pagination example
    examples['basic_pagination'] = {
      summary: 'Basic pagination without filters',
      description: 'Simple pagination with sorting',
      value: {
        page: 1,
        per_page: 10,
        sort_by: 'createdAt',
        sort_order: 'desc',
      },
    };

    // Add entity-specific examples
    const fieldNames = Object.keys(fields);

    if (fieldNames.length > 0) {
      // Generate examples for each field type
      fieldNames.forEach((fieldName) => {
        const field = fields[fieldName];
        const fieldType = field.fieldType || 'string';

        // Equal filter example
        examples[`${entityName}_${fieldName}_equal`] = {
          summary: `${entityName} - Equal filter by ${fieldName}`,
          description: field.description
            ? `Find ${entityName} by exact ${fieldName} match (${field.description})`
            : `Find ${entityName} by exact ${fieldName} match`,
          value: {
            filters: [
              {
                search_by: fieldName,
                filter_type: FilterType.EQUAL,
                search_query: String(field.value),
              },
            ],
          },
        };

        // Add appropriate filter examples based on field type
        switch (fieldType) {
          case 'string':
            // Text search examples
            examples[`${entityName}_${fieldName}_contains`] = {
              summary: `${entityName} - Text search by ${fieldName}`,
              description: `Search ${entityName} with case-insensitive pattern matching on ${fieldName}`,
              value: {
                filters: [
                  {
                    search_by: fieldName,
                    filter_type: FilterType.ILIKE,
                    search_query: String(field.value),
                  },
                ],
              },
            };

            // String pattern examples
            if (fieldName.includes('email')) {
              examples[`${entityName}_${fieldName}_ends_with`] = {
                summary: `${entityName} - Email domain filter`,
                description: `Find ${entityName} with email ending with specific domain`,
                value: {
                  filters: [
                    {
                      search_by: fieldName,
                      filter_type: FilterType.ENDS_WITH,
                      search_query: '@example.com',
                    },
                  ],
                },
              };
            }
            break;

          case 'number':
            // Range examples
            examples[`${entityName}_${fieldName}_range`] = {
              summary: `${entityName} - ${fieldName} range filter`,
              description: `Find ${entityName} with ${fieldName} in specific range`,
              value: {
                filters: [
                  {
                    search_by: fieldName,
                    filter_type: FilterType.BETWEEN,
                    start_value: String(Number(field.value) - 10),
                    end_value: String(Number(field.value) + 10),
                  },
                ],
              },
            };

            // Comparison examples
            examples[`${entityName}_${fieldName}_greater_than`] = {
              summary: `${entityName} - ${fieldName} greater than filter`,
              description: `Find ${entityName} with ${fieldName} greater than value`,
              value: {
                filters: [
                  {
                    search_by: fieldName,
                    filter_type: FilterType.GREATER_THAN,
                    search_query: String(field.value),
                  },
                ],
              },
            };
            break;

          case 'date':
            // Date range example
            examples[`${entityName}_${fieldName}_date_range`] = {
              summary: `${entityName} - ${fieldName} date range filter`,
              description: `Find ${entityName} within date range`,
              value: {
                filters: [
                  {
                    search_by: fieldName,
                    filter_type: FilterType.BETWEEN,
                    start_value: '2025-01-01',
                    end_value: '2025-12-31',
                  },
                ],
              },
            };
            break;

          case 'boolean':
            // Boolean example
            examples[`${entityName}_${fieldName}_boolean`] = {
              summary: `${entityName} - Filter by ${fieldName} boolean`,
              description: `Find ${entityName} where ${fieldName} is true/false`,
              value: {
                filters: [
                  {
                    search_by: fieldName,
                    filter_type: FilterType.EQUAL,
                    search_query: String(field.value),
                  },
                ],
              },
            };
            break;
        }
      });

      // Create multi-filter example if we have enough fields
      if (fieldNames.length >= 2) {
        const filters = fieldNames.slice(0, 3).map((fieldName) => {
          const field = fields[fieldName];
          const fieldType = field.fieldType || 'string';

          if (fieldType === 'date') {
            return {
              search_by: fieldName,
              filter_type: FilterType.BETWEEN,
              start_value: '2025-01-01',
              end_value: '2025-12-31',
            };
          } else if (fieldType === 'number') {
            return {
              search_by: fieldName,
              filter_type: FilterType.GREATER_EQUAL,
              search_query: String(field.value),
            };
          } else {
            return {
              search_by: fieldName,
              filter_type: FilterType.ILIKE,
              search_query: String(field.value),
            };
          }
        });

        examples[`${entityName}_multi_filter`] = {
          summary: `${entityName} - Multiple filters example`,
          description: `Search ${entityName} with multiple conditions (AND logic)`,
          value: {
            page: 1,
            per_page: 10,
            filters,
            sort_by: fieldNames[0],
            sort_order: 'desc',
          },
        };
      }
    }

    // Add additional examples
    return {
      ...examples,
      ...additionalExamples,
    };
  }

  static getCommonFilterExamples(): Record<string, any> {
    return {
      equal_filter: {
        summary: 'EQUAL filter - exact match',
        description: 'Match records where field equals value exactly',
        value: {
          filters: [
            {
              search_by: 'field',
              filter_type: FilterType.EQUAL,
              search_query: 'value',
            },
          ],
        },
      },
      not_equal_filter: {
        summary: 'NOT_EQUAL filter',
        description: 'Match records where field does not equal value',
        value: {
          filters: [
            {
              search_by: 'field',
              filter_type: FilterType.NOT_EQUAL,
              search_query: 'value',
            },
          ],
        },
      },
      like_filter: {
        summary: 'LIKE filter - case sensitive pattern',
        description: 'Case-sensitive text pattern matching',
        value: {
          filters: [
            {
              search_by: 'field',
              filter_type: FilterType.LIKE,
              search_query: 'pattern',
            },
          ],
        },
      },
      ilike_filter: {
        summary: 'ILIKE filter - case insensitive pattern',
        description: 'Case-insensitive text pattern matching',
        value: {
          filters: [
            {
              search_by: 'field',
              filter_type: FilterType.ILIKE,
              search_query: 'pattern',
            },
          ],
        },
      },
      between_filter: {
        summary: 'BETWEEN filter - range',
        description: 'Match records within a range (inclusive)',
        value: {
          filters: [
            {
              search_by: 'field',
              filter_type: FilterType.BETWEEN,
              start_value: 'min_value',
              end_value: 'max_value',
            },
          ],
        },
      },
      in_filter: {
        summary: 'IN filter - value in list',
        description: 'Match records where field value is in a list',
        value: {
          filters: [
            {
              search_by: 'field',
              filter_type: FilterType.IN,
              values_list: 'value1,value2,value3',
            },
          ],
        },
      },
      is_null_filter: {
        summary: 'IS_NULL filter',
        description: 'Match records where field is NULL',
        value: {
          filters: [
            {
              search_by: 'field',
              filter_type: FilterType.IS_NULL,
            },
          ],
        },
      },
      starts_with_filter: {
        summary: 'STARTS_WITH filter',
        description: 'Match records where field starts with pattern',
        value: {
          filters: [
            {
              search_by: 'field',
              filter_type: FilterType.STARTS_WITH,
              search_query: 'prefix',
            },
          ],
        },
      },
    };
  }

  static getSwaggerExamples(
    entityName: string,
    fields: Record<
      string,
      {
        value: string | number | boolean;
        description?: string;
        fieldType?: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'json';
      }
    >,
    includeCommonExamples: boolean = true,
    additionalExamples: Record<string, any> = {},
  ) {
    // Generate examples for this entity
    const entityExamples = this.generateFilterExamples(
      entityName,
      fields,
      additionalExamples,
    );

    // Include common examples if requested
    const commonExamples = includeCommonExamples
      ? this.getCommonFilterExamples()
      : {};

    return {
      examples: {
        ...entityExamples,
        ...commonExamples,
      },
    };
  }
}
