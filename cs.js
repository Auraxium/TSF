let favorites = {};
let cred = {};
let streamer_cache = {};
let later = {};
let config = {};

let list = [];
let imgs = []
let interval;
const regex = /{([^{}]*)}$/;
let hl = `onmouseover=this.style.backgroundColor='#3c3f43' onmouseout=this.style.backgroundColor=''`
let center = `display: flex; align-items: center;`
let icon = `${center} padding: 2px;`
let current_name;
let lon = '#9147ff'

var callback = function (mutationsList, observer) {
  for (var mutation of mutationsList) {
    mutation.addedNodes.forEach(function (node) {
      if (node.matches && list.some(e => node.matches(e))) {
        // console.log('mat', node);
      }
    });
  }
};

let icons = {
  later: (e = {}) => {
    let ind = window.location.href.includes('videos') ? window.location.href.split('/').at(-1) : current_name || document.querySelector('h1.tw-title').innerHTML.toLowerCase();
    let name = document.querySelector('h1.tw-title').innerHTML.toLowerCase()
    let ref = document.createElement("div");
    ref.style.display = 'flex';
    ref.style.alignItems = 'center';
    ref.style.padding = '6px'
    ref.style.borderRadius = '6px'
    ref.style.backgroundColor = '#292d33'
    ref.style.margin = '0 4px'
    ref.style.cursor = 'pointer'
    ref.setAttribute('onmouseover', `this.style.backgroundColor='#3c3f43'`)
    ref.setAttribute('onmouseout', `this.style.backgroundColor='#292d33'`)
    ref.setAttribute('title', 'watch later')
    ref.innerHTML = `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="${later[ind] ? lon : '#ffffff'}"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-clock-hour-4"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 12l3 2" /><path d="M12 7v5" /></svg>`
    ref.onclick = function (el) {
      if (this.firstElementChild.getAttribute('stroke') == lon) {
        this.firstElementChild.setAttribute('stroke', '#ffffff')
        let { user_login, vod_id } = later[ind]
        delete later[user_login];
        delete later[vod_id];
        console.log(later[ind], later);
      } else {
        this.firstElementChild.setAttribute('stroke', lon)
        if (window.location.href.includes('videos')) {
          later[ind] = { date: Date.now(), user_login: current_name, vod_id: ind };
          save({ later })
        }

        axi(`https://api.twitch.tv/helix/videos?type=archive&first=1&user_id=${streamer_cache[name]?.id || 123}`).then(res => {
          if (!res || !res.data[0].created_at || Date.now() - new Date(res.data[0].created_at).getTime() > 1000 * 60 * 60 * 24) {
            return console.error('loss:', res);
          }
          later[res.data[0].id] = {
            date: Date.now(),
            vod_id: res.data[0].id,
            user_login: name
          }
          later[name] = {
            date: Date.now(),
            vod_id: res.data[0].id,
            user_login: name
          }
          save({ later });
        });
      }
      save({ later })
    }
    return ref;
  },
  star: (e = {}) => {
    let ref = document.createElement("div");
    ref.style.display = 'flex';
    ref.style.alignItems = 'center';
    ref.style.padding = '6px'
    ref.style.borderRadius = '6px'
    ref.style.backgroundColor = '#292d33'
    ref.style.margin = '0 4px'
    ref.style.cursor = 'pointer'
    ref.setAttribute('onmouseover', `this.style.backgroundColor='#3c3f43'`)
    ref.setAttribute('onmouseout', `this.style.backgroundColor='#292d33'`)
    ref.setAttribute('title', 'favorite')
    ref.innerHTML = favorites[current_name] ? `<svg data-fill='on' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-star">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
  </svg>` : `<svg data-fill='off' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-star">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
  </svg>`
    ref.onclick = function (el) {
      if (this.firstElementChild.getAttribute('data-fill') == 'off') {
        favorites[current_name || document.querySelector('h1.tw-title').innerHTML.toLowerCase()] = 1;
        this.innerHTML = `<svg data-fill='on' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-star">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
      </svg>`
      } else {
        delete favorites[current_name || document.querySelector('h1.tw-title').innerHTML.toLowerCase()];
        this.innerHTML = `<svg data-fill='off' xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-star">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
      </svg>`
      }
      save({ favorites })
      getFavs()
    }
    return ref;
  },
  vods: (e = {}) => {
    let ref = document.createElement("div");
    ref.style.display = 'flex';
    ref.style.alignItems = 'center';
    ref.style.padding = '6px'
    ref.style.borderRadius = '6px'
    ref.style.backgroundColor = '#292d33'
    ref.style.margin = '0 4px'
    ref.style.cursor = 'pointer'
    ref.setAttribute('onmouseover', `this.style.backgroundColor='#3c3f43'`)
    ref.setAttribute('onmouseout', `this.style.backgroundColor='#292d33'`)
    ref.setAttribute('title', 'vods')
    ref.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-movie">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
    <path d="M8 4l0 16" />
    <path d="M16 4l0 16" />
    <path d="M4 8l4 0" />
    <path d="M4 16l4 0" />
    <path d="M4 12l16 0" />
    <path d="M16 8l4 0" />
    <path d="M16 16l4 0" />
  </svg>`
    ref.onclick = el => {
      window.location = `https://www.twitch.tv/${document.querySelector('h1.tw-title').innerHTML.toLowerCase()}/videos?filter=archives&sort=time`;
    }
    return ref;
  },
}

