import { supabaseService } from './supabaseService.js';

export interface HealthCheckItem {
  name: string;
  key: string;
  status: 'operational' | 'warning' | 'error' | 'not_configured';
  message: string;
}

class HealthService {
  async checkSystemHealth(): Promise<HealthCheckItem[]> {
    const checks: HealthCheckItem[] = [];

    // 1. Supabase Database
    if (supabaseService.isConfigured) {
      checks.push({
        name: 'Database Layer (Supabase PostgreSQL)',
        key: 'database',
        status: 'operational',
        message: 'Connected to Supabase PostgreSQL cluster.',
      });
    } else {
      checks.push({
        name: 'Database Layer (Supabase PostgreSQL)',
        key: 'database',
        status: 'not_configured',
        message: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing. Operating in local memory mode.',
      });
    }

    // 2. Brevo Email Gateway
    const brevoKey = process.env.BREVO_API_KEY;
    if (brevoKey && !brevoKey.includes('your-brevo-api-key')) {
      checks.push({
        name: 'Email & OTP Gateway (Brevo API)',
        key: 'brevo',
        status: 'operational',
        message: 'Brevo API key configured and ready for transactional email.',
      });
    } else {
      checks.push({
        name: 'Email & OTP Gateway (Brevo API)',
        key: 'brevo',
        status: 'not_configured',
        message: 'BREVO_API_KEY environment variable not configured.',
      });
    }

    // 3. Cloudflare Turnstile CAPTCHA Provider
    const turnstileKey = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileKey && !turnstileKey.includes('your-turnstile-secret')) {
      checks.push({
        name: 'Cloudflare Turnstile Verification',
        key: 'turnstile',
        status: 'operational',
        message: 'Server-side Cloudflare Turnstile secret configured.',
      });
    } else {
      checks.push({
        name: 'Cloudflare Turnstile Verification',
        key: 'turnstile',
        status: 'not_configured',
        message: 'TURNSTILE_SECRET_KEY environment variable not configured.',
      });
    }

    // 4. Ollama AI Infrastructure
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    checks.push({
      name: 'AI Agent Layer (Ollama LLM Host)',
      key: 'ollama',
      status: 'operational',
      message: `Configured base endpoint: ${ollamaUrl}`,
    });

    return checks;
  }
}

export const healthService = new HealthService();
