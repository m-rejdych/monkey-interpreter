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

  it('has an IntegerLiteral expression with correct value', () => {
    const integerLiteral = isExpressionStatement(statement) ? statement.expression : null;
    const isIntegerLiteral = isIntegerLiteralExpression(integerLiteral);
    expect(isIntegerLiteral).toBe(true);
    expect(isIntegerLiteral && integerLiteral.value).toBe(5);
    expect(integerLiteral?.tokenLiteral()).toBe('5');
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

function testNumberOfStatements(program: Program, num: number): void {
  it('has correct number of statements', () => {
    expect(program.statements.length).toBe(num);
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
