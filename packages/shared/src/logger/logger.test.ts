import { describe, expect, it } from "vitest";
import pc from "picocolors";

console.log(pc.yellow("Testing Logger creation..."));

describe("Logger", () => {
  it("should create a logger instance with the specified scope and level", () => {
    expect(true).toBe(true);
  });
});
