import { Lexer } from './lexer';

Lexer.test(`\
let x = 10;
let y = 20;

fn add(a, b) {
  return a + b;
}

add(x, y);
!-/*5;
5 < 10 > 5;
if (x == 5) {
  return 5;
} else {
  return 0;
}

10 == 10
15 != 10\
`);
