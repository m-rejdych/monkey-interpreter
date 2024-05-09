import { Parser } from '../parser';
import {
  Statement,
  LetStatement,
  ReturnStatement,
  ExpressionStatement,
  BlockStatement,
  Identifier,
  Expression,
  IntegerLiteral,
  PrefixExpression,
  InfixExpression,
  BoolExpression,
  IfExpression,
  FunctionExpression,
  CallExpression,
  StringLiteral,
  ArrayLiteral,
} from '../ast';
import { createProgram } from '../util/program';

describe('Let statement', () => {
  const tests: { input: string; expectedIdentifier: string; expectedValue: unknown }[] = [
    {
      input: 'let x = 5;',
      expectedIdentifier: 'x',
      expectedValue: 5,
    },
    {
      input: 'let y = true;',
      expectedIdentifier: 'y',
      expectedValue: true,
    },
    {
      input: 'let foobar = y;',
      expectedIdentifier: 'foobar',
      expectedValue: 'y',
    },
  ];

  tests.forEach(({ input, expectedIdentifier, expectedValue }) => {
    const { program, parser } = createProgram(input);

    testParserErrors(parser);
    testNumberOfStatements(program, 1);

    const statement = program.statements[0] ?? null;

    testLetStatement(statement, expectedIdentifier);

    testLiteralExpression(isLetStatement(statement) ? statement.value : null, expectedValue);
  });
});

describe('Return statement', () => {
  const tests: { input: string; expectedValue: unknown }[] = [
    {
      input: 'return 5;',
      expectedValue: 5,
    },
    {
      input: 'return true',
      expectedValue: true,
    },
    {
      input: 'return x;',
      expectedValue: 'x',
    },
  ];

  tests.forEach(({ input, expectedValue }) => {
    const { parser, program } = createProgram(input);

    testParserErrors(parser);
    testNumberOfStatements(program, 1);

    const statement = program.statements[0] ?? null;

    testReturnStatement(statement);
    testLiteralExpression(
      isReturnStatement(statement) ? statement.returnValue : null,
      expectedValue,
    );
  });
});

describe('Identifier expression', () => {
  const input = 'foobar;';
  const { program, parser } = createProgram(input);

  testParserErrors(parser);
  testNumberOfStatements(program, 1);

  const statement = program.statements[0] ?? null;
  testExpressionStatement(statement);

  const identifier = isExpressionStatement(statement) ? statement.expression : null;
  testIdentifierExpression(identifier, 'foobar');
});

describe('Integer literal expression', () => {
  const input = `5;`;
  const { program, parser } = createProgram(input);

  testParserErrors(parser);
  testNumberOfStatements(program, 1);

  const statement = program.statements[0] ?? null;
  testExpressionStatement(statement);
  testIntegerLiteralExpression(isExpressionStatement(statement) ? statement.expression : null, 5);
});

describe('Prefix expression', () => {
  const tests: { input: string; operator: string; value: unknown }[] = [
    {
      input: '!5',
      operator: '!',
      value: 5,
    },
    {
      input: '-15',
      operator: '-',
      value: 15,
    },
    {
      input: '!true',
      operator: '!',
      value: true,
    },
    {
      input: '!false',
      operator: '!',
      value: false,
    },
  ];

  tests.forEach(({ input, operator, value: integerValue }) => {
    const { program, parser } = createProgram(input);

    testParserErrors(parser);
    testNumberOfStatements(program, 1);

    const statement = program.statements[0] ?? null;

    testExpressionStatement(statement);

    const prefix = isExpressionStatement(statement) ? statement.expression : null;
    const isPrefix = isPrefixExpression(prefix);

    it('has PrefixExpression', () => {
      expect(isPrefix).toBe(true);
    });

    testOperator(prefix, operator);
    testLiteralExpression(isPrefix ? prefix.right : null, integerValue);
  });
});

