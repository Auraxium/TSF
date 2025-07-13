let access_token;
let port =  'https://misc.auraxium.dev'// "http://localhost:3145";// 
let url = "";
let last_streamer = "";
let recents = {};
let changes = new Set();
let change_filt = new Set(["config", "favorites", "later", 'date']);

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
    changes.add(e.key);
    // console.log(changes)
    cloudSave();
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
  recents = chrome.storage.local
    .get(["recents"])
    .then((res) => res.streamer_cache || recents)
    .catch(console.log);
}

function save(j, debug) {
  chrome.storage.local.set(j);
  if (debug) console.log(j);
}

var cloudSave = debounce(async () => {
  console.log("cloud saving");
  let data = [...changes].filter((e) => change_filt.has(e));
  data.push('cred');
  let is = await Promise.all(data.map((e) => chrome.storage.local.get([e]).catch(() => null)));
  let cred = is.pop().cred;
  if (!is.length) return console.log('nvm no saves');
  let send = is.reduce((acc, e, i) => {
    acc[data[i]] = e[data[i]];
    return acc;
  }, {});
  send.date = Date.now();
  send.device = cred.device;
  changes.clear();
  fetch(port + "/tsfSave", {
    method: "POST",
    body: JSON.stringify({changes: send}),
    headers: {
      Authorization: `Bearer ${cred.jwt}`,
      "Content-Type": "application/json",
    },
  }).then(() => console.log("cloud saved:", send)).catch(console.log);
}, 1000 * 3)

main();

// console.log('am i like restarting?');

// add recent stuff with tab.url
// return chrome.tabs.sendMessage(activeInfo.tabId, { type: "username" }, res => {
//   last_streamer = res;
// });
