import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { readdirSync } from "node:fs";

const htmlFiles = readdirSync(".")
  .filter((f) => f.endsWith(".html"))
  .reduce(
    (acc, f) => {
      acc[f.replace(".html", "")] = f;
      return acc;
    },
    {} as Record<string, string>,
  );

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: htmlFiles,
    },
  },
});
