import { Obj, Integer, Bool, Null, Error, Environment, Function } from '../object';
import { evl } from '../evaluator';
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
  ];

  tests.forEach(({ input, expected }) => {
    const evaluated = runTestEval(input);

    const isError = evaluated instanceof Error;
    it('correctly detectes an error', () => {
      expect(isError).toBe(true);
    });

    it('has correct error message', () => {
      expect(isError && evaluated.message).toBe(expected);
    });
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

function runTestEval(input: string): Obj {
  const { program } = createProgram(input);

  return evl(program, new Environment());
}

function testIntegerObject(obj: Obj, value: number): void {
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

function testNullObject(obj: Obj): void {
  it('is instance of a null', () => {
    const isNull = isNullObject(obj);
    expect(isNull).toBe(true);
  });
}

//function testFunctionObject(obj: Obj): void

function isIntegerObject(obj: Obj): obj is Integer {
  return obj instanceof Integer;
}

function isBoolObject(obj: Obj): obj is Bool {
  return obj instanceof Bool;
}

function isNullObject(obj: Obj): obj is Null {
  return obj instanceof Null;
}

function isFunctionObject(func: Object): func is Function {
  return func instanceof Function;
}
