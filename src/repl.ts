import readline from 'readline';
import util from 'util';
import type { Readable, Writable } from 'stream';

import { Lexer } from './lexer';
import { TOKEN_TYPE } from './token';

const PROMPT = '>> ' as const;

export class Repl {
  constructor(
    private input: Readable,
    private output: Writable,
  ) {}

  start(): void {
    const readInterface = readline.createInterface(this.input, this.output);

    this.output.write(PROMPT);

    readInterface.on('line', (line) => {
      const lexer = new Lexer(line);

      while (true) {
        const token = lexer.nextToken();
        this.output.write(`${util.format(token)}\n`);
        if (token.type === TOKEN_TYPE.EOF) {
          this.output.write(PROMPT);
          break;
        }
      }
    });
  }
}
