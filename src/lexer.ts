import { Token, TOKEN_TYPE, WHITESPACE_CHARS } from './token';

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
          token = new Token(TOKEN_TYPE.EQ, `${currentCh}${this.ch}`);
        } else {
          token = new Token(TOKEN_TYPE.ASSIGN, this.ch);
        }
        break;
      case ';':
        token = new Token(TOKEN_TYPE.SEMICOLON, this.ch);
        break;
      case ':':
        token = new Token(TOKEN_TYPE.COLON, this.ch);
        break;
      case '(':
        token = new Token(TOKEN_TYPE.LPAREN, this.ch);
        break;
      case ')':
        token = new Token(TOKEN_TYPE.RPAREN, this.ch);
        break;
      case ',':
        token = new Token(TOKEN_TYPE.COMMA, this.ch);
        break;
      case '+':
        token = new Token(TOKEN_TYPE.PLUS, this.ch);
        break;
      case '{':
        token = new Token(TOKEN_TYPE.LBRACE, this.ch);
        break;
      case '}':
        token = new Token(TOKEN_TYPE.RBRACE, this.ch);
        break;
      case '-':
        token = new Token(TOKEN_TYPE.MINUS, this.ch);
        break;
      case '!':
        if (this.peekChar() === '=') {
          const currentCh = this.ch;
          this.readChar();
          token = new Token(TOKEN_TYPE.NOT_EQ, `${currentCh}${this.ch}`);
        } else {
          token = new Token(TOKEN_TYPE.BANG, this.ch);
        }
        break;
      case '*':
        token = new Token(TOKEN_TYPE.ASTERISK, this.ch);
        break;
      case '/':
        token = new Token(TOKEN_TYPE.SLASH, this.ch);
        break;
      case '<':
        token = new Token(TOKEN_TYPE.LT, this.ch);
        break;
      case '>':
        token = new Token(TOKEN_TYPE.GT, this.ch);
        break;
      case '"':
        token = new Token(TOKEN_TYPE.STRING, this.readString());
        break;
      case '[':
        token = new Token(TOKEN_TYPE.LBRACKET, this.ch);
        break;
      case ']':
        token = new Token(TOKEN_TYPE.RBRACKET, this.ch);
        break;
      case null:
        token = new Token(TOKEN_TYPE.EOF, '');
        break;
      default:
        if (isLetter(this.ch)) {
          const ident = this.readIdentifier();
          return new Token(Token.lookupIdent(ident), ident);
        }

        if (isDigit(this.ch)) {
          return new Token(TOKEN_TYPE.INT, this.readNumber());
        }

        token = new Token(TOKEN_TYPE.ILLEGAL, this.ch);
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

  readString(): string {
    this.readChar();

    let str = '';

    while (this.ch !== '"' && this.ch !== null) {
      str += this.ch;
      this.readChar();
    }

    return str;
  }
}

function isLetter(ch: string) {
  return ('a' <= ch && ch <= 'z') || ('A' <= ch && 'Z' >= ch) || ch === '_';
}

function isDigit(ch: string): boolean {
  return !Number.isNaN(parseInt(ch, 10));
}
