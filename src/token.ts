export const TOKEN_TYPE = {
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
  fn: TOKEN_TYPE.FUNCTION,
  let: TOKEN_TYPE.LET,
  true: TOKEN_TYPE.TRUE,
  false: TOKEN_TYPE.FALSE,
  if: TOKEN_TYPE.IF,
  else: TOKEN_TYPE.ELSE,
  return: TOKEN_TYPE.RETURN,
} as const satisfies Record<string, TokenType>;

export const WHITESPACE_CHARS = [' ', '\n', '\r', '\t'];

export type TokenType = (typeof TOKEN_TYPE)[keyof typeof TOKEN_TYPE];

type Keywords = (typeof KEYWORDS)[keyof typeof KEYWORDS];

export class Token {
  constructor(
    public type: TokenType,
    public literal: string,
  ) {}

  static lookupIdent(ident: string): Keywords | typeof TOKEN_TYPE.IDENT {
    if (isKeyword(ident)) return KEYWORDS[ident];
    return TOKEN_TYPE.IDENT;
  }
}

function isKeyword(ident: string): ident is keyof typeof KEYWORDS {
  return ident in KEYWORDS;
}
