import path from "path";
import { fileURLToPath } from "url"; // Import the necessary function
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Get the directory name using the ES Module approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Use the correctly derived __dirname
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
