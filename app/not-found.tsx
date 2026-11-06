"use client";

import NextError from "next/error";

// Requests that never reach app/[locale] (no matching locale segment).
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <NextError statusCode={404} />
      </body>
    </html>
  );
}
