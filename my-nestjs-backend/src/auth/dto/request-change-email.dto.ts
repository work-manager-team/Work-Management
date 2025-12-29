import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestChangeEmailDto {
  @IsEmail({}, { message: 'Email mới không hợp lệ' })
  @IsNotEmpty({ message: 'Email mới không được để trống' })
  newEmail: string;
}
