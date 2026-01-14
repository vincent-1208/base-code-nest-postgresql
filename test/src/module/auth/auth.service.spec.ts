import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../../src/modules/auth/auth.service';
import { UsersService } from '../../../../src/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Response, Request } from 'express';
import { ROLE, STATUS } from '../../../../src/shared/src/constants/user.constant';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findByName: jest.fn(),
    create: jest.fn(),
    setRefreshToken: jest.fn(),
    removeRefreshToken: jest.fn(),
    findById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    decode: jest.fn(),
    verify: jest.fn(),
  };

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  const mockRequest = (cookies = {}, body = {}) => {
    return {
      cookies,
      body,
    } as unknown as Request;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('signUp', () => {
    const signUpDto = {
        email: 'test@example.com',
        userName: 'testuser',
        password: 'password123',
        passwordConfirm: 'password123'
    };
    const res = mockResponse();

    it('should throw BadRequestException if email already exists', async () => {
        mockUsersService.findByEmail.mockResolvedValue({ id: 1 });
        await expect(authService.signUp(signUpDto, res)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if username already exists', async () => {
        mockUsersService.findByEmail.mockResolvedValue(null);
        mockUsersService.findByName.mockResolvedValue({ id: 1 });
        await expect(authService.signUp(signUpDto, res)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if passwords do not match', async () => {
        mockUsersService.findByEmail.mockResolvedValue(null);
        mockUsersService.findByName.mockResolvedValue(null);
        const invalidDto = { ...signUpDto, passwordConfirm: 'wrong' };
        await expect(authService.signUp(invalidDto, res)).rejects.toThrow(BadRequestException);
    });

    it('should return tokens on successful signup', async () => {
        mockUsersService.findByEmail.mockResolvedValue(null);
        mockUsersService.findByName.mockResolvedValue(null);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_value');
        mockUsersService.create.mockResolvedValue({ 
            id: 1, 
            email: signUpDto.email,
            password: 'hashed_password',
            role: ROLE.USER,
            status: STATUS.ACTIVE
        });
        
        mockJwtService.sign.mockReturnValue('mock_token');
        
        const result = await authService.signUp(signUpDto, res);
        
        expect(result.statusCode).toBe(HttpStatus.OK);
        expect(result.data.accessToken).toBe('mock_token');
        expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'mock_token', expect.any(Object));
        expect(usersService.setRefreshToken).toHaveBeenCalledWith(1, 'hashed_value');
    });
  });

  describe('signIn', () => {
    const signInDto = {
        userName: 'testuser',
        password: 'password123'
    };
    const res = mockResponse();
    const mockUser = {
        id: 1,
        email: 'test@example.com',
        user_name: 'testuser',
        password: 'hashed_password'
    };

    it('should throw UnauthorizedException if user does not exist', async () => {
        mockUsersService.findByName.mockResolvedValue(null);
        await expect(authService.signIn(signInDto, res)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
        mockUsersService.findByName.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);
        await expect(authService.signIn(signInDto, res)).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens on successful signin', async () => {
        mockUsersService.findByName.mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        mockJwtService.sign.mockReturnValue('mock_token');
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_refresh_token');

        const result = await authService.signIn(signInDto, res);

        expect(result.statusCode).toBe(HttpStatus.OK);
        expect(result.data.accessToken).toBe('mock_token');
        expect(res.cookie).toHaveBeenCalled();
        expect(usersService.setRefreshToken).toHaveBeenCalledWith(1, 'hashed_refresh_token');
    });
  });

  describe('logout', () => {
    const res = mockResponse();

    it('should throw UnauthorizedException if no refresh token provided', async () => {
        const req = mockRequest({}, {});
        await expect(authService.logout(req, res)).rejects.toThrow(UnauthorizedException);
    });

    it('should remove refresh token and clear cookie', async () => {
        const req = mockRequest({ refreshToken: 'some_token' });
        mockJwtService.decode.mockReturnValue({ id: 1 });

        const result = await authService.logout(req, res);

        expect(usersService.removeRefreshToken).toHaveBeenCalledWith(1);
        expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
        expect(result.statusCode).toBe(HttpStatus.OK);
    });

    it('should just clear cookie if token invalid (user not found in decode)', async () => {
        const req = mockRequest({ refreshToken: 'some_token' });
        mockJwtService.decode.mockReturnValue(null);

        await authService.logout(req, res);
        
        expect(usersService.removeRefreshToken).not.toHaveBeenCalled();
        expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('refreshTokens', () => {
    const res = mockResponse();

    it('should throw UnauthorizedException if no refresh token', async () => {
        const req = mockRequest({}, {});
        await expect(authService.refreshTokens(req, res)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if invalid token (verify fails)', async () => {
        const req = mockRequest({ refreshToken: 'bad_token' });
        mockJwtService.verify.mockImplementation(() => { throw new Error(); });
        await expect(authService.refreshTokens(req, res)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found or no hashedRT', async () => {
        const req = mockRequest({ refreshToken: 'valid_token' });
        mockJwtService.verify.mockReturnValue({ sub: 1 });
        mockUsersService.findById.mockResolvedValue(null);
        await expect(authService.refreshTokens(req, res)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if refresh tokens do not match', async () => {
        const req = mockRequest({ refreshToken: 'valid_token' });
        mockJwtService.verify.mockReturnValue({ sub: 1 });
        mockUsersService.findById.mockResolvedValue({ id: 1, email: 'test@example.com', hashedRefreshToken: 'hash' });
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);
        await expect(authService.refreshTokens(req, res)).rejects.toThrow(UnauthorizedException);
    });

    it('should return new tokens on success', async () => {
        const req = mockRequest({ refreshToken: 'valid_token' });
        mockJwtService.verify.mockReturnValue({ sub: 1 });
        mockUsersService.findById.mockResolvedValue({ id: 1, email: 'test@example.com', hashedRefreshToken: 'hash' });
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        mockJwtService.sign.mockReturnValue('new_token');
        (bcrypt.hash as jest.Mock).mockResolvedValue('new_hash');

        const result = await authService.refreshTokens(req, res);

        expect(result.statusCode).toBe(HttpStatus.OK);
        expect(result.data.accessToken).toBe('new_token');
        expect(res.cookie).toHaveBeenCalled();
        expect(usersService.setRefreshToken).toHaveBeenCalledWith(1, 'new_hash');
    });
  });
});
