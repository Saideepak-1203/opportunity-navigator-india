import { describe, expect, it } from "vitest";
import { evaluateYouthForIndia } from "../shared/eligibility";

describe("Youth for India eligibility evaluator", () => {
  it("returns likely eligible for matching published criteria", () => {
    expect(evaluateYouthForIndia({ age: 25, degreeCompleted: "yes", citizenship: "Indian", sbiEmployee: "no" }).status).toBe("yes");
  });

  it("returns likely not eligible when a published criterion fails", () => {
    const result = evaluateYouthForIndia({ age: 19, degreeCompleted: "yes", citizenship: "Indian", sbiEmployee: "no" });
    expect(result.status).toBe("no");
    expect(result.checks.find(check => check.label === "Age")?.status).toBe("failed");
  });

  it("asks for more information when required answers are missing", () => {
    expect(evaluateYouthForIndia({ age: 25 }).status).toBe("more");
  });
});
