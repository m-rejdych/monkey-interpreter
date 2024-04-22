import {
  Node,
  Program,
  IntegerLiteral,
  BoolExpression,
  ExpressionStatement,
  PrefixExpression,
  InfixExpression,
  IfExpression,
  BlockStatement,
  ReturnStatement,
} from './ast';
import { OBJECT_TYPE, Obj, ObjType, Integer, Bool, Null, ReturnValue, Error } from './object';

const TRUE = new Bool(true);
const FALSE = new Bool(false);
const NULL = new Null();
const EARLY_RETURN_OBJECT_TYPES: ObjType[] = [OBJECT_TYPE.RETURN_VALUE_OBJ, OBJECT_TYPE.ERROR_OBJ];

export function evl(node: Node | null): Obj {
  if (!node) return NULL;

  switch (Object.getPrototypeOf(node).constructor) {
    case Program:
      return evlProgram(node as Program);
    case ExpressionStatement:
      return evl((node as ExpressionStatement).expression);
    case IntegerLiteral:
      return new Integer((node as IntegerLiteral).value);
    case BoolExpression:
      return nativeBoolToBoolObject((node as BoolExpression).value);
    case PrefixExpression: {
      const nd = node as PrefixExpression;
      const right = evl(nd.right);
      if (isError(right)) return right;
      return evlPrefixExpression((node as PrefixExpression).operator, right);
    }
    case InfixExpression: {
      const nd = node as InfixExpression;
      const left = evl(nd.left);
      if (isError(left)) return left;

      const right = evl(nd.right);
      if (isError(right)) return right;

      return evlInfixExpression(left, nd.operator, right);
    }
    case IfExpression:
      return evlIfExpression(node as IfExpression);
    case BlockStatement:
      return evlBlockStatement(node as BlockStatement);
    case ReturnStatement: {
      const value = evl((node as ReturnStatement).returnValue);
      if (isError(value)) return value;
      return new ReturnValue(value);
    }
    default:
      return NULL;
  }
}

function evlProgram(program: Program): Obj {
  if (!program.statements.length) return NULL;

  let result: Obj;

  for (const statement of program.statements) {
    result = evl(statement);
    switch (Object.getPrototypeOf(result).constructor) {
      case ReturnValue:
        return (result as ReturnValue).value;
      case Error:
        return result as Error;
      default:
        break;
    }
    if (result instanceof ReturnValue) return result.value;
  }

  return result!;
}

function evlBlockStatement(block: BlockStatement): Obj {
  if (!block.statements.length) return NULL;

  let result: Obj;

  for (const statement of block.statements) {
    result = evl(statement);
    if (EARLY_RETURN_OBJECT_TYPES.includes(result.type())) return result;
  }

  return result!;
}

function evlPrefixExpression(operator: string, right: Obj): Obj {
  switch (operator) {
    case '!':
      return evlBangOperatorExpression(right);
    case '-':
      return evlMinusPrefixOperatorExpression(right);
    default:
      return new Error(`unknown operator: ${operator}${right.type()}`);
  }
}

function evlInfixExpression(left: Obj, operator: string, right: Obj): Obj {
  if (left.type() === OBJECT_TYPE.INTEGER_OBJ && right.type() === OBJECT_TYPE.INTEGER_OBJ) {
    return evlIntegerInfixExpression(left, operator, right);
  }

  if (left.type() !== right.type()) {
    return new Error(`type mismatch: ${left.type()} ${operator} ${right.type()}`);
  }

  switch (operator) {
    case '==':
      return nativeBoolToBoolObject(left === right);
    case '!=':
      return nativeBoolToBoolObject(left !== right);
    default:
      return new Error(`unknown operator: ${left.type()} ${operator} ${right.type()}`);
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
      return new Error(`unknown operator: ${left.type()} ${operator} ${right.type()}`);
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
    return new Error(`unknown operator: -${right.type()}`);
  }

  return new Integer(-(right as Integer).value);
}

function evlIfExpression({ condition, consequence, alternative }: IfExpression): Obj {
  const evlCondition = evl(condition);
  if (isError(evlCondition)) return evlCondition;

  if (isTruthy(evlCondition)) {
    return evl(consequence);
  }

  return alternative ? evl(alternative) : NULL;
}

function nativeBoolToBoolObject(input: boolean): Bool {
  return input ? TRUE : FALSE;
}

function isTruthy(obj: Obj): boolean {
  return obj !== FALSE && obj !== NULL;
}

function isError(obj: Obj): obj is Error {
  return obj.type() === OBJECT_TYPE.ERROR_OBJ;
}
