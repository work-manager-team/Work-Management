import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty({ message: 'Token không được để trống' })
  token: string;
}
