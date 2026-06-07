import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter()],
  server: {
    port: Number(process.env.PORT) || 3000,
    allowedHosts: [
      // Allow the Shopify CLI tunnel host
      ".trycloudflare.com",
      ".ngrok.io",
      ".loca.lt",
    ],
  },
  build: {
    target: "es2022",
  },
});
