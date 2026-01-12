import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import type { IError, IErrorResponse, IResponse } from '@shared/src/common';

export class ClassResponse<T> implements IResponse<T> {
  @ApiProperty({
    default: 200,
  })
  status: number;

  @ApiProperty({
    default: 'Success',
  })
  message: string;

  @ApiProperty()
  data: T;
}

export class ClassErrorResponse implements IErrorResponse {
  @ApiProperty()
  coreUrl: string;

  @ApiProperty({
    default: 400,
  })
  status: HttpStatus;

  @ApiProperty({
    default: {
      config: null,
      code: 'string',
      message: 'string',
      details: 'string',
      validationErrors: [
        {
          message: 'string',
          members: ['string'],
        },
      ],
    },
  })
  error: IError;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  path: string;

  @ApiProperty()
  method: string;
}
