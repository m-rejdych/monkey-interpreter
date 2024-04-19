import readline from 'readline';
import type { Readable, Writable } from 'stream';

import { Lexer } from './lexer';
import { Parser } from './parser';

const PROMPT = '>> ' as const;

const MONKEY_FACE = `            __,__
   .--.  .-"     "-.  .--.
  / .. \/  .-. .-.  \/ .. \
 | |  '|  /   Y   \  |'  | |
 | \   \  \ 0 | 0 /  /   / |
  \ '- ,\.-"""""""-./, -' /
   ''-' /_   ^ ^   _\ '-''
       |  \._   _./  |
       \   \ '~' /   /
        '._ '-=-' _.'
           '-----'
` as const;

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
      const parser = new Parser(lexer);
      const program = parser.parseProgram();

      if (parser.errors.length) {
        this.printParserErrors(parser.errors);
        return;
      }

      this.output.write(program.string());
      this.output.write('\n');
      this.output.write(PROMPT);
    });
  }

  printParserErrors(errors: string[]): void {
    this.output.write(MONKEY_FACE);
    this.output.write('Whoops! We ran into some monkey business here!\n');
    this.output.write('parser errors:\n');
    errors.forEach((error) => {
      this.output.write(error);
      this.output.write('\n');
      this.output.write(PROMPT);
    });
  }
}
