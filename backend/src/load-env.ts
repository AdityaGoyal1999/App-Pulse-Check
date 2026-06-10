import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const backendRoot = resolve(__dirname, "..");

config({ path: resolve(backendRoot, ".env") });

const localEnvPath = resolve(backendRoot, ".env.local");
if (existsSync(localEnvPath)) {
  config({ path: localEnvPath, override: true });
}
