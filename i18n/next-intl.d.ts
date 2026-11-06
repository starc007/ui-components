import type { SiteMessages } from "./messages";
import type { routing } from "./routing";

// Typed keys: useTranslations("Chrome.header")("typo") fails typecheck.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: SiteMessages;
  }
}
