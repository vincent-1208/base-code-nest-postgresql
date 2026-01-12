import { HttpException } from '@nestjs/common';
import { ErrorCode } from '../errors/error-code';
import { IError } from '../interfaces';

export class SystemException extends HttpException {
  constructor(exceptionResponse: IError, statusCode: number) {
    const errorCode = exceptionResponse?.code || ErrorCode.INTERNAL_SERVER;
    super(
      HttpException.createBody({
        code: errorCode,
        message:
          exceptionResponse?.message ||
          ErrorCode.getError(errorCode) ||
          ErrorCode.getError(ErrorCode.INTERNAL_SERVER),
        details:
          exceptionResponse?.details ||
          ErrorCode.getError(errorCode) ||
          ErrorCode.getError(ErrorCode.INTERNAL_SERVER),
        validationErrors: exceptionResponse?.validationErrors || null,
      }),
      statusCode,
    );
  }
}
