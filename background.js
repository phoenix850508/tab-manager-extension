function updateTabList() {
  // update the list of all tabs
  chrome.tabs.query({}, (tabs) => {
    const tabList = tabs.map((tab) => {
      return {
        windowId: tab.windowId,
        id: tab.id,
        url: tab.url,
        title: tab.title,
        isActiveTab: tab.active,
        favIconUrl: tab.favIconUrl,
        groupId: tab.groupId,
      };
    });
    chrome.storage.local.set({ tabList }).then(() => {
      console.log("tabList is set");
    });
  });
}

function test() {
  console.log("test from popup");
}

chrome.tabs.onAttached.addListener(() => {
  updateTabList();
});

chrome.tabs.onCreated.addListener(() => {
  updateTabList();
});

chrome.tabs.onDetached.addListener(() => {
  updateTabList();
});

chrome.tabs.onRemoved.addListener(() => {
  updateTabList();
});

chrome.tabs.onReplaced.addListener(() => {
  updateTabList();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  // only update tabList if the url has changed
  if (changeInfo.url || changeInfo.groupId) {
    updateTabList();
  }
});
