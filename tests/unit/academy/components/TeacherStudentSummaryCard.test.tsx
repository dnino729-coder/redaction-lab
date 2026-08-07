// TeacherStudentSummaryCard es presentacional puro — se testea sin MSW ni
// QueryClient (mismo criterio que UnitStatusBadge.test.tsx). Se mockea
// `@/i18n/navigation` (App Router real no disponible en jsdom), mismo
// patrón que UnitDetailContainer.test.tsx.
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "../../../fixtures/renderWithIntl";
import { TeacherStudentSummaryCard } from "@/features/academy/components/teacher-panel";
import { ApiError } from "@/lib/apiClient";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("TeacherStudentSummaryCard", () => {
  it("muestra el resumen de progreso cuando la consulta resuelve con éxito", () => {
    renderWithIntl(
      <TeacherStudentSummaryCard
        studentId="student-1"
        summary={{ studentId: "student-1", unitsByState: { COMPLETED: 2, IN_PROGRESS: 1 }, unitsByTextType: {} }}
        isLoading={false}
        error={null}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText("student-1")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voir le détail" })).toHaveAttribute(
      "href",
      "/academy/teacher/students/student-1",
    );
  });

  it("muestra ForbiddenState cuando la consulta falla con 403", () => {
    renderWithIntl(
      <TeacherStudentSummaryCard
        studentId="student-2"
        summary={undefined}
        isLoading={false}
        error={new ApiError(403, { code: "FORBIDDEN", message: "Forbidden", correlationId: "test-correlation-id" })}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText("Vous n'avez pas accès à cet étudiant")).toBeInTheDocument();
  });
});
