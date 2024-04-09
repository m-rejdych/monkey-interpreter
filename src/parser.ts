import { Lexer } from './lexer';
import { Token, TOKEN_TYPES, type TokenTypes } from './token';
import { Program, Statement, LetStatement, Identifier } from './ast';

class Parser {
  curToken: Token | null = null;
  peekToken: Token | null = null;

  constructor(public lexer: Lexer) {
    this.nextToken();
  }

  nextToken(): void {
    this.curToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  parseProgram(): Program {
    const program = new Program();
    this.nextToken();

    while (true) {
      const statement = this.parseStatement();
      if (statement) {
        program.pushStatement(statement);
      }

      this.nextToken();

      if (this.curTokenIs(TOKEN_TYPES.EOF)) break;
    }

    return program;
  }

  parseStatement(): Statement | null {
    if (!this.curToken) return null;

    switch (this.curToken.type) {
      case TOKEN_TYPES.LET:
        return this.parseLetStatement();
     default:
       return null;
    }
  }

  parseLetStatement(): LetStatement | null {
    if (!this.curToken) return null;

    const letToken = this.curToken;

    if (!this.expectPeek(TOKEN_TYPES.IDENT)) {
      return null;
    }

    const name = new Identifier(this.curToken, this.curToken.literal);

    // TODO: make value an Expression
    const letStatement = new LetStatement(letToken, name, null);

    if (!this.expectPeek(TOKEN_TYPES.ASSIGN)) {
      return null;
    }

    // TODO: Handle expression
    while (!this.curTokenIs(TOKEN_TYPES.SEMICOLON)) {
      this.nextToken();
    }

    return letStatement;
  }

  curTokenIs(type: TokenTypes): boolean {
    return this.curToken?.type === type;
  }

  peekTokenIs(type: TokenTypes): boolean {
    return this.peekToken?.type === type;
  }

  expectPeek(type: TokenTypes): boolean {
    if (!this.peekTokenIs(type)) return false;

    this.nextToken();
    return true;
  }
}

export function testLetStatements(): void {
  const input = `
  let x = 5;
  let y = 10;
  let foobar = 838383;
`;

  const lexer = new Lexer(input);
  const parser = new Parser(lexer);

  const program = parser.parseProgram();

  if (program === null) {
    throw new Error('parseProgram returned null');
  }

  if (program.statements.length !== 3) {
    throw new Error(
      `program.statements does not contain 3 statements, got ${program.statements.length}`,
    );
  }

  const expectedIdentifiers = ['x', 'y', 'foobar'];

  for (let i = 0; i < expectedIdentifiers.length; i++) {
    const statement = program.statements[i]!;
    const expectedIdentifier = expectedIdentifiers[i]!;

    testLetStatement(statement, expectedIdentifier);
  }

  console.log(program);
}

function testLetStatement(statement: Statement, name: string): void {
  if (statement.tokenLiteral() !== 'let') {
    throw new Error(`Expected token literal: "let", got: ${statement.tokenLiteral()}`);
  }

  if (!(statement instanceof LetStatement)) {
    throw new Error(`Expected "LetStatement", got: ${statement}`);
  }

  if (statement.name.value !== name) {
    throw new Error(`Expected letStatement.name: "${name}", got: ${statement.name.value}`);
  }

  console.log('Test passed for statement: ', statement);
}
