const template = document.querySelector("#li_template");
const defaultUl = document.querySelector(".default-ul");
const addGroup = document.querySelector(".add-group");
const container = document.querySelector(".container");
const defaultIcon =
  "https://cdn.iconscout.com/icon/free/png-512/free-webpage-window-layout-design-blog-browser-web-2-22114.png?f=webp&w=512";

// from chrome local storage get tablist for the initial render
chrome.storage.local.get(["tabList"], (result) => {
  const tabs = result.tabList;
  const length = tabs.length;
  // initial render
  for (const tab of tabs) {
    // create element from template
    const element = template.content.firstElementChild.cloneNode(true);
    const newElement = makeTabElement(element, tab);
    const ulArray = document.querySelectorAll("ul");
    let isGroupExists = false;
    // if the tab belongs to a group
    if (tab.groupId !== "g-1") {
      // organize into the same group if group existed
      ulArray.forEach((ul) => {
        if (ul.className === tab.groupId) {
          isGroupExists = true;
          const classStr = `.${ul.className}`;
          const existUl = document.querySelector(classStr);
          existUl.appendChild(newElement);
        }
      });
      // insert into a newly created ul
      if (!isGroupExists) {
        insertIntoNewUl(newElement, tab.groupId);
      }
      continue;
    }
    // if the tab does not belong to any group
    defaultUl.append(newElement);
  }
});

// click event to switch
container.addEventListener("click", (e) => {
  const switchTarget = e.target.closest("li");
  // error handling
  if (!switchTarget) return;
  switchTab(switchTarget);
});

let selected = null;
let startingPoint = null;
let selectedTabId = null;

container.addEventListener("dragstart", (e) => {
  selected = e.target.tagName === "LI" ? e.target : e.target.closest("li");
  startingPoint = e.target.closest("ul");
  selectedTabId = selected.firstElementChild.className;
  // error handling
  if (!startingPoint) {
    selected = "";
    startingPoint = null;
    selectedTabId = null;
    return;
  }
});

// while dragging on the add-group area
addGroup.addEventListener("dragover", (e) => {
  e.preventDefault();
  // add CSS to the add-group area
  addGroup.classList.add("drag-over");
});

container.addEventListener("dragover", (e) => {
  e.preventDefault();
});

// drop at areas other than add-group
container.addEventListener("drop", async (e) => {
  e.preventDefault();
  const divClassList = e.target.closest("div");
  // from default-ul to the add-group area
  if (divClassList && divClassList.classList[0] === "add-group") {
    // error handling
    if (startingPoint.className !== "default-ul") {
      selected = "";
      startingPoint = null;
      selectedTabId = null;
      return;
    }
    // add the grouping to chrome local storage
    const selectedTabId = selected.firstElementChild.className;
    let groupId = await groupTabs([parseInt(selectedTabId)]);
    groupId = "g" + groupId;
    // insert the tab into new ul
    insertIntoNewUl(selected, groupId);
    selected = "";
    startingPoint = null;
    selectedTabId = null;
    return;
  }

  const destination = e.target.closest("ul");
  // error handling
  if (
    !destination ||
    (destination && destination.className === startingPoint.className)
  ) {
    selected = "";
    startingPoint = null;
    selectedTabId = null;
    return;
  }

  // from a grouped ul to default-ul
  if (
    startingPoint.tagName === "UL" &&
    destination.className === "default-ul"
  ) {
    defaultUl.append(selected);
    chrome.tabs.ungroup([parseInt(selectedTabId)]);
    if (startingPoint.children.length === 0) {
      startingPoint.nextSibling.remove();
      startingPoint.remove();
    }
  }
  // from default-ul to a grouped ul
  else if (
    startingPoint.className === "default-ul" &&
    destination.tagName === "UL"
  ) {
    const groupId = destination.className;
    groupTabs([parseInt(selectedTabId)], parseInt(groupId.slice(1)));
    destination.append(selected);
  }
  // from a grouped ul to another grouped ul
  else if (
    startingPoint.tagName === "UL" &&
    startingPoint.className !== "default-ul" &&
    destination.tagName === "UL"
  ) {
    chrome.tabs.ungroup([parseInt(selectedTabId)]);
    let destiGp = destination.className;
    groupTabs([parseInt(selectedTabId)], parseInt(destiGp.slice(1)));
    destination.append(selected);
    // remove grouped ul if it's empty
    if (startingPoint.children.length === 0) {
      startingPoint.nextSibling.remove();
      startingPoint.remove();
    }
  }
  selected = "";
  startingPoint = null;
  selectedTabId = null;
  return;
});

// done drag event from default ul
defaultUl.addEventListener("dragend", (e) => {
  addGroup.classList.remove("drag-over");
});

function switchTab(node) {
  const tabId = parseInt(node.closest("li").firstElementChild.className);
  // switch tab
  chrome.tabs.update(tabId, { active: true });
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
  const hr = document.createElement("hr");
  defaultUl.parentElement.insertBefore(hr, groupedUl.nextSibling);
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
