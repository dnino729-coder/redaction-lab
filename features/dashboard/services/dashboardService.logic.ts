// Lógica pura del Dashboard Service, separada de dashboardService.ts a
// propósito: este archivo NO importa Prisma, Redis ni ningún cliente de
// infraestructura, para poder probarse de forma rápida y aislada (tests/
// unit/dashboard/dashboardService.logic.test.ts) sin necesitar una base de
// datos ni un servidor Redis reales.

import { NAVIGATION_ITEMS } from "@/config/navigation";
import { DASHBOARD_NAV_KEY, REACTIVATION_THRESHOLD_DAYS } from "../constants/dashboard.constants";
import type { EcosystemLink, WelcomeVariant } from "../types";

export function daysBetween(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((to.getTime() - from.getTime()) / msPerDay);
}

/**
 * Variantes estructurales del mensaje de bienvenida — ver comentario en
 * features/dashboard/types/dashboard.types.ts sobre por qué las variantes de
 * juicio pedagógico (progress-improved/high-score/struggling) NO se deciden
 * aquí.
 */
export function selectWelcomeVariant(params: {
  hasAnyHistory: boolean;
  lastLoginAt: Date | null;
  now?: Date;
}): WelcomeVariant {
  if (!params.hasAnyHistory) return "empty-first-visit";
  if (params.lastLoginAt) {
    const inactiveDays = daysBetween(params.lastLoginAt, params.now ?? new Date());
    if (inactiveDays >= REACTIVATION_THRESHOLD_DAYS) return "reactivation";
  }
  return "ready";
}

export function buildEcosystemLinks(): EcosystemLink[] {
  return NAVIGATION_ITEMS.filter((item) => item !== DASHBOARD_NAV_KEY).map((item) => ({
    key: item,
    href: `/${item}`,
  }));
}
