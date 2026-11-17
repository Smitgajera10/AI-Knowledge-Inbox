import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("client scaffold", () => {
  it("exports the application entry component", () => {
    expect(App).toBeTypeOf("function");
  });
});
