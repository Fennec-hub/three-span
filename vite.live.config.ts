import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "./live",
  server: {
    open: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "live/src"),
      "@lib": resolve(__dirname, "lib"),
    },
  },
});
