import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class BankDetailsDto {
  @IsString()
  @IsNotEmpty()
  accountHolderName: string;

  @IsString()
  @Matches(/^\d{9,18}$/, { message: 'Account number must be 9-18 digits' })
  accountNumber: string;

  @IsString()
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'Invalid IFSC code' })
  ifscCode: string;

  @IsString()
  @IsNotEmpty()
  bankName: string;

  @IsOptional()
  @IsString()
  upiId?: string;
}
