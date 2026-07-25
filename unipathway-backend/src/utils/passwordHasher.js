/**
 * passwordHasher.js
 * Password hashing using Node's built-in crypto (scrypt).
 * No external dependencies required.
 *
 * Stored format: a random salt + the derived hash, kept as separate fields.
 */
const crypto = require('crypto');

const KEY_LENGTH = 64;

/**
 * Hashes a plaintext password.
 * Returns { salt, hash } — both hex strings to store on the user.
 */
function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(plainPassword, salt, KEY_LENGTH).toString('hex');
  return { salt, hash };
}

/**
 * Verifies a plaintext password against a stored salt + hash.
 * Uses a timing-safe comparison to avoid timing attacks.
 */
function verifyPassword(plainPassword, salt, hash) {
  if (!salt || !hash) return false;
  const derived = crypto.scryptSync(plainPassword, salt, KEY_LENGTH);
  const stored = Buffer.from(hash, 'hex');
  if (derived.length !== stored.length) return false;
  return crypto.timingSafeEqual(derived, stored);
}

module.exports = { hashPassword, verifyPassword };
