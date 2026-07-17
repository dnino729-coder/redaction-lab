// Layout del grupo de rutas privadas (sección 12.9: "Rutas privadas: Dashboard,
// Academia, Mi Plan, Laboratorio, Entrenamiento, Simulación, Evolución, Perfil").
// La protección real de acceso se aplica en middleware.ts (raíz) + middleware/auth.ts.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
