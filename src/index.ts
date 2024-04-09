import { Repl } from './repl';

function main(): void {
  Repl.start(process.stdin, process.stdout);
}

main();
