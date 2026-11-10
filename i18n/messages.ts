import chrome from "@/messages/en/chrome.json";
import docs from "@/messages/en/docs.json";
import landing from "@/messages/en/landing.json";
import metadata from "@/messages/en/metadata.json";
import native from "@/messages/en/native.json";
import pages from "@/messages/en/pages.json";

/** The site is English only; IntlProvider and createTranslator take this. */
export const LOCALE = "en";

/**
 * Site copy, one file per area: messages/en/<area>.json. The object key is
 * the use-intl namespace. Library components carry their own English
 * defaults (`<name>Messages`), so they aren't here.
 */
export const messages = {
  Metadata: metadata,
  Chrome: chrome,
  Landing: landing,
  Docs: docs,
  Pages: pages,
  Native: native,
};

export type SiteMessages = typeof messages;
