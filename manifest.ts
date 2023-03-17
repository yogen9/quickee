import packageJson from "./package.json";

/**
 * After changing, please reload the extension at `chrome://extensions`
 */
const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  action: {
    // default_popup: "src/pages/popup/index.html",
    default_icon: "quickee-32.png",
  },
  icons: {
    "16": "quickee-16.png",
    "32": "quickee-32.png",
    "48": "quickee-48.png",
    "128": "quickee-128.png",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*", "<all_urls>"],
      js: ["src/pages/content/index.js"],
    },
  ],
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/css/*.css",
        "quickee-16.png",
        "quickee-32.png",
        "quickee-48.png",
        "quickee-128.png",
      ],
      matches: ["*://*/*"],
    },
  ],
  permissions: ["activeTab", "scripting", "tabs"],
  host_permissions: ["https://*/*", "http://*/*"],
};

export default manifest;
