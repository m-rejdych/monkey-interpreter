import { Parser } from '../parser';
import { Lexer } from '../lexer';
import {
  Program,
  Statement,
  LetStatement,
  ReturnStatement,
  ExpressionStatement,
  Identifier,
  Expression,
  IntegerLiteral,
  PrefixExpression,
  InfixExpression,
} from '../ast';

describe('Let statements', () => {
  const input = `
  let x = 5;
  let y = 10;
  let foobar = 838383;
`;
  const { program, parser } = createProgram(input);

  testParserErrors(parser);
  testNumberOfStatements(program, 3);

  it('has correct number of statements', () => {
    expect(program.statements.length).toBe(3);
  });

  it('parses let statement', () => {
    const expectedIdentifiers = ['x', 'y', 'foobar'];

    for (let i = 0; i < expectedIdentifiers.length; i++) {
      const statement = program.statements[i]!;
      const expectedIdentifier = expectedIdentifiers[i]!;

      testLetStatement(statement, expectedIdentifier);
    }
  });
});

describe('Return statements', () => {
  const input = `
return 5;
return 10;
return 993332;
`;
  const { parser, program } = createProgram(input);

  testParserErrors(parser);
  testNumberOfStatements(program, 3);

  it('it parses return correctly', () => {
    program.statements.forEach((statement) => {
      expect(statement instanceof ReturnStatement).toBe(true);
      expect(statement.tokenLiteral()).toBe('return');
    });
  });
});

describe('Identifier expression', () => {
  const input = 'foobar;';
  const { program, parser } = createProgram(input);

  testParserErrors(parser);
  testNumberOfStatements(program, 1);

  const statement = program.statements[0] ?? null;
  testExpressionStatement(statement);

  it('is has Identifier expression with correct value', () => {
    const identifier = isExpressionStatement(statement) ? statement.expression : null;
    const isIdentifier = isIdentifierExpression(identifier);
    expect(isIdentifier).toBe(true);
    expect(isIdentifier && identifier.value).toBe('foobar');
  });
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
  const tests: { input: string; operator: string; integerValue: number }[] = [
    {
      input: '!5',
      operator: '!',
      integerValue: 5,
    },
    {
      input: '-15',
      operator: '-',
      integerValue: 15,
    },
  ];

  tests.forEach(({ input, operator, integerValue }) => {
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
    testIntegerLiteralExpression(isPrefix ? prefix.right : null, integerValue);
  });
});

describe('Infix expression', () => {
  const tests: { input: string; leftValue: number; operator: string; rightValue: number }[] = [
    { input: '5 + 5', leftValue: 5, operator: '+', rightValue: 5 },
    { input: '5 - 5', leftValue: 5, operator: '-', rightValue: 5 },
    { input: '5 * 5', leftValue: 5, operator: '*', rightValue: 5 },
    { input: '5 / 5', leftValue: 5, operator: '/', rightValue: 5 },
    { input: '5 < 5', leftValue: 5, operator: '<', rightValue: 5 },
    { input: '5 > 5', leftValue: 5, operator: '>', rightValue: 5 },
    { input: '5 == 5', leftValue: 5, operator: '==', rightValue: 5 },
    { input: '5 != 5', leftValue: 5, operator: '!=', rightValue: 5 },
  ];

  tests.forEach(({ input, leftValue, rightValue, operator }) => {
    const { program, parser } = createProgram(input);

    testParserErrors(parser);
    testNumberOfStatements(program, 1);

    const statement = program.statements[0] ?? null;

    testExpressionStatement(statement);

    const infix = isExpressionStatement(statement) ? statement.expression : null;
    const isInfix = isInfixExperssion(infix);

    it('has an InfixExpression', () => {
      expect(isInfix).toBe(true);
    });

    const leftInteger = isInfix ? infix.left : null;
    const rightInteger = isInfix ? infix.right : null;

    testIntegerLiteralExpression(leftInteger, leftValue);
    testOperator(infix, operator);
    testIntegerLiteralExpression(rightInteger, rightValue);
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

function testLetStatement(statement: Statement, name: string): void {
  expect(statement.tokenLiteral()).toBe('let');
  expect(statement instanceof LetStatement).toBe(true);
  expect((statement as LetStatement).name.value).toBe(name);
}

function testExpressionStatement(statement: Statement | null): void {
  it('is an ExpressionStatement', () => {
    expect(isExpressionStatement(statement)).toBe(true);
  });
}

function testParserErrors(parser: Parser): void {
  it('results without errors', () => {
    expect(parser.errors.length).toBe(0);
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

function testNumberOfStatements(program: Program, num: number): void {
  it('has correct number of statements', () => {
    expect(program.statements.length).toBe(num);
  });
}

function testOperator(expression: Expression | null, operator: string): void {
  it('has correct operator', () => {
    const hasOperator = expression && 'operator' in expression && !!expression.operator;
    expect(hasOperator).toBe(true);
    expect(hasOperator && expression.operator).toBe(operator);
  });
}

function createProgram(input: string): { program: Program; parser: Parser } {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parseProgram();

  return { parser, program };
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
