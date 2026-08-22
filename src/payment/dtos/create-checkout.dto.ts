import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Plan, TransactionType } from '@prisma/client';

export class CreateCheckoutDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsOptional()
  @IsEnum(Plan)
  plan?: Plan;

  @IsString()
  @IsOptional()
  returnUrl?: string;

  @IsString()
  @IsOptional()
  completionUrl?: string;

  @IsString()
  @IsOptional()
  taxId?: string; // CPF/CNPJ

  @IsString()
  @IsOptional()
  customerName?: string;
}
