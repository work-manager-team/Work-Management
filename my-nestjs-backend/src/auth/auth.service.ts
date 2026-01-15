import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { DRIZZLE } from '../db/database.module';
import { users, User } from '../db/schema';
import * as schema from '../db/schema';

// Token types
export type TokenType =
  | 'email_verification'
  | 'password_reset'
  | 'email_change'
  | 'magic_link'
  | 'otp'
  | 'access_token';

// Token payload interface
export interface TokenPayload {
  userId: number;
  email: string;
  type: TokenType;
  newEmail?: string; // For email change
  otp?: string; // For OTP verification
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  // In-memory OTP storage (for development - should use Redis in production)
  private otpStore: Map<string, { otp: string; expiresAt: Date }> = new Map();

  constructor(
    @Inject(DRIZZLE) private db: NeonHttpDatabase<typeof schema>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Generate JWT token for various auth purposes
   */
  generateToken(
    userId: number,
    email: string,
    type: TokenType,
    additionalData?: { newEmail?: string; otp?: string },
  ): string {
    let expiresIn: string;

    // Set expiration based on type
    switch (type) {
      case 'email_verification':
        expiresIn = this.configService.get('EMAIL_VERIFICATION_EXPIRY') || '3h';
        break;
      case 'password_reset':
        expiresIn = this.configService.get('PASSWORD_RESET_EXPIRY') || '1h';
        break;
      case 'email_change':
        expiresIn = '3h';
        break;
      case 'magic_link':
        expiresIn = '15m'; // Magic link có thời hạn ngắn
        break;
      case 'otp':
        expiresIn = '10m'; // OTP có thời hạn rất ngắn
        break;
      case 'access_token':
        expiresIn = '7d'; // Access token có thời hạn 7 ngày
        break;
      default:
        expiresIn = '1h';
    }

    const payload: any = {
      userId,
      email,
      type,
      ...additionalData,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_EMAIL_SECRET') || 'your-secret-key-change-this',
      expiresIn: expiresIn,
    } as any);
  }

  /**
   * Verify and decode JWT token
   */
  async verifyToken(token: string, expectedType: TokenType): Promise<TokenPayload> {
    try {
      const payload = this.jwtService.verify<TokenPayload>(token, {
        secret: this.configService.get('JWT_EMAIL_SECRET') || 'your-secret-key-change-this',
      });

      // Check token type
      if (payload.type !== expectedType) {
        throw new BadRequestException('Token không hợp lệ cho hành động này');
      }

      return payload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Token đã hết hạn');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new BadRequestException('Token không hợp lệ');
      }
      throw error;
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<User> {
    const payload = await this.verifyToken(token, 'email_verification');

    // Find user
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId));

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Check if already verified
    if (user.status === 'active' && user.emailVerifiedAt) {
      throw new BadRequestException('Email đã được xác thực rồi');
    }

    // Update user status
    const [updatedUser] = await this.db
      .update(users)
      .set({
        status: 'active',
        emailVerifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, payload.userId))
      .returning();

    return updatedUser;
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const payload = await this.verifyToken(token, 'password_reset');

