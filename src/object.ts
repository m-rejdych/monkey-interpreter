import { Identifier, BlockStatement } from './ast';

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
} as const;

export type ObjType = (typeof OBJECT_TYPE)[keyof typeof OBJECT_TYPE];

type BuiltinFunction = (...args: Obj[]) => Obj;

export interface Obj {
  type: () => ObjType;
  inspect: () => string;
}

export class Integer implements Obj {
  constructor(public value: number) {}

  inspect() {
    return this.value.toString();
  }

  type() {
    return OBJECT_TYPE.INTEGER_OBJ;
  }
}

export class Bool implements Obj {
  constructor(public value: boolean) {}

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

export class String implements Obj {
  constructor(public value: string) {}

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
