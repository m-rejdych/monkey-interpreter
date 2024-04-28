import {
  Node,
  Program,
  Expression,
  IntegerLiteral,
  BoolExpression,
  ExpressionStatement,
  PrefixExpression,
  InfixExpression,
  IfExpression,
  BlockStatement,
  ReturnStatement,
  LetStatement,
  Identifier,
  FunctionExpression,
  CallExpression,
  StringLiteral,
} from './ast';
import {
  OBJECT_TYPE,
  Obj,
  ObjType,
  Integer,
  Bool,
  Null,
  ReturnValue,
  Error,
  Environment,
  Function,
  String,
} from './object';

const TRUE = new Bool(true);
const FALSE = new Bool(false);
const NULL = new Null();
const EARLY_RETURN_OBJECT_TYPES: ObjType[] = [OBJECT_TYPE.RETURN_VALUE_OBJ, OBJECT_TYPE.ERROR_OBJ];

export function evl(node: Node | null, env: Environment): Obj {
  if (!node) return NULL;

  switch (Object.getPrototypeOf(node).constructor) {
    case Program:
      return evlProgram(node as Program, env);
    case ExpressionStatement:
      return evl((node as ExpressionStatement).expression, env);
    case IntegerLiteral:
      return new Integer((node as IntegerLiteral).value);
    case BoolExpression:
      return nativeBoolToBoolObject((node as BoolExpression).value);
    case PrefixExpression: {
      const nd = node as PrefixExpression;
      const right = evl(nd.right, env);
      if (isError(right)) return right;
      return evlPrefixExpression((node as PrefixExpression).operator, right);
    }
    case InfixExpression: {
      const nd = node as InfixExpression;
      const left = evl(nd.left, env);
      if (isError(left)) return left;

      const right = evl(nd.right, env);
      if (isError(right)) return right;

      return evlInfixExpression(left, nd.operator, right);
    }
    case IfExpression:
      return evlIfExpression(node as IfExpression, env);
    case BlockStatement:
      return evlBlockStatement(node as BlockStatement, env);
    case ReturnStatement: {
      const value = evl((node as ReturnStatement).returnValue, env);
      if (isError(value)) return value;
      return new ReturnValue(value);
    }
    case LetStatement: {
      const nd = node as LetStatement;
      const value = evl(nd.value, env);
      if (isError(value)) return value;
      env.set(nd.name.value, value);
      return NULL;
    }
    case Identifier:
      return evlIdentifier(node as Identifier, env);
    case FunctionExpression: {
      const nd = node as FunctionExpression;
      return new Function(nd.args, nd.body, env);
    }
    case CallExpression: {
      const nd = node as CallExpression;
      const func = evl(nd.func, env);
      if (isError(func)) return func;
      const args = evlExpressions(nd.args, env);
      if (args.length === 1 && isError(args[0]!)) {
        return args[0];
      }

      return applyFunction(func, args);
    }
    case StringLiteral:
      return new String((node as StringLiteral).value);
    default:
      return NULL;
  }
}

function evlProgram(program: Program, env: Environment): Obj {
  if (!program.statements.length) return NULL;

  let result: Obj;

  for (const statement of program.statements) {
    result = evl(statement, env);
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

function evlBlockStatement(block: BlockStatement, env: Environment): Obj {
  if (!block.statements.length) return NULL;

  let result: Obj;

  for (const statement of block.statements) {
    result = evl(statement, env);
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

function evlIfExpression(
  { condition, consequence, alternative }: IfExpression,
  env: Environment,
): Obj {
  const evlCondition = evl(condition, env);
  if (isError(evlCondition)) return evlCondition;

  if (isTruthy(evlCondition)) {
    return evl(consequence, env);
  }

  return alternative ? evl(alternative, env) : NULL;
}

function evlIdentifier(node: Identifier, env: Environment): Obj {
  const value = env.get(node.value);
  if (!value) return new Error(`identifier not found: ${node.value}`);
  return value;
}

function evlExpressions(expressions: Expression[], env: Environment): Obj[] {
  const result: Obj[] = [];

  for (const expression of expressions) {
    const evaluated = evl(expression, env);
    if (isError(evaluated)) return [evaluated];
    result.push(evaluated);
  }

  return result;
}

function applyFunction(func: Obj, args: Obj[]): Obj {
  if (!(func instanceof Function)) {
    return new Error(`not a function: ${func.type()}`);
  }

  const extendedEnv = extendFunctionEnv(func, args);
  const evaluated = evl(func.body, extendedEnv);

  return unwrapReturnValue(evaluated);
}

function unwrapReturnValue(obj: Obj): Obj {
  if (obj instanceof ReturnValue) {
    return obj.value;
  }

  return obj;
}

function extendFunctionEnv(func: Function, args: Obj[]): Environment {
  const env = new Environment(func.env);

  func.args.forEach(({ value }, idx) => {
    env.set(value, args[idx]!);
  });

  return env;
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
