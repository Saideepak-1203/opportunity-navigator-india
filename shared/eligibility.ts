export type YouthForIndiaInput = {
  age?: number;
  degreeCompleted?: "yes" | "no";
  citizenship?: string;
  sbiEmployee?: "no" | "confirmed" | "unconfirmed";
};

export type EligibilityCheck = {
  label: string;
  status: "matched" | "failed" | "missing";
  detail: string;
};

export type EligibilityResult = {
  status: "yes" | "no" | "more";
  checks: EligibilityCheck[];
};

const acceptedStatuses = new Set(["Indian", "Nepal", "Bhutan", "OCI", "NRI"]);

export function evaluateYouthForIndia(input: YouthForIndiaInput): EligibilityResult {
  const checks: EligibilityCheck[] = [];
  if (input.age === undefined || Number.isNaN(input.age)) {
    checks.push({ label: "Age", status: "missing", detail: "Age is required." });
  } else {
    checks.push(input.age >= 21 && input.age <= 32
      ? { label: "Age", status: "matched", detail: "Published range: 21–32 years." }
      : { label: "Age", status: "failed", detail: "Published range: 21–32 years." });
  }

  if (!input.degreeCompleted) {
    checks.push({ label: "Bachelor's degree", status: "missing", detail: "Degree completion is required." });
  } else {
    checks.push(input.degreeCompleted === "yes"
      ? { label: "Bachelor's degree", status: "matched", detail: "Must be completed by 4 October 2026." }
      : { label: "Bachelor's degree", status: "failed", detail: "Must be completed by 4 October 2026." });
  }

  if (!input.citizenship) {
    checks.push({ label: "Citizenship or status", status: "missing", detail: "Citizenship or status is required." });
  } else {
    checks.push(acceptedStatuses.has(input.citizenship)
      ? { label: "Citizenship or status", status: "matched", detail: "Accepted: India, Nepal, Bhutan, OCI, or NRI." }
      : { label: "Citizenship or status", status: "failed", detail: "Accepted: India, Nepal, Bhutan, OCI, or NRI." });
  }

  if (!input.sbiEmployee) {
    checks.push({ label: "SBI employee status", status: "missing", detail: "This extra condition is required only to resolve the published employee rule." });
  } else {
    checks.push(input.sbiEmployee === "unconfirmed"
      ? { label: "SBI employee status", status: "failed", detail: "Published rule requires a confirmed Officer in Scale I/II." }
      : { label: "SBI employee status", status: "matched", detail: input.sbiEmployee === "confirmed" ? "Confirmed Officer in Scale I/II." : "Not an SBI employee." });
  }

  const hasMissing = checks.some(check => check.status === "missing");
  const hasFailure = checks.some(check => check.status === "failed");
  return { status: hasMissing ? "more" : hasFailure ? "no" : "yes", checks };
}
