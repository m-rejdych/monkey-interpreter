import { Lexer } from '../lexer';
import { TOKEN_TYPE, TokenType } from '../token';

describe('Next token', () => {
  const input = `let five = 5;
let ten = 10;
   let add = fn(x, y) {
     x + y;
};
   let result = add(five, ten);
   "foobar"
   "foo bar"
   [1, 2];
   {"foo": "bar"}
   `;

  const lexer = new Lexer(input);

  it('assigns correct literal value and token type', () => {
    const expected: { type: TokenType; literal: string }[] = [
      { type: TOKEN_TYPE.LET, literal: 'let' },
      { type: TOKEN_TYPE.IDENT, literal: 'five' },
      { type: TOKEN_TYPE.ASSIGN, literal: '=' },
      { type: TOKEN_TYPE.INT, literal: '5' },
      { type: TOKEN_TYPE.SEMICOLON, literal: ';' },
      { type: TOKEN_TYPE.LET, literal: 'let' },
      { type: TOKEN_TYPE.IDENT, literal: 'ten' },
      { type: TOKEN_TYPE.ASSIGN, literal: '=' },
      { type: TOKEN_TYPE.INT, literal: '10' },
      { type: TOKEN_TYPE.SEMICOLON, literal: ';' },
      { type: TOKEN_TYPE.LET, literal: 'let' },
      { type: TOKEN_TYPE.IDENT, literal: 'add' },
      { type: TOKEN_TYPE.ASSIGN, literal: '=' },
      { type: TOKEN_TYPE.FUNCTION, literal: 'fn' },
      { type: TOKEN_TYPE.LPAREN, literal: '(' },
      { type: TOKEN_TYPE.IDENT, literal: 'x' },
      { type: TOKEN_TYPE.COMMA, literal: ',' },
      { type: TOKEN_TYPE.IDENT, literal: 'y' },
      { type: TOKEN_TYPE.RPAREN, literal: ')' },
      { type: TOKEN_TYPE.LBRACE, literal: '{' },
      { type: TOKEN_TYPE.IDENT, literal: 'x' },
      { type: TOKEN_TYPE.PLUS, literal: '+' },
      { type: TOKEN_TYPE.IDENT, literal: 'y' },
      { type: TOKEN_TYPE.SEMICOLON, literal: ';' },
      { type: TOKEN_TYPE.RBRACE, literal: '}' },
      { type: TOKEN_TYPE.SEMICOLON, literal: ';' },
      { type: TOKEN_TYPE.LET, literal: 'let' },
      { type: TOKEN_TYPE.IDENT, literal: 'result' },
      { type: TOKEN_TYPE.ASSIGN, literal: '=' },
      { type: TOKEN_TYPE.IDENT, literal: 'add' },
      { type: TOKEN_TYPE.LPAREN, literal: '(' },
      { type: TOKEN_TYPE.IDENT, literal: 'five' },
      { type: TOKEN_TYPE.COMMA, literal: ',' },
      { type: TOKEN_TYPE.IDENT, literal: 'ten' },
      { type: TOKEN_TYPE.RPAREN, literal: ')' },
      { type: TOKEN_TYPE.SEMICOLON, literal: ';' },
      { type: TOKEN_TYPE.STRING, literal: 'foobar' },
      { type: TOKEN_TYPE.STRING, literal: 'foo bar' },
      { type: TOKEN_TYPE.LBRACKET, literal: '[' },
      { type: TOKEN_TYPE.INT, literal: '1' },
      { type: TOKEN_TYPE.COMMA, literal: ',' },
      { type: TOKEN_TYPE.INT, literal: '2' },
      { type: TOKEN_TYPE.RBRACKET, literal: ']' },
      { type: TOKEN_TYPE.SEMICOLON, literal: ';' },
      { type: TOKEN_TYPE.LBRACE, literal: '{' },
      { type: TOKEN_TYPE.STRING, literal: 'foo' },
      { type: TOKEN_TYPE.COLON, literal: ':' },
      { type: TOKEN_TYPE.STRING, literal: 'bar' },
      { type: TOKEN_TYPE.RBRACE, literal: '}' },
      { type: TOKEN_TYPE.EOF, literal: '' },
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
