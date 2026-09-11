// Fixtures compartidas de los tests de Domain/Application de Academia —
// mismo criterio que tests/unit/my-plan/{domain,application}/fixtures.ts
// (UUIDs v4 deterministas, uno por entidad, para que los tests sean
// legibles y reproducibles).
export const FIXTURE_IDS = {
  attempt: "11111111-1111-4111-8111-111111111111",
  attempt2: "11111111-1111-4111-8111-111111111112",
  unit: "22222222-2222-4222-8222-222222222222",
  unit2: "22222222-2222-4222-8222-222222222223",
  student: "33333333-3333-4333-8333-333333333333",
  otherStudent: "99999999-9999-4999-8999-999999999999",
  draft: "44444444-4444-4444-8444-444444444444",
  version: "55555555-5555-4555-8555-555555555555",
  version2: "55555555-5555-4555-8555-555555555556",
  feedback: "66666666-6666-4666-8666-666666666666",
  feedback2: "66666666-6666-4666-8666-666666666667",
  teacherOverride: "77777777-7777-4777-8777-777777777777",
  teacher: "88888888-8888-4888-8888-888888888888",
} as const;
