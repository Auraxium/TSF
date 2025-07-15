let access_token;
let port =  'https://misc.auraxium.dev'// "http://localhost:3145";// 
let url = "";
let last_streamer = "";
let cred = {};
let recents = {};
let changes = {}
let change_filt = new Set(["config", "favorites", "later", 'date']);
let save_rdy, changes_str;

let debounce = function (cb, delay = 1000, timeout) {
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
};

function change(tabId, changeInfo, tab) {
  if (changeInfo.url && changeInfo.url.includes("access_token")) {
    console.log(changeInfo.url);
    let ps = new URLSearchParams(changeInfo.url.split("#")[1]);
    access_token = ps.get("access_token");
  }
}

let msgs = {
  unload: (e, sendResponse) => {
    console.log("applebobatea");
  },
  change: (e, sendResponse) => {
    // if(e.change.cred) return cred = e.change.cred;
    // if(!change_filt.has(Object.keys(e.change)[0])) return;
    // changes = {...changes, ...e.change}
    // changes_str = JSON.stringify(changes)
    // save_rdy = 1
    // bounceSave()
  },
  slate: (e, sendResponse) => {},
};

if (chrome?.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // console.log(request);
    msgs[request.port] && msgs[request.port](request, sendResponse);
    if (request.authing) chrome.tabs.onUpdated.addListener(change);
    if (request.get && access_token) {
      chrome.tabs.onUpdated.removeListener(change);
      return sendResponse(access_token);
    }
    if (request.tab) chrome.tabs.update({ url: request.tab });
    if (request.cs) {
      fetch(port + "/tsfSave", {
        method: "POST",
        body: request.cs,
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((res) => sendResponse(res));
    }
    if (request.current) return sendResponse(last_streamer);
    if (request.recent) return sendResponse(recents);
    if (request.open) {
      chrome.storage.local.get(["recents"]).then((res) => {
        let recents = res.recents || {};
        recents[request.open.split("?")[0]] = Date.now();
        chrome.storage.local.set({ recents });
      });
      let s = request.open.split("/");
      save({ last_streamer: (s[4] || s[3]).split("?")[0] });
      return;
    }

    return true;
  });
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    if (!tab || !tab.url.includes("https://www.twitch.tv/")) return;
    chrome.storage.local.get(["recents"]).then((res) => {
      let recents = res.recents || {};
      recents[tab.url.split("?")[0]] = Date.now();
      chrome.storage.local.set({ recents });
    });
    let s = tab.url.split("/");
    save({ last_streamer: (s[4] || s[3]).split("?")[0] });
  });
});

function main() {
  chrome.storage.local.get(["recents", "cred"]).then((res) => {
    // console.log('background res:' ,res);
    recents = res.recents || {};
    cred = res.cred || {};
  })
  // changes_plat = {device: cred.device, }
}

function save(j, debug, ) {
  chrome.storage.local.set(j);
  if (debug) console.log(j);
}

main();

// chrome.windows.onRemoved.addListener(hardSave);

// let background = chrome.extension.getBackgroundPage();
// background.addEventListener("unload", () => {
//   cache['baj'] = 'bajbaj'
//   save({cache})
// })

// console.log('am i like restarting?');

// add recent stuff with tab.url
// return chrome.tabs.sendMessage(activeInfo.tabId, { type: "username" }, res => {
//   last_streamer = res;
// });
