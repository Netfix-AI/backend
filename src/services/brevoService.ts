class BrevoService {
  private apiKey: string | undefined;
  private senderEmail: string;
  private senderName: string;

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    this.senderEmail = process.env.BREVO_SENDER_EMAIL || 'notifications@netfixai.com';
    this.senderName = process.env.BREVO_SENDER_NAME || 'Netfix AI — MARG GROUP';
  }

  /**
   * Send transactional OTP verification email via Brevo API
   */
  async sendOtpEmail(recipientEmail: string, recipientName: string, otpCode: string, purpose: 'registration' | 'login'): Promise<{ success: boolean; messageId?: string }> {
    if (!this.apiKey || this.apiKey.trim() === '' || this.apiKey.includes('your-brevo-api-key')) {
      console.warn(`[BrevoService] Warning: BREVO_API_KEY not configured. Cannot send OTP email to ${recipientEmail}.`);
      throw new Error('Email service configuration missing. Please configure BREVO_API_KEY in backend environment.');
    }

    const subject = purpose === 'registration'
      ? 'NETFIX AI — Verify Your Registration Code'
      : 'NETFIX AI — Your Login Verification Code';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; background-color: #07090F; color: #F5F7FA; margin: 0; padding: 40px 20px; }
          .container { max-width: 520px; margin: 0 auto; background-color: #0C101A; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .brand { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
          .sub-brand { font-size: 11px; font-weight: 700; color: #20E0C2; tracking-wider: uppercase; }
          .title { font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 24px; margin-bottom: 8px; }
          .subtitle { font-size: 13px; color: #A6AFBF; margin-bottom: 24px; leading-relaxed: 1.5; }
          .otp-box { background: rgba(32,224,194,0.08); border: 1px solid rgba(32,224,194,0.3); border-radius: 16px; text-align: center; padding: 20px; margin: 24px 0; }
          .otp-code { font-family: ui-monospace, monospace; font-size: 32px; font-weight: 900; letter-spacing: 10px; color: #20E0C2; margin: 0; }
          .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 11px; color: #6F7889; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="brand">NETFIX AI</div>
          <div class="sub-brand">MARG GROUP PLATFORM</div>
          
          <div class="title">Verification Code</div>
          <div class="subtitle">Hello ${recipientName || 'User'}, enter the 6-digit verification code below to complete your ${purpose}:</div>
          
          <div class="otp-box">
            <p class="otp-code">${otpCode}</p>
          </div>
          
          <p style="font-size: 12px; color: #A6AFBF; text-align: center;">This code expires in approximately <strong>10 minutes</strong>. If you did not request this code, please ignore this email.</p>
          
          <div class="footer">
            NETFIX AI • MARG GROUP — Smarter Law. Stronger Decisions.<br>
            Secure Transactional System • Do not reply to this email.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          sender: { name: this.senderName, email: this.senderEmail },
          to: [{ email: recipientEmail, name: recipientName || recipientEmail }],
          subject: subject,
          htmlContent: htmlContent,
        }),
      });

      if (!response.ok) {
        const errorData: any = await response.json().catch(() => ({}));
        console.error('[BrevoService] Error response from Brevo API:', errorData);
        throw new Error('Unable to send verification code email via Brevo service.');
      }

      const data: any = await response.json();
      return { success: true, messageId: data.messageId };
    } catch (err: any) {
      console.error('[BrevoService] Request failed:', err.message);
      throw new Error(err.message || 'Unable to send verification code. Please try again.');
    }
  }
}

export const brevoService = new BrevoService();
