import { validate } from 'class-validator';
import { SignInDto } from '../../../../../src/modules/auth/dto/signin.dto';

describe('SignInDto', () => {
  it('should pass with valid credentials', async () => {
    const dto = new SignInDto();
    dto.userName = 'testuser';
    dto.password = 'somePassword';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if userName is not a string', async () => {
    const dto = new SignInDto();
    // @ts-ignore
    dto.userName = 123;
    dto.password = 'somePassword';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const userNameError = errors.find((error) => error.property === 'userName');
    expect(userNameError).toBeDefined();
    expect(userNameError?.constraints).toHaveProperty('isString');
  });

  it('should fail if password is not a string', async () => {
    const dto = new SignInDto();
    dto.userName = 'testuser';
    // @ts-ignore
    dto.password = 123;
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const passwordError = errors.find((error) => error.property === 'password');
    expect(passwordError).toBeDefined();
    expect(passwordError?.constraints).toHaveProperty('isString');
  });
});
