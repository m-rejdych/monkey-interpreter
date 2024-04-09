import { Parser } from '../parser';
import { Lexer } from '../lexer';
import { Statement, LetStatement } from '../ast';

describe('Let statements', () => {
  const input = `
  let x = 5;
  let y = 10;
  let foobar = 838383;
`;

  const lexer = new Lexer(input);
  const parser = new Parser(lexer);

  const program = parser.parseProgram();

  it('creates program', () => {
    expect(program).not.toBe(null);
  });

  it('results without errors', () => {
    checkParserErrors(parser);
  });

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

function testLetStatement(statement: Statement, name: string): void {
  expect(statement.tokenLiteral()).toBe('let');
  expect(statement instanceof LetStatement).toBe(true);
  expect((statement as LetStatement).name.value).toBe(name);
}

function checkParserErrors(parser: Parser): void {
  expect(parser.errors.length).toBe(0);
}
