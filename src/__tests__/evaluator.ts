import {
  Obj,
  Integer,
  Bool,
  Null,
  Error,
  Environment,
  Function,
  String,
  Array,
  Hash,
  HashKey,
} from '../object';
import { evl, TRUE, FALSE } from '../evaluator';
import { createProgram } from '../util/program';

describe('Evaluate integer expression', () => {
  const tests: { input: string; expected: number }[] = [
    {
      input: '5',
      expected: 5,
    },
    {
      input: '10',
      expected: 10,
    },
    {
      input: '-5',
      expected: -5,
    },
    {
      input: '-10',
      expected: -10,
    },
    {
      input: '5 + 5 + 5 + 5 - 10',
      expected: 10,
    },
    {
      input: '2 * 2 * 2 * 2 * 2',
      expected: 32,
    },
    {
      input: '-50 + 100 + -50',
      expected: 0,
    },
    {
      input: '5 * 2 + 10',
      expected: 20,
    },
    {
      input: '5 + 2 * 10',
      expected: 25,
    },
    {
      input: '20 + 2 * -10',
      expected: 0,
    },
    {
      input: '50 / 2 * 2 + 10',
      expected: 60,
    },
    {
      input: '2 * (5 + 10)',
      expected: 30,
    },
    {
      input: '3 * 3 * 3 + 10',
      expected: 37,
    },
    {
      input: '(5 + 10 * 2 + 15 / 3) * 2 + -10',
      expected: 50,
    },
  ];

  tests.forEach(({ input, expected }) => {
    const evaluated = runTestEval(input);
    testIntegerObject(evaluated, expected);
  });
});

describe('Evaluate bool expression', () => {
  const tests: { input: string; expected: boolean }[] = [
    {
      input: 'true',
      expected: true,
    },
    {
      input: 'false',
      expected: false,
    },
    {
      input: '1 < 2',
      expected: true,
    },
    {
      input: '1 > 2',
      expected: false,
    },
    {
      input: '1 < 1',
      expected: false,
    },
    {
      input: '1 > 1',
      expected: false,
    },
    {
      input: '1 == 1',
      expected: true,
    },
    {
      input: '1 != 1',
      expected: false,
    },
    {
      input: '1 == 2',
      expected: false,
    },
    {
      input: '1 != 2',
      expected: true,
    },
    {
      input: 'true == true',
      expected: true,
    },
    {
      input: 'false == false',
      expected: true,
    },
    {
      input: 'true == false',
      expected: false,
    },
    {
      input: 'true != false',
      expected: true,
    },
    {
      input: 'false != true',
      expected: true,
    },
    {
      input: '(1 < 2) == true',
      expected: true,
    },
    {
      input: '(1 < 2) == false',
      expected: false,
    },
    {
      input: '(1 > 2) == true',
      expected: false,
    },
    {
      input: '(1 > 2) == false',
      expected: true,
    },
  ];

  tests.forEach(({ input, expected }) => {
    const evaluated = runTestEval(input);
    testBoolObject(evaluated, expected);
  });
});

describe('Bang operator', () => {
  const tests: { input: string; expected: boolean }[] = [
    {
      input: '!true',
      expected: false,
    },
    {
      input: '!false',
      expected: true,
    },
    {
      input: '!5',
      expected: false,
    },
    {
      input: '!!true',
      expected: true,
    },
    {
      input: '!!false',
      expected: false,
    },
    {
      input: '!!5',
      expected: true,
    },
  ];

  tests.forEach(({ input, expected }) => {
    const evaluated = runTestEval(input);
    testBoolObject(evaluated, expected);
  });
});

