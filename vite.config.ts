import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "./lib",
      name: "ThreeSpan",
    },
    minify: true,
    rollupOptions: {
      external: ["three"],
      output: {
        globals: { three: "THREE" },
      },
    },
    sourcemap: true,
  },
  plugins: [
    dts({
      entryRoot: "./lib",
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  server: {
    open: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "live/src"),
      "@lib": resolve(__dirname, "lib"),
      "@docs": resolve(__dirname, "docs"),
    },
  },
});
