import readline from 'readline';
import util from 'util';
import type { Readable, Writable } from 'stream';

import { Lexer } from './lexer';
import { TOKEN_TYPES } from './token';

const PROMPT = '>> ' as const;

export class Repl {
  static start(input: Readable, output: Writable): void {
    const readInterface = readline.createInterface(input, output);

    output.write(PROMPT);

    readInterface.on('line', (line) => {
      const lexer = new Lexer(line);

      while (true) {
        const token = lexer.nextToken();
        output.write(`${util.format(token)}\n`);
        if (token.type === TOKEN_TYPES.EOF) {
          output.write(PROMPT);
          break;
        }
      }
    });
  }
}
