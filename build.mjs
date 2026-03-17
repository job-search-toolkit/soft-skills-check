import { execSync } from "child_process";
const env = { ...process.env };
delete env.TURBOPACK;
delete env.TURBOPACK_BUILD;
env.NODE_ENV = "production";
try {
  execSync("npx next build", { stdio: "inherit", env });
} catch (e) {
  process.exit(1);
}
