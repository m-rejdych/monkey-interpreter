import { Repl } from './repl';

function main(): void {
  const repl = new Repl(process.stdin, process.stdout);
  repl.start();
}

main();
