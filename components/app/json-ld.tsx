export type JsonLdSchema = Record<string, unknown>;

/**
 * Renders JSON-LD structured data. Server component, no client cost.
 * Pass one schema object or an array; each is emitted as its own script tag.
 */
export function JsonLd({ data }: { data: JsonLdSchema | JsonLdSchema[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          // biome-ignore lint/suspicious/noArrayIndexKey: stable build-time list
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
