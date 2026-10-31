"use client";

import { AvatarGroup } from "@/components/motion/avatar-group";

const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=96&h=96&q=80`;

const MEMBERS = [
  { id: "maya", name: "Maya Chen", src: photo("1494790108377-be9c29b29330") },
  { id: "leo", name: "Leo Hart", src: photo("1507003211169-0a1dd7228f2d") },
  { id: "ines", name: "Ines Duarte", src: photo("1438761681033-6461ffad8d80") },
  { id: "sam", name: "Sam Okafor", src: photo("1500648767791-00dcc994a43e") },
  { id: "noah", name: "Noah Berg", src: photo("1472099645785-5658abf4ff4e") },
  { id: "aria", name: "Aria Patel" },
  { id: "zoe", name: "Zoe Laurent", src: photo("1534528741775-53994a69daeb") },
  { id: "kai", name: "Kai Moreno" },
];

export function AvatarGroupPreview() {
  return <AvatarGroup members={MEMBERS} max={4} size="lg" label="Project members" />;
}
