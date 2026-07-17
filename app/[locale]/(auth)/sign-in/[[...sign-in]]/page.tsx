// Ruta: Inicio de sesión (Clerk — sección 12.3, resolución 18.1).
// Uso del componente prebuilt oficial de Clerk: wiring de infraestructura,
// no una pantalla de producto diseñada (sin Design System aplicado todavía
// — eso corresponde a la fase de desarrollo del módulo de Autenticación).
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return <SignIn />;
}
