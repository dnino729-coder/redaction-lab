import { NextResponse } from "next/server";
import { createAcademyContainer } from "../composition/academyContainer";
import { resolveAcademyActor, requireRole } from "../http/auth";
import { requireIdempotencyKey } from "../http/idempotency";
import { jsonSuccess, resolvePagination, paginate, type AcademyResponseHeaders } from "../http/response";
import { CreateModelExampleCommand } from "@/features/academy/application/commands/CreateModelExampleCommand";
import { UpdateModelExampleCommand } from "@/features/academy/application/commands/UpdateModelExampleCommand";
import { RetireModelExampleCommand } from "@/features/academy/application/commands/RetireModelExampleCommand";
import { ListModelExamplesByTextTypeQuery } from "@/features/academy/application/queries/ListModelExamplesByTextTypeQuery";
import { TextType } from "@/features/academy/domain/enums/TextType";
import {
  toCreateModelExampleRequest,
  toUpdateModelExampleRequest,
  toRetireModelExampleRequest,
  toListModelExamplesRequest,
} from "../request-mappers/modelExampleRequestMappers";
import { toModelExampleHttp } from "../response-mappers/modelExampleResponseMappers";

const ALL_TEXT_TYPES = Object.values(TextType);

// Route Handlers de `academy/model-examples` — EP-09, EP-10, EP-11, EP-19
// (API Contract v1.3, Sección 4).

// EP-09 — POST /api/v1/academy/model-examples
export async function handleCreateModelExample(
  request: Request,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  requireIdempotencyKey(request);
  const actor = await resolveAcademyActor();
  requireRole(actor, ["ADMIN"]);
  const body = (await request.json()) as {
    textType: unknown;
    content: unknown;
    rating: unknown;
    curatorialComment: unknown;
  };
  const container = createAcademyContainer();

  const dto = await container.commandHandlers.createModelExample.handle(
    CreateModelExampleCommand.fromRequest(toCreateModelExampleRequest(body)),
  );
  return jsonSuccess(toModelExampleHttp(dto), 201, headers);
}

// EP-10 — PATCH /api/v1/academy/model-examples/{modelExampleId} (nativa,
// sin Idempotency-Key).
export async function handleUpdateModelExample(
  request: Request,
  modelExampleId: string,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  const actor = await resolveAcademyActor();
  requireRole(actor, ["ADMIN"]);
  const body = (await request.json()) as { content?: unknown; curatorialComment?: unknown };
  const container = createAcademyContainer();

  const dto = await container.commandHandlers.updateModelExample.handle(
    UpdateModelExampleCommand.fromRequest(toUpdateModelExampleRequest(modelExampleId, body)),
  );
  return jsonSuccess(toModelExampleHttp(dto), 200, headers);
}

// EP-11 — DELETE /api/v1/academy/model-examples/{modelExampleId} (nativa,
// sin Idempotency-Key — "retirar dos veces produce el mismo estado
// final").
export async function handleRetireModelExample(
  modelExampleId: string,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  const actor = await resolveAcademyActor();
  requireRole(actor, ["ADMIN"]);
  const container = createAcademyContainer();

  const dto = await container.commandHandlers.retireModelExample.handle(
    RetireModelExampleCommand.fromRequest(toRetireModelExampleRequest(modelExampleId)),
  );
  return jsonSuccess(toModelExampleHttp(dto), 200, headers);
}

// EP-19 — GET /api/v1/academy/model-examples
//
// Nota de reconciliación (disclosed, no BLOCKER): el Contrato documenta
// `textType` como filtro OPCIONAL; `ListModelExamplesByTextTypeRequestDto`/
// su validador (Application, Frozen) exigen `textType` como valor
// obligatorio de un enum de 5 valores — no admiten "todos". Esta API Layer
// honra la opcionalidad del Contrato componiendo, cuando el cliente omite
// el filtro, una consulta por cada `TextType` (5 llamadas de solo lectura
// al mismo Query ya Frozen) y fusionando el resultado — sin modificar
// Application ni inventar un valor "ALL" no soportado por su validador.
export async function handleListModelExamples(
  request: Request,
  headers: AcademyResponseHeaders,
): Promise<NextResponse> {
  const actor = await resolveAcademyActor();
  requireRole(actor, ["STUDENT", "ADMIN"]);
  const container = createAcademyContainer();
  const url = new URL(request.url);
  const textType = url.searchParams.get("textType");
  const pagination = resolvePagination(url.searchParams);

  const items = textType
    ? await container.queryHandlers.listModelExamplesByTextType.handle(
        ListModelExamplesByTextTypeQuery.fromRequest(toListModelExamplesRequest(textType)),
      )
    : (
        await Promise.all(
          ALL_TEXT_TYPES.map((type) =>
            container.queryHandlers.listModelExamplesByTextType.handle(
              ListModelExamplesByTextTypeQuery.fromRequest(toListModelExamplesRequest(type)),
            ),
          ),
        )
      ).flat();

  // "status: ACTIVE únicamente para rol STUDENT" (Contrato, EP-19) — el
  // rol ADMIN (gestión) ve el catálogo completo, incluidos `RETIRED`.
  const visible = actor.role === "STUDENT" ? items.filter((item) => item.status === "ACTIVE") : items;
  const page = paginate(visible.map(toModelExampleHttp), pagination);
  return jsonSuccess(page, 200, headers, "cacheable");
}
