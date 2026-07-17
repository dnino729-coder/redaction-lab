// Fixture de pruebas: envuelve un componente en NextIntlClientProvider con
// el diccionario francés real (fuente primaria, resolución 18.18) — así los
// tests de componentes verifican contra las claves de traducción reales del
// proyecto, no contra un mock que pueda desincronizarse silenciosamente.
import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/messages/fr.json";

export function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}
