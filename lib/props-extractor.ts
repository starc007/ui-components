import path from "node:path";
import ts from "typescript";
import * as docgen from "react-docgen-typescript";
import { registry } from "@/lib/registry";

const PROJECT_ROOT = process.cwd();

export type PropDoc = {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
};

export type ComponentPropsDoc = {
  displayName: string;
  props: PropDoc[];
};

function allRegisteredFiles(): string[] {
  const files = new Set<string>();
  for (const category of registry) {
    for (const comp of category.components) {
      files.add(path.join(PROJECT_ROOT, comp.file));
      for (const example of comp.examples ?? []) {
        files.add(path.join(PROJECT_ROOT, example.file));
      }
    }
  }
  return Array.from(files);
}

let program: ts.Program | null = null;

function getProgram() {
  if (!program) {
    const configPath = path.join(PROJECT_ROOT, "tsconfig.json");
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, PROJECT_ROOT);
    program = ts.createProgram(allRegisteredFiles(), parsed.options);
  }
  return program;
}

const parser = docgen.withDefaultConfig({
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  savePropValueAsString: true,
});

function formatType(prop: docgen.PropItem): string {
  if (prop.type?.name === "enum" && Array.isArray(prop.type.value)) {
    return prop.type.value.map((v: { value: string }) => v.value).join(" | ");
  }
  return prop.type?.name ?? "unknown";
}

function isFromNodeModules(prop: docgen.PropItem): boolean {
  return prop.parent?.fileName.includes("node_modules") ?? false;
}

// Interfaces like `ButtonProps extends Omit<HTMLMotionProps<"button">, "children">`
// merge in framer-motion/DOM attributes whose origin the type checker can't always
// trace back to node_modules (parent comes back undefined instead). So: if *any*
// prop on this component resolves to node_modules, treat every untraceable prop as
// inherited noise too and drop it, keeping only props traceable to this repo. If
// none do (e.g. a component with a plain inline prop-object type), nothing was
// spread in from a library type, so keep everything as-is.
function ownProps(props: docgen.PropItem[]): docgen.PropItem[] {
  const hasLibraryProps = props.some(isFromNodeModules);
  if (!hasLibraryProps) return props;
  // Every beUI component accepts `className` (merged via `cn()`), even when it
  // arrives through a native/motion passthrough rather than a hand-declared field.
  return props.filter(
    (prop) => prop.name === "className" || (prop.parent && !isFromNodeModules(prop)),
  );
}

const cache = new Map<string, ComponentPropsDoc[]>();

export function getComponentProps(relFile: string): ComponentPropsDoc[] {
  const absPath = path.join(PROJECT_ROOT, relFile);
  const cached = cache.get(absPath);
  if (cached) return cached;

  const docs = parser.parseWithProgramProvider([absPath], getProgram);
  const result: ComponentPropsDoc[] = docs.map((doc) => ({
    displayName: doc.displayName,
    props: ownProps(Object.values(doc.props ?? {})).map((prop) => ({
      name: prop.name,
      type: formatType(prop),
      required: prop.required,
      defaultValue: (prop.defaultValue?.value as string | undefined) ?? null,
      description: prop.description || "",
    })),
  }));
  cache.set(absPath, result);
  return result;
}
