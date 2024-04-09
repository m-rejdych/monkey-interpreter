import { Token } from './token'

interface NodeInterface {
  tokenLiteral: () => string;
}

interface Statement extends NodeInterface {
  statementNode: () => void;
}

interface Expression extends NodeInterface {
  expressionNode: () => void;
}

export class Program implements NodeInterface {
  statements: Statement[] = [];

  constructor() {}

  tokenLiteral() {
    if (this.statements.length) {
      return this.statements[0]!.tokenLiteral();
    }

    return '';
  }
}

export class LetStatement implements Statement {
  constructor(public token: Token, public name: Identifier, public value: Expression) {}

  statementNode() {}

  tokenLiteral() {
    return this.token.literal;
  }
}

export class Identifier implements Expression {
  constructor(public token: Token, public value: string) {}

  expressionNode() {}

  tokenLiteral() {
    return this.token.literal;
  }
}
