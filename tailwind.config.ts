// Configuración base de Tailwind CSS.
// Únicamente registra los Design Tokens oficiales (sección 14.12 del documento consolidado).
// MUST (14.12.1): "Toda propiedad visual deberá referenciar un token."
// MUST NOT (14.12.1): "Utilizar valores HEX, RGB, tamaños, radios, sombras o espaciados
// directamente dentro de componentes." — los componentes de producto deberán consumir
// estas clases/utilidades, nunca valores crudos.
// No se incluye aquí ningún componente ni funcionalidad de producto.

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Color Tokens — sección 14.12.3 (Primary / Secondary / Neutral / Success / Warning / Danger)
        primary: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
          800: "#1E3A8A",
          900: "#172554",
          950: "#0F172A",
        },
        secondary: {
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#7C3AED",
          600: "#6D28D9",
          700: "#5B21B6",
          800: "#4C1D95",
          900: "#2E1065",
        },
        neutral: {
          0: "#FFFFFF",
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0A0A0A",
        },
        success: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
        warning: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        danger: {
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },
        // Colores por ecosistema — sección 14.3 (referenciar aquí cuando se
        // definan las variantes tonales exactas; no inventar valores no
        // especificados en el catálogo de tokens).
      },
      transitionDuration: {
        // Motion tokens — sección 14.8 / resolución 18.8 (400ms es el máximo
        // oficial para transiciones de pantalla; 150-300ms para microinteracciones).
        150: "150ms",
        300: "300ms",
        400: "400ms",
      },
      transitionTimingFunction: {
        "delf-ease": "cubic-bezier(0.4, 0, 0.2, 1)", // ease-in-out, sección 14.8
      },
    },
  },
  plugins: [],
};

export default config;
