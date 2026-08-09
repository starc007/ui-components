"use client";

import { useState } from "react";
import { SignUpForm } from "@/components/motion/signup-form";

export function SignUpFormPreview() {
  const [formError, setFormError] = useState<string>();

  return (
    <div className="flex w-full justify-center py-4">
      <SignUpForm
        description="Sign up with taken@example.com to see the failure state."
        errorMessage={formError}
        onSubmit={async (values) => {
          setFormError(undefined);
          await new Promise((resolve) => setTimeout(resolve, 1200));
          if (values.email.toLowerCase().startsWith("taken@")) {
            setFormError("That email is already registered.");
            throw new Error("Email already registered");
          }
        }}
        footer={
          <>
            Already have an account?{" "}
            <button
              type="button"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Sign in
            </button>
          </>
        }
      />
    </div>
  );
}
