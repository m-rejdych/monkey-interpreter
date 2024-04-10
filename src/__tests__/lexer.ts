import { Lexer } from '../lexer';
import { TOKEN_TYPES, TokenTypes } from '../token';

describe('Tokens', () => {
  const input = `let five = 5;
let ten = 10;
   let add = fn(x, y) {
     x + y;
};
   let result = add(five, ten);
   `;

  const lexer = new Lexer(input);

  it('assigns correct literal value and token type', () => {
    const expected: { type: TokenTypes; literal: string }[] = [
      { type: TOKEN_TYPES.LET, literal: 'let' },
      { type: TOKEN_TYPES.IDENT, literal: 'five' },
      { type: TOKEN_TYPES.ASSIGN, literal: '=' },
      { type: TOKEN_TYPES.INT, literal: '5' },
      { type: TOKEN_TYPES.SEMICOLON, literal: ';' },
      { type: TOKEN_TYPES.LET, literal: 'let' },
      { type: TOKEN_TYPES.IDENT, literal: 'ten' },
      { type: TOKEN_TYPES.ASSIGN, literal: '=' },
      { type: TOKEN_TYPES.INT, literal: '10' },
      { type: TOKEN_TYPES.SEMICOLON, literal: ';' },
      { type: TOKEN_TYPES.LET, literal: 'let' },
      { type: TOKEN_TYPES.IDENT, literal: 'add' },
      { type: TOKEN_TYPES.ASSIGN, literal: '=' },
      { type: TOKEN_TYPES.FUNCTION, literal: 'fn' },
      { type: TOKEN_TYPES.LPAREN, literal: '(' },
      { type: TOKEN_TYPES.IDENT, literal: 'x' },
      { type: TOKEN_TYPES.COMMA, literal: ',' },
      { type: TOKEN_TYPES.IDENT, literal: 'y' },
      { type: TOKEN_TYPES.RPAREN, literal: ')' },
      { type: TOKEN_TYPES.LBRACE, literal: '{' },
      { type: TOKEN_TYPES.IDENT, literal: 'x' },
      { type: TOKEN_TYPES.PLUS, literal: '+' },
      { type: TOKEN_TYPES.IDENT, literal: 'y' },
      { type: TOKEN_TYPES.SEMICOLON, literal: ';' },
      { type: TOKEN_TYPES.RBRACE, literal: '}' },
      { type: TOKEN_TYPES.SEMICOLON, literal: ';' },
      { type: TOKEN_TYPES.LET, literal: 'let' },
      { type: TOKEN_TYPES.IDENT, literal: 'result' },
      { type: TOKEN_TYPES.ASSIGN, literal: '=' },
      { type: TOKEN_TYPES.IDENT, literal: 'add' },
      { type: TOKEN_TYPES.LPAREN, literal: '(' },
      { type: TOKEN_TYPES.IDENT, literal: 'five' },
      { type: TOKEN_TYPES.COMMA, literal: ',' },
      { type: TOKEN_TYPES.IDENT, literal: 'ten' },
      { type: TOKEN_TYPES.RPAREN, literal: ')' },
      { type: TOKEN_TYPES.SEMICOLON, literal: ';' },
      { type: TOKEN_TYPES.EOF, literal: '' },
    ];

    let i = 0;

    while (true) {
      const token = lexer.nextToken();
      const isPresent = i in expected;
      expect(isPresent).toBe(true);

      if (isPresent) {
        expect(token.type).toBe(expected[i]!.type);
        expect(token.literal).toBe(expected[i]!.literal);
      }

      i++;

      if (lexer.ch === null) break;
    }
  });
});