describe('Infix expression', () => {
  const tests: { input: string; leftValue: unknown; operator: string; rightValue: unknown }[] = [
    { input: '5 + 5', leftValue: 5, operator: '+', rightValue: 5 },
    { input: '5 - 5', leftValue: 5, operator: '-', rightValue: 5 },
    { input: '5 * 5', leftValue: 5, operator: '*', rightValue: 5 },
    { input: '5 / 5', leftValue: 5, operator: '/', rightValue: 5 },
    { input: '5 < 5', leftValue: 5, operator: '<', rightValue: 5 },
    { input: '5 > 5', leftValue: 5, operator: '>', rightValue: 5 },
    { input: '5 == 5', leftValue: 5, operator: '==', rightValue: 5 },
    { input: '5 != 5', leftValue: 5, operator: '!=', rightValue: 5 },
    { input: 'true == true', leftValue: true, operator: '==', rightValue: true },
    { input: 'false != true', leftValue: false, operator: '!=', rightValue: true },
    { input: 'false == false', leftValue: false, operator: '==', rightValue: false },
  ];

  tests.forEach(({ input, leftValue, rightValue, operator }) => {
    const { program, parser } = createProgram(input);

    testParserErrors(parser);
    testNumberOfStatements(program, 1);

    const statement = program.statements[0] ?? null;

    testExpressionStatement(statement);

    const infix = isExpressionStatement(statement) ? statement.expression : null;
    testInfixExpression(infix, leftValue, operator, rightValue);
  });
});

describe('Operator precedence parsing', () => {
  const tests: { input: string; expected: string }[] = [
    { input: '-a * b', expected: '((-a) * b)' },
    { input: '!-a', expected: '(!(-a))' },
    { input: 'a + b + c', expected: '((a + b) + c)' },
    { input: 'a + b - c', expected: '((a + b) - c)' },
    { input: 'a * b * c', expected: '((a * b) * c)' },
    { input: 'a * b / c', expected: '((a * b) / c)' },
    { input: 'a + b / c', expected: '(a + (b / c))' },
    { input: 'a + b * c + d / e - f', expected: '(((a + (b * c)) + (d / e)) - f)' },
    { input: '3 + 4; -5 * 5', expected: '(3 + 4)((-5) * 5)' },
    { input: '5 > 4 == 3 < 4', expected: '((5 > 4) == (3 < 4))' },
    { input: '5 < 4 != 3 > 4', expected: '((5 < 4) != (3 > 4))' },
    { input: '3 + 4 * 5 == 3 * 1 + 4 * 5', expected: '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))' },
    { input: '-a * b', expected: '((-a) * b)' },
    { input: 'true', expected: 'true' },
    { input: 'false', expected: 'false' },
    { input: '3 > 5 == false', expected: '((3 > 5) == false)' },
    { input: '1 + (2 + 3) + 4', expected: '((1 + (2 + 3)) + 4)' },
    { input: '(5 + 5) * 2', expected: '((5 + 5) * 2)' },
    { input: '2 / (5 + 5)', expected: '(2 / (5 + 5))' },
    { input: '-(5 + 5)', expected: '(-(5 + 5))' },
    { input: '!(true == true)', expected: '(!(true == true))' },
    { input: 'a + add(b * c) + d', expected: '((a + add((b * c))) + d)' },
    {
      input: 'add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))',
      expected: 'add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))',
    },
    { input: 'add(a + b + c * d / f + g)', expected: 'add((((a + b) + ((c * d) / f)) + g))' },
  ];

  tests.forEach(({ input, expected }) => {
    const { program, parser } = createProgram(input);
    testParserErrors(parser);

    it('parses correctly according to the precedence', () => {
      const actual = program.string();
      expect(actual).toBe(expected);
    });
  });
});

describe('Bool expression', () => {
  const tests: { input: string; boolValue: boolean }[] = [
    {
      input: 'true;',
      boolValue: true,
    },
    {
      input: 'false;',
      boolValue: false,
    },
  ];

  tests.forEach(({ input, boolValue }) => {
    const { program, parser } = createProgram(input);

    testParserErrors(parser);
    testNumberOfStatements(program, 1);

    const statement = program.statements[0] ?? null;
    testExpressionStatement(statement);

    const bool = isExpressionStatement(statement) ? statement.expression : null;
    testBoolExperssion(bool, boolValue);
  });
});

