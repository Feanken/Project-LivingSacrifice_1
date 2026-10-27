import { defineConfig } from "@playwright/test";
import path from "node:path";
const baseURL = "http://127.0.0.1:3100";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 15000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    browserName: "chromium",
    channel:
      process.env.PLAYWRIGHT_CHANNEL ||
      (process.platform === "win32" ? "msedge" : undefined),
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [320, 768, 1024, 1199, 1920].map((width) => ({
    name: `${width}px`,
    use: { viewport: { width, height: 900 } },
  })),
  webServer: {
    command: "npm run dev -- --port 3100",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      DATABASE_MODE: "embedded",
      EMBEDDED_DATABASE_PATH: path.resolve(`.data/e2e-${Date.now()}`),
      TRUSTED_IP_HEADER: "x-test-ip",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
});
