// Ruta: Registro (Clerk — sección 12.3, resolución 18.1).
// Uso del componente prebuilt oficial de Clerk: wiring de infraestructura,
// no una pantalla de producto diseñada. El flujo de onboarding real
// (sección 6.2: diagnóstico, "Mi Plan" inicial, etc.) se conecta como
// lógica de negocio cuando se desarrolle ese módulo, no aquí.
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return <SignUp />;
}
