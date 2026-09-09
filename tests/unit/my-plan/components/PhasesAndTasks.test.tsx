// PhasesAndTasks — primer component test de My Plan (no existía ninguno
// para esta feature antes de este archivo). Sin MSW/QueryClientProvider
// (infraestructura MSW específica de Academy, no usada aquí para no
// inventarla solo para este slice): se mockean directamente los 5 hooks
// que el componente importa — patrón estándar de RTL, más simple y
// suficiente para demostrar que la UI refleja la regla "PAUSED = sin
// nuevo progreso" ya implementada en el backend (sin modificar aquí).
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/messages/es.json";
import { PhasesAndTasks } from "@/features/my-plan/components/PhasesAndTasks";
import type { LearningPhasesHttp, LearningPlanHttp } from "@/features/my-plan/services/myPlanApi";

const {
  mockUseLearningPhases,
  mockUseActiveLearningPlan,
  mockUseCreateStudySession,
  mockUseFinishStudySession,
  mockUseCompleteLearningTask,
} = vi.hoisted(() => ({
  mockUseLearningPhases: vi.fn(),
  mockUseActiveLearningPlan: vi.fn(),
  mockUseCreateStudySession: vi.fn(),
  mockUseFinishStudySession: vi.fn(),
  mockUseCompleteLearningTask: vi.fn(),
}));

vi.mock("@/features/my-plan/hooks/useLearningPhases", () => ({
  useLearningPhases: mockUseLearningPhases,
}));
vi.mock("@/features/my-plan/hooks/useActiveLearningPlan", () => ({
  useActiveLearningPlan: mockUseActiveLearningPlan,
}));
vi.mock("@/features/my-plan/hooks/useCreateStudySession", () => ({
  useCreateStudySession: mockUseCreateStudySession,
}));
vi.mock("@/features/my-plan/hooks/useFinishStudySession", () => ({
  useFinishStudySession: mockUseFinishStudySession,
}));
vi.mock("@/features/my-plan/hooks/useCompleteLearningTask", () => ({
  useCompleteLearningTask: mockUseCompleteLearningTask,
}));

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="es" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

const phasesFixture: LearningPhasesHttp = {
  phases: [
    {
      id: "phase-1",
      name: "Fase 1",
      status: "IN_PROGRESS",
      tasks: [
        {
          id: "task-1",
          title: "Tarea autónoma",
          status: "NOT_STARTED",
          source: "SELF_DIRECTED",
          sessions: [],
        },
        {
          id: "task-2",
          title: "Tarea con sesión abierta",
          status: "IN_PROGRESS",
          // source ACADEMY (no SELF_DIRECTED): nunca muestra "Completar
          // tarea" (mismo canCompleteTask ya existente, sin modificar) —
          // deja un único botón "Completar tarea" en el fixture, evitando
          // ambigüedad de selector en el test.
          source: "ACADEMY",
          sessions: [
            {
              id: "session-1",
              startedAt: "2026-07-18T09:00:00.000Z",
              finishedAt: null,
              durationMinutes: null,
              completed: false,
            },
          ],
        },
      ],
    },
  ],
};

function activePlan(status: LearningPlanHttp["status"]): LearningPlanHttp {
  return {
    id: "plan-1",
    studentId: "student-1",
    name: "Plan",
    description: null,
    targetLevel: "B2",
    startDate: "2026-01-01T00:00:00.000Z",
    endDate: null,
    status,
  };
}

function mockHooks(planStatus: LearningPlanHttp["status"]) {
  mockUseLearningPhases.mockReturnValue({
    data: phasesFixture,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  });
  mockUseActiveLearningPlan.mockReturnValue({ data: activePlan(planStatus) });
  const createSessionMutate = vi.fn();
  mockUseCreateStudySession.mockReturnValue({
    mutate: createSessionMutate,
    isPending: false,
    isError: false,
    variables: undefined,
  });
  const finishSessionMutate = vi.fn();
  mockUseFinishStudySession.mockReturnValue({
    mutate: finishSessionMutate,
    isPending: false,
    isError: false,
    variables: undefined,
  });
  const completeTaskMutate = vi.fn();
  mockUseCompleteLearningTask.mockReturnValue({
    mutate: completeTaskMutate,
    isPending: false,
    isError: false,
    variables: undefined,
  });
  return { createSessionMutate, finishSessionMutate, completeTaskMutate };
}

describe("PhasesAndTasks — controles de progreso vs. plan.status", () => {
  it("con el plan ACTIVE, completar tarea e iniciar sesión están habilitados y disparan su mutación", () => {
    const { createSessionMutate, completeTaskMutate } = mockHooks("ACTIVE");
    renderWithIntl(<PhasesAndTasks />);

    const completeButton = screen.getByRole("button", { name: "Completar tarea" });
    expect(completeButton).not.toBeDisabled();
    fireEvent.click(completeButton);
    expect(completeTaskMutate).toHaveBeenCalledWith("task-1");

    const startButtons = screen.getAllByRole("button", { name: "Iniciar sesión" });
    expect(startButtons[0]).not.toBeDisabled();
    fireEvent.click(startButtons[0]!);
    expect(createSessionMutate).toHaveBeenCalledWith("task-1");
  });

  // Slice "reflect paused state in progress controls" — la regla backend
  // (CompleteLearningTaskHandler/CreateStudySessionHandler, sin modificar)
  // ya rechaza estas dos acciones con 409 mientras PAUSED; aquí se
  // demuestra que la UI las deshabilita anticipadamente y que el `disabled`
  // nativo del botón impide que la mutación llegue a invocarse.
  it("con el plan PAUSED, completar tarea e iniciar sesión quedan deshabilitados y sus mutaciones NO se invocan", () => {
    const { createSessionMutate, completeTaskMutate } = mockHooks("PAUSED");
    renderWithIntl(<PhasesAndTasks />);

    const completeButton = screen.getByRole("button", { name: "Completar tarea" });
    expect(completeButton).toBeDisabled();
    fireEvent.click(completeButton);
    expect(completeTaskMutate).not.toHaveBeenCalled();

    const startButtons = screen.getAllByRole("button", { name: "Iniciar sesión" });
    for (const button of startButtons) {
      expect(button).toBeDisabled();
    }
    fireEvent.click(startButtons[0]!);
    expect(createSessionMutate).not.toHaveBeenCalled();

    expect(
      screen.getByText("Tu plan está en pausa. Reanúdalo para seguir progresando."),
    ).toBeInTheDocument();
  });

  // "Finalizar sesión" (FinishStudySessionHandler, sin modificar) nunca
  // consulta el plan — debe permanecer habilitado incluso con PAUSED.
  it("con el plan PAUSED, finalizar una sesión ya abierta permanece habilitado y dispara su mutación", () => {
    const { finishSessionMutate } = mockHooks("PAUSED");
    renderWithIntl(<PhasesAndTasks />);

    const finishButton = screen.getByRole("button", { name: "Finalizar" });
    expect(finishButton).not.toBeDisabled();
    fireEvent.click(finishButton);
    expect(finishSessionMutate).toHaveBeenCalledWith("session-1");
  });
});
