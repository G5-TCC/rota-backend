import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
  IsOptional,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'johndoe',
    minLength: 3,
    maxLength: 30,
    description:
      'Nome de usuário único. Deve conter apenas letras, números e hifens.',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'Alias can only contain letters, numbers and hyphens',
  })
  alias: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'E-mail principal do usuário para login e notificações.',
  })
  @IsEmail()
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({
    example: 'P@ssw0rd123',
    minLength: 6,
    maxLength: 72,
    description: 'Senha segura. Mínimo de 6 caracteres.',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MaxLength(72)
  password: string;

  @ApiProperty({
    example: false,
    required: false,
    description: 'Se verdadeiro, a sessão será estendida.',
  })
  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token de recuperação enviado por e-mail.' })
  @IsString()
  token: string;

  @ApiProperty({ minLength: 6, description: 'Nova senha do usuário.' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class TwoFactorVerifyDto {
  @ApiProperty({
    example: '123456',
    description: 'Código de 6 dígitos gerado pelo app de 2FA.',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code: string;

  @ApiProperty({
    description:
      'Token parcial obtido após login bem-sucedido com 2FA ativado.',
  })
  @IsString()
  partialToken: string;
}

export class VerifyEmailDto {
  @ApiProperty({
    example: 'a1b2c3d4e5f6g7h8i9j0',
    description:
      'Token de verificação enviado para o e-mail do usuário após o registro.',
  })
  @IsString()
  token: string;
}
