import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@utils": "/src/utils",
      "@containers": "/src/containers",
      "@services": "/src/services",
    },
  },
});
