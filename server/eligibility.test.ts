import { describe, expect, it } from "vitest";
import { evaluateScholarships } from "../shared/eligibility";

describe("scholarship matcher", () => {
  it("finds both the Reliance scholarship and Youth for India for a matching profile", () => {
    const results = evaluateScholarships({
      age: 25,
      citizenship: "Indian",
      educationLevel: "graduate",
      studyYear: "postgraduate",
      householdIncomeLakh: 8,
      studyMode: "regular",
    });
    expect(results.find(result => result.id === "sbi-youth-for-india-2026")?.status).toBe("likely-match");
    expect(results.find(result => result.id === "reliance-undergraduate-2026")?.status).toBe("not-match");
  });

  it("matches a first-year undergraduate to the Reliance scholarship", () => {
    const results = evaluateScholarships({
      citizenship: "Indian",
      educationLevel: "undergraduate",
      studyYear: "1",
      householdIncomeLakh: 6,
      studyMode: "regular",
    });
    expect(results.find(result => result.id === "reliance-undergraduate-2026")?.status).toBe("likely-match");
  });

  it("asks for more information when the profile is incomplete", () => {
    expect(evaluateScholarships({}).every(result => result.status === "more-info")).toBe(true);
  });

  it("rejects a Reliance profile above the published income limit", () => {
    const result = evaluateScholarships({
      citizenship: "Indian",
      educationLevel: "undergraduate",
      studyYear: "1",
      householdIncomeLakh: 18,
      studyMode: "regular",
    }).find(item => item.id === "reliance-undergraduate-2026");
    expect(result?.status).toBe("not-match");
    expect(result?.checks.find(check => check.label === "Household income")?.status).toBe("failed");
  });
});
