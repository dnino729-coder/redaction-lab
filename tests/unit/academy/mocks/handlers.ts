// Handlers MSW — uno por cada una de las 17 operaciones REST de Academia
// (`features/academy/services/academyApi.ts`). Scaffolding de tests (Fase
// 0.8): responde con las fixtures canónicas (happy path), no cubre cada
// variante de error/estado — cada test de Fase 1 sobreescribe el handler
// puntual que necesite con `server.use(...)` (ver `server.ts`).
import { http, HttpResponse } from "msw";
import {
  attemptSummaryFixture,
  continuationFixture,
  draftFixture,
  feedbackFixture,
  modelExampleFixture,
  progressSummaryFixture,
  studentUnitHistoryFixture,
  teacherOverrideFixture,
  teacherRecommendationFixture,
  unitDetailFixture,
  unitSummaryFixture,
} from "./fixtures";

const BASE = "/api/v1/academy";

function paginated<T>(data: T[]) {
  return { data, meta: { total: data.length, limit: 20, offset: 0 } };
}

export const academyHandlers = [
  // EP-13
  http.get(`${BASE}/units`, () => HttpResponse.json(paginated([unitSummaryFixture]))),
  // EP-14
  http.get(`${BASE}/units/:unitId`, () => HttpResponse.json(unitDetailFixture)),
  // EP-16
  http.get(`${BASE}/units/:unitId/attempts`, () => HttpResponse.json(paginated([attemptSummaryFixture]))),
  // EP-07
  http.post(`${BASE}/units/:unitId/teacher-overrides`, () => HttpResponse.json(teacherOverrideFixture)),
  // EP-08
  http.post(`${BASE}/students/:studentId/unit-recommendations`, () =>
    HttpResponse.json(teacherRecommendationFixture),
  ),
  // EP-09
  http.post(`${BASE}/model-examples`, () => HttpResponse.json(modelExampleFixture)),
  // EP-19
  http.get(`${BASE}/model-examples`, () => HttpResponse.json(paginated([modelExampleFixture]))),
  // EP-10
  http.patch(`${BASE}/model-examples/:modelExampleId`, () => HttpResponse.json(modelExampleFixture)),
  // EP-11
  http.delete(`${BASE}/model-examples/:modelExampleId`, () =>
    HttpResponse.json({ ...modelExampleFixture, status: "RETIRED" }),
  ),
  // EP-12
  http.get(`${BASE}/progress-summary`, () => HttpResponse.json(progressSummaryFixture)),
  // EP-20
  http.get(`${BASE}/students/:studentId/progress-summary`, () => HttpResponse.json(progressSummaryFixture)),
  // EP-15
  http.get(`${BASE}/continuation`, () => HttpResponse.json(continuationFixture)),
  // EP-17
  http.get(`${BASE}/attempts/:attemptId/draft`, () => HttpResponse.json(draftFixture)),
  // EP-04
  http.patch(`${BASE}/attempts/:attemptId/phase`, () => HttpResponse.json(attemptSummaryFixture)),
  // EP-05
  http.post(`${BASE}/attempts/:attemptId/reflection`, () => HttpResponse.json(unitDetailFixture)),
  // EP-18
  http.get(`${BASE}/attempts/:attemptId/feedback`, () => HttpResponse.json(feedbackFixture)),
  // EP-23
  http.get(`${BASE}/students/:studentId/units/:unitId/history`, () =>
    HttpResponse.json(studentUnitHistoryFixture),
  ),
];
