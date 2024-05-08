import { Builtin, Error, String, Integer } from './object';

export const BUILTINS = {
  len: new Builtin((...args) => {
    if (args.length !== 1) {
      return new Error(`wrong number of arguments, got=${args.length}, want=1`);
    }

    const obj = args[0]!;

    switch (Object.getPrototypeOf(obj).constructor) {
      case String:
        return new Integer((obj as String).value.length);
      default:
        return new Error(`argument to \`len\` not supported, got ${obj.type()}`);
    }
  }),
} as const satisfies Record<string, Builtin>;

export function isBuiltin(value: string): value is keyof typeof BUILTINS {
  return value in BUILTINS;
}
