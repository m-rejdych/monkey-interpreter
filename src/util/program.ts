import { Parser } from '../parser';
import { Lexer } from '../lexer';
import { Program } from '../ast';

export function createProgram(input: string): { program: Program; parser: Parser } {
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parseProgram();

  return { parser, program };
}
