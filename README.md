# tab-manager-extension
"tab manager extension" is a Chrome extension for people who find it is somewhat tricky to organize their tabs when there are many tabs opened. This extension can make your life easier by viewing all the opened tabs in a popup list, which you could view the titles of each tab much clearer in a glance. You can also categorize tabs into different categories, collapse/expand the grouped tabs or jump right into the tabs you'd like to focus with just one click on the popup tab list. 

[tab-manager-extension demo](https://www.youtube.com/watch?v=WanoYkFUzD0)

## Description
The tag-manager-extension includes an image folder and 6 files. These files are consist of HTML, CSS, 2 JavaScript files, README and a json file. The manifest.json file is to let the browser know that this directory is a browser extension, of which indicates default html file, service worker file, and the information that the extension will be granted access to.

The HTML file shows the structure of list items that illustrate the tabs opened in Chrome, and this is where 2 js files come to effect. With the help of background.js, it is a service worker that is constantly monitoring if there's any tab created/removed/attached/detached/replaced. If there's any tab-related movement in the background, it will update the information at Chrome's local storage. And popup.js will then take into action, to retrieve the most up to date tab information, so the popup window can show the latest list items.

After all of the tabs are successfully shown, popup.js will allow user to control them. All thanks to the Chrome tab's API, user is granted to have interactions with list items. Such as clicking an item to focus, creating a new group, grouping with other tabs etc. During the interaction, user can view DOM element's direct feedback on whether the changes are as intended. For example, when creating a new group, the tab list will be added to a new ul tag, and has a hr tag seperates it from other list items. This provides user a better understanding of what has changed, and if the Chrome API is reacting correctly to the actions user want to perform.

## Installation to local environment
1. Find a folder where you want to download this project, open Terminal, and run the command for cloning:<br>
``git clone https://github.com/phoenix850508/tab-manager-extension.git``
2. On the Google Chrome browser, navigate to ``chrome://extensions/`` and enable "Developer mode" in the upper right corner.
3. Click on the Load unpacked extension... button.
4. Select the tab-manager-extension folder

If you have completed above steps, you should be able to use Tab Manager Extension 1.0 to manage your Chrome tabs.

## Shoutouts
The extension icon is from [icon8](https://icons8.com/), and the idea is brainstormed after seeing The [Great Marvellous Suspender](https://chromewebstore.google.com/detail/the-marvellous-suspender/noogafoofpebimajpfpamcfhoaifemoa),
which is also solving problems if people having the habit of opening many Chrome tabs.


