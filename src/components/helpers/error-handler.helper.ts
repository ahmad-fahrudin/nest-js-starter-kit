import { Response } from 'express';
import { ResponseCode } from '../enums/response-code.enum';
import { ResponseHelper } from '../http/response-helper';
import { FormatHelper } from '../format/format-helper';
import {
  ValidationException,
  UserNotFoundException,
} from 'src/components/exceptions/user.exceptions';
import { NotFoundException } from '@nestjs/common';

export class ErrorHandlerHelper {
  /**
   * Handle different types of errors and return appropriate HTTP responses
   */
  static handleError(
    error: any,
    res: Response,
    defaultMessage?: string,
  ): Response {
    console.error('Error occurred:', error);
    console.error('Error stack:', error.stack);

    // Handle SATU SEHAT API errors - show full error details
    if (error.message && error.message.includes('SATU SEHAT Error')) {
      console.error('🔥 SATU SEHAT Full Error Details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        response: error.response,
        headers: error.headers,
      });

      return ResponseHelper.generate(res, ResponseCode.INTERNAL_SERVER_ERROR, {
        error: [error.message],
        satusehat_error: error.response,
        status_code: error.status,
        status_text: error.statusText,
      });
    }

    // Handle NotFoundException (NestJS or custom)
    if (error instanceof NotFoundException) {
      return ResponseHelper.generate(res, ResponseCode.NOT_FOUND, {
        error: [error.message || 'Resource not found'],
      });
    }

    // Handle UserNotFoundException (404 Not Found)
    if (error instanceof UserNotFoundException) {
      return ResponseHelper.generate(res, ResponseCode.NOT_FOUND, {
        error: [error.message],
      });
    }

    // Handle ValidationException (from service validation)
    if (error instanceof ValidationException) {
      return ResponseHelper.generate(res, ResponseCode.INVALID_FIELD_FORMAT, {
        error: [error.message],
      });
    }

    // Handle Sequelize unique constraint errors (409 Conflict)
    if (error.name === 'SequelizeUniqueConstraintError') {
      const errorMessages = this.extractSequelizeUniqueConstraintErrors(error);
      return ResponseHelper.generate(res, ResponseCode.CONFLICT, {
        error: errorMessages,
      });
    }

    // Handle Sequelize validation errors (422 Unprocessable Entity)
    if (error.name === 'SequelizeValidationError') {
      const errorMessages = this.extractSequelizeValidationErrors(error);
      return ResponseHelper.generate(res, ResponseCode.INVALID_FIELD_FORMAT, {
        error: errorMessages,
      });
    }

    // Handle Sequelize database errors
    if (error.name === 'SequelizeDatabaseError') {
      const errorMessages = FormatHelper.extractErrorMessages(error);
      return ResponseHelper.generate(res, ResponseCode.BAD_REQUEST, {
        error: errorMessages,
      });
    }

    // Handle foreign key constraint errors
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      const errorMessages = this.extractForeignKeyConstraintErrors(error);
      return ResponseHelper.generate(res, ResponseCode.BAD_REQUEST, {
        error: errorMessages,
      });
    }

    // Handle other Sequelize errors
    if (error.name && error.name.startsWith('Sequelize')) {
      const errorMessages = FormatHelper.extractErrorMessages(error);
      return ResponseHelper.generate(res, ResponseCode.BAD_REQUEST, {
        error: errorMessages,
      });
    }

    // Handle generic errors (500 Internal Server Error)
    const errorMessages = FormatHelper.extractErrorMessages(error);
    return ResponseHelper.generate(res, ResponseCode.INTERNAL_SERVER_ERROR, {
      error:
        errorMessages.length > 0
          ? errorMessages
          : [defaultMessage || 'An unexpected error occurred'],
    });
  }

  /**
   * Extract detailed error messages from Sequelize unique constraint errors
   */
  private static extractSequelizeUniqueConstraintErrors(error: any): string[] {
    const messages: string[] = [];

    if (error.errors && Array.isArray(error.errors)) {
      error.errors.forEach((err: any) => {
        if (err.type === 'unique violation') {
          const field = err.path || 'field';
          const value = err.value || 'value';
          messages.push(`${field} '${value}' already exists`);
        } else {
          messages.push(err.message || 'Unique constraint violation');
        }
      });
    } else if (error.message) {
      // Extract field name from error message if possible
      const match = error.message.match(
        /duplicate key value violates unique constraint "(.+)"/i,
      );
      if (match) {
        messages.push(`Duplicate value detected`);
      } else {
        messages.push(error.message);
      }
    } else {
      messages.push('Duplicate value detected');
    }

    return messages.length > 0 ? messages : ['Data already exists'];
  }

  /**
   * Extract detailed error messages from Sequelize validation errors
   */
  private static extractSequelizeValidationErrors(error: any): string[] {
    const messages: string[] = [];

    if (error.errors && Array.isArray(error.errors)) {
      error.errors.forEach((err: any) => {
        messages.push(err.message || 'Validation error');
      });
    } else if (error.message) {
      messages.push(error.message);
    } else {
      messages.push('Validation failed');
    }

    return messages.length > 0 ? messages : ['Validation failed'];
  }

  /**
   * Extract detailed error messages from foreign key constraint errors
   */
  private static extractForeignKeyConstraintErrors(error: any): string[] {
    const messages: string[] = [];

    if (error.message) {
      // Try to extract the field name from the error message
      const match = error.message.match(
        /foreign key constraint "(.+)" is violated/i,
      );
      if (match) {
        messages.push(`Invalid reference: ${match[1]}`);
      } else {
        messages.push('Invalid reference to related data');
      }
    } else {
      messages.push('Foreign key constraint violation');
    }

    return messages;
  }
}
