// Cliente de Supabase Storage (resolución 18.16 del documento consolidado:
// Supabase Storage es el proveedor oficial de almacenamiento de archivos,
// AWS S3 queda descartado para el MVP).
//
// Sin lógica de negocio: solo instanciación del cliente con la service role
// key (uso exclusivo desde el servidor — nunca importar este módulo desde
// un componente cliente).

import { createClient } from "@supabase/supabase-js";

const globalForSupabase = globalThis as unknown as {
  supabaseAdmin?: ReturnType<typeof createClient>;
};

export const supabaseAdmin =
  globalForSupabase.supabaseAdmin ??
  createClient(process.env.SUPABASE_URL ?? "", process.env.SUPABASE_SERVICE_ROLE_KEY ?? "", {
    auth: { persistSession: false },
  });

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabaseAdmin = supabaseAdmin;
}
