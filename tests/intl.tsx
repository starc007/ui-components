import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import { englishMessages } from "@/i18n/messages";

/** Site components read their copy from next-intl; render them with English. */
export function withIntl(ui: ReactElement) {
  return (
    <NextIntlClientProvider locale="en" messages={englishMessages} timeZone="UTC">
      {ui}
    </NextIntlClientProvider>
  );
}
