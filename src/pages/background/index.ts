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
    case "OPEN_TAB":
      chrome.tabs
        .update(message.payload.tabId, {
          active: true,
          highlighted: true,
        })
        .then(() => {
          sendResponse(true);
        });
      break;
    case "DUPLICATE_TAB":
      chrome.tabs.duplicate(sender.tab.id);
      sendResponse(true);
      break;
    case "NEW_TAB":
      chrome.tabs.create({ active: true });
      sendResponse(true);
      break;
    case "CLOSE_TAB":
      chrome.tabs.remove(message.payload.tabId).then(() => {
        sendResponse(true);
      });
      break;
    case "OPTIMIZE_TAB":
      chrome.tabs.query({}).then((tabs) => {
        // remove duplicate tabs
        const uniqueTabsMap = {};
        tabs.forEach((tab) => {
          if (!uniqueTabsMap[tab.url]) {
            uniqueTabsMap[tab.url] = tab;
          } else {
            chrome.tabs.remove(tab.id);
          }
        });

        // group tabs by domain
        let hash = tabs.reduce((hash, tab) => {
          if (tab.groupId !== -1) return hash;
          const domAndDir = tab.url
            .replace(/(^\w+:|^)\/\//, "")
            .split("/")?.[0];
          if (!domAndDir) return hash;
          hash[domAndDir] = (hash[domAndDir] || []).concat(tab.id);
          return hash;
        }, {});

        const domains = Object.keys(hash).sort();
        domains.forEach((key) => {
          const tabIds = hash[key];
          chrome.tabs.move(tabIds, { index: -1 });
        });

        sendResponse(true);
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
