import path from "node:path";
import { fileURLToPath } from "node:url";
import swc from "@rollup/plugin-swc";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { defineConfig, withFilter } from "vite";
import solid from "vite-plugin-solid";

const host = process.env.TAURI_DEV_HOST;

const dirname = fileURLToPath(new URL(".", import.meta.url));

const port = 31420;
const SOLID_APP_JSX_MODULE_RE = /src[\\/].*\.[cm]?[jt]sx$/;
const SOLID_DEPENDENCY_JSX_RE =
  /node_modules[\\/](?:@solidjs[\\/]router|@ark-ui[\\/]solid|lucide-solid|solid-motionone|@dschz[\\/]solid-flow)(?:[\\/].*)?\.jsx$/;

export default defineConfig(async ({ command }) => ({
  plugins: [
    solid({
      include: [SOLID_APP_JSX_MODULE_RE, SOLID_DEPENDENCY_JSX_RE],
    }),
    withFilter(
      swc({
        swc: {
          jsc: {
            parser: {
              syntax: "typescript",
              tsx: true,
              decorators: true,
            },
            transform: {
              decoratorVersion: "2022-03",
            },
          },
        },
      }),
      {
        transform: {
          id: /^(?!.*(?:src[\\/].*\.[cm]?[jt]sx$|node_modules[\\/](?:@solidjs[\\/]router|@ark-ui[\\/]solid|lucide-solid|solid-motionone|@dschz[\\/]solid-flow)(?:[\\/].*)?\.jsx$)).*\.[cm]?[jt]sx?$/,
          code: "@",
        },
      },
    ),
    vanillaExtractPlugin(),
  ],
  build: {
    rolldownOptions: {
      input: {
        main: path.resolve(dirname, "index.html"),
        mini: path.resolve(dirname, "mini.html"),
        overlay: path.resolve(dirname, "overlay.html"),
      },
      output: {
        codeSplitting:
          command === "serve"
            ? false
            : {
                groups: [
                  {
                    name: "vendor-solid",
                    test: /node_modules[\\/](solid-js|@solidjs|@solid-primitives|solid-zustand|solid-motionone|lucide-solid)([\\/]|$)|node_modules[\\/]@ark-ui[\\/]solid|node_modules[\\/]@dschz[\\/]solid-flow/,
                    priority: 21,
                  },
                  {
                    name: "vendor-graph",
                    test: /node_modules[\\/](@dschz|@dagrejs)/,
                    priority: 12,
                  },
                  {
                    name: "vendor-table",
                    test: /node_modules[\\/]@tanstack/,
                    priority: 11,
                  },
                  {
                    name: "vendor-misc",
                    test: /node_modules[\\/](i18next|remeda|zod|pino|graphology|uuid)([\\/]|$)|node_modules[\\/]zustand[\\/](?:esm[\\/])?(vanilla|middleware)(?:[\\/.]|$)/,
                    priority: 10,
                  },
                ],
              },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
  clearScreen: false,
  server: {
    port,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: port + 1 } : undefined,
    watch: { ignored: ["**/src-tauri/**", "**/target/**"] },
  },
}));
