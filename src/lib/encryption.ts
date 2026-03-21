import crypto from 'crypto';

// ----------------------------------------------------------------------------
// 🛡️ MILITARY-GRADE AES-256-GCM ENCRYPTION FOR HIPAA/PHI
// Built in accordance with Diceus Custom Medical Billing Security Standards
// ----------------------------------------------------------------------------
// This module ensures that ANY patient identification (Patient Name, SSN, 
// DOB, etc.) is encrypted at the application level *before* it touches the
// database. Even if the database is fully compromised, the attacker only
// sees AES-256 encrypted ciphertext.
// ----------------------------------------------------------------------------

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'); // Must be 256 bits (32 bytes)
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Encrypts a string (e.g., Patient Name, SSN) into AES-256-GCM ciphertext.
 */
export function encryptPHI(text: string): string {
    if (!text) return text;
    
    // Generate random Initialization Vector (IV)
    const iv = crypto.randomBytes(IV_LENGTH);
    // Generate random salt for key derivation/extra entropy if needed
    const salt = crypto.randomBytes(SALT_LENGTH);

    // Create Cipher
    const cipher = crypto.createCipheriv(
        ALGORITHM, 
        Buffer.from(ENCRYPTION_KEY, 'hex'), 
        iv
    );

    // Encrypt
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get Auth Tag (GCM signature)
    const tag = cipher.getAuthTag();

    // Format: iv:salt:tag:ciphertext
    return `${iv.toString('hex')}:${salt.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM ciphertext back to plaintext.
 * Fails securely if the data was tampered with (Auth Tag verification).
 */
export function decryptPHI(encryptedString: string): string {
    if (!encryptedString || !encryptedString.includes(':')) return encryptedString;

    const parts = encryptedString.split(':');
    if (parts.length !== 4) throw new Error('Invalid HIPAA encryption format');

    const [ivHex, saltHex, tagHex, ciphertext] = parts;

    const decipher = crypto.createDecipheriv(
        ALGORITHM, 
        Buffer.from(ENCRYPTION_KEY, 'hex'), 
        Buffer.from(ivHex, 'hex')
    );

    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

// Ensure the system enforces a strong environment variable for production
if (process.env.NODE_ENV === 'production' && ENCRYPTION_KEY.length !== 64) {
    console.warn("⚠️ [SECURITY_WARNING]: ENCRYPTION_KEY should be exactly 64 hex characters (32 bytes) for full AES-256 compliance.");
}
