// Validación de variables de entorno con Zod (sección 5.2: React Hook Form + Zod
// para validación y tipado consistente en todo el proyecto).
// No debe contener lógica de negocio ni de módulos.

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  // Requerido por app/api/webhooks/clerk/route.ts para verificar la firma
  // Svix de cada entrega (aprovisionamiento de usuario, 12.3/12.4) — sin
  // esta variable, el webhook rechaza toda petición (falla cerrado, nunca
  // procesa un payload sin verificar).
  CLERK_WEBHOOK_SECRET: z.string().min(1),
  REDIS_URL: z.string().min(1),
});

// TODO: invocar envSchema.parse(process.env) en el arranque del servidor
// cuando se configuren los entornos reales (Development/Testing/Staging/Production — 13.14).
export type Env = z.infer<typeof envSchema>;