describe('If expression', () => {
  const input = 'if (x < y) { x }';

  const { parser, program } = createProgram(input);

  testParserErrors(parser);
  testNumberOfStatements(program, 1);

  const statement = program.statements[0] ?? null;
  testExpressionStatement(statement);

  const ifExpression = isExpressionStatement(statement) ? statement.expression : null;
  const isIf = isIfExpression(ifExpression);
  it('has IfExpression', () => {
    expect(isIf).toBe(true);
  });

  const condition = isIf ? ifExpression.condition : null;
  const consequence = isIf ? ifExpression.consequence : null;
  const alternative = isIf ? ifExpression.alternative : null;

  testInfixExpression(condition, 'x', '<', 'y');

  testBlockStatement(consequence);
  testNumberOfStatements(consequence, 1);
  const consequenceExpression = consequence?.statements[0] ?? null;
  testExpressionStatement(consequenceExpression);

  const consequenceIdentifier = isExpressionStatement(consequenceExpression)
    ? consequenceExpression.expression
    : null;
  testIdentifierExpression(consequenceIdentifier, 'x');

  it('has no alternative block', () => {
    expect(alternative).toBe(null);
  });
});

describe('If else expression', () => {
  const input = 'if (x < y) { x } else { y }';

  const { parser, program } = createProgram(input);

  testParserErrors(parser);
  testNumberOfStatements(program, 1);

  const statement = program.statements[0] ?? null;
  testExpressionStatement(statement);

  const ifExpression = isExpressionStatement(statement) ? statement.expression : null;
  const isIf = isIfExpression(ifExpression);
  it('has IfExpression', () => {
    expect(isIf).toBe(true);
  });

  const condition = isIf ? ifExpression.condition : null;
  const consequence = isIf ? ifExpression.consequence : null;
  const alternative = isIf ? ifExpression.alternative : null;

  testInfixExpression(condition, 'x', '<', 'y');

  testBlockStatement(consequence);
  testNumberOfStatements(consequence, 1);
  const consequenceExpression = consequence?.statements[0] ?? null;
  testExpressionStatement(consequenceExpression);

  const consequenceIdentifier = isExpressionStatement(consequenceExpression)
    ? consequenceExpression.expression
    : null;
  testIdentifierExpression(consequenceIdentifier, 'x');

  testBlockStatement(alternative);
  testNumberOfStatements(alternative, 1);
  const alternativeExpression = alternative?.statements[0] ?? null;
  testExpressionStatement(alternativeExpression);

  const alternativeIdentifier = isExpressionStatement(alternativeExpression)
    ? alternativeExpression.expression
    : null;
  testIdentifierExpression(alternativeIdentifier, 'y');
});

describe('Function expression', () => {
  const input = 'fn(x, y) { x + y }';

  const { program, parser } = createProgram(input);

  testParserErrors(parser);
  testNumberOfStatements(program, 1);

  const statement = program.statements[0] ?? null;
  testExpressionStatement(statement);

  const functionExpression = isExpressionStatement(statement) ? statement.expression : null;
  const isFunction = isFunctionExpression(functionExpression);

  it('has FunctionExpression', () => {
    expect(isFunction).toBe(true);
  });

  testNumberOfArgs(isFunction ? functionExpression : null, 2);

  const params = isFunction ? functionExpression.args : null;
  testIdentifierExpression(params && (params[0] ?? null), 'x');
  testIdentifierExpression(params && (params[1] ?? null), 'y');

  const body = isFunction ? functionExpression.body : null;
  testBlockStatement(body);
  testNumberOfStatements(body, 1);

  const bodyExpression = body?.statements[0] ?? null;
  testExpressionStatement(bodyExpression);

  const bodyInfixExpression = isExpressionStatement(bodyExpression)
    ? bodyExpression.expression
    : null;
  testInfixExpression(bodyInfixExpression, 'x', '+', 'y');
});

