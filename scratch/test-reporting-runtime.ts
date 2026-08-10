import { execSync } from "child_process";

console.log("Redirecting execution to frontend/scratch/test-reporting-runtime.ts...");
try {
  execSync("npx tsx scratch/test-reporting-runtime.ts", { cwd: "./frontend", stdio: "inherit" });
  process.exit(0);
} catch (error: any) {
  process.exit(1);
}
