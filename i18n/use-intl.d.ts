import type { SiteMessages } from "./messages";

// Typed keys: useTranslations("Chrome.header")("typo") fails typecheck.
declare module "use-intl" {
  interface AppConfig {
    Locale: "en";
    Messages: SiteMessages;
  }
}
