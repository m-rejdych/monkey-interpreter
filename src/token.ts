export const TOKEN_TYPES = {
  ILLEGAL: 'ILLEGAL',
  EOF: 'EOF',

  // Identifiers + literals
  IDENT: 'IDENT',
  INT: 'INT',

  // Operatos
  ASSIGN: 'ASSIGN',
  PLUS: 'PLUS',

  // Delimeters
  COMMA: 'COMMA',
  SEMICOLON: 'SEMICOLON',

  LPAREN: '(',
  RPAREN: ')',
  LBRACE: '{',
  RBRACE: '}',

  // Keywords
  FUNCTION: 'FUNCTION',
  LET: 'LET',
} as const;

const KEYWORDS = {
  fn: TOKEN_TYPES.FUNCTION,
  let: TOKEN_TYPES.LET,
} as const;

export const WHITESPACE_CHARS = [' ', '\n', '\r', '\t'];

type TokenTypes = (typeof TOKEN_TYPES)[keyof typeof TOKEN_TYPES];

type Keywords = (typeof KEYWORDS)[keyof typeof KEYWORDS];

export class Token {
  constructor(
    public type: TokenTypes,
    public literal: string,
  ) {}

  static lookupIdent(ident: string): Keywords | typeof TOKEN_TYPES.IDENT {
    if (Token.isKeyword(ident)) return KEYWORDS[ident];
    return TOKEN_TYPES.IDENT;
  }

  static isKeyword(ident: string): ident is keyof typeof KEYWORDS {
    return ident in KEYWORDS;
  }
}
