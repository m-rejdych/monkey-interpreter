import { Program, LetStatement, Identifier } from '../ast';
import { Token, TOKEN_TYPES } from '../token';

describe('string method', () => {
  it('returns correct string', () => {
    const program = new Program();
    program.statements = [
      new LetStatement(
        new Token(TOKEN_TYPES.LET, 'let'),
        new Identifier(new Token(TOKEN_TYPES.IDENT, 'x'), 'x'),
        new Identifier(new Token(TOKEN_TYPES.IDENT, 'y'), 'y'),
      ),
    ];

    expect(program.string()).toBe('let x = y;');
  });
});
