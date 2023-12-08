const template = document.querySelector("#li_template");
const defaultUl = document.querySelector(".default-ul");
const addGroup = document.querySelector(".add-group");
const defaultIcon =
  "https://cdn.iconscout.com/icon/free/png-512/free-webpage-window-layout-design-blog-browser-web-2-22114.png?f=webp&w=512";

// from chrome local storage get tablist for the initial render
chrome.storage.local.get(["tabList"], (result) => {
  const tabs = result.tabList;
  // initial render
  for (const tab of tabs) {
    // create element from template
    const element = template.content.firstElementChild.cloneNode(true);
    const newElement = makeTabElement(element, tab);
    // if the tab has a group
    if (tab.groupId !== -1) {
      // insert into a newly created ul
      // 整理同一個group的功能
      insertIntoNewUl(newElement, tab.groupId);
      continue;
    }
    defaultUl.append(newElement);
  }
});

// click event to switch
defaultUl.addEventListener("click", (e) => {
  switchTab(e.target);
});

// drag item event from default ul
defaultUl.addEventListener("dragstart", (e) => {
  let selected = e.target;
  // if not selecting an list item, then return
  if (selected.tagName !== "LI") return;
  // while draggin on the add-group area
  addGroup.addEventListener("dragover", (e) => {
    e.preventDefault();
    // add CSS to the add-group area
    addGroup.classList.add("drag-over");
  });

  // while drop at add-group
  addGroup.addEventListener("drop", async (e) => {
    // add the grouping to chrome local storage
    const selectedTabId = selected.firstElementChild.className;
    const groupId = await groupTabs([parseInt(selectedTabId)]);
    // insert the tab into new ul
    insertIntoNewUl(selected, groupId);
    selected = null;
  });
});

// done drag event from default ul
defaultUl.addEventListener("dragend", (e) => {
  addGroup.classList.remove("drag-over");
});

// drag item from default-ul to the a grouped ul
document.addEventListener("dragstart", (e) => {
  let selected = e.target;
  const selectedTabId = selected.firstElementChild.className;
  // if selecting is not an list item, then return
  if (selected.tagName !== "LI") return;
  document.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  document.addEventListener("drop", (e) => {
    const destination = e.target.closest("ul");
    // if the destination is default-ul, return
    if (destination && destination.className === "default-ul") return;
    const groupId = destination.className;
    groupTabs([parseInt(selectedTabId)], parseInt(groupId));
    destination.append(selected);
    selected = null;
    // 加入移出group功能
  });
});

function switchTab(node) {
  const tabId = parseInt(node.closest("li").firstElementChild.className);
  // switch tab
  chrome.tabs.update(tabId, { active: true }, (tab) => {
    console.log("tab switched");
  });
}

function makeTabElement(templateEle, tabObj) {
  templateEle.querySelector(".title").textContent = tabObj.title;
  templateEle.querySelector(".favIcon").src = tabObj.favIconUrl || defaultIcon;
  templateEle.querySelector(".url").textContent = tabObj.url;
  templateEle.firstElementChild.className = tabObj.id;
  return templateEle;
}

function insertIntoNewUl(selectedTab, groupID) {
  const groupedUl = defaultUl.parentElement.insertBefore(
    document.createElement("ul"),
    defaultUl,
  );
  groupedUl.appendChild(selectedTab);
  defaultUl.parentElement.insertBefore(
    document.createElement("hr"),
    groupedUl.nextSibling,
  );
  groupedUl.className = groupID;
}

async function groupTabs(idArray, existedGroupId) {
  return new Promise((resolve, reject) => {
    try {
      // if it's the first element in the group
      if (!existedGroupId) {
        chrome.tabs.group({ tabIds: idArray }, (createdGroupId) => {
          resolve(createdGroupId);
        });
        // if group already existed
      } else {
        chrome.tabs.group(
          { tabIds: idArray, groupId: existedGroupId },
          (createdGroupId) => {
            resolve(createdGroupId);
          },
        );
      }
    } catch (error) {
      console.error(error);
    }
  });
}
