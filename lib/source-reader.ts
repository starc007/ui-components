import { promises as fs } from "node:fs";
import path from "node:path";

export async function readSourceFile(rel: string) {
  try {
    return await fs.readFile(path.join(process.cwd(), rel), "utf8");
  } catch (error) {
    throw new Error(`Missing source file: ${rel}`, { cause: error });
  }
}

export async function readOptionalSourceFile(rel: string) {
  try {
    return await fs.readFile(path.join(process.cwd(), rel), "utf8");
  } catch {
    return null;
  }
}
