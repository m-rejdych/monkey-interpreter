const OBJECT_TYPE = {
  INTEGER_OBJ: 'INTEGER',
} as const;

type ObjectType = typeof OBJECT_TYPE[keyof typeof OBJECT_TYPE];

interface Object {
  type: () => ObjectType;
  inspect: () => string;
}

export class Integer implements Object {
  constructor(public value: number) {}

  inspect() {
    return this.value.toString();
  }

  type() {
    return OBJECT_TYPE.INTEGER_OBJ;
  }
}
