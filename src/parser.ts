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
  BlockStatement,
  IntegerLiteral,
  PrefixExpression,
  InfixExpression,
  BoolExpression,
  IfExpression,
  FunctionExpression,
  CallExpression,
  StringLiteral,
  ArrayLiteral,
  IndexExpression,
  HashLiteral,
} from './ast';

type PrefixParseFn = () => Expression | null;
type InfixParseFn = (expression: Expression) => Expression | null;

const PRECEDENCE_TYPE = {
  LOWEST: 0,
  EQUALS: 1,
  LESSGREATER: 2,
  SUM: 3,
  PRODUCT: 4,
  PREFIX: 5,
  CALL: 6,
  INDEX: 7,
} as const;

type PrecedenceType = (typeof PRECEDENCE_TYPE)[keyof typeof PRECEDENCE_TYPE];

const PRECEDENCES: Partial<Record<TokenType, PrecedenceType>> = {
  [TOKEN_TYPE.EQ]: PRECEDENCE_TYPE.EQUALS,
  [TOKEN_TYPE.NOT_EQ]: PRECEDENCE_TYPE.EQUALS,
  [TOKEN_TYPE.LT]: PRECEDENCE_TYPE.LESSGREATER,
  [TOKEN_TYPE.GT]: PRECEDENCE_TYPE.LESSGREATER,
  [TOKEN_TYPE.PLUS]: PRECEDENCE_TYPE.SUM,
  [TOKEN_TYPE.MINUS]: PRECEDENCE_TYPE.SUM,
  [TOKEN_TYPE.SLASH]: PRECEDENCE_TYPE.PRODUCT,
  [TOKEN_TYPE.ASTERISK]: PRECEDENCE_TYPE.PRODUCT,
  [TOKEN_TYPE.LPAREN]: PRECEDENCE_TYPE.CALL,
  [TOKEN_TYPE.LBRACKET]: PRECEDENCE_TYPE.INDEX,
};

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
    this.registerPrefix(TOKEN_TYPE.BANG, this.parsePrefixExpression.bind(this));
    this.registerPrefix(TOKEN_TYPE.MINUS, this.parsePrefixExpression.bind(this));
    this.registerPrefix(TOKEN_TYPE.TRUE, this.parseBoolExpression.bind(this));
    this.registerPrefix(TOKEN_TYPE.FALSE, this.parseBoolExpression.bind(this));
    this.registerPrefix(TOKEN_TYPE.LPAREN, this.parseGroupedExpression.bind(this));
    this.registerPrefix(TOKEN_TYPE.RPAREN, this.parseGroupedExpression.bind(this));
    this.registerPrefix(TOKEN_TYPE.IF, this.parseIfExpression.bind(this));
    this.registerPrefix(TOKEN_TYPE.FUNCTION, this.parseFunctionExpression.bind(this));
    this.registerPrefix(TOKEN_TYPE.STRING, this.parseStringLiteral.bind(this));
    this.registerPrefix(TOKEN_TYPE.LBRACKET, this.parseArrayLiteral.bind(this));
    this.registerPrefix(TOKEN_TYPE.LBRACE, this.parseHashLiteral.bind(this));
    this.registerInfix(TOKEN_TYPE.EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPE.NOT_EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPE.LT, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPE.GT, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPE.PLUS, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPE.MINUS, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPE.SLASH, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPE.ASTERISK, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKEN_TYPE.LPAREN, this.parseCallExpression.bind(this));
    this.registerInfix(TOKEN_TYPE.LBRACKET, this.parseIndexExpression.bind(this));
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

    if (!this.expectPeek(TOKEN_TYPE.ASSIGN)) {
      return null;
    }

    this.nextToken();
    const value = this.parseExpression(PRECEDENCE_TYPE.LOWEST);

    if (this.peekTokenIs(TOKEN_TYPE.SEMICOLON)) {
      this.nextToken();
    }

    return new LetStatement(letToken, name, value);
  }

  parseReturnStatement(): ReturnStatement {
    const returnToken = this.curToken;

    this.nextToken();

    const returnValue = this.parseExpression(PRECEDENCE_TYPE.LOWEST);

    if (this.peekTokenIs(TOKEN_TYPE.SEMICOLON)) {
      this.nextToken();
    }

    return new ReturnStatement(returnToken, returnValue);
  }

  parseExpressionStatement(): ExpressionStatement {
    const statement = new ExpressionStatement(
      this.curToken,
      this.parseExpression(PRECEDENCE_TYPE.LOWEST),
    );

    if (this.peekTokenIs(TOKEN_TYPE.SEMICOLON)) {
      this.nextToken();
    }

    return statement;
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

  parseExpression(precedence: PrecedenceType): Expression | null {
    const prefix = this.prefixParseFns[this.curToken.type];
    if (!prefix) {
      this.errors.push(`no prefix parse function found for ${this.curToken.type}`);
      return null;
    }

    let leftExpression = prefix();
    if (!leftExpression) return null;

    while (!this.peekTokenIs(TOKEN_TYPE.SEMICOLON) && precedence < this.peekPrecedence()) {
      const infix = this.infixParseFns[this.peekToken.type];
      if (!infix) return null;

      this.nextToken();

      if (!leftExpression) return null;
      leftExpression = infix(leftExpression);
    }

    return leftExpression;
  }

  parsePrefixExpression(): PrefixExpression {
    const operatorToken = this.curToken;

    this.nextToken();

    const prefixExpression = new PrefixExpression(
      operatorToken,
      operatorToken.literal,
      this.parseExpression(PRECEDENCE_TYPE.PREFIX)!,
    );

    return prefixExpression;
  }

  parseInfixExpression(left: Expression): InfixExpression {
    const operatorToken = this.curToken;
    const precedence = this.curPrecedence();

    this.nextToken();

    const infixExpression = new InfixExpression(
      operatorToken,
      operatorToken.literal,
      left,
      this.parseExpression(precedence)!,
    );

    return infixExpression;
  }

  parseBoolExpression(): BoolExpression {
    return new BoolExpression(this.curToken, this.curTokenIs(TOKEN_TYPE.TRUE));
  }

  parseIfExpression(): IfExpression | null {
    const ifToken = this.curToken;

    if (!this.expectPeek(TOKEN_TYPE.LPAREN)) {
      return null;
    }

    this.nextToken();

    const condition = this.parseExpression(PRECEDENCE_TYPE.LOWEST);
    if (!condition) return null;

    if (!this.expectPeek(TOKEN_TYPE.RPAREN)) {
      return null;
    }

    if (!this.expectPeek(TOKEN_TYPE.LBRACE)) {
      return null;
    }

    const consequence = this.parseBlockStatement();

    const hasAlternative = this.peekTokenIs(TOKEN_TYPE.ELSE);
    if (hasAlternative) {
      this.nextToken();
      if (!this.expectPeek(TOKEN_TYPE.LBRACE)) {
        return null;
      }
    }

    const alternative = hasAlternative ? this.parseBlockStatement() : null;

    return new IfExpression(ifToken, condition, consequence, alternative);
  }

  parseBlockStatement(): BlockStatement {
    const blockStatement = new BlockStatement(this.curToken);

    this.nextToken();

    while (!this.curTokenIs(TOKEN_TYPE.RBRACE) && !this.curTokenIs(TOKEN_TYPE.EOF)) {
      const statement = this.parseStatement();
      if (statement) blockStatement.pushStatement(statement);
      this.nextToken();
    }

    return blockStatement;
  }

  parseGroupedExpression(): Expression | null {
    this.nextToken();

    const expression = this.parseExpression(PRECEDENCE_TYPE.LOWEST);

    if (!this.expectPeek(TOKEN_TYPE.RPAREN)) {
      return null;
    }

    return expression;
  }

  parseFunctionExpression(): FunctionExpression | null {
    const fnToken = this.curToken;

    if (!this.expectPeek(TOKEN_TYPE.LPAREN)) {
      return null;
    }

    const params = this.parseFunctionParameters();
    if (!params) return null;

    if (!this.expectPeek(TOKEN_TYPE.LBRACE)) {
      return null;
    }

    return new FunctionExpression(fnToken, params, this.parseBlockStatement());
  }

  parseFunctionParameters(): Identifier[] | null {
    const params: Identifier[] = [];

    this.nextToken();

    if (this.curTokenIs(TOKEN_TYPE.RPAREN)) {
      return params;
    }

    params.push(this.parseIdentifier());

    while (this.peekTokenIs(TOKEN_TYPE.COMMA)) {
      this.nextToken();
      this.nextToken();
      params.push(this.parseIdentifier());
    }

    if (!this.expectPeek(TOKEN_TYPE.RPAREN)) {
      return null;
    }

    return params;
  }

  parseCallExpression(func: Expression): CallExpression | null {
    const functionToken = this.curToken;
    const args = this.parseExpressionList(TOKEN_TYPE.RPAREN);
    if (!args) return null;

    return new CallExpression(functionToken, func, args);
  }

  parseStringLiteral(): StringLiteral {
    return new StringLiteral(this.curToken, this.curToken.literal);
  }

  parseArrayLiteral(): ArrayLiteral | null {
    const token = this.curToken;

    const elements = this.parseExpressionList(TOKEN_TYPE.RBRACKET);
    if (!elements) return null;

    return new ArrayLiteral(token, elements);
  }

  parseExpressionList(end: TokenType): Expression[] | null {
    const list: Expression[] = [];

    this.nextToken();

    if (this.curTokenIs(end)) {
      return list;
    }

    const elem = this.parseExpression(PRECEDENCE_TYPE.LOWEST);
    if (!elem) return null;
    list.push(elem);

    while (this.peekTokenIs(TOKEN_TYPE.COMMA)) {
      this.nextToken();
      this.nextToken();
      const newElem = this.parseExpression(PRECEDENCE_TYPE.LOWEST);
      if (!newElem) return null;

      list.push(newElem);
    }

    if (!this.expectPeek(end)) {
      return null;
    }

    return list;
  }

  parseIndexExpression(left: Expression): IndexExpression | null {
    const token = this.curToken;
    this.nextToken();

    const index = this.parseExpression(PRECEDENCE_TYPE.LOWEST);
    if (!index) return null;

    if (!this.expectPeek(TOKEN_TYPE.RBRACKET)) {
      return null;
    }

    return new IndexExpression(token, left, index);
  }

  parseHashLiteral(): HashLiteral | null {
    const token = this.curToken;
    const entries: [Expression, Expression][] = [];

    this.nextToken();

    if (this.curTokenIs(TOKEN_TYPE.RBRACE)) {
      return new HashLiteral(token, entries);
    }

    const key = this.parseExpression(PRECEDENCE_TYPE.LOWEST);
    if (!key) return null;

    if (!this.expectPeek(TOKEN_TYPE.COLON)) {
      return null;
    }

    this.nextToken();

    const value = this.parseExpression(PRECEDENCE_TYPE.LOWEST);
    if (!value) return null;

    entries.push([key, value]);

    while (this.peekTokenIs(TOKEN_TYPE.COMMA)) {
      this.nextToken();
      this.nextToken();

      const key = this.parseExpression(PRECEDENCE_TYPE.LOWEST);
      if (!key) return null;

      if (!this.expectPeek(TOKEN_TYPE.COLON)) {
        return null;
      }

      this.nextToken();

      const value = this.parseExpression(PRECEDENCE_TYPE.LOWEST);
      if (!value) return null;

      entries.push([key, value]);
    }

    if (!this.expectPeek(TOKEN_TYPE.RBRACE)) {
      return null;
    }

    return new HashLiteral(token, entries);
  }

  curTokenIs(type: TokenType): boolean {
    return this.curToken.type === type;
  }

  peekTokenIs(type: TokenType): boolean {
    return this.peekToken.type === type;
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

  peekPrecedence(): PrecedenceType {
    return PRECEDENCES[this.peekToken.type] ?? PRECEDENCE_TYPE.LOWEST;
  }

  curPrecedence(): PrecedenceType {
    return PRECEDENCES[this.curToken.type] ?? PRECEDENCE_TYPE.LOWEST;
  }

  registerPrefix(tokenType: TokenType, fn: PrefixParseFn): void {
    this.prefixParseFns[tokenType] = fn;
  }

  registerInfix(tokenType: TokenType, fn: InfixParseFn): void {
    this.infixParseFns[tokenType] = fn;
  }
}
