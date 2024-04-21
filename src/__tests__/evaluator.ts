import { Obj, Integer } from '../object';
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
  ];

  tests.forEach(({ input, expected }) => {
    const evaluated = runTestEval(input);
    testIntegerObject(evaluated, expected);
  });
});

function runTestEval(input: string): Obj {
  const { program } = createProgram(input);

  return evl(program);
}

function testIntegerObject(obj: Obj, value: number): void {
  it('is integer and has correct value', () => {
    const isInteger = isIntegerObject(obj);
    expect(isInteger).toBe(true);
    expect(isInteger && obj.value).toBe(value);
  });
}

function isIntegerObject(obj: Obj): obj is Integer {
  return obj instanceof Integer;
}
