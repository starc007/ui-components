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

// Props that come from React's own types carry no JSDoc in this repo; these
// say what they do in beUI terms so no row of the API table is blank.
const COMMON_PROP_DESCRIPTIONS: Record<string, string> = {
  children: "Content rendered inside the component.",
  className: "Classes merged onto the root element.",
  style: "Inline styles for the root element.",
  ref: "Ref to the root element.",
  id: "Id for the root element.",
};

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
      description: prop.description || COMMON_PROP_DESCRIPTIONS[prop.name] || "",
    })),
  }));
  cache.set(absPath, result);
  return result;
}

export type TypeFieldDoc = {
  name: string;
  type: string;
  required: boolean;
  description: string;
};

/** An object type a component's props refer to, such as `CommandItem`. */
export type ReferencedTypeDoc = {
  name: string;
  /** Repo-relative file that declares it. */
  file: string;
  fields: TypeFieldDoc[];
};

const typeCache = new Map<string, ReferencedTypeDoc[]>();

/** Object-shaped interfaces and type aliases declared in one source file. */
function objectTypeDeclarations(source: ts.SourceFile) {
  const found = new Map<string, ts.InterfaceDeclaration | ts.TypeLiteralNode>();
  for (const statement of source.statements) {
    if (ts.isInterfaceDeclaration(statement)) found.set(statement.name.text, statement);
    else if (ts.isTypeAliasDeclaration(statement) && ts.isTypeLiteralNode(statement.type)) {
      found.set(statement.name.text, statement.type);
    }
  }
  return found;
}

/** The repo's own files a source file imports from (not node_modules). */
function importedRepoFiles(source: ts.SourceFile, checker: ts.TypeChecker) {
  const files: ts.SourceFile[] = [];
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) continue;
    const specifier = statement.moduleSpecifier;
    if (!specifier) continue;
    const declaration = checker.getSymbolAtLocation(specifier)?.valueDeclaration;
    const file = declaration?.getSourceFile();
    if (file && !file.isDeclarationFile && !file.fileName.includes("node_modules")) files.push(file);
  }
  return files;
}

function fieldsOf(
  node: ts.InterfaceDeclaration | ts.TypeLiteralNode,
  checker: ts.TypeChecker,
): TypeFieldDoc[] {
  const fields: TypeFieldDoc[] = [];
  for (const member of node.members) {
    if (!ts.isPropertySignature(member) && !ts.isMethodSignature(member)) continue;
    const symbol = member.name ? checker.getSymbolAtLocation(member.name) : undefined;
    const description = symbol
      ? ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim()
      : "";
    const type = ts.isPropertySignature(member)
      ? (member.type?.getText() ?? "unknown")
      : `(${member.parameters.map((p) => p.getText()).join(", ")}) => ${member.type?.getText() ?? "void"}`;
    fields.push({
      name: member.name.getText(),
      type: type.replace(/\s+/g, " "),
      required: !member.questionToken,
      description,
    });
  }
  return fields;
}

/**
 * The object types a component's props name, with their fields, so docs can
 * say what goes in `items: CommandItem[]`. Looks in the component file and the
 * repo files it imports, and follows types those fields name in turn, two
 * levels deep. Props types themselves and string unions are left out: the
 * props table covers the first, and the type column already spells out the
 * second.
 */
export function getReferencedTypes(relFile: string): ReferencedTypeDoc[] {
  const absPath = path.join(PROJECT_ROOT, relFile);
  const cached = typeCache.get(absPath);
  if (cached) return cached;

  const program = getProgram();
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(absPath);
  if (!source) return [];

  const declarations = new Map(objectTypeDeclarations(source));
  for (const file of importedRepoFiles(source, checker)) {
    for (const [name, node] of objectTypeDeclarations(file)) {
      if (!declarations.has(name)) declarations.set(name, node);
    }
  }

  const named = (text: string) =>
    [...declarations.keys()].filter(
      (name) => !name.endsWith("Props") && !name.endsWith("Messages") && new RegExp(`\\b${name}\\b`).test(text),
    );

  const propTypes = getComponentProps(relFile).flatMap((doc) => doc.props.map((prop) => prop.type));
  const result: ReferencedTypeDoc[] = [];
  const seen = new Set<string>();
  let frontier = named(propTypes.join(" "));
  for (let depth = 0; depth < 2 && frontier.length; depth++) {
    const next: string[] = [];
    for (const name of frontier) {
      if (seen.has(name)) continue;
      seen.add(name);
      const node = declarations.get(name);
      if (!node) continue;
      const fields = fieldsOf(node, checker);
      if (!fields.length) continue;
      const file = path.relative(PROJECT_ROOT, node.getSourceFile().fileName);
      result.push({ name, file, fields });
      next.push(...named(fields.map((field) => field.type).join(" ")));
    }
    frontier = next;
  }
  typeCache.set(absPath, result);
  return result;
}
