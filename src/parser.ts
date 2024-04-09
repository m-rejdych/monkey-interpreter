import { Lexer } from './lexer';
import { Token, TOKEN_TYPES, type TokenTypes } from './token';
import { Program, Statement, LetStatement, Identifier } from './ast';

export class Parser {
  curToken: Token | null = null;
  peekToken: Token | null = null;
  errors: string[] = [];

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
    const isValidToken = this.peekTokenIs(type);

    if (isValidToken) {
      this.nextToken();
    } else {
      this.peekError(type);
    }

    return isValidToken;
  }

  peekError(type: TokenTypes): void {
    this.errors.push(`Expected next token: ${type}, got: ${this.peekToken?.type}`);
  }
}