describe('If else expressions', () => {
  const tests: { input: string; expected: unknown }[] = [
    {
      input: 'if (true) { 10 }',
      expected: 10,
    },
    {
      input: 'if (false) { 10 }',
      expected: null,
    },
    {
      input: 'if (1) { 10 }',
      expected: 10,
    },
    {
      input: 'if (1 < 2) { 10 }',
      expected: 10,
    },
    {
      input: 'if (1 > 2) { 10 }',
      expected: null,
    },
    {
      input: 'if (1 > 2) { 10 } else { 20 }',
      expected: 20,
    },
    {
      input: 'if (1 < 2) { 10 } else { 20 }',
      expected: 10,
    },
  ];

  tests.forEach(({ input, expected }) => {
    const evaluated = runTestEval(input);

    if (typeof expected === 'number') {
      testIntegerObject(evaluated, expected);
    } else {
      testNullObject(evaluated);
    }
  });
});

describe('Return statements', () => {
  const tests: { input: string; expected: number }[] = [
    {
      input: 'return 10;',
      expected: 10,
    },
    {
      input: 'return 10; 9;',
      expected: 10,
    },
    {
      input: 'return 2 * 5; 9;',
      expected: 10,
    },
    {
      input: '9; return 2 * 5; 9;',
      expected: 10,
    },
    {
      input: `
if (10 > 1) {
  if (10 > 1) {
    return 10;
  }

  return 1;
}`,
      expected: 10,
    },
  ];

  tests.forEach(({ input, expected }) => {
    const evaluated = runTestEval(input);
    testIntegerObject(evaluated, expected);
  });
});

describe('Error handling', () => {
  const tests: { input: string; expected: string }[] = [
    {
      input: '5 + true;',
      expected: 'type mismatch: INTEGER + BOOL',
    },
    {
      input: '5 + true; 5;',
      expected: 'type mismatch: INTEGER + BOOL',
    },
    {
      input: '-true;',
      expected: 'unknown operator: -BOOL',
    },
    {
      input: 'true + false;',
      expected: 'unknown operator: BOOL + BOOL',
    },
    {
      input: '5; true + false; 5;',
      expected: 'unknown operator: BOOL + BOOL',
    },
    {
      input: 'if (10 > 1) { true + false; }',
      expected: 'unknown operator: BOOL + BOOL',
    },
    {
      input: `
if (10 > 1) {
  if (10 > 1) {
    return true + false;
  }

  return 1;
}`,
      expected: 'unknown operator: BOOL + BOOL',
    },
    {
      input: 'foobar',
      expected: 'identifier not found: foobar',
    },
    {
      input: '"Hello" - "World"',
      expected: 'unknown operator: STRING - STRING',
    },
    {
      input: '{"name": "monkey"}[fn(x) { x }]',
      expected: 'unusable as hash key: FUNCTION',
    },
  ];

  tests.forEach(({ input, expected }) => {
    const evaluated = runTestEval(input);

    testErrorObject(evaluated, expected);
  });
});

describe('Let statements', () => {
  const tests: { input: string; expected: number }[] = [
    {
      input: 'let a = 5; a;',
      expected: 5,
    },
    {
      input: 'let a = 5 * 5; a;',
      expected: 25,
    },
    {
      input: 'let a = 5; let b = a; b;',
      expected: 5,
    },
    {
      input: 'let a = 5; let b = a; let c = a + b + 5; c;',
      expected: 15,
    },
  ];

  tests.forEach(({ input, expected }) => {
    testIntegerObject(runTestEval(input), expected);
  });
});

describe('Function object', () => {
  const input = 'fn(x) { x + 2 };';

  const evaluated = runTestEval(input);

  const isFunction = isFunctionObject(evaluated);
  it('is instance of a function', () => {
    expect(isFunction).toBe(true);
  });

  it('has correct number of parameters', () => {
    expect(isFunction && evaluated.args.length).toBe(1);
  });

  it('has correct parameter', () => {
    expect(isFunction && evaluated.args[0]?.string()).toBe('x');
  });

  it('has correct body', () => {
    expect(isFunction && evaluated.body.string()).toBe('(x + 2)');
  });
});

