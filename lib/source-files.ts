import { promises as fs } from "node:fs";
import path from "node:path";

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".css"] as const;

export type SourceFile = {
  path: string;
  content: string;
};

function toProjectRelative(filePath: string) {
  return filePath.split(path.sep).join("/");
}

function sourcePath(rel: string) {
  return path.join(process.cwd(), rel);
}

export async function readSourceFile(rel: string) {
  try {
    return await fs.readFile(sourcePath(rel), "utf8");
  } catch (error) {
    throw new Error(`Missing source file: ${rel}`, { cause: error });
  }
}

export async function readOptionalSourceFile(rel: string) {
  try {
    return await fs.readFile(sourcePath(rel), "utf8");
  } catch {
    return null;
  }
}

export async function resolveSourceImport(spec: string, fromFile?: string): Promise<SourceFile | null> {
  if (!spec.startsWith("@/") && !spec.startsWith(".")) return null;

  const rel = spec.startsWith("@/")
    ? spec.replace(/^@\//, "")
    : toProjectRelative(path.normalize(path.join(path.dirname(fromFile ?? ""), spec)));

  const candidates = candidatePaths(rel);

  for (const candidate of candidates) {
    const content = await readOptionalSourceFile(candidate);
    if (content != null) {
      return { path: candidate, content };
    }
  }

  return null;
}

function candidatePaths(rel: string) {
  const parsed = path.parse(rel);
  if (parsed.ext) return [rel];

  return [
    ...SOURCE_EXTENSIONS.map((ext) => `${rel}${ext}`),
    ...SOURCE_EXTENSIONS.map((ext) => `${rel}/index${ext}`),
    rel,
  ];
}
