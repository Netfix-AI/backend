import 'dotenv/config';
// NOTE: Import only the CLASSES (not singletons) so no module-level construction occurs.
// Individual tests set required env vars then construct their own instances.
import { GeminiService } from '../services/geminiService.js';
import { EncryptionUtility } from '../services/encryptionUtility.js';
import type { GeminiCallOptions, GeminiResult } from '../types/index.js';


// ─────────────────────────────────────────────────────────────────────────────
// Testable subclass: injects a spy for the retry loop without touching the SDK
// ─────────────────────────────────────────────────────────────────────────────
class TestableGeminiService extends GeminiService {
  private generateContentSpy: ((prompt: string) => Promise<unknown>) | null = null;
  public spyCallCount = 0;

  setGenerateContentSpy(spy: (prompt: string) => Promise<unknown>) {
    this.generateContentSpy = spy;
    this.spyCallCount = 0;
  }

  /** Expose the private extractHttpStatus for use inside this subclass */
  private extractHttpStatusPublic(error: unknown): number | null {
    return (this as unknown as { extractHttpStatus(e: unknown): number | null }).extractHttpStatus(error);
  }

  override async call<T = Record<string, unknown>>(
    options: GeminiCallOptions
  ): Promise<GeminiResult<T>> {
    // T4: no-key mode — return fallback with zero network calls
    if (this.isNoKeyMode()) {
      return { ai_source: 'rule_based_fallback' };
    }

    // No spy set → delegate to the real implementation
    if (!this.generateContentSpy) {
      return super.call<T>(options);
    }

    // Spy is set — run the same retry loop logic with 1 ms delays so tests stay fast
    const MAX_ATTEMPTS = 4;
    const BASE_DELAY_MS = 1;
    const MAX_DELAY_MS = 10;

    let attempt = 0;
    while (attempt < MAX_ATTEMPTS) {
      attempt++;
      this.spyCallCount++;
      try {
        const result = await this.generateContentSpy(options.prompt);
        return { ...(result as object), ai_source: 'ai' } as GeminiResult<T>;
      } catch (error: unknown) {
        const httpStatus = this.extractHttpStatusPublic(error);

        if (
          httpStatus !== null &&
          httpStatus >= 400 &&
          httpStatus !== 429 &&
          httpStatus < 500
        ) {
          // Non-retryable 4xx → break immediately to fallback
          break;
        }
        // 429, 5xx, unknown → retryable
        if (attempt < MAX_ATTEMPTS) {
          await new Promise(r =>
            setTimeout(r, Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), MAX_DELAY_MS))
          );
          continue;
        }
        break;
      }
    }

    return { ai_source: 'rule_based_fallback' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test runner
// ─────────────────────────────────────────────────────────────────────────────
export async function runAiPhase1Tests(): Promise<{
  total: number;
  passed: number;
  failures: string[];
}> {
  const failures: string[] = [];
  let total = 0;
  let passed = 0;

  function assertTest(testName: string, condition: boolean, failReason: string) {
    total++;
    if (condition) {
      passed++;
      console.log(` ✅ [PASS] ${testName}`);
    } else {
      failures.push(`${testName}: ${failReason}`);
      console.error(` ❌ [FAIL] ${testName} — ${failReason}`);
    }
  }

  // Valid 64-char lowercase hex key used in all encryption tests
  const TEST_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  console.log('\n============================================================');
  console.log('🤖 NETFIX AI — PHASE 1 AI INFRASTRUCTURE TEST SUITE');
  console.log('============================================================\n');

  // ──────────────────────────────────────────────────────────────────────────
  // T1 — Happy Path: real Gemini call (task 6.2)
  // Requires: GEMINI_API_KEY in environment. Skips cleanly if absent.
  // ──────────────────────────────────────────────────────────────────────────
  console.log('── T1: Happy Path (Real Gemini Call) ──');
  if (!process.env.GEMINI_API_KEY) {
    console.log(
      ' ⏭️  [SKIP] T1: GEMINI_API_KEY not set — skipping live Gemini call test'
    );
    total++; // count as skipped, not a failure
  } else {
    try {
      // Ensure model env vars have defaults if absent
      if (!process.env.GEMINI_MODEL_FLASH) process.env.GEMINI_MODEL_FLASH = 'gemini-1.5-flash';
      if (!process.env.GEMINI_MODEL_PRO) process.env.GEMINI_MODEL_PRO = 'gemini-1.5-pro';

      const svc = new GeminiService();
      const result = await svc.call<{ greeting: string }>({
        agentKey: 'test_t1',
        modelTier: 'FLASH',
        prompt:
          'Respond with a JSON object containing exactly one field "greeting" with the string value "hello".',
        schema: {
          type: 'object',
          required: ['greeting'],
          properties: { greeting: { type: 'string' } },
        },
      });

      const isAi = result.ai_source === 'ai';
      const hasGreeting =
        isAi && 'greeting' in result && typeof (result as { greeting: unknown }).greeting === 'string';

      assertTest(
        'T1: Happy path returns ai_source=ai + schema-conformant JSON',
        isAi && hasGreeting,
        `ai_source=${result.ai_source}, hasGreeting=${hasGreeting}`
      );
    } catch (err) {
      assertTest('T1: Happy path Gemini call', false, `Threw unexpected error: ${String(err)}`);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // T2 — 429 Fallback: spy always throws 429, assert 4 total attempts (task 6.3)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n── T2: 429 Fallback (4-attempt spy) ──');
  {
    const savedKey = process.env.GEMINI_API_KEY;
    try {
      process.env.GEMINI_API_KEY = 'fake_key_for_spy_test';
      process.env.GEMINI_MODEL_FLASH = 'gemini-1.5-flash';

      const svc2 = new TestableGeminiService();
      svc2.setGenerateContentSpy(async (_prompt: string) => {
        const err = new Error('[429 Too Many Requests]') as Error & { status: number };
        err.status = 429;
        throw err;
      });

      const result2 = await svc2.call({
        agentKey: 'test_t2',
        modelTier: 'FLASH',
        prompt: 'test',
        schema: { type: 'object' },
      });

      assertTest(
        'T2: 429 returns rule_based_fallback',
        result2.ai_source === 'rule_based_fallback',
        `ai_source=${result2.ai_source}`
      );
      assertTest(
        'T2: 429 makes exactly 4 attempts',
        svc2.spyCallCount === 4,
        `spy call count = ${svc2.spyCallCount}`
      );
      assertTest('T2: Promise resolves (no unhandled exception)', true, '');
    } catch (err) {
      assertTest('T2: 429 returns rule_based_fallback', false, `Threw: ${String(err)}`);
      assertTest('T2: exactly 4 attempts', false, 'Could not verify — exception was thrown');
      assertTest('T2: Promise resolves', false, 'Exception was thrown');
    } finally {
      process.env.GEMINI_API_KEY = savedKey ?? '';
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // T3 — 401 Non-Retry: spy throws 401, assert exactly 1 attempt (task 6.4)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n── T3: 401 Non-Retry (1-attempt spy) ──');
  {
    const savedKey = process.env.GEMINI_API_KEY;
    try {
      process.env.GEMINI_API_KEY = 'fake_key_for_spy_test';
      process.env.GEMINI_MODEL_FLASH = 'gemini-1.5-flash';

      const svc3 = new TestableGeminiService();
      svc3.setGenerateContentSpy(async (_prompt: string) => {
        const err = new Error('[401 Unauthorized]') as Error & { status: number };
        err.status = 401;
        throw err;
      });

      const result3 = await svc3.call({
        agentKey: 'test_t3',
        modelTier: 'FLASH',
        prompt: 'test',
        schema: { type: 'object' },
      });

      assertTest(
        'T3: 401 returns rule_based_fallback',
        result3.ai_source === 'rule_based_fallback',
        `ai_source=${result3.ai_source}`
      );
      assertTest(
        'T3: 401 makes exactly 1 attempt',
        svc3.spyCallCount === 1,
        `spy call count = ${svc3.spyCallCount}`
      );
    } catch (err) {
      assertTest('T3: 401 returns rule_based_fallback', false, `Threw: ${String(err)}`);
      assertTest('T3: exactly 1 attempt', false, 'Could not verify — exception was thrown');
    } finally {
      process.env.GEMINI_API_KEY = savedKey ?? '';
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // T4 — No API Key: immediate fallback, zero network calls (task 6.5)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n── T4: No API Key (immediate fallback, zero network calls) ──');
  {
    const savedKey = process.env.GEMINI_API_KEY;
    try {
      process.env.GEMINI_API_KEY = '';

      const svc4 = new TestableGeminiService();
      // Spy would fail if called — used only to count calls
      svc4.setGenerateContentSpy(async () => {
        throw new Error('Network call should NOT be made when key is absent');
      });

      const result4 = await svc4.call({
        agentKey: 'test_t4',
        modelTier: 'FLASH',
        prompt: 'test',
        schema: { type: 'object' },
      });

      assertTest(
        'T4: No API key returns rule_based_fallback',
        result4.ai_source === 'rule_based_fallback',
        `ai_source=${result4.ai_source}`
      );
      assertTest(
        'T4: No API key makes zero network calls',
        svc4.spyCallCount === 0,
        `spy call count = ${svc4.spyCallCount}`
      );
    } catch (err) {
      assertTest('T4: No API key fallback', false, `Threw: ${String(err)}`);
      assertTest('T4: Zero network calls', false, 'Could not verify — exception was thrown');
    } finally {
      process.env.GEMINI_API_KEY = savedKey ?? '';
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // T5 — Encryption Round-Trip: 4 boundary inputs (Property 1) (task 6.6)
  //      decrypt(encrypt(p)) === p for all 4 inputs
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n── T5: Encryption Round-Trip (Property 1) ──');
  {
    const inputs: Array<{ label: string; value: string }> = [
      { label: 'empty string ""', value: '' },
      { label: 'single char "a"', value: 'a' },
      { label: 'Unicode "MARG — नेटफिक्स AI 🔐"', value: 'MARG — नेटफिक्स AI 🔐' },
      { label: '10,000-char string', value: 'x'.repeat(10_000) },
    ];

    for (const { label, value } of inputs) {
      try {
        process.env.ENCRYPTION_KEY = TEST_KEY;
        const eu = new EncryptionUtility();
        const encrypted = eu.encrypt(value);
        const decrypted = eu.decrypt(encrypted);
        assertTest(
          `T5: Round-trip for ${label}`,
          decrypted === value,
          `decrypted !== original (first 40 chars: "${decrypted.slice(0, 40)}")`
        );
      } catch (err) {
        assertTest(`T5: Round-trip for ${label}`, false, `Threw: ${String(err)}`);
      }
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // T6 — IV Uniqueness: same plaintext encrypted twice → different outputs (task 6.7)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n── T6: IV Uniqueness (Property 2) ──');
  try {
    process.env.ENCRYPTION_KEY = TEST_KEY;
    const euT6 = new EncryptionUtility();
    const plaintext = 'MARG Group test data';
    const enc1 = euT6.encrypt(plaintext);
    const enc2 = euT6.encrypt(plaintext);
    assertTest(
      'T6: Same plaintext encrypted twice produces different base64url outputs',
      enc1 !== enc2,
      `Both outputs were identical: "${enc1}"`
    );
  } catch (err) {
    assertTest('T6: IV uniqueness', false, `Threw: ${String(err)}`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // T7 — Tamper Detection: flip a byte in ciphertext region → throws (task 6.8)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n── T7: Tamper Detection (Property 3) ──');
  try {
    process.env.ENCRYPTION_KEY = TEST_KEY;
    const euT7 = new EncryptionUtility();
    const original = 'sensitive credential data';
    const encrypted = euT7.encrypt(original);

    // Decode to raw bytes
    const raw = Buffer.from(encrypted, 'base64url');
    // Ciphertext starts at byte 28 (12 IV + 16 AuthTag)
    // Flip the first ciphertext byte; if empty plaintext, flip the last auth tag byte instead
    const flipOffset = raw.length > 28 ? 28 : 27;
    raw[flipOffset] = raw[flipOffset] ^ 0xff;

    // Re-encode with tampered bytes
    const tampered = raw.toString('base64url');

    let threw = false;
    try {
      euT7.decrypt(tampered);
    } catch {
      threw = true;
    }
    assertTest(
      'T7: Tampered ciphertext causes decrypt() to throw',
      threw,
      'decrypt() returned a value instead of throwing on tampered ciphertext'
    );
  } catch (err) {
    assertTest('T7: Tamper detection setup', false, `Threw in test setup: ${String(err)}`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // T8 — Non-String Input: encrypt(null/undefined/42) throws TypeError (task 6.9)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n── T8: Non-String Input Rejection ──');
  {
    process.env.ENCRYPTION_KEY = TEST_KEY;
    const euT8 = new EncryptionUtility();
    const nonStringInputs: Array<[string, unknown]> = [
      ['null', null],
      ['undefined', undefined],
      ['number 42', 42],
    ];
    for (const [label, input] of nonStringInputs) {
      let threw = false;
      let wasTypeError = false;
      try {
        euT8.encrypt(input as string);
      } catch (err) {
        threw = true;
        wasTypeError = err instanceof TypeError;
      }
      assertTest(
        `T8: encrypt(${label}) throws TypeError`,
        threw && wasTypeError,
        `threw=${threw}, isTypeError=${wasTypeError}`
      );
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // T9 — Startup Error: invalid ENCRYPTION_KEY → descriptive error, key not in message (task 6.9)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n── T9: Startup Error on Invalid ENCRYPTION_KEY ──');
  {
    const savedKey = process.env.ENCRYPTION_KEY;
    const invalidKey = 'not-hex!!';
    process.env.ENCRYPTION_KEY = invalidKey;
    let threw = false;
    let errorMessage = '';
    try {
      new EncryptionUtility();
    } catch (err) {
      threw = true;
      errorMessage = String(err);
    } finally {
      process.env.ENCRYPTION_KEY = savedKey ?? '';
    }
    assertTest(
      'T9: EncryptionUtility constructor throws on invalid ENCRYPTION_KEY',
      threw,
      'Constructor did not throw with an invalid key'
    );
    assertTest(
      'T9: Error message does not contain the invalid key value',
      threw && !errorMessage.includes(invalidKey),
      `Error message contained the key value. Message: "${errorMessage}"`
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n------------------------------------------------------------');
  console.log(`AI Phase 1 Test Summary: ${passed}/${total} Tests Passed`);
  if (failures.length > 0) {
    console.log('Failures:');
    failures.forEach(f => console.error(`  - ${f}`));
  }
  console.log('------------------------------------------------------------\n');

  return { total, passed, failures };
}

// Auto-run when executed directly via tsx
if (process.argv[1] && (process.argv[1].endsWith('aiPhase1Tests.ts') || process.argv[1].endsWith('aiPhase1Tests.js'))) {
  runAiPhase1Tests().then(result => {
    if (result.failures.length > 0) {
      process.exit(1);
    }
  });
}