    // Find user
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId));

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, payload.userId));
  }

  /**
   * Verify email change
   */
  async verifyEmailChange(token: string): Promise<User> {
    const payload = await this.verifyToken(token, 'email_change');

    if (!payload.newEmail) {
      throw new BadRequestException('Token không chứa email mới');
    }

    // Check if new email already exists
    const [existingUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, payload.newEmail));

    if (existingUser) {
      throw new BadRequestException('Email mới đã được sử dụng');
    }

    // Update email
    const [updatedUser] = await this.db
      .update(users)
      .set({
        email: payload.newEmail,
        updatedAt: new Date(),
      })
      .where(eq(users.id, payload.userId))
      .returning();

    return updatedUser;
  }

  /**
   * Verify magic link and login user
   */
  async verifyMagicLink(token: string): Promise<User> {
    const payload = await this.verifyToken(token, 'magic_link');

    // Find user
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId));

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new UnauthorizedException('Tài khoản chưa được kích hoạt');
    }

    // Update last login
    await this.db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, payload.userId));

    return user;
  }

  /**
   * Generate OTP code
   */
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Store OTP in memory (use Redis in production)
   */
  storeOTP(email: string, otp: string): void {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

    this.otpStore.set(email.toLowerCase(), { otp, expiresAt });

    // Clean up expired OTPs
    setTimeout(() => {
      this.cleanupExpiredOTPs();
    }, 10 * 60 * 1000);
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(email: string, otp: string): Promise<User> {
    const stored = this.otpStore.get(email.toLowerCase());

    if (!stored) {
      throw new BadRequestException('OTP không tồn tại hoặc đã hết hạn');
    }

    // Check expiration
    if (new Date() > stored.expiresAt) {
      this.otpStore.delete(email.toLowerCase());
      throw new BadRequestException('OTP đã hết hạn');
    }

    // Check OTP match
    if (stored.otp !== otp) {
      throw new BadRequestException('OTP không đúng');
    }

    // Find user
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new UnauthorizedException('Tài khoản chưa được kích hoạt');
    }

    // Delete OTP after successful verification
    this.otpStore.delete(email.toLowerCase());

    // Update last login
    await this.db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return user;
  }

  /**
   * Clean up expired OTPs
   */
  private cleanupExpiredOTPs(): void {
    const now = new Date();
    for (const [email, data] of this.otpStore.entries()) {
      if (now > data.expiresAt) {
        this.otpStore.delete(email);
      }
    }
  }

  /**
   * Reset password with OTP (NEW)
   */
  async resetPasswordWithOtp(email: string, otp: string, newPassword: string): Promise<void> {
    const otpKey = `reset:${email.toLowerCase()}`;
    const stored = this.otpStore.get(otpKey);

    if (!stored) {
      throw new BadRequestException('Mã OTP không tồn tại hoặc đã hết hạn');
    }

    // Check expiration
    if (new Date() > stored.expiresAt) {
      this.otpStore.delete(otpKey);
      throw new BadRequestException('Mã OTP đã hết hạn');
    }

    // Check OTP match
    if (stored.otp !== otp) {
      throw new BadRequestException('Mã OTP không đúng');
    }

    // Find user
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await this.db
      .update(users)
      .set({
        passwordHash: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Delete OTP after successful reset
    this.otpStore.delete(otpKey);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return user;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: number): Promise<User | undefined> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    return user;
  }

  /**
   * Generate access token for authenticated user (7 days expiry)
   */
  generateAccessToken(user: User): string {
    return this.generateToken(user.id, user.email, 'access_token');
  }

  /**
   * Validate or create user from Google profile
   */
  async validateGoogleUser(googleProfile: {
    googleId: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    provider: string;
  }): Promise<User> {
    // Check if user already exists with Google ID
    const [existingUser] = await this.db
      .select()
      .from(users)
      .where(eq(users.googleId, googleProfile.googleId));

    if (existingUser) {
      // Update last login
      await this.db
        .update(users)
        .set({
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id));

      return existingUser;
    }

    // Check if user exists with the same email (link accounts)
    const [userWithEmail] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, googleProfile.email));

    if (userWithEmail) {
      // Link Google account to existing user
      const [updatedUser] = await this.db
        .update(users)
        .set({
          googleId: googleProfile.googleId,
          provider: 'google', // Update provider to google
          status: 'active', // Auto-activate since Google email is verified
          emailVerifiedAt: userWithEmail.emailVerifiedAt || new Date(),
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userWithEmail.id))
        .returning();

      return updatedUser;
    }

    // Create new user from Google profile
    // Generate username from email
    const username = googleProfile.email.split('@')[0] + '_' + Math.random().toString(36).substring(7);

    const [newUser] = await this.db
      .insert(users)
      .values({
        googleId: googleProfile.googleId,
        email: googleProfile.email,
        username: username,
        fullName: googleProfile.fullName,
        avatarUrl: googleProfile.avatarUrl,
        provider: 'google',
        status: 'active', // Auto-activate for Google users
        emailVerifiedAt: new Date(), // Google email is already verified
        lastLoginAt: new Date(),
      })
      .returning();

    return newUser;
  }
}
