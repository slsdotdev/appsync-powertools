import { describe } from "node:test";
import { expect, it } from "vitest";
import { stripUndef } from "./stripUndef.js";

describe("stripUndef", () => {
  it("should remove undefined properties from an object", () => {
    const input = {
      a: 1,
      b: undefined,
      c: "test",
      d: null,
      e: {
        f: undefined,
        g: "nested",
      },
    };

    const expectedOutput = {
      a: 1,
      c: "test",
      d: null,
      e: {
        g: "nested",
      },
    };

    const result = stripUndef(input);
    expect(result).toEqual(expectedOutput);
  });

  it("should return non-object values unchanged", () => {
    expect(stripUndef(42)).toBe(42);
    expect(stripUndef("hello")).toBe("hello");
    expect(stripUndef(null)).toBe(null);
    expect(stripUndef(undefined)).toBe(undefined);
  });

  it("should handle arrays and nested objects", () => {
    const input = {
      a: [1, undefined, 3],
      b: {
        c: undefined,
        d: "test",
      },
    };

    const expectedOutput = {
      a: [1, 3],
      b: {
        d: "test",
      },
    };

    const result = stripUndef(input);
    expect(result).toEqual(expectedOutput);
  });
});
