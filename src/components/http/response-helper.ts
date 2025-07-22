import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { ResponseCode, getMessage } from 'src/components/enums/response-code.enum';
import { FormatHelper } from 'src/components/format/format-helper';

@Injectable()
export class ResponseHelper {
  static generate(
    res: Response,
    responseCode: ResponseCode,
    data: any = {},
    message: string | null = null,
  ) {
    // Check if response was already sent
    if (res.headersSent) {
      return res;
    }

    const status = parseInt(responseCode.toString().substring(0, 3), 10);

    const response: any = {
      response_code: responseCode,
      response_message: message ?? getMessage(responseCode),
    };

    if (status < 300) {
      response.data = data;
    } else {
      let errorMessages = FormatHelper.extractErrorMessages(data);
      if (errorMessages && errorMessages.length > 0) {
        errorMessages = errorMessages.flatMap((msg) =>
          typeof msg === 'string' && msg.includes(',')
            ? msg
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [msg],
        );
        response.error = errorMessages;
      }
    }

    return res.status(status).json(response);
  }

  static paginate(
    res: Response,
    responseCode: ResponseCode,
    items: any[],
    currentPage: number,
    lastPage: number,
    perPage: number,
    total: number,
    data: any = {},
    message: string | null = null,
  ) {
    // Check if response was already sent
    if (res.headersSent) {
      return res;
    }

    const status = parseInt(responseCode.toString().substring(0, 3), 10);
    const from = total > 0 ? (currentPage - 1) * perPage + 1 : 0;
    const to = Math.min(currentPage * perPage, total);

    const response = {
      response_code: responseCode,
      response_message: message ?? getMessage(responseCode),
      data: items,
      meta: {
        current_page: Math.max(1, currentPage),
        last_page: Math.max(1, lastPage),
        per_page: perPage,
        total,
        from,
        to,
      },
      ...data,
    };

    return res.status(status).json(response);
  }

  /**
   * Enhanced pagination method with better metadata
   */
  static paginateWithMeta(
    res: Response,
    responseCode: ResponseCode,
    items: any[],
    meta: {
      currentPage: number;
      totalPages: number;
      perPage: number;
      total: number;
      from: number;
      to: number;
    },
    message: string | null = null,
  ) {
    // Check if response was already sent
    if (res.headersSent) {
      return res;
    }

    const status = parseInt(responseCode.toString().substring(0, 3), 10);

    const response = {
      response_code: responseCode,
      response_message: message ?? getMessage(responseCode),
      data: items,
      meta: {
        current_page: meta.currentPage,
        last_page: meta.totalPages,
        per_page: meta.perPage,
        total: meta.total,
        from: meta.from,
        to: meta.to,
      },
    };

    return res.status(status).json(response);
  }
}
