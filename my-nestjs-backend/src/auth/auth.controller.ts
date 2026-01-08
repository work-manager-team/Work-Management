import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { EmailService } from '../email/email.service';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RequestChangeEmailDto } from './dto/request-change-email.dto';
import { MagicLinkRequestDto } from './dto/magic-link-request.dto';
import { OtpRequestDto, OtpVerifyDto } from './dto/otp-request.dto';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Verify email with token (POST - for API calls)
   */
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    const user = await this.authService.verifyEmail(verifyEmailDto.token);

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      statusCode: 200,
      message: 'Email đã được xác thực thành công',
      user: userWithoutPassword,
    };
  }

  /**
   * Verify email with token (GET - for email links)
   * User clicks link in email → directly verifies
   */
  @Get('verify-email/:token')
  @HttpCode(HttpStatus.OK)
  async verifyEmailViaLink(@Req() req: Request, @Res() res: Response) {
    try {
      const token = req.params.token;
      const user = await this.authService.verifyEmail(token);

      const { passwordHash, ...userWithoutPassword } = user;

      return res.status(200).json({
        statusCode: 200,
        message: 'Email đã được xác thực thành công! Bạn có thể đóng trang này và đăng nhập.',
        user: userWithoutPassword,
        success: true,
      });
    } catch (error) {
      return res.status(400).json({
        statusCode: 400,
        message: error.message || 'Xác thực email thất bại',
        success: false,
      });
    }
  }

  /**
   * Resend verification email
   */
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() resendDto: ResendVerificationDto) {
    const user = await this.authService.getUserByEmail(resendDto.email);

    if (!user) {
      throw new NotFoundException('Email không tồn tại trong hệ thống');
    }

    if (user.status === 'active' && user.emailVerifiedAt) {
      throw new BadRequestException('Email đã được xác thực rồi');
    }

    // Generate new token
    const token = this.authService.generateToken(user.id, user.email, 'email_verification');

    // Build verification link - point to API endpoint
    const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/auth/verify-email/${token}`;

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        user.fullName || user.username,
        verificationLink,
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    return {
      statusCode: 200,
      message: 'Email xác thực đã được gửi lại',
      token, // Return token for testing
      userId: user.id,
      email: user.email,
    };
  }

  /**
   * Request password reset
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.authService.getUserByEmail(forgotPasswordDto.email);

    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return {
        statusCode: 200,
        message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi',
      };
    }

    // Generate reset token
    const token = this.authService.generateToken(user.id, user.email, 'password_reset');

    // Build reset link - Note: For password reset, we might want to redirect to frontend with token
    // since user needs to enter new password in a form
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.fullName || user.username,
        resetLink,
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }

    return {
      statusCode: 200,
      message: 'Link đặt lại mật khẩu đã được gửi đến email của bạn',
      token, // Return token for testing
      userId: user.id,
      email: user.email,
    };
  }

  /**
   * Reset password with token
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);

    return {
      statusCode: 200,
      message: 'Mật khẩu đã được đặt lại thành công',
    };
  }

  /**
   * Request email change (must be authenticated)
   * Note: In real app, you should add AuthGuard to get userId from JWT
   */
  @Post('request-change-email')
  @HttpCode(HttpStatus.OK)
  async requestChangeEmail(@Body() requestDto: RequestChangeEmailDto) {
    // TODO: Get userId from JWT token (AuthGuard)
    const userId = 1; // Hardcoded for now

    const user = await this.authService.getUserById(userId);

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Check if new email is the same as current
    if (user.email === requestDto.newEmail) {
      throw new BadRequestException('Email mới trùng với email hiện tại');
    }

    // Check if new email already exists
    const existingUser = await this.authService.getUserByEmail(requestDto.newEmail);
    if (existingUser) {
      throw new BadRequestException('Email mới đã được sử dụng');
    }

    // Generate token with newEmail
    const token = this.authService.generateToken(user.id, user.email, 'email_change', {
      newEmail: requestDto.newEmail,
    });

    return {
      statusCode: 200,
      message: 'Email xác thực đã được gửi đến email mới',
      token, // Return token for EmailService to use
      userId: user.id,
      oldEmail: user.email,
      newEmail: requestDto.newEmail,
    };
  }

  /**
   * Verify email change with token
   */
  @Post('verify-email-change')
  @HttpCode(HttpStatus.OK)
  async verifyEmailChange(@Body() verifyDto: VerifyEmailDto) {
    const user = await this.authService.verifyEmailChange(verifyDto.token);

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      statusCode: 200,
      message: 'Email đã được thay đổi thành công',
      user: userWithoutPassword,
    };
  }

  /**
   * Request magic link (passwordless login)
   */
  @Post('magic-link/request')
  @HttpCode(HttpStatus.OK)
  async requestMagicLink(@Body() requestDto: MagicLinkRequestDto) {
    const user = await this.authService.getUserByEmail(requestDto.email);

    if (!user) {
      // Don't reveal if email exists or not
      return {
        statusCode: 200,
        message: 'Nếu email tồn tại, magic link đã được gửi',
      };
    }

    if (user.status !== 'active') {
      throw new BadRequestException('Tài khoản chưa được kích hoạt');
    }

    // Generate magic link token
    const token = this.authService.generateToken(user.id, user.email, 'magic_link');

    // Build magic link - point to API endpoint
    const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
    const magicLink = `${baseUrl}/auth/magic-link/${token}`;

    // Send magic link email
    try {
      await this.emailService.sendMagicLinkEmail(
        user.email,
        user.fullName || user.username,
        magicLink,
      );
    } catch (error) {
      console.error('Failed to send magic link email:', error);
    }

    return {
      statusCode: 200,
      message: 'Magic link đã được gửi đến email của bạn',
      token, // Return token for testing
      userId: user.id,
      email: user.email,
    };
  }

  /**
   * Verify magic link and login (POST - for API calls)
   */
  @Post('magic-link/verify')
  @HttpCode(HttpStatus.OK)
  async verifyMagicLink(@Body() verifyDto: VerifyEmailDto, @Res() res: Response) {
    const user = await this.authService.verifyMagicLink(verifyDto.token);

    // Generate access token
    const accessToken = this.authService.generateAccessToken(user);

    // Set httpOnly cookie with 7 days expiry
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return res.status(200).json({
      statusCode: 200,
      message: 'Đăng nhập thành công',
      user: userWithoutPassword,
      accessToken, // Also return in body for testing
    });
  }

  /**
   * Verify magic link and login (GET - for email links)
   * User clicks magic link in email → directly logs in
   */
  @Get('magic-link/:token')
  @HttpCode(HttpStatus.OK)
  async verifyMagicLinkViaLink(@Req() req: Request, @Res() res: Response) {
    try {
      const token = req.params.token;
      const user = await this.authService.verifyMagicLink(token);

      // Generate access token
      const accessToken = this.authService.generateAccessToken(user);

      // Set httpOnly cookie with 7 days expiry
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      });

      const { passwordHash, ...userWithoutPassword } = user;

      return res.status(200).json({
        statusCode: 200,
        message: 'Đăng nhập thành công! Bạn đã được xác thực.',
        user: userWithoutPassword,
        accessToken,
        success: true,
      });
    } catch (error) {
      return res.status(400).json({
        statusCode: 400,
        message: error.message || 'Magic link không hợp lệ hoặc đã hết hạn',
        success: false,
      });
    }
  }

  /**
   * Request OTP code
   */
  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  async requestOTP(@Body() requestDto: OtpRequestDto) {
    const user = await this.authService.getUserByEmail(requestDto.email);

    if (!user) {
      // Don't reveal if email exists or not
      return {
        statusCode: 200,
        message: 'Nếu email tồn tại, OTP đã được gửi',
      };
    }

    if (user.status !== 'active') {
      throw new BadRequestException('Tài khoản chưa được kích hoạt');
    }

    // Generate OTP
    const otp = this.authService.generateOTP();

    // Store OTP
    this.authService.storeOTP(user.email, otp);

    // Send OTP email
    try {
      await this.emailService.sendOTPEmail(
        user.email,
        user.fullName || user.username,
        otp,
      );
    } catch (error) {
      console.error('Failed to send OTP email:', error);
    }

    return {
      statusCode: 200,
      message: 'OTP đã được gửi đến email của bạn',
      otp, // Return OTP for testing (remove in production!)
      userId: user.id,
      email: user.email,
    };
  }

  /**
   * Verify OTP and login
   */
  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOTP(@Body() verifyDto: OtpVerifyDto, @Res() res: Response) {
    const user = await this.authService.verifyOTP(verifyDto.email, verifyDto.otp);

    // Generate access token
    const accessToken = this.authService.generateAccessToken(user);

    // Set httpOnly cookie with 7 days expiry
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return res.status(200).json({
      statusCode: 200,
      message: 'Đăng nhập thành công với OTP',
      user: userWithoutPassword,
      accessToken, // Also return in body for testing
    });
  }

  /**
   * Google OAuth - Initiate authentication
   */
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Req() req: Request) {
    // Guard redirects to Google
  }

  /**
   * Google OAuth - Callback URL
   */
  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      // Validate and get/create user from Google profile
      const user = await this.authService.validateGoogleUser(req.user as any);

      // Generate access token
      const accessToken = this.authService.generateAccessToken(user);

      // Set httpOnly cookie with 7 days expiry
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      });

      // Remove sensitive data
      const { passwordHash, googleId, ...userWithoutSensitiveData } = user;

      // Return success response
      return res.status(200).json({
        statusCode: 200,
        message: 'Đăng nhập Google thành công',
        user: userWithoutSensitiveData,
        accessToken, // Also return in body for testing (can be removed in production)
      });
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        message: 'Đăng nhập Google thất bại',
        error: error.message,
      });
    }
  }

  /**
   * Logout - Clear cookie
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res() res: Response) {
    res.clearCookie('access_token');
    return res.status(200).json({
      statusCode: 200,
      message: 'Đăng xuất thành công',
    });
  }
}
