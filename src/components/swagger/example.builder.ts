import { FilterType } from './dto/pagination.dto';

/**
 * Helper class to generate entity-specific Swagger examples for pagination and filtering
 */
export class SwaggerExampleBuilder {
  static getEntityExamples(
    entityName: string,
    searchFields: Record<string, any>,
  ): Record<string, any> {
    const entityExamples = {};
    const fieldNames = Object.keys(searchFields);

    // Create basic filter examples for this entity's fields
    if (fieldNames.length > 0) {
      // Use the first field for basic examples
      const primaryField = fieldNames[0];
      const primaryValue = searchFields[primaryField];

      entityExamples[`${entityName}_equal`] = {
        summary: `${entityName} - Equal filter example`,
        description: `Find ${entityName} by exact ${primaryField} match`,
        value: {
          page: 1,
          per_page: 10,
          filters: [
            {
              search_by: primaryField,
              filter_type: FilterType.EQUAL,
              search_query: primaryValue,
            },
          ],
        },
      };

      entityExamples[`${entityName}_search`] = {
        summary: `${entityName} - Text search example`,
        description: `Search ${entityName} by ${primaryField}`,
        value: {
          page: 1,
          per_page: 10,
          filters: [
            {
              search_by: primaryField,
              filter_type: FilterType.ILIKE,
              search_query: primaryValue,
            },
          ],
        },
      };

      // If we have a date field, create a date range example
      const dateField = fieldNames.find(
        (field) =>
          field.toLowerCase().includes('date') ||
          field.toLowerCase().includes('at'),
      );

      if (dateField) {
        entityExamples[`${entityName}_date_range`] = {
          summary: `${entityName} - Date range example`,
          description: `Find ${entityName} within date range`,
          value: {
            page: 1,
            per_page: 10,
            filters: [
              {
                search_by: dateField,
                filter_type: FilterType.BETWEEN,
                start_value: '2025-01-01',
                end_value: '2025-12-31',
              },
            ],
          },
        };
      }

      // If we have multiple fields, create a complex example
      if (fieldNames.length >= 2) {
        const secondaryField = fieldNames[1];
        const secondaryValue = searchFields[secondaryField];

        entityExamples[`${entityName}_complex`] = {
          summary: `${entityName} - Complex search example`,
          description: `Search ${entityName} with multiple filters`,
          value: {
            page: 1,
            per_page: 10,
            filters: [
              {
                search_by: primaryField,
                filter_type: FilterType.ILIKE,
                search_query: primaryValue,
              },
              {
                search_by: secondaryField,
                filter_type: FilterType.NOT_EQUAL,
                search_query: secondaryValue,
              },
            ],
            sort_by: fieldNames[0],
            sort_order: 'desc',
          },
        };
      }
    }

    return entityExamples;
  }
}
