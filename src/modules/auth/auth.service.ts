import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { ROLE, STATUS } from '@shared/src/constants/user.constant';
import type { Response, Request } from 'express';
import { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private async getTokens(userId: number, email: string) {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET || 'ACCESS_SECRET',
      expiresIn: (process.env.ACCESS_TOKEN_EXPIRED as StringValue) || '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET || 'REFRESH_SECRET',
      expiresIn: (process.env.REFRESH_TOKEN_EXPIRED as StringValue) || '7d',
    });
    return { accessToken, refreshToken };
  }

  // helper to set refresh cookie
  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge:
        (Number(process.env.REFRESH_TOKEN_EXPIRED) || 7) * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  async signUp(dto: SignUpDto, res: Response) {
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) throw new BadRequestException('Email already in use');
    const nameExist = await this.usersService.findByName(dto.userName);
    if (nameExist) throw new BadRequestException('User name already in use');
    if (dto.password !== dto.passwordConfirm)
      throw new BadRequestException('Password confirm is incorrect');
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      user_name: dto.userName,
      password: hashed,
      role: ROLE.USER,
      status: STATUS.ACTIVE,
    });
    const tokens = await this.getTokens(user.id, user.email);
    const hashedRt = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersService.setRefreshToken(user.id, hashedRt);
    if (tokens?.refreshToken) this.setRefreshCookie(res, tokens.refreshToken);
    return {
      statusCode: HttpStatus.OK,
      message: 'Signup successfully',
      data: {
        accessToken: tokens?.accessToken,
      },
    };
  }

  async signIn(dto: SignInDto, res: Response) {
    const user = await this.usersService.findByName(dto.userName);
    if (!user) throw new UnauthorizedException('User not exist');
    const pwMatches = await bcrypt.compare(dto.password, user.password);
    if (!pwMatches) throw new UnauthorizedException('Incorrect password');
    const tokens = await this.getTokens(user.id, user.email);
    const hashedRt = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersService.setRefreshToken(user.id, hashedRt);
    if (tokens?.refreshToken) this.setRefreshCookie(res, tokens.refreshToken);
    return {
      statusCode: HttpStatus.OK,
      message: 'Signin successfully',
      data: {
        accessToken: tokens?.accessToken,
      },
    };
  }

  async logout(req: Request, res: Response) {
    const refreshToken =
      req.cookies?.refreshToken ?? (req.body?.refreshToken as string);
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    const user = await this.jwtService.decode(refreshToken);
    if (user) {
      await this.usersService.removeRefreshToken(user.id);
    }
    res.clearCookie('refreshToken');
    return {
      statusCode: HttpStatus.OK,
      message: 'Logout succeessfully',
      data: null,
    };
  }

  async refreshTokens(req: Request, res: Response) {
    const refreshToken =
      req.cookies?.refreshToken ?? (req.body?.refreshToken as string);
    if (!refreshToken)
      throw new UnauthorizedException('No refresh token provided');
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET || 'REFRESH_SECRET',
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.hashedRefreshToken)
      throw new UnauthorizedException('Invalid refresh token');
    const rtMatches = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );
    if (!rtMatches) throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.getTokens(user.id, user.email);
    const hashedRt = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersService.setRefreshToken(user.id, hashedRt);
    if (tokens?.refreshToken) this.setRefreshCookie(res, tokens.refreshToken);
    return {
      statusCode: HttpStatus.OK,
      message: 'Refesh token successfully',
      data: {
        accessToken: tokens?.accessToken,
      },
    };
  }
}
