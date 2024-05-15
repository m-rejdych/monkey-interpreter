import { HashKey, KeyLiteral, HashKeyType } from './object';

class HashKeyCache {
  keys: Map<KeyLiteral, HashKey> = new Map();

  set(literal: KeyLiteral, key: HashKey): void {
    this.keys.set(literal, key);
  }

  get(literal: KeyLiteral, type: HashKeyType): HashKey | null {
    const hashKey = this.keys.get(literal);
    if (!hashKey) return null;

    return hashKey.type === type ? hashKey : null;
  }

  has(literal: KeyLiteral, type: HashKeyType): boolean {
    const hashKey = this.keys.get(literal);
    if (!hashKey) return false;

    return hashKey.type === type;
  }
}

export const hashKeyCache = new HashKeyCache();
