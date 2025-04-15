import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"), // Main app entry
        pip: path.resolve(__dirname, "src/pipEntry.jsx"), // PiP window entry
      },
      output: {
        entryFileNames: "[name].js", // Output as main.js and pipEntry.js
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/pip-window": {
        target: "http://localhost:3000",
        rewrite: () => "/pip.html",
      },
    },
  },
});
