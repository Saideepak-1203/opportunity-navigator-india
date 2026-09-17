export type ScholarshipProfile = {
  age?: number;
  citizenship?: string;
  educationLevel?: "school" | "undergraduate" | "postgraduate" | "graduate";
  studyYear?: "1" | "2" | "3" | "4" | "postgraduate";
  householdIncomeLakh?: number;
  studyMode?: "regular" | "online" | "distance";
};

export type EligibilityCheck = {
  label: string;
  status: "matched" | "failed" | "missing";
  detail: string;
};

export type ScholarshipMatch = {
  id: string;
  title: string;
  provider: string;
  status: "likely-match" | "not-match" | "more-info";
  reason: string;
  checks: EligibilityCheck[];
  officialUrl: string;
  sourceStatus: string;
};

const acceptedYouthStatuses = new Set(["Indian", "Nepal", "Bhutan", "OCI", "NRI"]);

const scholarships = [
  {
    id: "reliance-undergraduate-2026",
    title: "Reliance Foundation Undergraduate Scholarships 2026–27",
    provider: "Reliance Foundation",
    officialUrl: "https://www.scholarships.reliancefoundation.org/UG_Scholarship",
    sourceStatus: "Open · deadline 5 Oct 2026",
    check(profile: ScholarshipProfile): EligibilityCheck[] {
      return [
        { label: "Citizenship", status: !profile.citizenship ? "missing" : profile.citizenship === "Indian" ? "matched" : "failed", detail: "Must be a resident Indian citizen." },
        { label: "Study level", status: !profile.educationLevel ? "missing" : profile.educationLevel === "undergraduate" ? "matched" : "failed", detail: "Must be enrolled in the first year of a regular full-time undergraduate degree." },
        { label: "Study year", status: !profile.studyYear ? "missing" : profile.studyYear === "1" ? "matched" : "failed", detail: "Must be in year 1 during academic year 2026–27." },
        { label: "Household income", status: profile.householdIncomeLakh === undefined ? "missing" : profile.householdIncomeLakh < 15 ? "matched" : "failed", detail: "Published household income limit: below ₹15 lakh per year." },
        { label: "Study mode", status: !profile.studyMode ? "missing" : profile.studyMode === "regular" ? "matched" : "failed", detail: "Online, distance, hybrid, and remote programmes are excluded." },
      ];
    },
  },
  {
    id: "sbi-youth-for-india-2026",
    title: "SBI Youth for India Fellowship 2026–27",
    provider: "SBI Foundation",
    officialUrl: "https://youthforindia.org/",
    sourceStatus: "Paused · no current deadline",
    check(profile: ScholarshipProfile): EligibilityCheck[] {
      return [
        { label: "Age", status: profile.age === undefined ? "missing" : profile.age >= 21 && profile.age <= 32 ? "matched" : "failed", detail: "Published range: 21–32 years at programme commencement." },
        { label: "Citizenship or status", status: !profile.citizenship ? "missing" : acceptedYouthStatuses.has(profile.citizenship) ? "matched" : "failed", detail: "Accepted: India, Nepal, Bhutan, OCI, or NRI." },
        { label: "Education", status: !profile.educationLevel ? "missing" : profile.educationLevel === "graduate" ? "matched" : "failed", detail: "A completed bachelor’s degree is required by the published date." },
      ];
    },
  },
];

export function evaluateScholarships(profile: ScholarshipProfile): ScholarshipMatch[] {
  return scholarships.map(scholarship => {
    const checks = scholarship.check(profile);
    const hasMissing = checks.some(check => check.status === "missing");
    const hasFailure = checks.some(check => check.status === "failed");
    const status = hasMissing ? "more-info" : hasFailure ? "not-match" : "likely-match";
    const reason = status === "likely-match" ? "Your answers match the published criteria." : status === "not-match" ? "At least one published criterion does not match." : "Complete the missing answers to check this scholarship.";
    return { id: scholarship.id, title: scholarship.title, provider: scholarship.provider, status, reason, checks, officialUrl: scholarship.officialUrl, sourceStatus: scholarship.sourceStatus };
  });
}
