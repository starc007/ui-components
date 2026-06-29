"use client";

import { Eye, EyeOff, Mail, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/motion/input";

export function InputPreview() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("hunter2");
  const [query, setQuery] = useState("Ada");
  const [show, setShow] = useState(false);

  const emailError =
    email.length > 0 && !email.includes("@") ? "Enter a valid email address." : undefined;

  return (
    <div className="flex w-full max-w-xs flex-col gap-5">
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        leftIcon={<Mail />}
        value={email}
        onChange={setEmail}
        error={emailError}
      />
      <Input
        label="Password"
        type={show ? "text" : "password"}
        value={pass}
        onChange={setPass}
        rightIcon={
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="pointer-events-auto"
          >
            {show ? <EyeOff /> : <Eye />}
          </button>
        }
      />
      <Input
        label="Search"
        leftIcon={<Search />}
        value={query}
        onChange={setQuery}
        success={query.length > 1}
      />
    </div>
  );
}
