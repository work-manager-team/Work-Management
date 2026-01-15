import { IsString, IsNotEmpty, MinLength, IsEmail } from 'class-validator';

/**
 * DTO for resetting password with OTP
 */
export class ResetPasswordOtpDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  otp: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  newPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống' })
  confirmPassword: string;
}
