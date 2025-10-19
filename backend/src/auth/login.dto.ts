import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'sundly@live.fr' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Madinalake_3' })
   @IsString()
    @MinLength(6)
  password: string;
}