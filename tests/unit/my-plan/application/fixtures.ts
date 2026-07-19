// Fixtures compartidas de los tests de aplicación de Mi Plan — reutiliza
// los mismos UUIDs deterministas que tests/unit/my-plan/domain/fixtures.ts
// para que ambas suites sean coherentes entre sí.
export const APP_FIXTURE_IDS = {
  plan: "11111111-1111-4111-8111-111111111111",
  goal: "22222222-2222-4222-8222-222222222222",
  objective: "33333333-3333-4333-8333-333333333333",
  phase: "44444444-4444-4444-8444-444444444444",
  task: "55555555-5555-4555-8555-555555555555",
  task2: "55555555-5555-4555-8555-555555555556",
  schedule: "66666666-6666-4666-8666-666666666666",
  session: "77777777-7777-4777-8777-777777777777",
  student: "88888888-8888-4888-8888-888888888888",
  otherStudent: "99999999-9999-4999-8999-999999999999",
} as const;
