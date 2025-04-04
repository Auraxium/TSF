let access_token;
let port = 'http://localhost:3145' //'https://misc.auraxium.dev'
let url = "";
let last_streamer = "";
let recents = {};

function change(tabId, changeInfo, tab) {
  if (changeInfo.url && changeInfo.url.includes("access_token")) {
    console.log(changeInfo.url);
    let ps = new URLSearchParams(changeInfo.url.split('#')[1])
    access_token = ps.get('access_token');
  }
}

if (chrome?.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // console.log(request);
    if (request.authing) chrome.tabs.onUpdated.addListener(change);
    if (request.get && access_token) {
      chrome.tabs.onUpdated.removeListener(change)
      return sendResponse(access_token);
    }
    if (request.tab) chrome.tabs.update({ url: request.tab });
    if (request.cs) {
      fetch(port + '/tsfSave', {
        method: 'POST',
        body: request.cs,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json()).then(res => sendResponse(res))
    }
    if (request.current) return sendResponse(last_streamer);
    if (request.recent) return sendResponse(recents)
    if (request.open) {
      chrome.storage.local.get(['recents']).then(res => {
        let recents = res.recents || {};
        recents[request.open.split('?')[0]] = Date.now()
        chrome.storage.local.set({ recents });
      })
      let s = request.open.split('/');
      save({ last_streamer: (s[4] || s[3]).split('?')[0] })
      return;
    }

    return true;
  });
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    if (!tab || !tab.url.includes("https://www.twitch.tv/")) return;
    chrome.storage.local.get(['recents']).then(res => {
      let recents = res.recents || {};
      recents[tab.url.split('?')[0]] = Date.now()
      chrome.storage.local.set({ recents });
    })
    let s = tab.url.split('/');
    save({ last_streamer: (s[4] || s[3]).split('?')[0] })
  });
});

function main() {
  recents = chrome.storage.local.get(['recents']).then(res => res.streamer_cache || recents).catch(console.log)
}

function save(j, debug) {
  chrome.storage.local.set(j);
  if (debug) console.log(j)
}

main()

// console.log('am i like restarting?');

// add recent stuff with tab.url
// return chrome.tabs.sendMessage(activeInfo.tabId, { type: "username" }, res => {
//   last_streamer = res;
// });