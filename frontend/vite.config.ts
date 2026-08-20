import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "cache-bust",
      enforce: "post",
      transformIndexHtml(html) {
        const ts = Date.now();
        return html.replace(
          /src="(\/assets\/index-[^"]+\.js)"/,
          `src="$1?v=${ts}"`
        );
      },
    },
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
