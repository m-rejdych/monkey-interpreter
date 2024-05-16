import fs from 'fs/promises';
import path from 'path';

import { Lexer } from './lexer';
import { Parser } from './parser';
import { Environment } from './object';
import { evl } from './evaluator';

const readSource = async (source: string): Promise<string> => {
  const file = await fs.readFile(path.resolve(process.cwd(), source));
  return file.toString();
};

const main = async (): Promise<void> => {
  try {
    const [, , source] = process.argv;
    if (!source) throw new Error('"source" arg is requried.');

    const content = await readSource(source);

    const lexer = new Lexer(content);
    const parser = new Parser(lexer);

    evl(parser.parseProgram(), new Environment());
  } catch (error) {
    console.log(error);
  }
};

main();
