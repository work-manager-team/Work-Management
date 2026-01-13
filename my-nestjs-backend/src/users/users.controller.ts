// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthService } from '../auth/auth.service';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AttachmentsService } from '../attachments/attachments.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { FileValidationPipe } from '../common/pipes/file-validation.pipe';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly attachmentsService: AttachmentsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const user = await this.usersService.create(createUserDto);

    // Generate access token
    const accessToken = this.authService.generateAccessToken(user as any);

    // Set httpOnly cookie with 7 days expiry
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      statusCode: 201,
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
      user,
      accessToken,
    });
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginUserDto, @Res() res: Response) {
    const user = await this.usersService.validateUser(loginDto);
    if (!user) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Email/Username hoặc password không đúng',
      });
    }

    // Generate access token
    const accessToken = this.authService.generateAccessToken(user as any);

    // Set httpOnly cookie with 7 days expiry
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      statusCode: 200,
      message: 'Đăng nhập thành công',
      user,
      accessToken,
    });
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(
      id,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
    return {
      statusCode: 200,
      message: 'Đổi mật khẩu thành công',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  /**
   * Upload user avatar
   */
  @Post('avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile(
      new FileValidationPipe({
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser('userId') userId: number,
  ) {
    // Delete old avatar if exists
    const oldAvatar = await this.attachmentsService.findUserAvatar(userId);
    if (oldAvatar) {
      await this.attachmentsService.remove(oldAvatar.id, userId);
    }

    // Upload new avatar
    const attachment = await this.attachmentsService.create(file, {
      uploadedBy: userId,
      entityType: 'user_avatar',
      entityId: userId,
    });

    // Update user's avatar URL in database
    await this.usersService.updateAvatar(userId, attachment.secureUrl, attachment.publicId);

    return {
      message: 'Avatar uploaded successfully',
      avatar: {
        id: attachment.id,
        url: attachment.secureUrl,
        thumbnail: this.cloudinaryService.getAvatarUrl(attachment.publicId, 150),
        small: this.cloudinaryService.getAvatarUrl(attachment.publicId, 50),
      },
    };
  }

  /**
   * Delete user avatar
   */
  @Delete('avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAvatar(@CurrentUser('userId') userId: number) {
    const avatar = await this.attachmentsService.findUserAvatar(userId);

    if (avatar) {
      await this.attachmentsService.remove(avatar.id, userId);
      // Clear avatar URL in users table
      await this.usersService.updateAvatar(userId, null, null);
    }

    return;
  }

  /**
   * Get user avatar
   */
  @Public()
  @Get(':id/avatar')
  async getUserAvatar(@Param('id', ParseIntPipe) id: number) {
    const avatar = await this.attachmentsService.findUserAvatar(id);

    if (!avatar) {
      return {
        message: 'User has no avatar',
        avatar: null,
      };
    }

    return {
      avatar: {
        id: avatar.id,
        url: avatar.secureUrl,
        thumbnail: this.cloudinaryService.getAvatarUrl(avatar.publicId, 150),
        small: this.cloudinaryService.getAvatarUrl(avatar.publicId, 50),
      },
    };
  }
}