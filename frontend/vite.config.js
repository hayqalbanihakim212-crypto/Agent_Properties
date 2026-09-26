import react from "@vitejs/plugin-react";
import { reactCompilerPreset } from "@vitejs/plugin-react"; // jika dipisah
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/Agent_Properties/",
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
});
