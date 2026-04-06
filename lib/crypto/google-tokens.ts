import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto"

const ALGO = "aes-256-gcm"
const IV_LENGTH = 16
const TAG_LENGTH = 16
const SALT = "happy-reunion-oauth-v1"

function deriveKey(): Buffer {
  const secret = process.env.OAUTH_TOKEN_ENCRYPTION_KEY
  if (!secret || secret.length < 16) {
    throw new Error("OAUTH_TOKEN_ENCRYPTION_KEY must be set (at least 16 characters)")
  }
  return scryptSync(secret, SALT, 32)
}

export function encryptToken(plain: string): string {
  const key = deriveKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGO, key, iv)
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, enc]).toString("base64url")
}

export function decryptToken(payload: string): string {
  const key = deriveKey()
  const buf = Buffer.from(payload, "base64url")
  const iv = buf.subarray(0, IV_LENGTH)
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const data = buf.subarray(IV_LENGTH + TAG_LENGTH)
  const decipher = createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8")
}
