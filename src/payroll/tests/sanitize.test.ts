import { describe, expect, it } from "vitest";
import { isUnsafeText } from "../sanitize";

/** Wraps a single code point between safe letters. */
const wrap = (code: number) => `a${String.fromCodePoint(code)}b`;

describe("isUnsafeText", () => {
  it("accepts ordinary free text", () => {
    expect(isUnsafeText("Alice")).toBe(false);
    expect(isUnsafeText("O'Brien-Smith")).toBe(false);
    expect(isUnsafeText("e.g employee")).toBe(false);
  });

  it("rejects angle brackets (XSS)", () => {
    expect(isUnsafeText("<script>alert(1)</script>")).toBe(true);
    expect(isUnsafeText("a > b")).toBe(true);
  });

  it("rejects control and null characters", () => {
    expect(isUnsafeText("a\tb")).toBe(true);
    expect(isUnsafeText("a\r\nb")).toBe(true);
    expect(isUnsafeText(wrap(0x00))).toBe(true); // null
    expect(isUnsafeText(wrap(0x7f))).toBe(true); // DEL
  });

  it("rejects zero-width and bidi format characters", () => {
    expect(isUnsafeText(wrap(0x200b))).toBe(true); // zero-width space
    expect(isUnsafeText(wrap(0x202e))).toBe(true); // right-to-left override
    expect(isUnsafeText(wrap(0xfeff))).toBe(true); // zero-width no-break space
  });

  it("rejects line and paragraph separators", () => {
    expect(isUnsafeText(wrap(0x2028))).toBe(true); // line separator
    expect(isUnsafeText(wrap(0x2029))).toBe(true); // paragraph separator
  });

  it("rejects leading formula-injection characters", () => {
    expect(isUnsafeText("=SUM(A1)")).toBe(true);
    expect(isUnsafeText("+1")).toBe(true);
    expect(isUnsafeText("-1")).toBe(true);
    expect(isUnsafeText("@cmd")).toBe(true);
    expect(isUnsafeText("  =x")).toBe(true);
  });
});