describe('Function parameters parsing', () => {
  const tests: { input: string; expectedParams: string[] }[] = [
    {
      input: 'fn() {}',
      expectedParams: [],
    },
    {
      input: 'fn(x) {}',
      expectedParams: ['x'],
    },
    {
      input: 'fn(x, y, z) {}',
      expectedParams: ['x', 'y', 'z'],
    },
  ];

  tests.forEach(({ input, expectedParams }) => {
    const { parser, program } = createProgram(input);

    testParserErrors(parser);

    const statement = program.statements[0] ?? null;
    const functionExpression = isExpressionStatement(statement) ? statement.expression : null;
    const args = isFunctionExpression(functionExpression) ? functionExpression.args : null;

    testNumberOfArgs(
      isFunctionExpression(functionExpression) ? functionExpression : null,
      expectedParams.length,
    );

    for (let i = 0; i < expectedParams.length; i++) {
      testIdentifierExpression(args?.[i] ?? null, expectedParams[i] ?? '');
    }
  });
});

describe('Call expression', () => {
  const input = 'add(3, 2 * 5, 3 + 5)';

  const { parser, program } = createProgram(input);

  testParserErrors(parser);
  testNumberOfStatements(program, 1);

  const statement = program.statements[0] ?? null;
  testExpressionStatement(statement);

  const callExpression = isExpressionStatement(statement) ? statement.expression : null;
  const isCall = isCallExpression(callExpression);

  it('is a call expression', () => {
    expect(isCall).toBe(true);
  });

  const callFunction = isCall ? callExpression.func : null;

  testIdentifierExpression(callFunction, 'add');
  testNumberOfArgs(isCall ? callExpression : null, 3);

  const args = isCall ? callExpression.args : null;
  testLiteralExpression(args?.[0] ?? null, 3);
  testInfixExpression(args?.[1] ?? null, 2, '*', 5);
  testInfixExpression(args?.[2] ?? null, 3, '+', 5);
});

describe('String literal', () => {
  const input = '"hello world!"';

  const { parser, program } = createProgram(input);

  testParserErrors(parser);
  testNumberOfStatements(program, 1);

  const stringExpression = program.statements[0] ?? null;
  testExpressionStatement(stringExpression);

  const stringLiteral = isExpressionStatement(stringExpression)
    ? stringExpression.expression
    : null;
  const isString = isStringLiteralExpression(stringLiteral);

  it('is a StringLiteral', () => {
    expect(isString).toBe(true);
  });

  it('has correct value', () => {
    expect(isString && stringLiteral.value).toBe('hello world!');
  });
});

describe('Array literals', () => {
  const input = '[1, 2 * 2, 3 + 3]';

  const { parser, program } = createProgram(input);

  testParserErrors(parser);
  testNumberOfStatements(program, 1);

  const statement = program.statements[0] ?? null;

  testExpressionStatement(statement)

  const array = isExpressionStatement(statement) ? statement.expression : null;
  const isArray = isArrayLiteralExpression(array);

  it('is array literal', () => {
    expect(isArray).toBe(true);
  });

  const elements = isArray ? array.elements : [];

  testIntegerLiteralExpression(elements[0] ?? null, 1);
  testInfixExpression(elements[1] ?? null, 2, '*', 2);
  testInfixExpression(elements[2] ?? null, 3, '+', 3);
});

function testLetStatement(statement: Statement | null, name: string): void {
  it('parses let statement', () => {
    expect(statement?.tokenLiteral()).toBe('let');
    expect(isLetStatement(statement)).toBe(true);
    expect((statement as LetStatement).name.value).toBe(name);
  });
}

function testReturnStatement(statement: Statement | null): void {
  it('parses return correctly', () => {
    expect(statement?.tokenLiteral()).toBe('return');
    expect(isReturnStatement(statement)).toBe(true);
  });
}

function testExpressionStatement(statement: Statement | null): void {
  it('is an ExpressionStatement', () => {
    expect(isExpressionStatement(statement)).toBe(true);
  });
}

function testBlockStatement(statement: Statement | null): void {
  it('is a BlockStatement', () => {
    expect(isBlockStatement(statement)).toBe(true);
  });
}

function testParserErrors(parser: Parser): void {
  it('results without errors', () => {
    expect(parser.errors.length).toBe(0);
  });
}

function testIdentifierExpression(expression: Expression | null, value: string): void {
  it('has Identifier expression with correct value', () => {
    const isIdentifier = isIdentifierExpression(expression);
    expect(isIdentifier).toBe(true);
    expect(isIdentifier && expression.value).toBe(value);
    expect(isIdentifier && expression.tokenLiteral()).toBe(value);
  });
}

