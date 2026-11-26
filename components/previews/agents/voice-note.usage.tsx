"use client";

import { VoiceNote } from "@/components/agents/voice-note";

export function VoiceNoteUsage() {
  return (
    <VoiceNote
      className="max-w-sm"
      onRecordStart={() => {
        // Start your MediaRecorder here and pass its level to `level`.
      }}
      onSend={(durationMs) => {
        // Stop the recorder and upload the clip; durationMs is its length.
        void durationMs;
      }}
    />
  );
}
