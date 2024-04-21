export const OBJECT_TYPE = {
  INTEGER_OBJ: 'INTEGER',
  BOOL_OBJ: 'BOOL',
  NULL_OBJ: 'NULL',
} as const;

type ObjType = typeof OBJECT_TYPE[keyof typeof OBJECT_TYPE];

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