function testIntegerLiteralExpression(expression: Expression | null, value: number): void {
  it('has an IntegerLiteral expression with correct value', () => {
    const isIntegerLiteral = isIntegerLiteralExpression(expression);
    expect(isIntegerLiteral).toBe(true);
    expect(isIntegerLiteral && expression.value).toBe(value);
    expect(expression?.tokenLiteral()).toBe(value.toString());
  });
}

function testBoolExperssion(expression: Expression | null, value: boolean): void {
  it('has a Bool expression with correct value', () => {
    const isBool = isBoolExpression(expression);
    expect(isBool).toBe(true);
    expect(isBool ? expression.value : null).toBe(value);
    expect(isBool && `${expression.value}`).toBe(`${value}`);
  });
}

function testLiteralExpression(expression: Expression | null, expected: unknown): void {
  switch (typeof expected) {
    case 'string':
      testIdentifierExpression(expression, expected);
      break;
    case 'number':
      testIntegerLiteralExpression(expression, expected);
      break;
    case 'boolean':
      testBoolExperssion(expression, expected);
      break;
    default:
      break;
  }
}

function testInfixExpression(
  expression: Expression | null,
  leftValue: unknown,
  operator: string,
  rightValue: unknown,
): void {
  const isInfix = isInfixExperssion(expression);

  it('has an InfixExpression', () => {
    expect(isInfix).toBe(true);
  });

  const left = isInfix ? expression.left : null;
  const right = isInfix ? expression.right : null;

  testLiteralExpression(left, leftValue);
  testOperator(expression, operator);
  testLiteralExpression(right, rightValue);
}

function testNumberOfStatements<T extends { statements: Statement[] } | null>(
  obj: T,
  num: number,
): void {
  it('has correct number of statements', () => {
    expect(obj && obj.statements.length).toBe(num);
  });
}

function testNumberOfArgs<T extends { args: Expression[] } | null>(func: T, num: number): void {
  it('has correct number of args', () => {
    expect(func && func.args.length).toBe(num);
  });
}

function testOperator(expression: Expression | null, operator: string): void {
  it('has correct operator', () => {
    const hasOperator = expression && 'operator' in expression && !!expression.operator;
    expect(hasOperator).toBe(true);
    expect(hasOperator && expression.operator).toBe(operator);
  });
}

function isLetStatement(statement: Statement | null): statement is LetStatement {
  return statement instanceof LetStatement;
}

function isReturnStatement(statement: Statement | null): statement is ReturnStatement {
  return statement instanceof ReturnStatement;
}

function isExpressionStatement(statement: Statement | null): statement is ExpressionStatement {
  return !!statement && statement instanceof ExpressionStatement;
}

function isIdentifierExpression(expression: Expression | null): expression is Identifier {
  return expression instanceof Identifier;
}

function isIntegerLiteralExpression(expression: Expression | null): expression is IntegerLiteral {
  return expression instanceof IntegerLiteral;
}

function isPrefixExpression(expression: Expression | null): expression is PrefixExpression {
  return expression instanceof PrefixExpression;
}

function isInfixExperssion(expression: Expression | null): expression is InfixExpression {
  return expression instanceof InfixExpression;
}

function isBoolExpression(expression: Expression | null): expression is BoolExpression {
  return expression instanceof BoolExpression;
}

function isIfExpression(expression: Expression | null): expression is IfExpression {
  return expression instanceof IfExpression;
}

function isBlockStatement(statement: Statement | null): statement is BlockStatement {
  return statement instanceof BlockStatement;
}

function isFunctionExpression(expression: Expression | null): expression is FunctionExpression {
  return expression instanceof FunctionExpression;
}

function isCallExpression(expression: Expression | null): expression is CallExpression {
  return expression instanceof CallExpression;
}

function isStringLiteralExpression(expression: Expression | null): expression is StringLiteral {
  return expression instanceof StringLiteral;
}

function isArrayLiteralExpression(expression: Expression | null): expression is ArrayLiteral {
  return expression instanceof ArrayLiteral;
}
