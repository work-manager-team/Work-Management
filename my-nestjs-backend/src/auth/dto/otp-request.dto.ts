import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class OtpRequestDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;
}

export class OtpVerifyDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsString()
  @Length(6, 6, { message: 'OTP phải có đúng 6 ký tự' })
  @IsNotEmpty({ message: 'OTP không được để trống' })
  otp: string;
}
