// Resolución del idioma + carga de diccionario por request (Server
// Components). Consumido automáticamente por el plugin de next-intl
// registrado en next.config.mjs. Si el locale entrante no es soportado,
// cae a DEFAULT_LOCALE (fr) en vez de fallar (resolución 18.18).

import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
