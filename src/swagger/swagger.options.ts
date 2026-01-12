import { SwaggerDocumentOptions } from '@nestjs/swagger';
import { ClassErrorResponse, ClassResponse } from '@shared/src/utilities';

export const swaggerOptions: SwaggerDocumentOptions = {
  deepScanRoutes: true,
  operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  extraModels: [ClassResponse, ClassErrorResponse],
};
