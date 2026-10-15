// Whether component pages show the web or the React Native docs. The choice
// lives on <html data-platform>, so CSS can pick the panel before hydration.

export type Platform = "web" | "native";

export const PLATFORM_STORAGE_KEY = "beui:platform";
export const PLATFORM_PARAM = "platform";
export const PLATFORM_EVENT = "beui:platform";

/**
 * Runs in <head> before the page paints: `?platform=` wins, then the
 * remembered choice. Without it, readers who chose React Native would see
 * the web docs flash first.
 */
export const PLATFORM_SCRIPT = `(function(){try{var p=new URLSearchParams(location.search).get("${PLATFORM_PARAM}");if(p!=="web"&&p!=="native")p=localStorage.getItem("${PLATFORM_STORAGE_KEY}");if(p==="native")document.documentElement.dataset.platform="native"}catch(e){}})()`;
