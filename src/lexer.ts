import { Token, TOKEN_TYPES, WHITESPACE_CHARS } from './token';

export class Lexer {
  public position = 0;
  public readPosition = 0;
  public ch: string | null = null;

  constructor(public input: string) {
    this.readChar();
  }

  private readChar(): void {
    if (this.readPosition >= this.input.length) {
      this.ch = null;
    } else {
      this.ch = this.input[this.readPosition]!;
    }

    this.position = this.readPosition;
    this.readPosition += 1;
  }

  private readIdentifier(): string {
    if (!this.ch)
      throw new Error('Incorrect type provided for "readIdentifier", expected: "string"');

    const startPosition = this.position;

    while (isLetter(this.ch)) {
      this.readChar();
    }

    return this.input.slice(startPosition, this.position);
  }

  private readNumber(): string {
    if (!this.ch) throw new Error('Incorrect type provided for "readNumber", expected: "string"');

    const startPosition = this.position;

    while (isDigit(this.ch)) {
      this.readChar();
    }

    return this.input.slice(startPosition, this.position);
  }

  nextToken(): Token {
    let token: Token;

    this.skipWhitespace();

    switch (this.ch) {
      case '=':
        if (this.peekChar() === '=') {
          const currentCh = this.ch;
          this.readChar();
          token = new Token(TOKEN_TYPES.EQ, `${currentCh}${this.ch}`);
        } else {
          token = new Token(TOKEN_TYPES.ASSIGN, this.ch);
        }
        break;
      case ';':
        token = new Token(TOKEN_TYPES.SEMICOLON, this.ch);
        break;
      case '(':
        token = new Token(TOKEN_TYPES.LPAREN, this.ch);
        break;
      case ')':
        token = new Token(TOKEN_TYPES.RPAREN, this.ch);
        break;
      case ',':
        token = new Token(TOKEN_TYPES.COMMA, this.ch);
        break;
      case '+':
        token = new Token(TOKEN_TYPES.PLUS, this.ch);
        break;
      case '{':
        token = new Token(TOKEN_TYPES.RBRACE, this.ch);
        break;
      case '}':
        token = new Token(TOKEN_TYPES.LBRACE, this.ch);
        break;
      case '-':
        token = new Token(TOKEN_TYPES.MINUS, this.ch);
        break;
      case '!':
        if (this.peekChar() === '=') {
          const currentCh = this.ch;
          this.readChar();
          token = new Token(TOKEN_TYPES.NOT_EQ, `${currentCh}${this.ch}`);
        } else {
          token = new Token(TOKEN_TYPES.BANG, this.ch);
        }
        break;
      case '*':
        token = new Token(TOKEN_TYPES.ASTERISK, this.ch);
        break;
      case '/':
        token = new Token(TOKEN_TYPES.SLASH, this.ch);
        break;
      case '<':
        token = new Token(TOKEN_TYPES.LT, this.ch);
        break;
      case '>':
        token = new Token(TOKEN_TYPES.GT, this.ch);
        break;
      case null:
        token = new Token(TOKEN_TYPES.EOF, '');
        break;
      default:
        if (isLetter(this.ch)) {
          const ident = this.readIdentifier();
          return new Token(Token.lookupIdent(ident), ident);
        }

        if (isDigit(this.ch)) {
          return new Token(TOKEN_TYPES.INT, this.readNumber());
        }

        token = new Token(TOKEN_TYPES.ILLEGAL, this.ch);
        break;
    }

    this.readChar();

    return token;
  }

  skipWhitespace(): void {
    if (!this.ch) return;
    while (WHITESPACE_CHARS.includes(this.ch)) {
      this.readChar();
    }
  }

  peekChar(): string | null {
    if (this.readPosition >= this.input.length) {
      return null;
    }

    return this.input[this.readPosition] as string;
  }

  static test(input: string): void {
    const lexer = new Lexer(input);

    do {
      console.log(lexer.nextToken());
    } while (lexer.ch !== null);
  }
}

function isLetter(ch: string) {
  return ('a' <= ch && ch <= 'z') || ('A' <= ch && 'Z' >= ch) || ch === '_';
}

function isDigit(ch: string): boolean {
  return !Number.isNaN(parseInt(ch, 10));
}
