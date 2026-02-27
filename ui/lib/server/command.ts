import { spawn } from "node:child_process";

export type CommandResult = {
  stdout: string;
  stderr: string;
  code: number;
};

export async function runCommand(
  command: string,
  args: string[],
  options?: { cwd?: string; timeoutMs?: number }
): Promise<CommandResult> {
  const timeoutMs = options?.timeoutMs ?? 15000;

  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options?.cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (timedOut) {
        resolve({ stdout, stderr: `${stderr}\nCommand timed out after ${timeoutMs}ms`, code: 124 });
        return;
      }
      resolve({ stdout, stderr, code: code ?? 1 });
    });
  });
}

export function sanitizeMultiline(input: string): string {
  return input.replace(/\r\n/g, "\n").trim();
}
