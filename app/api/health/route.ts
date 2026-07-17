// Endpoint de salud — sección 15.5: "todos los servicios exponen endpoint /health".
export async function GET(): Promise<Response> {
  return Response.json({ status: "ok" });
}
