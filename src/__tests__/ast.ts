import { Program, LetStatement, Identifier } from '../ast';
import { Token, TOKEN_TYPE } from '../token';

describe('string method', () => {
  it('returns correct string', () => {
    const program = new Program();
    program.statements = [
      new LetStatement(
        new Token(TOKEN_TYPE.LET, 'let'),
        new Identifier(new Token(TOKEN_TYPE.IDENT, 'x'), 'x'),
        new Identifier(new Token(TOKEN_TYPE.IDENT, 'y'), 'y'),
      ),
    ];

    expect(program.string()).toBe('let x = y;');
  });
});
