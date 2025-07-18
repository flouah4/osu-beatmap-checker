import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  /** This is important for electron to work! */
  base: "./",
  plugins: [react(), tailwindcss()],
});
