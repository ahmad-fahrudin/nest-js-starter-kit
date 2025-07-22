export enum ResponseCode {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  INVALID_FIELD_FORMAT = 422,
  CONFLICT = 409,
  TOO_MANY_REQUESTS = 429,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

export const getMessage = (code: ResponseCode): string => {
  const messages = {
    [ResponseCode.SUCCESS]: 'Success',
    [ResponseCode.CREATED]: 'Created successfully',
    [ResponseCode.BAD_REQUEST]: 'Bad Request Exception',
    [ResponseCode.UNAUTHORIZED]: 'Unauthorized',
    [ResponseCode.FORBIDDEN]: 'Forbidden',
    [ResponseCode.NOT_FOUND]: 'Not found',
    [ResponseCode.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    [ResponseCode.INVALID_FIELD_FORMAT]: 'Invalid Field Format',
    [ResponseCode.CONFLICT]: 'Data Conflict',
    [ResponseCode.TOO_MANY_REQUESTS]: 'Too many requests',
    [ResponseCode.SERVICE_UNAVAILABLE]: 'Service unavailable',
    [ResponseCode.GATEWAY_TIMEOUT]: 'Gateway timeout',
  };
  return messages[code] || 'Unknown error';
};
