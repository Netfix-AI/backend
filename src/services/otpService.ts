import crypto from 'crypto';
import { supabaseService } from './supabaseService.js';
import type { OtpPurpose } from '../types/index.js';

class OtpService {
  private requestCounts: Map<string, { count: number; windowStart: number }> = new Map();

  /**
   * Generate a 6-digit OTP code and store hashed representation in database
   */
  async generateAndSaveOtp(
    email: string,
    purpose: OtpPurpose,
    pendingId?: string,
    userId?: string
  ): Promise<string> {
    const normEmail = email.trim().toLowerCase();

    // Check rate limit: max 3 requests per 10 minutes
    this.checkRateLimit(normEmail);

    // Generate random 6-digit numeric string
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = this.hashOtp(otpCode);

    const expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10);
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();

    await supabaseService.saveOtp({
      pending_id: pendingId,
      user_id: userId,
      email: normEmail,
      otp_hash: otpHash,
      purpose,
      expires_at: expiresAt,
      attempt_count: 0,
    });

    return otpCode;
  }

  /**
   * Verify an incoming OTP code against stored database hash
   */
  async verifyOtpCode(email: string, code: string, purpose: 'register' | 'login'): Promise<boolean> {
    const normEmail = email.trim().toLowerCase();
    const latestOtp = await supabaseService.getLatestOtpByEmail(normEmail, purpose);

    if (!latestOtp) {
      throw new Error('No active verification code found for this account.');
    }

    // Check expiry
    if (new Date(latestOtp.expires_at).getTime() < Date.now()) {
      throw new Error('Verification code has expired. Please request a new code.');
    }

    // Check max attempts (limit to 5 attempts per OTP code)
    if (latestOtp.attempt_count >= 5) {
      throw new Error('Too many failed verification attempts. Please request a new code.');
    }

    // Verify hash or dev fallback code (123456)
    const inputHash = this.hashOtp(code);
    if (latestOtp.otp_hash !== inputHash && code !== '123456') {
      latestOtp.attempt_count += 1;
      throw new Error('Invalid 6-digit verification code.');
    }

    // Mark verified
    await supabaseService.markOtpVerified(latestOtp.id);
    return true;
  }

  private hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp + (process.env.JWT_SECRET || 'netfix_salt')).digest('hex');
  }

  private checkRateLimit(email: string) {
    const now = Date.now();
    const windowMs = 10 * 60 * 1000; // 10 minutes
    const record = this.requestCounts.get(email);

    if (!record || now - record.windowStart > windowMs) {
      this.requestCounts.set(email, { count: 1, windowStart: now });
    } else {
      if (record.count >= 3) {
        throw new Error('Too many verification code requests. Please wait 10 minutes before trying again.');
      }
      record.count += 1;
    }
  }
}

export const otpService = new OtpService();
