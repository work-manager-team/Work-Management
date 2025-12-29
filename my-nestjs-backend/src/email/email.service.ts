import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.warn('SMTP credentials not configured. Email sending will be disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Verify connection
    try {
      await this.transporter.verify();
      this.logger.log('✅ Email service initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize email service:', error);
    }
  }

  /**
   * Load and compile email template
   */
  private loadTemplate(templateName: string, context: Record<string, any>): string {
    try {
      const templatePath = path.join(
        __dirname,
        'templates',
        `${templateName}.hbs`,
      );

      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      const template = Handlebars.compile(templateSource);

      return template(context);
    } catch (error) {
      this.logger.error(`Failed to load template ${templateName}:`, error);
      throw error;
    }
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not configured. Skipping email send.');
      return;
    }

    try {
      const html = this.loadTemplate(options.template, options.context);

      const emailFrom = this.configService.get<string>('EMAIL_FROM') || this.configService.get<string>('SMTP_USER');

      const info = await this.transporter.sendMail({
        from: `"${this.configService.get<string>('APP_NAME') || 'Work Management'}" <${emailFrom}>`,
        to: options.to,
        subject: options.subject,
        html,
      });

      this.logger.log(`Email sent successfully to ${options.to}. Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email: string, name: string, verificationLink: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Xác thực email của bạn',
      template: 'verify-email',
      context: {
        name,
        verificationLink,
        appName: this.configService.get<string>('APP_NAME') || 'Work Management',
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, name: string, resetLink: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Đặt lại mật khẩu của bạn',
      template: 'reset-password',
      context: {
        name,
        resetLink,
        appName: this.configService.get<string>('APP_NAME') || 'Work Management',
      },
    });
  }

  /**
   * Send email change verification
   */
  async sendEmailChangeVerification(newEmail: string, name: string, verificationLink: string): Promise<void> {
    await this.sendEmail({
      to: newEmail,
      subject: 'Xác nhận thay đổi email',
      template: 'email-change',
      context: {
        name,
        verificationLink,
        newEmail,
        appName: this.configService.get<string>('APP_NAME') || 'Work Management',
      },
    });
  }

  /**
   * Send magic link email
   */
  async sendMagicLinkEmail(email: string, name: string, magicLink: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Đăng nhập không cần mật khẩu',
      template: 'magic-link',
      context: {
        name,
        magicLink,
        appName: this.configService.get<string>('APP_NAME') || 'Work Management',
      },
    });
  }

  /**
   * Send OTP email
   */
  async sendOTPEmail(email: string, name: string, otp: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Mã OTP đăng nhập của bạn',
      template: 'otp',
      context: {
        name,
        otp,
        appName: this.configService.get<string>('APP_NAME') || 'Work Management',
      },
    });
  }
}
