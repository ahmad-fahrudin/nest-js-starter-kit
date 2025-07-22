import { HttpException } from '@nestjs/common';
import { validateSync } from 'class-validator';
import { ValidationError } from 'class-validator';

export class FormatHelper {
  static logContext(data: Error | HttpException): object {
    if (data instanceof HttpException) {
      return {
        status_code: data.getStatus(),
        response: JSON.stringify(data.getResponse()),
      };
    }

    if (data instanceof Error) {
      return {
        error_class: data.name,
        error_message: data.message,
        stack_trace: data.stack,
      };
    }

    return {};
  }

  static extractErrorMessages(error: any): string[] {
    if (!error) return [];

    const extractedMessages = this.extractErrorMessagesRecursive(error);
    // Ensure completely flat array
    return this.flattenDeep(extractedMessages);
  }

  private static extractErrorMessagesRecursive(error: any): any[] {
    if (!error) return [];

    if (Array.isArray(error)) {
      return error.flatMap((err) => this.extractErrorMessagesRecursive(err));
    }

    if (error instanceof ValidationError) {
      if (error.constraints) {
        return Object.values(error.constraints);
      }
      if (error.children) {
        return this.extractErrorMessagesRecursive(error.children);
      }
    }

    // Handle Sequelize errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      if (error.errors && Array.isArray(error.errors)) {
        return error.errors.map((err: any) => {
          if (err.message) {
            return err.message;
          }
          return `Duplicate value for field: ${err.path}`;
        });
      }
      return [error.message || 'Unique constraint violation'];
    }

    if (error.name === 'SequelizeValidationError') {
      if (error.errors && Array.isArray(error.errors)) {
        return error.errors.map(
          (err: any) => err.message || 'Validation error',
        );
      }
      return [error.message || 'Validation error'];
    }

    if (typeof error === 'string') {
      return [error];
    }

    if (error.message) {
      return [error.message];
    }

    if (error.error) {
      return this.extractErrorMessagesRecursive(error.error);
    }

    return [];
  }

  // Helper to ensure completely flat array
  private static flattenDeep(arr: any[]): string[] {
    return arr.reduce((acc, val) => {
      if (Array.isArray(val)) {
        return acc.concat(this.flattenDeep(val));
      }
      if (typeof val === 'string') {
        return acc.concat(val);
      }
      return acc;
    }, []);
  }

  static validateDtoSync(dto: object): string[] {
    const errors = validateSync(dto);
    if (errors.length > 0) {
      const errorMessages = errors.flatMap((err) =>
        Object.values(err.constraints || {}),
      );
      // Ensure completely flat array
      return this.flattenDeep(errorMessages);
    }
    return [];
  }
}
