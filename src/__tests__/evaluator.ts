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
