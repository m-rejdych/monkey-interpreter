import { Lexer } from './lexer';
import { Token, TOKEN_TYPE, type TokenType } from './token';
import {
  Program,
  Statement,
  Expression,
  LetStatement,
  Identifier,
  ReturnStatement,
  ExpressionStatement,
  IntegerLiteral,
} from './ast';

type PrefixParseFn = () => Expression | null;
type InfixParseFn = (expression: Expression) => Expression | null;

const PRECEDENCE = {
  LOWEST: 0,
  EQUALS: 1,
  LESSGREATER: 2,
  SUM: 3,
  PRODUCT: 4,
  PREFIX: 5,
  CALL: 6,
} as const;

type Precedence = (typeof PRECEDENCE)[keyof typeof PRECEDENCE];

export class Parser {
  curToken: Token;
  peekToken: Token;
  errors: string[] = [];
  prefixParseFns: Partial<Record<TokenType, PrefixParseFn>> = {};
  infixParseFns: Partial<Record<TokenType, InfixParseFn>> = {};

  constructor(public lexer: Lexer) {
    this.curToken = lexer.nextToken();
    this.peekToken = lexer.nextToken();
    this.registerPrefix(TOKEN_TYPE.IDENT, this.parseIdentifier.bind(this));
    this.registerPrefix(TOKEN_TYPE.INT, this.parseIntegerLiteral.bind(this));
  }

  nextToken(): void {
    this.curToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  parseProgram(): Program {
    const program = new Program();

    while (true) {
      const statement = this.parseStatement();
      if (statement) {
        program.pushStatement(statement);
      }

      this.nextToken();

      if (this.curTokenIs(TOKEN_TYPE.EOF)) break;
    }

    return program;
  }

  parseStatement(): Statement | null {
    switch (this.curToken.type) {
      case TOKEN_TYPE.LET:
        return this.parseLetStatement();
      case TOKEN_TYPE.RETURN:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  parseLetStatement(): LetStatement | null {
    const letToken = this.curToken;

    if (!this.expectPeek(TOKEN_TYPE.IDENT)) {
      return null;
    }

    const name = new Identifier(this.curToken, this.curToken.literal);

    // TODO: make value an Expression
    const letStatement = new LetStatement(letToken, name, null);

    if (!this.expectPeek(TOKEN_TYPE.ASSIGN)) {
      return null;
    }

    // TODO: Handle expression
    while (!this.curTokenIs(TOKEN_TYPE.SEMICOLON)) {
      this.nextToken();
    }

    return letStatement;
  }

  parseReturnStatement(): ReturnStatement {
    // TODO: make value an Expression
    const returnStatement = new ReturnStatement(this.curToken, null);

    this.nextToken();

    // TODO: Handle expression
    while (!this.curTokenIs(TOKEN_TYPE.SEMICOLON)) {
      this.nextToken();
    }

    return returnStatement;
  }

  parseExpressionStatement(): ExpressionStatement {
    const statement = new ExpressionStatement(
      this.curToken,
      this.parseExpression(PRECEDENCE.LOWEST),
    );

    if (this.peekTokenIs(TOKEN_TYPE.SEMICOLON)) {
      this.nextToken();
    }

    return statement;
  }

  parseExpression(_precedence: Precedence): Expression | null {
    const prefix = this.prefixParseFns[this.curToken.type];
    if (!prefix) return null;

    const leftExpression = prefix();

    return leftExpression;
  }

  parseIdentifier(): Identifier {
    return new Identifier(this.curToken, this.curToken.literal);
  }

  parseIntegerLiteral(): IntegerLiteral | null {
    const integer = parseInt(this.curToken.literal, 10);

    if (Number.isNaN(integer)) {
      this.errors.push(`${this.curToken.literal} could not be parsed as an integer`);
      return null;
    }

    return new IntegerLiteral(this.curToken, integer);
  }

  curTokenIs(type: TokenType): boolean {
    return this.curToken?.type === type;
  }

  peekTokenIs(type: TokenType): boolean {
    return this.peekToken?.type === type;
  }

  expectPeek(type: TokenType): boolean {
    const isValidToken = this.peekTokenIs(type);

    if (isValidToken) {
      this.nextToken();
    } else {
      this.peekError(type);
    }

    return isValidToken;
  }

  peekError(type: TokenType): void {
    this.errors.push(`Expected next token: ${type}, got: ${this.peekToken?.type}`);
  }

  registerPrefix(tokenType: TokenType, fn: PrefixParseFn): void {
    this.prefixParseFns[tokenType] = fn;
  }

  registerInfix(tokenType: TokenType, fn: InfixParseFn): void {
    this.infixParseFns[tokenType] = fn;
  }
}
