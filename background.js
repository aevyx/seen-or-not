const BADGE = {
  NEW: { text: "NEW", color: "#00c853" },
  SEEN: { text: "SEEN", color: "#ff0000" },
  IDLE: { text: "IDLE", color: "#9e9e9e" }
};

const IDLE_DELAY = 5 * 60 * 1000; 

const idleTimers = {};

function isValidTabUrl(url) {
  return url && url.startsWith("http");
}

function normalizeUrl(url) {
  try {
    const u = new URL(url);

    if (u.hostname.includes("google.com") && u.pathname === "/search") {
      return `https://google.com/search?q=${u.searchParams.get("q") || ""}`;
    }

    if (u.hostname.includes("linkedin.com") && u.pathname.startsWith("/search")) {
      return `https://linkedin.com${u.pathname}`;
    }

    u.hash = ""; 

    return u.toString();
  } catch {
    return url;
  }
}

function applyBadge(tabId, state) {
  if (!state) {
    chrome.action.setBadgeText({ tabId, text: "" });
    return;
  }
  const b = BADGE[state];
  chrome.action.setBadgeText({ tabId, text: b.text });
  chrome.action.setBadgeBackgroundColor({ tabId, color: b.color });
}

function startIdleTimer(tabId) {
  clearTimeout(idleTimers[tabId]);
  idleTimers[tabId] = setTimeout(() => {
    chrome.storage.local.get("tabState", ({ tabState = {} }) => {
      tabState[tabId] = "IDLE";
      chrome.storage.local.set({ tabState });
      applyBadge(tabId, "IDLE");
    });
  }, IDLE_DELAY);
}

function resetIdleTimer(tabId) {
  clearTimeout(idleTimers[tabId]);
  chrome.storage.local.get("tabState", ({ tabState = {} }) => {
    if (tabState[tabId] === "IDLE") tabState[tabId] = "SEEN";
    chrome.storage.local.set({ tabState });
    applyBadge(tabId, tabState[tabId]);
  });
  startIdleTimer(tabId);
}

chrome.tabs.onCreated.addListener((tab) => {
  chrome.storage.local.get("tabState", ({ tabState = {} }) => {

    if (isValidTabUrl(tab.url)) {
      tabState[tab.id] = "NEW";
      chrome.storage.local.set({ tabState });
      applyBadge(tab.id, "NEW");
      startIdleTimer(tab.id);
    } else {

      tabState[tab.id] = "NEW";
      chrome.storage.local.set({ tabState });
      applyBadge(tab.id, "NEW");
    }
  });
});
chrome.webNavigation.onBeforeNavigate.addListener((d) => {
  if (d.frameId !== 0) return;

  const normUrl = normalizeUrl(d.url);

  chrome.storage.local.get(["visited", "tabState"], ({ visited = {}, tabState = {} }) => {
    const isVisited = !!visited[normUrl];
    const state = isVisited ? "SEEN" : "NEW";
    tabState[d.tabId] = state;
    chrome.storage.local.set({ tabState });
    applyBadge(d.tabId, state);
    startIdleTimer(d.tabId);
  });
});

chrome.webNavigation.onCompleted.addListener((d) => {
  if (d.frameId !== 0) return;

  const normUrl = normalizeUrl(d.url);

  chrome.storage.local.get(["visited", "tabState"], ({ visited = {}, tabState = {} }) => {

    visited[normUrl] = true;

    tabState[d.tabId] = tabState[d.tabId] || "NEW";

    chrome.storage.local.set({ visited, tabState });

    applyBadge(d.tabId, tabState[d.tabId]);

    startIdleTimer(d.tabId);
  });
});

chrome.tabs.onActivated.addListener(({ tabId, previousTabId }) => {
  if (previousTabId && previousTabId > 0) {
    chrome.tabs.get(previousTabId, (prevTab) => {
      if (!prevTab || !isValidTabUrl(prevTab.url)) return;

      const normUrl = normalizeUrl(prevTab.url);
      chrome.storage.local.get(["visited", "tabState"], ({ visited = {}, tabState = {} }) => {
        visited[normUrl] = true;
        tabState[previousTabId] = tabState[previousTabId] || "SEEN";
        chrome.storage.local.set({ visited, tabState });
        applyBadge(previousTabId, tabState[previousTabId]);
      });
    });
  }

  chrome.tabs.get(tabId, (tab) => {
    if (!tab || !isValidTabUrl(tab.url)) {
      chrome.action.setBadgeText({ tabId, text: "" });
      return;
    }
    chrome.storage.local.get("tabState", ({ tabState = {} }) => {
      applyBadge(tabId, tabState[tabId] || "NEW");
      resetIdleTimer(tabId);
    });
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && isValidTabUrl(tab.url)) {
    resetIdleTimer(tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.get("tabState", ({ tabState = {} }) => {
    delete tabState[tabId];
    chrome.storage.local.set({ tabState });
  });
  clearTimeout(idleTimers[tabId]);
});

