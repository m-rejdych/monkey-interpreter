import { createHash } from 'crypto';

export function hash(value: string): string {
  return createHash('sha1').update(value).digest('base64');
}
