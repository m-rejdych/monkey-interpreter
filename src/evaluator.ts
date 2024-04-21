import {
  Node,
  Program,
  IntegerLiteral,
  BoolExpression,
  Statement,
  ExpressionStatement,
  PrefixExpression,
  InfixExpression,
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
    case PrefixExpression: {
      const nd = node as PrefixExpression;
      const right = evl(nd.right);
      return evlPrefixExpression((node as PrefixExpression).operator, right);
    }
    case InfixExpression: {
      const nd = node as InfixExpression;
      const left = evl(nd.left);
      const right = evl(nd.right);
      return evlInfixExpression(left, nd.operator, right);
    }
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

function evlInfixExpression(left: Obj, operator: string, right: Obj): Obj {
  if (left.type() === OBJECT_TYPE.INTEGER_OBJ && right.type() === OBJECT_TYPE.INTEGER_OBJ) {
    return evlIntegerInfixExpression(left, operator, right);
  }

  switch (operator) {
    case '==':
      return nativeBoolToBoolObject(left === right);
    case '!=':
      return nativeBoolToBoolObject(left !== right);
    default:
      return NULL;
  }
}

function evlIntegerInfixExpression(left: Obj, operator: string, right: Obj): Obj {
  const leftValue = (left as Integer).value;
  const rightValue = (right as Integer).value;

  switch (operator) {
    case '+':
      return new Integer(leftValue + rightValue);
    case '-':
      return new Integer(leftValue - rightValue);
    case '/':
      return new Integer(leftValue / rightValue);
    case '*':
      return new Integer(leftValue * rightValue);
    case '<':
      return nativeBoolToBoolObject(leftValue < rightValue);
    case '>':
      return nativeBoolToBoolObject(leftValue > rightValue);
    case '==':
      return nativeBoolToBoolObject(leftValue === rightValue);
    case '!=':
      return nativeBoolToBoolObject(leftValue !== rightValue);
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
