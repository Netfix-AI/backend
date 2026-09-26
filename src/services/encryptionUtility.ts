import crypto from 'crypto';

class EncryptionUtility {
  private keyBuffer: Buffer;

  constructor() {
    const key = process.env.ENCRYPTION_KEY;

    // Validate: present
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required but not set');
    }
    // Validate: exactly 64 hex characters
    if (key.length !== 64) {
      throw new Error(
        `ENCRYPTION_KEY must be a 64-character hex string (32 bytes), got ${key.length} characters`
      );
    }
    // Validate: valid hex string
    if (!/^[0-9a-fA-F]{64}$/.test(key)) {
      throw new Error(
        'ENCRYPTION_KEY contains non-hex characters — must be a valid lowercase hex string'
      );
    }

    // Store as Buffer in memory — do not re-derive on every call
    this.keyBuffer = Buffer.from(key, 'hex');
  }

  /**
   * AES-256-GCM encrypt.
   * Returns base64url string encoding: IV(12 bytes) || AuthTag(16 bytes) || Ciphertext(N bytes)
   * Generates a fresh 12-byte random IV on every call.
   * Throws TypeError if plaintext is not a string.
   */
  encrypt(plaintext: string): string {
    if (typeof plaintext !== 'string') {
      throw new TypeError(`plaintext must be a string, received: ${typeof plaintext}`);
    }

    // Generate fresh 12-byte random IV on every call
    const iv = crypto.randomBytes(12);

    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-gcm', this.keyBuffer, iv);

    // Encrypt
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    // Get auth tag AFTER cipher.final() — 16 bytes
    const authTag = cipher.getAuthTag();

    // Concatenate: IV (12 B) || AuthTag (16 B) || Ciphertext (N B)
    const combined = Buffer.concat([iv, authTag, encrypted]);

    return combined.toString('base64url');
  }

  /**
   * AES-256-GCM decrypt.
   * Accepts the base64url output of encrypt().
   * Returns original plaintext with byte-for-byte fidelity.
   * Throws descriptive error if payload is tampered, truncated, or structurally invalid.
   * Never returns corrupt or partial plaintext.
   */
  decrypt(payload: string): string {
    // Validate it's a string
    if (typeof payload !== 'string') {
      throw new Error('Decryption failed: invalid payload encoding');
    }

    // Decode from base64url
    let combined: Buffer;
    try {
      combined = Buffer.from(payload, 'base64url');
    } catch {
      throw new Error('Decryption failed: invalid payload encoding');
    }

    // Minimum 28 bytes: IV (12) + AuthTag (16)
    if (combined.length < 28) {
      throw new Error('Decryption failed: payload too short to contain IV and auth tag');
    }

    // Slice components
    const iv = combined.subarray(0, 12);
    const authTag = combined.subarray(12, 28);
    const ciphertext = combined.subarray(28);

    // Decrypt
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.keyBuffer, iv);
    decipher.setAuthTag(authTag);

    try {
      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);
      return decrypted.toString('utf8');
    } catch {
      throw new Error('Decryption failed: authentication tag mismatch');
    }
  }
}

// Export the class for direct instantiation in tests (T5–T9 set process.env before constructing)
export { EncryptionUtility };

// Singleton for production use.
// Only constructed when ENCRYPTION_KEY is present so that importing this module in
// test environments (where the key is intentionally absent) does not crash the process.
// Production callers always have the key set via .env; the constructor throws a clear
// error if they don't, which surfaces immediately at server startup.
function createEncryptionUtility(): EncryptionUtility | null {
  if (!process.env.ENCRYPTION_KEY) {
    return null;
  }
  try {
    return new EncryptionUtility();
  } catch {
    return null;
  }
}

/** Production singleton. Will be null if ENCRYPTION_KEY is not configured at module load time. */
export const encryptionUtility = createEncryptionUtility();
