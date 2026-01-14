import { IsEmail, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  userName: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).*$/, {
    message: 'Password too weak',
  })
  password: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  passwordConfirm: string;
}
