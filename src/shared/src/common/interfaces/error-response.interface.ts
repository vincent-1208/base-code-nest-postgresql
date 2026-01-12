/* eslint-disable @typescript-eslint/no-empty-interface */
import { HttpStatus } from '@nestjs/common';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';

export interface IErrorResponse {
  coreUrl: string;
  status: HttpStatus;
  error: IError;
  timestamp: string;
  path: string;
  method: string;
}
export interface IError {
  code: string;
  message?: string;
  details?: string;
  validationErrors?: IValidationError[];
  config?: AxiosResponse['config'];
}

export interface IValidationError {
  message: string;
  members?: string[];
}

export interface IErrorCoreResponse {
  error: IError;
}