describe('Function application', () => {
  const tests: { input: string; expected: number }[] = [
    {
      input: 'let identity = fn(x) { x; }; identity(5);',
      expected: 5,
    },
    {
      input: 'let identity = fn(x) { return x; }; identity(5);',
      expected: 5,
    },
    {
      input: 'let double = fn(x) { x * 2; }; double(5);',
      expected: 10,
    },
    {
      input: 'let add = fn(x, y) { x + y; }; add(5, 5);',
      expected: 10,
    },
    {
      input: 'let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));',
      expected: 20,
    },
    {
      input: 'fn(x) { x; }(5)',
      expected: 5,
    },
  ];

  tests.forEach(({ input, expected }) => {
    testIntegerObject(runTestEval(input), expected);
  });
});

describe('String literal', () => {
  const input = '"hello world!"';

  const evaluated = runTestEval(input);

  testStringObject(evaluated, 'hello world!');
});

describe('String concatenation', () => {
  const input = '"Hello" + " " + "World!"';

  const evaluated = runTestEval(input);

  testStringObject(evaluated, 'Hello World!');
});

describe('Builtin functions', () => {
  const tests: { input: string; expected: unknown }[] = [
    {
      input: 'len("")',
      expected: 0,
    },
    {
      input: 'len("four")',
      expected: 4,
    },
    {
      input: 'len("hello world")',
      expected: 11,
    },
    {
      input: 'len(1)',
      expected: 'argument to `len` not supported, got INTEGER',
    },
    {
      input: 'len("one", "two")',
      expected: 'wrong number of arguments, got=2, want=1',
    },
    {
      input: 'len("four")',
      expected: 4,
    },
    {
      input: 'len([1, 2, 3])',
      expected: 3,
    },
    {
      input: 'let x = [true, 1, "hi"]; len(x)',
      expected: 3,
    },
  ];

  tests.forEach(({ input, expected }) => {
    const evaluated = runTestEval(input);

    switch (typeof expected) {
      case 'number':
        testIntegerObject(evaluated, expected);
        break;
      case 'string':
        testErrorObject(evaluated, expected);
    }
  });
});

describe('Array literals', () => {
  const input = '[1, 2 * 2, 3 + 3]';

  const evaluated = runTestEval(input);

  const isArray = isArrayObject(evaluated);

  it('is instance of an array', () => {
    expect(isArray).toBe(true);
  });

  it('has correct number of elements', () => {
    expect(isArray && evaluated.elements.length).toBe(3);
  });

  const elements = isArray ? evaluated.elements : [];

  testIntegerObject(elements[0] ?? null, 1);
  testIntegerObject(elements[1] ?? null, 4);
  testIntegerObject(elements[2] ?? null, 6);
});

describe('Index expressions', () => {
  const tests: { input: string; expected: unknown }[] = [
    {
      input: '[1, 2, 3][0]',
      expected: 1,
    },
    {
      input: '[1, 2, 3][1]',
      expected: 2,
    },
    {
      input: '[1, 2, 3][2]',
      expected: 3,
    },
    {
      input: 'let i = 0; [1][i];',
      expected: 1,
    },
    {
      input: '[1, 2, 3][1 + 1];',
      expected: 3,
    },
    {
      input: 'let myArray = [1, 2, 3]; myArray[2];',
      expected: 3,
    },
    {
      input: 'let myArray = [1, 2, 3]; myArray[0] + myArray[1] + myArray[2];',
      expected: 6,
    },
    {
      input: 'let myArray = [1, 2, 3]; let i = myArray[0]; myArray[i];',
      expected: 2,
    },
    {
      input: '[1, 2, 3][3]',
      expected: null,
    },
    {
      input: '[1, 2, 3][-1]',
      expected: null,
    },
  ];

  tests.forEach(({ input, expected }) => {
    const evaluated = runTestEval(input);

    if (typeof expected === 'number') {
      testIntegerObject(evaluated, expected);
    } else {
      testNullObject(evaluated);
    }
  });
});

