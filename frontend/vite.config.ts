import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({target: 'react', autoCodeSplitting: true,}),
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    port: Number(process.env.FRONTEND_PORT) || 5173,
    hmr: {
      host: 'localhost', // or your host machine's IP (not 127.0.0.1)
      port: Number(process.env.FRONTEND_PORT) || 5173,
    },
  }
});
