# Runbook — Día de la Demostración

Complementa `docs/product/demo-content/07-demo-script-final.md` (qué decir) con las acciones operativas de infraestructura antes, durante y después de la demo.

---

## 24 horas antes

- Ejecutar el checklist completo de `docs/operations/02-demo-environment-checklist.md` de principio a fin.
- Ejecutar el recorrido completo del guion (`07-demo-script-final.md`) una vez, cronometrado, contra el entorno real de demo (no local).
- Confirmar que el video de respaldo está grabado y descargado localmente en el dispositivo que se usará para presentar.
- Verificar que las 3 cuentas demo (Camille, Sofía, Mateo) siguen activas y con la whitelist configurada.

## 12 horas antes

- Revisar el estado del último despliegue en Vercel (build verde, sin errores).
- Confirmar que la clave de IA no ha expirado ni alcanzado ningún límite de cuota.
- Cargar el laptop principal y el laptop de respaldo al 100%.

## 2 horas antes

- Ejecutar una llamada real de IA de prueba (enviar una versión de prueba en una unidad distinta a la que se usará en vivo, para no consumir el estado "limpio" de Mateo) y confirmar que responde dentro del tiempo esperado.
- Verificar la red del recinto (wifi) y activar el hotspot de respaldo como prueba.
- Confirmar que ambos dispositivos (principal y respaldo) tienen sesión ya iniciada en las cuentas correctas, en pestañas separadas.

## 30 minutos antes

- Cerrar todas las aplicaciones innecesarias en el dispositivo de presentación (evitar notificaciones, actualizaciones automáticas, otras pestañas).
- Confirmar el volumen y la proyección/pantalla compartida funcionando.
- Tener `docs/product/demo-content/07-demo-script-final.md` y `06-preguntas-directivos.md` abiertos en un dispositivo secundario (no en la pantalla proyectada).

## 10 minutos antes

- Última verificación: recargar `/dashboard` con la sesión de Mateo ya iniciada — confirmar que carga sin error.
- Confirmar que el estado de Mateo está "limpio" para la demo (sin un intento ya enviado en la Unidad 1 que interfiera con el envío en vivo).

## 5 minutos antes

- Dejar el navegador abierto exactamente en `/sign-in`, listo para el primer paso del guion.
- Silenciar el teléfono y cualquier dispositivo que pueda interrumpir.

## Durante la demo

- Seguir `07-demo-script-final.md` exactamente.
- Si algo fuera del guion se cae (una notificación, una ventana), no detenerse a explicarlo — continuar.
- Si un paso individual tarda más de lo esperado, usar las frases de transición ya preparadas en el guion (Bloque 5) en vez de quedarse en silencio.

## Después de la demo

- No cerrar sesión de ninguna cuenta todavía — podrían pedir ver algo de nuevo.
- Anotar, mientras está fresco, cualquier pregunta que no estuviera en `06-preguntas-directivos.md`, para ampliar ese documento.
- Confirmar con el equipo si hubo algún paso del guion que se sintió forzado o lento, para ajustar antes de la siguiente presentación.

---

## Qué hacer si falla Internet

1. Cambiar inmediatamente al hotspot de respaldo (ya probado en el punto de "2 horas antes").
2. Si el hotspot tampoco resuelve en menos de 60 segundos, pasar directamente al **video de respaldo** — no intentar depurar la conexión en vivo frente a los directivos.
3. Retomar la narrativa (Fase 1 de la Demo Story) mientras se reproduce el video, en vez de narrar en silencio.

## Qué hacer si falla la IA

*(Evidencia de Sprint 7: no hay reintento automático de la llamada — un fallo se convierte en "procesando" indefinido, no en un error visible de inmediato.)*

1. Si la retroalimentación no aparece después de ~20-30 segundos (más del doble del tiempo objetivo ensayado), no esperar los 3 minutos completos del timeout del sistema.
2. Explicar con naturalidad: *"Parece que la respuesta está tardando más de lo normal — mientras esperamos, les muestro el Panel de Profesor con un caso ya resuelto"* — y saltar temporalmente al Bloque 7 del guion (Panel de Profesor), que usa datos ya existentes de Sofía, no una llamada nueva.
3. Si el tiempo lo permite, volver al Bloque 5 al final. Si no, cerrar con el Panel de Profesor y mencionar que el paso de retroalimentación ya se mostró en el video de respaldo (tenerlo preparado para este caso específico, no solo para la caída total de internet).

## Qué hacer si falla Clerk

1. Si el login no responde, intentar una sola vez recargar la página.
2. Si persiste, cambiar al dispositivo de respaldo (que ya debería tener sesión iniciada de antemano, según "2 horas antes") — no reintentar el login en vivo frente al público.
3. Si ambos dispositivos fallan, pasar al video de respaldo.

## Qué hacer si falla Supabase (base de datos)

1. Sería el fallo más severo — probablemente ninguna pantalla cargará datos.
2. No intentar diagnosticar en vivo. Pasar directamente al video de respaldo.
3. Usar el tiempo mientras se reproduce el video para reforzar verbalmente la Demo Story (Fase 1) — el problema que resuelve la plataforma sigue siendo válido aunque la infraestructura falle en ese momento puntual.

## Qué hacer si la demo falla de forma irrecuperable

1. Reproducir el video de respaldo completo, presentándolo explícitamente como tal: *"Les voy a mostrar el recorrido grabado para no perder tiempo resolviendo un problema técnico puntual."* — la transparencia genera más confianza que intentar disimular la falla.
2. Continuar con el guion de preguntas y respuestas (`06-preguntas-directivos.md`) con total normalidad — el video cumple la misma función narrativa que la demo en vivo.
