import { validate } from 'class-validator';
import { SignUpDto } from '../../../../../src/modules/auth/dto/signup.dto';

describe('SignUpDto', () => {
  it('should pass with a strong password', async () => {
    const dto = new SignUpDto();
    dto.email = 'test@example.com';
    dto.userName = 'testuser';
    dto.password = 'StrongP@ssw0rd'; // valid
    dto.passwordConfirm = 'StrongP@ssw0rd';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with a weak password (no number)', async () => {
    const dto = new SignUpDto();
    dto.email = 'test@example.com';
    dto.userName = 'testuser';
    dto.password = 'WeakPassword!'; // no number
    dto.passwordConfirm = 'WeakPassword!';

    const errors = await validate(dto);
    const passwordError = errors.find((error) => error.property === 'password');
    expect(passwordError).toBeDefined();
    expect(passwordError?.constraints).toHaveProperty('matches');
  });

  it('should fail with a weak password (no uppercase)', async () => {
    const dto = new SignUpDto();
    dto.email = 'test@example.com';
    dto.userName = 'testuser';
    dto.password = 'weakpassword1!'; // no uppercase
    dto.passwordConfirm = 'weakpassword1!';

    const errors = await validate(dto);
    const passwordError = errors.find((error) => error.property === 'password');
    expect(passwordError).toBeDefined();
  });

  it('should fail with a weak password (no special char)', async () => {
    const dto = new SignUpDto();
    dto.email = 'test@example.com';
    dto.userName = 'testuser';
    dto.password = 'WeakPassword1'; // no special char
    dto.passwordConfirm = 'WeakPassword1';

    const errors = await validate(dto);
    const passwordError = errors.find((error) => error.property === 'password');
    expect(passwordError).toBeDefined();
  });
  
  it('should fail with a weak password (too short)', async () => {
    const dto = new SignUpDto();
    dto.email = 'test@example.com';
    dto.userName = 'testuser';
    dto.password = 'Short1!'; 
    dto.passwordConfirm = 'Short1!';

    const errors = await validate(dto);
    const passwordError = errors.find((error) => error.property === 'password');
    expect(passwordError).toBeDefined();
    // It might fail on minLength as well
  });
});