describe('Hash literals', () => {
  const input = `let two = "two";
  {
    "one": 10 - 9,
    two: 1 + 1,
    "thr" + "ee": 6 / 2,
    4: 4,
    true: 5,
    false: 6
  }
  `;

  const evaluated = runTestEval(input);

  const isHash = isHashObject(evaluated);
  it('is an instance of Hash', () => {
    expect(isHash).toBe(true);
  });

  const expected: Map<HashKey, number> = new Map();
  expected.set(new String('one').hashKey(), 1);
  expected.set(new String('two').hashKey(), 2);
  expected.set(new String('three').hashKey(), 3);
  expected.set(new Integer(4).hashKey(), 4);
  expected.set(TRUE.hashKey(), 5);
  expected.set(FALSE.hashKey(), 6);

  it('has correct number of pairs', () => {
    expect(isHash && evaluated.entries.size === expected.size).toBe(true);
  });

  expected.forEach((value, key) => {
    const pair = isHash ? evaluated.entries.get(key) : null;

    it('has a pair for given key', () => {
      expect(pair).toBeTruthy();
    });

    testIntegerObject(pair?.value ?? null, value);
  });
});

describe('Hash index expressions', () => {
  const tests: { input: string; expected: unknown }[] = [
    {
      input: '{"foo": 5}["foo"]',
      expected: 5,
    },
    {
      input: '{"foo": 5}["bar"]',
      expected: null,
    },
    {
      input: 'let key = "foo"; {"foo": 5}[key]',
      expected: 5,
    },
    {
      input: '{}["foo"]',
      expected: null,
    },
    {
      input: '{5: 5}[5]',
      expected: 5,
    },
    {
      input: '{true: 5}[true]',
      expected: 5,
    },
    {
      input: '{false: 5}[false]',
      expected: 5,
    },
  ];

  tests.forEach(({ input, expected }) => {
    const evaluated = runTestEval(input);
    if (typeof expected === 'number') {
      testIntegerObject(evaluated, expected);
    } else {
      testNullObject(evaluated);
    }
  });
});

function runTestEval(input: string): Obj {
  const { program } = createProgram(input);

  return evl(program, new Environment());
}

function testIntegerObject(obj: Obj | null, value: number): void {
  const isInteger = isIntegerObject(obj);

  it('is instance of an integer', () => {
    expect(isInteger).toBe(true);
  });

  it('has correct value', () => {
    expect(isInteger && obj.value).toBe(value);
  });
}

function testBoolObject(obj: Obj, value: boolean): void {
  const isBool = isBoolObject(obj);

  it('is instance of a bool', () => {
    expect(isBool).toBe(true);
  });

  it('has correct value', () => {
    expect(isBool && obj.value).toBe(value);
  });
}

function testStringObject(obj: Obj, value: string): void {
  const isString = isStringObject(obj);

  it('is instance of a string', () => {
    expect(isString).toBe(true);
  });

  it('has correct value', () => {
    expect(isString && obj.value).toBe(value);
  });
}

function testNullObject(obj: Obj): void {
  it('is instance of a null', () => {
    const isNull = isNullObject(obj);
    expect(isNull).toBe(true);
  });
}

function testErrorObject(obj: Obj, message: string) {
  const isError = isErrorObject(obj);

  it('is instance of an error', () => {
    expect(isError).toBe(true);
  });

  it('has correct error messagee', () => {
    expect(isError && obj.message).toBe(message);
  });
}

function isIntegerObject(obj: Obj | null): obj is Integer {
  return obj instanceof Integer;
}

function isBoolObject(obj: Obj): obj is Bool {
  return obj instanceof Bool;
}

function isNullObject(obj: Obj): obj is Null {
  return obj instanceof Null;
}

function isFunctionObject(func: Obj): func is Function {
  return func instanceof Function;
}

function isStringObject(str: Obj): str is String {
  return str instanceof String;
}

function isErrorObject(err: Obj): err is Error {
  return err instanceof Error;
}

function isArrayObject(arr: Obj): arr is Array {
  return arr instanceof Array;
}

function isHashObject(hash: Obj): hash is Hash {
  return hash instanceof Hash;
}
