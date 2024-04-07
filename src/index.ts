import { testLexer } from './lexer';

testLexer(`\
let x = 10;
let y = 20;

fn add(a, b) {
  return a + b;
}

add(x, y);\
`);
