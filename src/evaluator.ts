import { Node, Program, IntegerLiteral, BoolExpression, Statement, ExpressionStatement } from './ast';
import { Obj, Integer, Bool, Null } from './object';

export function evl(node: Node | null): Obj {
  if (!node) return new Null();

  switch (Object.getPrototypeOf(node).constructor) {
    case Program:
      return evlStatements((node as Program).statements);
    case ExpressionStatement:
      return evl((node as ExpressionStatement).expression);
    case IntegerLiteral:
      return new Integer((node as IntegerLiteral).value);
    case BoolExpression:
      return new Bool((node as BoolExpression).value);
    default:
      return new Null();
  }
}

function evlStatements(statements: Statement[]): Obj {
  let result: Obj = new Null();

  statements.forEach((statement) => {
    result = evl(statement);
  });

  return result;
}