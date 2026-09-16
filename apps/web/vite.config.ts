import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const configuredApiUrl = env.VITE_API_BASE_URL;
  const configuredRemoteApi = configuredApiUrl?.startsWith("http://") || configuredApiUrl?.startsWith("https://")
    ? configuredApiUrl
    : undefined;
  const apiProxyTarget = env.API_PROXY_TARGET || configuredRemoteApi || "http://127.0.0.1:8000";

  return {
    server: {
      proxy: {
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    plugins: [
      react(),
      tailwindcss(),
    ],
  };
});
