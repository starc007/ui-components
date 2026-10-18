// Copies beUI Native into the site: its component manifest and source go to
// lib/native/catalog.json (slugs to lib/native/slugs.json, sidebar entries to
// lib/native/nav.json, counts to lib/native/summary.json), and its showcase
// clips and posters go to the
// beui-native R2 bucket, served from media.beui.dev.
//
//   bun scripts/sync-native.ts [path-to-beui-native]
//
// The path defaults to ../beui-native, or BEUI_NATIVE_DIR. Run `bun run
// manifest` there first, and record the clips with its scripts/record.sh.
// Posters need ffmpeg; uploads need `wrangler login` on the beUI account.
//
// Files are named by a hash of their content and cached forever, so a
// re-recorded clip gets a new URL. Only files R2 doesn't have yet upload.
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dir, "..");
const NATIVE = path.resolve(
  process.argv[2] ?? process.env.BEUI_NATIVE_DIR ?? path.join(ROOT, "../beui-native"),
);
const CATALOG = path.join(ROOT, "lib/native/catalog.json");
const BUCKET = "beui-native";
const MEDIA_URL = (process.env.BEUI_MEDIA_URL ?? "https://media.beui.dev").replace(/\/$/, "");
const CACHE = "public, max-age=31536000, immutable";
const THEMES = ["light", "dark"] as const;

type ManifestComponent = {
  slug: string;
  title: string;
  description: string;
  group: string;
  variants: number;
  /** When it reached beui.dev; the site marks it New for a week. */
  launchedAt?: string;
  readme: string;
  source: string;
  files: string[];
  shared: string[];
  libraries: string[];
  expoGo: string;
  clips: Record<(typeof THEMES)[number], string>;
};

const manifestPath = path.join(NATIVE, "showcase.json");
if (!existsSync(manifestPath)) {
  console.error(`No showcase.json in ${NATIVE}. Pass the beui-native path.`);
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const read = (file: string) => readFileSync(path.join(NATIVE, file), "utf8");

mkdirSync(path.dirname(CATALOG), { recursive: true });
const posters = mkdtempSync(path.join(tmpdir(), "beui-native-posters-"));

// URLs already in the catalog were uploaded by an earlier sync.
const uploaded = new Set<string>();
if (existsSync(CATALOG)) {
  for (const component of JSON.parse(readFileSync(CATALOG, "utf8")).components) {
    for (const clip of Object.values(component.clips) as ({ video: string; poster: string } | null)[]) {
      if (clip) uploaded.add(clip.video).add(clip.poster);
    }
  }
}

function upload(file: string, key: string, contentType: string) {
  const url = `${MEDIA_URL}/${key}`;
  if (uploaded.has(url)) return url;
  const result = Bun.spawnSync(
    [
      // bunx re-splits arguments on spaces, which breaks --cache-control.
      path.join(ROOT, "node_modules/.bin/wrangler"),
      "r2", "object", "put", `${BUCKET}/${key}`,
      "--file", file, "--content-type", contentType,
      "--cache-control", CACHE, "--remote",
    ],
    { cwd: ROOT },
  );
  if (result.exitCode !== 0) {
    throw new Error(`Upload of ${key} failed:\n${result.stderr.toString()}`);
  }
  console.log(`Uploaded ${key}`);
  return url;
}

const missing: string[] = [];
const components = (manifest.components as ManifestComponent[]).map(
  (component) => {
    const clips = Object.fromEntries(
      THEMES.map((theme) => {
        const name = component.clips[theme];
        const from = path.join(NATIVE, "recordings", name);
        if (!existsSync(from)) {
          missing.push(name);
          return [theme, null];
        }
        const bytes = readFileSync(from);
        const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 10);
        const key = `clips/${name.replace(/\.mp4$/, "")}.${hash}`;
        // The first frame, shown until the clip plays.
        const poster = path.join(posters, `${path.basename(key)}.jpg`);
        if (!uploaded.has(`${MEDIA_URL}/${key}.jpg`)) {
          const ffmpeg = Bun.spawnSync([
            "ffmpeg", "-loglevel", "error", "-y", "-i", from,
            "-frames:v", "1", "-q:v", "4", poster,
          ]);
          if (ffmpeg.exitCode !== 0) throw new Error(ffmpeg.stderr.toString());
        }
        return [
          theme,
          {
            video: upload(from, `${key}.mp4`, "video/mp4"),
            poster: upload(poster, `${key}.jpg`, "image/jpeg"),
          },
        ];
      }),
    );

    return {
      slug: component.slug,
      title: component.title,
      description: component.description,
      group: component.group,
      variants: component.variants,
      launchedAt: component.launchedAt,
      repository: component.source,
      libraries: component.libraries,
      expoGo: component.expoGo,
      clips,
      files: component.files.map((file) => ({ path: file, content: read(file) })),
      shared: component.shared.map((file) => ({ path: file, content: read(file) })),
      readme: existsSync(path.join(NATIVE, component.readme))
        ? read(component.readme)
        : null,
    };
  },
);

const catalog = {
  // Regenerate with `bun scripts/sync-native.ts`. Do not edit by hand.
  generatedFrom: `${manifest.repository}@${manifest.version}`,
  name: manifest.name,
  version: manifest.version,
  repository: manifest.repository,
  expoGo: manifest.expoGo,
  theme: { path: manifest.theme, content: read(manifest.theme) },
  components,
};

writeFileSync(CATALOG, `${JSON.stringify(catalog, null, 2)}\n`);
// Client code, like the sidebar's platform switch, only needs to know which
// pages have a native version, not the whole catalog.
writeFileSync(
  path.join(path.dirname(CATALOG), "slugs.json"),
  `${JSON.stringify(components.map((component) => component.slug))}\n`,
);
// The sidebar lists native components by group on /react-native pages.
writeFileSync(
  path.join(path.dirname(CATALOG), "nav.json"),
  `${JSON.stringify(
    components.map(({ slug, title, group, launchedAt }) => ({
      slug,
      title,
      group,
      ...(launchedAt ? { launchedAt } : {}),
    })),
  )}\n`,
);
// The site announcement counts every variant, like the web's install count.
writeFileSync(
  path.join(path.dirname(CATALOG), "summary.json"),
  `${JSON.stringify({
    components: components.length,
    variants: components.reduce((total, component) => total + component.variants, 0),
  })}\n`,
);
console.log(
  `Synced ${components.length} native components to lib/native/catalog.json.`,
);
if (missing.length > 0) {
  console.warn(`Missing clips (record them in beui-native): ${missing.join(", ")}`);
}
