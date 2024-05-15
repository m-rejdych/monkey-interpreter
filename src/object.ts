import { Identifier, BlockStatement } from './ast';
import { hashKeyCache } from './cache';
import { hash } from './util/hash';

export const OBJECT_TYPE = {
  INTEGER_OBJ: 'INTEGER',
  BOOL_OBJ: 'BOOL',
  NULL_OBJ: 'NULL',
  RETURN_VALUE_OBJ: 'RETURN_VALUE',
  ERROR_OBJ: 'ERROR',
  FUNCTION_OBJ: 'FUNCTION',
  STRING_OBJ: 'STRING',
  BUILTIN_OBJ: 'BUILTIN',
  ARRAY_OBJ: 'ARRAY',
  HASH_OBJ: 'HASH',
} as const;

export type ObjType = (typeof OBJECT_TYPE)[keyof typeof OBJECT_TYPE];

type BuiltinFunction = (...args: Obj[]) => Obj;
export type KeyLiteral = string | boolean | number;
export type HashKeyType =
  | typeof OBJECT_TYPE.BOOL_OBJ
  | typeof OBJECT_TYPE.STRING_OBJ
  | typeof OBJECT_TYPE.INTEGER_OBJ;

export interface Obj {
  type: () => ObjType;
  inspect: () => string;
}

export abstract class Hashable {
  hashKey: () => HashKey;

  constructor(keyType: HashKeyType, literal: KeyLiteral) {
    this.hashKey = () => {
      let hashKey: HashKey;

      if (hashKeyCache.has(literal, keyType)) {
        hashKey = hashKeyCache.get(literal, keyType)!;
      } else {
        hashKey = new HashKey(keyType, literal);
        hashKeyCache.set(literal, hashKey);
      }

      return hashKey;
    };
  }
}

export class HashKey {
  value: string;

  constructor(
    public type: ObjType,
    value: KeyLiteral,
  ) {
    switch (typeof value) {
      case 'boolean':
        this.value = hash(value ? '1' : '0');
        break;
      case 'number':
        this.value = hash(value.toString());
        break;
      case 'string':
      default:
        this.value = hash(value);
        break;
    }
  }

  compare(hashKey: HashKey): boolean {
    return this.type === hashKey.type && this.value === hashKey.value;
  }
}

export class HashPair {
  constructor(
    public key: Obj,
    public value: Obj,
  ) {}
}

export class Hash implements Obj {
  constructor(public entries: Map<HashKey, HashPair>) {}

  type() {
    return OBJECT_TYPE.HASH_OBJ;
  }

  inspect() {
    return `{${[...this.entries].map(([, { key, value }]) => `${key.inspect()}: ${value.inspect()}`).join(', ')}}`;
  }
}

export class Integer extends Hashable implements Obj {
  constructor(public value: number) {
    super(OBJECT_TYPE.INTEGER_OBJ, value);
  }

  inspect() {
    return this.value.toString();
  }

  type() {
    return OBJECT_TYPE.INTEGER_OBJ;
  }
}

export class Bool extends Hashable implements Obj {
  constructor(public value: boolean) {
    super(OBJECT_TYPE.BOOL_OBJ, value);
  }

  inspect() {
    return `${this.value}`;
  }

  type() {
    return OBJECT_TYPE.BOOL_OBJ;
  }
}

export class Null implements Obj {
  constructor() {}

  type() {
    return OBJECT_TYPE.NULL_OBJ;
  }

  inspect() {
    return 'null';
  }
}

export class ReturnValue implements Obj {
  constructor(public value: Obj) {}

  type() {
    return OBJECT_TYPE.RETURN_VALUE_OBJ;
  }

  inspect() {
    return this.value.inspect();
  }
}

export class Error implements Obj {
  constructor(public message: string) {}

  type() {
    return OBJECT_TYPE.ERROR_OBJ;
  }

  inspect() {
    return `ERROR: ${this.message}`;
  }
}

export class Environment {
  store: Record<string, Obj> = {};

  constructor(public outer: Environment | null = null) {}

  get(name: string): Obj | undefined {
    return this.store[name] ?? this.outer?.get(name);
  }

  set(name: string, value: Obj): Obj {
    this.store[name] = value;
    return value;
  }
}

export class Function implements Obj {
  constructor(
    public args: Identifier[],
    public body: BlockStatement,
    public env: Environment,
  ) {}

  type() {
    return OBJECT_TYPE.FUNCTION_OBJ;
  }

  inspect() {
    return `fn (${this.args.map((param) => param.string())}) {
${this.body.string()}
}`;
  }
}

export class String extends Hashable implements Obj {
  constructor(public value: string) {
    super(OBJECT_TYPE.STRING_OBJ, value);
  }

  type() {
    return OBJECT_TYPE.STRING_OBJ;
  }

  inspect() {
    return this.value;
  }
}

export class Builtin implements Obj {
  constructor(public fn: BuiltinFunction) {}

  type() {
    return OBJECT_TYPE.BUILTIN_OBJ;
  }

  inspect() {
    return 'builtin function';
  }
}

export class Array implements Obj {
  constructor(public elements: Obj[]) {}

  type() {
    return OBJECT_TYPE.ARRAY_OBJ;
  }

  inspect() {
    return `[${this.elements.map((element) => element.inspect()).join(', ')}]`;
  }
}
