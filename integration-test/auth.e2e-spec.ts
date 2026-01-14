import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseConfigService } from '../src/shared/src/config/database.config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseConfigService)
      .useValue({
        createTypeOrmOptions: (): TypeOrmModuleOptions => ({
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          autoLoadEntities: true,
          dropSchema: true,
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const signupDto = {
    email: 'test@example.com',
    password: 'StrongP@ssw0rd!',
    passwordConfirm: 'StrongP@ssw0rd!',
    userName: 'TestUser',
  };

  it('/v1/auth/signup (POST)', async () => {
    return request(app.getHttpServer())
      .post('/v1/auth/signup')
      .send(signupDto)
      .expect(201)
      .then((response) => {
        expect(response.body.data).toHaveProperty('accessToken');
        expect(response.body.message).toEqual('Signup successfully');
      });
  });

  it('/v1/auth/signin (POST)', async () => {
    // Signup first
    await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send(signupDto);

    return request(app.getHttpServer())
      .post('/v1/auth/signin')
      .send({
        userName: signupDto.userName,
        password: signupDto.password,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toHaveProperty('accessToken');
      });
  });
});
