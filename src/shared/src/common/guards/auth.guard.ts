import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { IError } from '../interfaces';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = req.headers.authorization?.split(' ')[1];
    // if (!token){
    //     const exception: IError = {
    //     code: ErrorCode.UNAUTHORIZED,
    //     message: ErrorCode.getError(ErrorCode.UNAUTHORIZED),
    //     details: ErrorCode.getError(ErrorCode.UNAUTHORIZED),
    //     validationErrors: null,
    //   };
    //   throw new SystemException(exception, HttpStatus.UNAUTHORIZED);
    // }
    // try{
    //     const payload= await this.jwtService
    // }
    return true;
  }
}