async function axi(s) {
  let ax = await fetch(s, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${cred.access_token}`,
      'Client-Id': 'yumlrqfeiz2kh0x43c1h6gviqn752w'
    }
  }).then(res => res.json());
  return ax;
}

function save(j, debug) {
  chrome.storage.local.set(j);
  if (debug) console.log(j)
}

function vc(s) {
  return s.length < 4 ? s : s.slice(0, -3) + '.' + s.at(-2) + 'K'
}

function showThumbnail(event) {
  let thumb = document.querySelector('.tsf_thumb')
  let title = document.querySelector('.tsf_title')

  this.style.backgroundColor = '#3c3f43';
  let bound = this.getBoundingClientRect();
  thumb.src = 'https://static-cdn.jtvnw.net/previews-ttv/live_user_'+this.dataset.user_login+'.jpg';
  thumb.style.left = bound.right - 12 + 'px';
  // thumb.style.top = event.clientY < screen.height / 2 ? bound.bottom - 20 + 'px' : bound.top - 248 + 120 + 'px';
  title.innerHTML = this.dataset.title;
  // title.style.left = bound.right + 16 + 'px';
  // title.style.top = bound.top+'px';

  thumb.style.display='flex'
  title.style.display = 'flex';
}

function hideThumbnail(event) {
  let thumb = document.querySelector('.tsf_thumb');
  let title = document.querySelector('.tsf_title');

  this.style.backgroundColor = ''; 
  thumb.style.display = 'none'; 
  title.style.display = 'none';
}

function stream(e) {
  if (!e) return;
  // console.log(e);
  let img = streamer_cache[e.user_login].profile_image_url;
  if (!streamer_cache[e.user_login]) {
    img = e.user_login;
    imgs.push({ id: e.user_id, login: e.user_login, cb: img })
  } else img = streamer_cache[e.user_login].profile_image_url;

  return `<a style="all: unset; cursor: default; display: flex; padding: 0px 3px; box-sizing: border-box; align-items: center; justify-content: center; gap: 5px; height: 42px;" 
  onmouseover="${regex.exec(showThumbnail.toString())[1].trim()}" onmouseout="${regex.exec(hideThumbnail.toString())[1].trim()}" data-user_login="${e.user_login}" data-title="${e.title}" href="/${e.user_login}" > 

    <img src=${img} style="width: 16%; padding: 4px; aspect-ratio: 1; border-radius: 99%" />

    <div style="width: 59%; height: 100%; display: flex; flex-direction: column; justify-content: center; overflow-y: hidden; overflow-x: hidden;">
      <p style="font-weight: 600 !important; ">${e.user_name}</p>
      <span title="${e.game_name}" style="white-space: nowrap; font-weight: 400 !important; color: #ADADB8; display: inline-block; line-height: 1;">${e.game_name}</span>
    </div>

    <div style="width: 25%; height: 100%; display: flex; gap: 3px; align-items: start; justify-content: center">
      <div style="display: flex; align-items: center; gap: 3px"  >
        <div class="ScChannelStatusIndicator-sc-bjn067-0 kqWDUJ tw-channel-status-indicator"></div>
        ${vc(e.viewer_count + '')}
      </div>
    </div>
  </a>`
}

// console.log('here close', document.querySelector('.simplebar-content'));

async function getFavs() {
  let lives = await axi(`https://api.twitch.tv/helix/streams/followed?user_id=${cred.id}`);
  console.log(lives);
  let favs = lives.data.filter(e => favorites[e.user_name.toLowerCase()]);
  ``
  let str = `<div id="tsf_head" style="display: flex; align-items: center"> 
      <h2 style="font-size: 14px; padding: 8px">TSF FAVORITES (${favs.length})</h2> 
      <img class="tsf_thumb" src=""  width="440" height="248" style="position: absolute; display: none; z-index: 998; border-radius: 4px;  box-shadow: 5px 5px 10px 2px rgba(0,0,0,.8);"/>

    <div class="tsf_title" style="position: absolute; display: none; max-width: 270px; max-height: 46px; z-index: 999; display: none; border-radius: 4px; background-color: #292d33; padding: 6px; overflow: hidden;   text-overflowellipsis; box-shadow: 5px 5px 10px 2px rgba(0,0,0,.8);"></div>
     </div> 
      ${favs.map(e => stream(e)).join("")}`;

  document.querySelector('.tsf-favs').innerHTML = str;

  if (imgs.length) {
    let res = await axi('https://api.twitch.tv/helix/users?' + imgs.map(e => `id=${e.id}&`).join(""));
    console.log('for imgs: ', res);
    res.data.forEach(e => {
      streamer_cache[e.login] = e;
      document.querySelector(`[src="${e.login}"]`).src = e.profile_image_url;
    });
    save({ streamer_cache })
    imgs = [];
  }

  // document.querySelector('#tsf_head').appendChild(icons.refresh());
}

async function main() {
  let observer = new MutationObserver(callback);
  observer.observe(document.body, { childList: true, subtree: true });

  [streamer_cache, favorites, cred, config, later] = await Promise.all([
    chrome.storage.local.get(['streamer_cache']).then(res => res.streamer_cache || {}),
    chrome.storage.local.get(['favorites']).then(res => res.favorites || {}),
    chrome.storage.local.get(['cred']).then(res => res.cred || {}),
    chrome.storage.local.get(['config']).then(res => res.config || {}),
    chrome.storage.local.get(['later']).then(res => res.later || {}),
  ]);

  if (!cred.access_token) return;
  if (config.no_cs) return;

  document.querySelector('.simplebar-content').insertAdjacentHTML('afterbegin', `<div class="tsf-favs" style="padding: 2px; margin-top: 9px ">
    
  </div>
  `);

    console.log('thub',document.querySelector('.tsf_thumb'));

  getFavs();
  interval = setInterval(getFavs, 1000 * 60 * 4);

  while (!document.querySelector('.Layout-sc-1xcs6mc-0.ktLpvM')) await Delay(1000);

  let la = document.querySelector('.Layout-sc-1xcs6mc-0.lmNILC');
  current_name = document.querySelector('h1.tw-title').innerHTML.toLowerCase()
  la.prepend(icons.vods());
  la.prepend(icons.later());
  la.prepend(icons.star());
}

async function Delay(secs) {
  return new Promise((res) => setTimeout(() => res(""), secs))
}

// Later, you can disconnect the observer when it's no longer needed
// observer.disconnect();

main();

// document.addEventListener('click', e => {
//   if(e.target.dataset.fiie) console.log(e.target.dataset.fiie)
// })