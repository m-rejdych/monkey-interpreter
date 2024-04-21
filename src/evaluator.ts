import {
  Node,
  Program,
  IntegerLiteral,
  BoolExpression,
  Statement,
  ExpressionStatement,
  PrefixExpression,
} from './ast';
import { OBJECT_TYPE, Obj, Integer, Bool, Null } from './object';

const TRUE = new Bool(true);
const FALSE = new Bool(false);
const NULL = new Null();

export function evl(node: Node | null): Obj {
  if (!node) return NULL;

  switch (Object.getPrototypeOf(node).constructor) {
    case Program:
      return evlStatements((node as Program).statements);
    case ExpressionStatement:
      return evl((node as ExpressionStatement).expression);
    case IntegerLiteral:
      return new Integer((node as IntegerLiteral).value);
    case BoolExpression:
      return nativeBoolToBoolObject((node as BoolExpression).value);
    case PrefixExpression:
      const right = evl((node as PrefixExpression).right);
      return evlPrefixExpression((node as PrefixExpression).operator, right);
    default:
      return NULL;
  }
}

function evlStatements(statements: Statement[]): Obj {
  let result: Obj = new Null();

  statements.forEach((statement) => {
    result = evl(statement);
  });

  return result;
}

function evlPrefixExpression(operator: string, right: Obj): Obj {
  switch (operator) {
    case '!':
      return evlBangOperatorExpression(right);
    case '-':
      return evlMinusPrefixOperatorExpression(right);
    default:
      return NULL;
  }
}

function evlBangOperatorExpression(right: Obj): Obj {
  switch (right) {
    case TRUE:
      return FALSE;
    case FALSE:
      return TRUE;
    case NULL:
      return TRUE;
    default:
      return FALSE;
  }
}

function evlMinusPrefixOperatorExpression(right: Obj): Obj {
  if (right.type() !== OBJECT_TYPE.INTEGER_OBJ) {
    return NULL;
  }

  return new Integer(-(right as Integer).value);
}

function nativeBoolToBoolObject(input: boolean): Bool {
  return input ? TRUE : FALSE;
}
