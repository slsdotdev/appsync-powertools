import ts from "typescript";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Checks whether a string is a valid JS identifier
 * (safe to use as a bare property key).
 */
function isValidIdentifier(name: string): boolean {
  if (name.length === 0) return false;
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, /* skipTrivia */ false);
  scanner.setText(name);
  const token = scanner.scan();
  return (
    (token === ts.SyntaxKind.Identifier || (ts.tokenToString(token) !== undefined) === false) &&
    scanner.getTokenEnd() === name.length &&
    scanner.scan() === ts.SyntaxKind.EndOfFileToken
  );
}

/**
 * Converts a JSON-serializable value into a TypeScript AST expression
 * using `ts.factory`.
 */
export function jsonToObjectAst(value: JsonValue): ts.Expression {
  if (typeof value === "object") {
    if (value === null) {
      return ts.factory.createNull();
    }

    if (Array.isArray(value)) {
      return ts.factory.createArrayLiteralExpression(
        value.map((item) => jsonToObjectAst(item)),
        value.length > 1 // multiline when >1 element
      );
    }

    const properties = Object.entries(value as Record<string, JsonValue>).map(([key, val]) =>
      ts.factory.createPropertyAssignment(
        isValidIdentifier(key)
          ? ts.factory.createIdentifier(key)
          : ts.factory.createStringLiteral(key),
        jsonToObjectAst(val)
      )
    );

    return ts.factory.createObjectLiteralExpression(
      properties,
      properties.length > 1 // multiline when >1 property
    );
  }

  if (typeof value === "string") {
    return ts.factory.createStringLiteral(value);
  }

  if (typeof value === "number") {
    return value < 0
      ? ts.factory.createPrefixUnaryExpression(
          ts.SyntaxKind.MinusToken,
          ts.factory.createNumericLiteral(Math.abs(value))
        )
      : ts.factory.createNumericLiteral(value);
  }

  if (typeof value === "boolean") {
    return value ? ts.factory.createTrue() : ts.factory.createFalse();
  }

  // undefined, functions, symbols — not JSON-serializable
  return ts.factory.createIdentifier("undefined");
}
