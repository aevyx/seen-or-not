document.addEventListener("DOMContentLoaded", () => {
  const data = document.getElementById("data");

  document.getElementById("export").onclick = () => {
    chrome.storage.local.get(["visited"], ({ visited = {} }) => {
      data.value = JSON.stringify(visited, null, 2);
    });
  };

  document.getElementById("import").onclick = () => {
    try {
      const parsed = JSON.parse(data.value);
      chrome.storage.local.get(["visited"], ({ visited = {} }) => {
        const merged = { ...visited, ...parsed }; 

        chrome.storage.local.set({ visited: merged }, () => {
          alert("Imported and merged!");
        });
      });
    } catch {
      alert("Invalid JSON");
    }
  };

  document.getElementById("clear").onclick = () => {
    chrome.storage.local.set({ visited: {} });
    data.value = "";
  };

  document.getElementById("markSeen").onclick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab) return;
      chrome.storage.local.get(["tabState", "visited"], ({ tabState = {}, visited = {} }) => {
        tabState[tab.id] = "SEEN";
        visited[tab.url] = true;
        chrome.storage.local.set({ tabState, visited });
        chrome.action.setBadgeText({ tabId: tab.id, text: "SEEN" });
      });
    });
  };

  document.getElementById("resetNew").onclick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab) return;
      chrome.storage.local.get("tabState", ({ tabState = {} }) => {
        tabState[tab.id] = "NEW";
        chrome.storage.local.set({ tabState });
        chrome.action.setBadgeText({ tabId: tab.id, text: "NEW" });
      });
    });
  };
});

