"use client";

import { Avatar, AvatarGroup } from "@/components/ui/avatar";

export function AvatarPreview() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Avatar size="xs" name="Ada Lovelace" />
        <Avatar size="sm" name="Linus Torvalds" />
        <Avatar size="md" name="Grace Hopper" />
        <Avatar size="lg" name="Donald Knuth" />
        <Avatar size="xl" name="Margaret Hamilton" />
      </div>
      <AvatarGroup max={4}>
        <Avatar name="A B" />
        <Avatar name="C D" />
        <Avatar name="E F" />
        <Avatar name="G H" />
        <Avatar name="I J" />
        <Avatar name="K L" />
      </AvatarGroup>
    </div>
  );
}
