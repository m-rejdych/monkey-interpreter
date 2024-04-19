import { Token } from './token';

interface Node {
  tokenLiteral: () => string;
  string: () => string;
}

export interface Statement extends Node {
  statementNode: () => void;
}

export interface Expression extends Node {
  expressionNode: () => void;
}

export class Program implements Node {
  statements: Statement[] = [];

  constructor() {}

  tokenLiteral() {
    if (this.statements.length) {
      return this.statements[0]!.tokenLiteral();
    }

    return '';
  }

  string() {
    return this.statements.map((statement) => statement.string()).join('');
  }

  pushStatement(statement: Statement) {
    this.statements.push(statement);
  }
}

export class LetStatement implements Statement {
  constructor(
    public token: Token,
    public name: Identifier,
    // TODO: make value an Expression
    public value: null | Expression,
  ) {}

  statementNode() {}

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    // TODO: Remove null check when expressions are implemented
    return `${this.tokenLiteral()} ${this.name.string()} = ${this.value?.string() ?? ''};`;
  }
}

export class ReturnStatement implements Statement {
  constructor(
    public token: Token,
    // TODO: make value an Expression
    public returnValue: null | Expression,
  ) {}

  statementNode() {}

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    // TODO: Remove null check when expressions are implemented
    return `${this.tokenLiteral()} ${this.returnValue?.string() ?? ''};`;
  }
}

export class ExpressionStatement implements Statement {
  constructor(
    public token: Token,
    // TODO: make value an Expression
    public expression: null | Expression,
  ) {}

  statementNode() {}

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    // TODO: Remove null check when expressions are implemented
    return this.expression?.string() ?? '';
  }
}

export class BlockStatement implements Statement {
  statements: Statement[] = [];

  constructor(public token: Token) {}

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return this.statements.map((statement) => statement.string()).join('');
  }

  statementNode() {}

  pushStatement(statement: Statement): void {
    this.statements.push(statement);
  }
}

export class Identifier implements Expression {
  constructor(
    public token: Token,
    public value: string,
  ) {}

  expressionNode() {}

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return this.value;
  }
}

export class IntegerLiteral implements Expression {
  constructor(
    public token: Token,
    public value: number,
  ) {}

  tokenLiteral() {
    return this.token.literal;
  }

  expressionNode() {}

  string() {
    return this.value.toString();
  }
}

export class PrefixExpression implements Expression {
  constructor(
    public token: Token,
    public operator: string,
    public right: Expression,
  ) {}

  expressionNode() {}

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return `(${this.operator}${this.right.string()})`;
  }
}

export class InfixExpression implements Expression {
  constructor(
    public token: Token,
    public operator: string,
    public left: Expression,
    public right: Expression,
  ) {}

  expressionNode() {}

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return `(${this.left.string()} ${this.operator} ${this.right.string()})`;
  }
}

export class BoolExpression implements Expression {
  constructor(
    public token: Token,
    public value: boolean,
  ) {}

  tokenLiteral() {
    return this.token.literal;
  }

  expressionNode() {}

  string() {
    return this.token.literal;
  }
}

export class IfExpression implements Expression {
  constructor(
    public token: Token,
    public condition: Expression,
    public consequence: BlockStatement,
    public alternative: BlockStatement | null,
  ) {}

  expressionNode() {}

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return `if ${this.condition.string()} ${this.consequence.string()}${this.alternative && ` else ${this.alternative.string()}`}`;
  }
}

export class FunctionExpression implements Expression {
  constructor(
    public token: Token,
    public args: Identifier[],
    public body: BlockStatement,
  ) {}

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return `fn (${this.args.map((arg) => arg.string()).join(', ')}) ${this.body.string()}`;
  }

  expressionNode() {}
}

export class CallExpression implements Expression {
  constructor(
    public token: Token,
    public func: Expression,
    public args: Expression[],
  ) {}

  tokenLiteral() {
    return this.token.literal;
  }

  string() {
    return `${this.func.string()}(${this.args.map((arg) => arg.string()).join(', ')})`;
  }

  expressionNode() {}
}
