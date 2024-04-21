import { Obj, Integer, Bool } from '../object';
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
  })
});

function runTestEval(input: string): Obj {
  const { program } = createProgram(input);

  return evl(program);
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

  it('is instance of a  bool', () => {
    expect(isBool).toBe(true);
  });

  it('has correct value', () => {
    expect(isBool && obj.value).toBe(value);
  });
}

function isIntegerObject(obj: Obj): obj is Integer {
  return obj instanceof Integer;
}

function isBoolObject(obj: Obj): obj is Bool {
  return obj instanceof Bool;
}
