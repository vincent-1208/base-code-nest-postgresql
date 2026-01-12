export class ErrorCode {
  static INTERNAL_SERVER = 'INTERNAL_SERVER_500';

  private static createErrorMap(): Map<string, string> {
    const errorCode = new Map<string, string>();

    errorCode.set(this.INTERNAL_SERVER, 'Internal server error');

    return errorCode;
  }

  private static errorCode = ErrorCode.createErrorMap();

  static getError(code: string): string {
    if (this.errorCode.has(code)) {
      return this.errorCode.get(code)!;
    }
    return 'Error code has not been defined';
  }
}
