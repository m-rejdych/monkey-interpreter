import { OBJECT_TYPE, Builtin, Error, String, Integer, Array } from './object';
import { NULL } from './evaluator';

export const BUILTINS = {
  len: new Builtin((...args) => {
    if (args.length !== 1) {
      return new Error(`wrong number of arguments, got=${args.length}, want=1`);
    }

    const obj = args[0]!;

    switch (Object.getPrototypeOf(obj).constructor) {
      case String:
        return new Integer((obj as String).value.length);
      case Array:
        return new Integer((obj as Array).elements.length);
      default:
        return new Error(`argument to \`len\` not supported, got ${obj.type()}`);
    }
  }),

  first: new Builtin((...args) => {
    if (args.length !== 1) {
      return new Error(`wrong number of arguments, got=${args.length}, want=1`);
    }

    const obj = args[0]!;
    if (obj.type() !== OBJECT_TYPE.ARRAY_OBJ) {
      return new Error(`argument to \`first\` must be ${OBJECT_TYPE.ARRAY_OBJ}, got ${obj.type()}`);
    }

    const arr = obj as Array;

    if (!arr.elements.length) return NULL;

    return arr.elements[0]!;
  }),

  last: new Builtin((...args) => {
    if (args.length !== 1) {
      return new Error(`wrong number of arguments, got=${args.length}, want=1`);
    }

    const obj = args[0]!;

    if (obj.type() !== OBJECT_TYPE.ARRAY_OBJ) {
      return new Error(`argument to \`first\` must be ${OBJECT_TYPE.ARRAY_OBJ}, got ${obj.type()}`);
    }

    const arr = obj as Array;

    if (!arr.elements) return NULL;

    return arr.elements[arr.elements.length - 1]!;
  }),

  rest: new Builtin((...args) => {
    if (args.length !== 1) {
      return new Error(`wrong number of arguments, got=${args.length}, want=1`);
    }

    const obj = args[0]!;

    if (obj.type() !== OBJECT_TYPE.ARRAY_OBJ) {
      return new Error(`argument to \`first\` must be ${OBJECT_TYPE.ARRAY_OBJ}, got ${obj.type()}`);
    }

    const arr = obj as Array;

    if (!arr.elements) return NULL;

    return new Array(arr.elements.slice(1));
  }),

  push: new Builtin((...args) => {
    if (args.length !== 2) {
      return new Error(`wrong number of arguments, got=${args.length}, want=2`);
    }

    const obj = args[0]!;

    if (obj.type() !== OBJECT_TYPE.ARRAY_OBJ) {
      return new Error(`argument to \`first\` must be ${OBJECT_TYPE.ARRAY_OBJ}, got ${obj.type()}`);
    }

    const newElem = args[1]!;
    const arr = obj as Array;

    return new Array([...arr.elements, newElem]);
  }),
} as const satisfies Record<string, Builtin>;

export function isBuiltin(value: string): value is keyof typeof BUILTINS {
  return value in BUILTINS;
}
