let access_token;
let port = 'http://localhost:3145' //'https://misc.auraxium.dev'

function change(tabId, changeInfo, tab) {
  if (changeInfo.url && changeInfo.url.includes("access_token")) {
    console.log(changeInfo.url);
    let ps = new URLSearchParams(changeInfo.url.split('#')[1])
    access_token = ps.get('access_token');
  }
}

if(chrome?.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // console.log(request);
    if(request.authing) chrome.tabs.onUpdated.addListener(change);
    if(request.get && access_token) {
      chrome.tabs.onUpdated.removeListener(change)
      return sendResponse(access_token);
    } 
    if(request.tab) chrome.tabs.update({url: request.tab});
    if(request.cs) {
      fetch(port + '/tsfSave', {
        method: 'POST',
        body: request.cs,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json()).then(res => sendResponse(res))
    }
    return true;
  });
}