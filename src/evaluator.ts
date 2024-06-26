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
  ArrayLiteral,
  IndexExpression,
  HashLiteral,
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
  Builtin,
  Array,
  Hash,
  Hashable,
  HashKey,
  HashPair,
} from './object';
import { BUILTINS, isBuiltin } from './builtins';

export const TRUE = new Bool(true);
export const FALSE = new Bool(false);
export const NULL = new Null();
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
    case ArrayLiteral: {
      const nd = node as ArrayLiteral;
      const elements = evlExpressions(nd.elements, env);
      if (elements.length === 1 && isError(elements[0]!)) return elements[0];
      return new Array(elements);
    }
    case IndexExpression: {
      const nd = node as IndexExpression;
      const left = evl(nd.left, env);
      if (isError(left)) return left;
      const index = evl(nd.index, env);
      if (isError(index)) return left;
      return evlIndexExpression(left, index);
    }
    case HashLiteral: {
      return evlHashLiteral(node as HashLiteral, env);
    }
    default:
      return NULL;
  }
}

function evlIndexExpression(left: Obj, index: Obj): Obj {
  if (left.type() === OBJECT_TYPE.ARRAY_OBJ && index.type() === OBJECT_TYPE.INTEGER_OBJ) {
    return evlArrayIndexExpression(left as Array, index as Integer);
  } else if (left.type() === OBJECT_TYPE.HASH_OBJ) {
    return evlHashIndexExpression(left as Hash, index);
  }

  return new Error(`index operator not supported: ${left.type()}`);
}

function evlArrayIndexExpression(left: Array, index: Integer): Obj {
  const idx = index.value;
  const max = left.elements.length - 1;

  if (idx < 0 || idx > max) return NULL;

  return left.elements[idx]!;
}

function evlHashIndexExpression(left: Hash, index: Obj): Obj {
  if (!isHashable(index)) {
    return new Error(`unusable as hash key: ${index.type()}`);
  }

  return left.entries.get(index.hashKey())?.value ?? NULL;
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
  if (left.type() === OBJECT_TYPE.STRING_OBJ && right.type() === OBJECT_TYPE.STRING_OBJ) {
    return evlStringInfixExpression(left, operator, right);
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

function evlStringInfixExpression(left: Obj, operator: string, right: Obj): Obj {
  if (operator !== '+')
    return new Error(`unknown operator: ${left.type()} ${operator} ${right.type()}`);
  return new String(`${(left as String).value}${(right as String).value}`);
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
  const nodeValue = node.value;

  const value = env.get(nodeValue);
  if (value) return value;

  const builtin = isBuiltin(nodeValue) ? BUILTINS[nodeValue] : null;
  if (builtin) return builtin;

  return new Error(`identifier not found: ${node.value}`);
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

function evlHashLiteral(hash: HashLiteral, env: Environment): Hash {
  const pairs: Map<HashKey, HashPair> = new Map();

  hash.entries.forEach(([keyExpression, valueExpression]) => {
    const key = evl(keyExpression, env);
    if (isError(key)) return key;

    const isKeyHashable = isHashable(key);
    if (!isKeyHashable) {
      return new Error(`unusable as hash key: ${key.type()}`);
    }

    const value = evl(valueExpression, env);
    if (isError(value)) return value;

    const hashed = key.hashKey();
    pairs.set(hashed, new HashPair(key, value));
  });

  return new Hash(pairs);
}

function applyFunction(func: Obj, args: Obj[]): Obj {
  switch (Object.getPrototypeOf(func).constructor) {
    case Function: {
      const fn = func as Function;
      const extendedEnv = extendFunctionEnv(fn, args);
      const evaluated = evl(fn.body, extendedEnv);

      return unwrapReturnValue(evaluated);
    }
    case Builtin:
      return (func as Builtin).fn(...args);
    default:
      return new Error(`not a function: ${func.type()}`);
  }
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

function isHashable(obj: Obj): obj is Hashable & Obj {
  return 'hashKey' in obj;
}
