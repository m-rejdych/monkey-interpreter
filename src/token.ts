export const TOKEN_TYPES = {
  ILLEGAL: 'ILLEGAL',
  EOF: 'EOF',

  // Identifiers + literals
  IDENT: 'IDENT',
  INT: 'INT',

  // Operatos
  ASSIGN: '=',
  PLUS: '+',
  MINUS: '-',
  BANG: '!',
  ASTERISK: '*',
  SLASH: '/',
  LT: '<',
  GT: '>',
  EQ: '==',
  NOT_EQ: '!=',

  // Delimeters
  COMMA: ',',
  SEMICOLON: ';',

  LPAREN: '(',
  RPAREN: ')',
  LBRACE: '{',
  RBRACE: '}',

  // Keywords
  FUNCTION: 'FUNCTION',
  LET: 'LET',
  TRUE: 'TRUE',
  FALSE: 'FALSE',
  IF: 'IF',
  ELSE: 'ELSE',
  RETURN: 'RETURN',
} as const;

const KEYWORDS = {
  fn: TOKEN_TYPES.FUNCTION,
  let: TOKEN_TYPES.LET,
  true: TOKEN_TYPES.TRUE,
  false: TOKEN_TYPES.FALSE,
  if: TOKEN_TYPES.IF,
  else: TOKEN_TYPES.ELSE,
  return: TOKEN_TYPES.RETURN,
} as const satisfies Record<string, TokenTypes>;

export const WHITESPACE_CHARS = [' ', '\n', '\r', '\t'];

export type TokenTypes = (typeof TOKEN_TYPES)[keyof typeof TOKEN_TYPES];

type Keywords = (typeof KEYWORDS)[keyof typeof KEYWORDS];

export class Token {
  constructor(
    public type: TokenTypes,
    public literal: string,
  ) {}

  static lookupIdent(ident: string): Keywords | typeof TOKEN_TYPES.IDENT {
    if (isKeyword(ident)) return KEYWORDS[ident];
    return TOKEN_TYPES.IDENT;
  }
}

function isKeyword(ident: string): ident is keyof typeof KEYWORDS {
  return ident in KEYWORDS;
}
