import { registerAs } from '@nestjs/config';

const getOptionalEnv = (key: string): string | undefined => {
  const value = process.env[key];
  if (typeof value !== 'string') {
    return undefined;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const parseStrictInteger = (raw: string): number => {
  const normalized = raw.trim();
  if (!/^-?\d+$/.test(normalized)) {
    return Number.NaN;
  }
  return Number(normalized);
};

const getIntEnvWithDefault = (key: string, defaultValue: number): number => {
  const value = getOptionalEnv(key);
  if (!value) {
    return defaultValue;
  }
  const parsed = parseStrictInteger(value);
  if (!Number.isInteger(parsed)) {
    throw new Error(`${key} must be a valid integer`);
  }
  return parsed;
};

export default registerAs('fileStorage', () => ({
  uploadDir: process.env.FILE_UPLOAD_DIR || './uploads',
  maxSizeBytes: getIntEnvWithDefault('FILE_MAX_SIZE_BYTES', 10 * 1024 * 1024),
  allowedMimeTypes: (
    process.env.FILE_ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml'
  )
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean),
  baseUrl: process.env.FILE_BASE_URL || '',
}));
