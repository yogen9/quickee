import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

reloadOnUpdate("pages/background");

/**
 * @description
 * Inject content script to all tabs
 */
chrome.runtime.onInstalled.addListener(async () => {
  for (const cs of chrome.runtime.getManifest().content_scripts) {
    for (const tab of await chrome.tabs.query({ url: cs.matches })) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: cs.js,
      });
    }
  }
});

/**
 * @description
 * Listen for messages from content script
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "GET_ALL_TABS":
      chrome.tabs.query({}).then((tabs) => {
        sendResponse(tabs);
      });
      break;
    default:
      sendResponse({});
      break;
  }
  return true;
});

const injectApp = (tabId: number) => {
  chrome.scripting.executeScript({
    target: { tabId },
    files: ["src/pages/content/index.js"],
  });
};
