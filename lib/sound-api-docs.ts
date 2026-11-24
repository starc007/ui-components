import type { ComponentPropsDoc } from "@/lib/props-extractor";

// Sounds are objects, not components, so the props extractor finds nothing
// in them. Their pages list the call options instead; keep these in step with
// lib/sounds/engine.ts and lib/sound.tsx.

const PLAY: ComponentPropsDoc = {
  displayName: "sound.play(options)",
  props: [
    {
      name: "volume",
      type: "number",
      required: false,
      defaultValue: "1",
      description: "0 to 1, multiplied with the SoundProvider volume.",
    },
    {
      name: "pitch",
      type: "number",
      required: false,
      defaultValue: "1",
      description: "Pitch multiplier; 1 is the designed pitch.",
    },
  ],
};

const USE_SOUND: ComponentPropsDoc = {
  displayName: "useSound(sound, options)",
  props: [
    {
      name: "enabled",
      type: "boolean",
      required: false,
      defaultValue: "true",
      description: "False makes play do nothing, for a component's sound prop.",
    },
    {
      name: "volume",
      type: "number",
      required: false,
      defaultValue: "1",
      description: "0 to 1 for this sound, on top of the provider volume.",
    },
  ],
};

const PROVIDER: ComponentPropsDoc = {
  displayName: "SoundProvider",
  props: [
    {
      name: "enabled",
      type: "boolean",
      required: false,
      defaultValue: "true",
      description: "False mutes every beUI sound under the provider.",
    },
    {
      name: "volume",
      type: "number",
      required: false,
      defaultValue: "1",
      description: "0 to 1, scales every beUI sound.",
    },
  ],
};

/** The API reference for a page in the sounds category. */
export function soundApiDocs(slug: string): ComponentPropsDoc[] {
  return slug === "sound-kit" ? [PROVIDER, USE_SOUND, PLAY] : [PLAY, USE_SOUND];
}
