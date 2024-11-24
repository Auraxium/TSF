//#region init
let cred = {};
let streamer_cache = {}
let favorites = {};
let config = {}
let later = {}
let cache = {}

let port = 'https://misc.auraxium.dev'//'http://localhost:3145' //
let lives_save = {}
let temp;
let icon_size = 28;
let current_page = '';
let search = ''

let fetches = []

let debounce = function (cb, delay = 1000) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
};

let keys = {}

let icons = {
  star: (e, n) => `<svg title="favorite" data-user_login="${e.user_login}" xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-star star" width="${n || 18}" height="${n || 18}" 
  viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
   <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
   <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
 </svg>`,
  starFilled: (e, n) => `<svg title="remove favorite" data-user_login="${e.user_login}"  xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-star-filled star-filled" width="${n || 18}" height="${n || 18}" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
 <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
 <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" stroke-width="0" fill="currentColor" />
 </svg>`,
  later: (e, alt, id) => `<svg data-user_login="${e.user_login}" ${id && `data-vod_id="${id}"`} data-js='${JSON.stringify(e)}' xmlns="http://www.w3.org/2000/svg" class="later ${alt ? 'icon-on bg-white' : 'icon'}" width="${icon_size}" height="${icon_size}" viewBox="0 0 24 24" stroke-width="1.5" stroke="#${alt ? '000000' : 'ffffff'}" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
  <path d="M12 12l3 2" />
  <path d="M12 7v5" />
</svg>`,
  vods: (e) => `<svg data-user_login="${e.user_login}" xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-movie vods" width="${icon_size}" height="${icon_size}" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
<path stroke="none" d="M0 0h24v24H0z" fill="none"/>
<path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
<path d="M8 4l0 16" />
<path d="M16 4l0 16" />
<path d="M4 8l4 0" />
<path d="M4 16l4 0" />
<path d="M4 12l16 0" />
<path d="M16 8l4 0" />
<path d="M16 16l4 0" />
</svg>`,
  duration: (e) => `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-eye" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
  <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
</svg>`,
  trash: e => `<svg data-vod_id="${e.id}" data-user_login="${e.login}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon trash icon icon-tabler icons-tabler-outline icon-tabler-trash">
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M4 7l16 0" />
  <path d="M10 11l0 6" />
  <path d="M14 11l0 6" />
  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
</svg>`
}

let contexts = {
  'vods': e => {
    let ctrl = e.ctrlKey;
    axi(`https://api.twitch.tv/helix/videos?type=archive&first=1&user_id=${streamer_cache[e.target.dataset.user_login].id}`).then(res => {
      ctrl ? window.open(`https://www.twitch.tv/videos/${res.data[0].id}`) : chrome.runtime.sendMessage({ tab: `https://www.twitch.tv/videos/${res.data[0].id}` })
      window.close();
    })
  },
}

let clickable = {
  fix: e => {
    for (let l in later) {
      if (!+l) delete later[l]
      // later[later[l].vod_id] = later[l];
    }
    save({ later })
  },
  'get-vods': async (event) => {
    // await fetchForElse(Object.keys(favorites).filter(e => !streamer_cache[e]))
    Promise.all(Object.keys(favorites).map(e => axi(`https://api.twitch.tv/helix/videos?type=archive&first=2&user_id=${streamer_cache[e]?.id || 123}`))).then(res => {
      // if(!res?.data?.[0]) return console.log('no data', res);
      let lives = event.target.dataset.live.split(',').reduce((acc, e) => { acc[e] = 1; return acc }, {});
      res = res.map(e => {
        if (!e.data[0]?.user_login) return console.log('no data', res);
        return (!lives[e.data[0].user_login]) ? e.data[0] : null; //e.data[1] || e.data[0];
      }).filter(e => e);
      // console.log(res);

      let now = Date.now()
      event.target.outerHTML = `<div style="font-size: 18px; border-bottom: 1px solid">Vods of Favorites (${res.length})</div>` + res.sort((a, b) => (new Date(b.created_at).getTime() + durToSecs(b.duration)) - (new Date(a.created_at).getTime() + durToSecs(a.duration))).map(el => vod(el, now, 0, !search.length || el.user_login.includes(search))).join("");
    })
  },
  'get-offline': async (e) => {
    let els = []
    let offs = await axi(`https://api.twitch.tv/helix/channels/followed?first=100&user_id=${cred.id}`)
    els.push(...offs.data)
    while (offs.pagination?.cursor) {
      offs = await axi(`https://api.twitch.tv/helix/channels/followed?first=100&user_id=${cred.id}&after=${offs.pagination.cursor}`)
      els.push(...offs.data)
    }

    let str = `<div style="font-size: 18px; border-bottom: 1px solid">Offline (${els.length})</div>`;
    str += els.map(e => channel(e, !search.length || e.broadcaster_login.includes(search))).join(""); //.filter(e => !lives_save[e.user_login])

    // console.log(els);
    e.target.outerHTML = str;

    // fetchForCache()
  },
  'get-more': e => {
    window.open(`https://www.twitch.tv/${e.target.dataset.user_name}/videos?filter=archives&sort=time`)
  },
  stream: (e) => {
    if (e.ctrlKey) return window.open(`https://twitch.tv/${e.target.dataset.user_login}`)
    chrome.runtime.sendMessage({ tab: `https://twitch.tv/${e.target.dataset.user_login}` })
    window.close();
  },
  vod: e => {
    if (e.ctrlKey) return window.open(`https://www.twitch.tv/videos/${e.target.dataset.vod_id}`)
    chrome.runtime.sendMessage({ tab: `https://www.twitch.tv/videos/${e.target.dataset.vod_id}` })
    window.close();
  },
  later: (e) => {
    let date = Date.now() + 1000 * 60 * 60 * 10;
    let tag = e.target.dataset.vod_id || e.target.dataset.user_login;
    if (e.target.classList.contains('bg-white')) {
      let { user_login, vod_id } = later[tag];
      delete later[vod_id]
      delete later[user_login];
      save({ later });
      return e.target.outerHTML = icons.later(e, 0, e.target.dataset.vod_id);
    }

    e.target.outerHTML = icons.later(e, 1, e.target.dataset.vod_id);
    if (e.target.dataset.vod_id) {
      later[tag] = { vod_id: tag, date };
      return save({ later }, 0);
    }

    later[e.target.dataset.user_login] = { date };
    axi(`https://api.twitch.tv/helix/videos?type=archive&first=1&user_id=${streamer_cache[e.target.dataset.user_login]?.id || 123}`).then(res => {
      if (!res || !res.data[0].created_at || Date.now() - new Date(res.data[0].created_at).getTime() > 1000 * 60 * 60 * 24) {
        console.log('loss:', res);
        return delete later[tag];
      }
      later[res.data[0].id] = {
        date,
        vod_id: res.data[0].id,
        user_login: e.target.dataset.user_login
      }
      later[e.target.dataset.user_login] = {
        date,
        vod_id: res.data[0].id,
        user_login: e.target.dataset.user_login
      }
      save({ later }, 0);
    });
  },
  star: (e) => {
    favorites[e.target.dataset.user_login.toLowerCase()] = 1;
    chrome.storage.local.set({ favorites: favorites })
    e.target.outerHTML = icons.starFilled({ user_login: e.target.dataset.user_login }, e.target.getAttribute('width'))
  },
  'star-filled': e => {
    delete favorites[e.target.dataset.user_login.toLowerCase()];
    chrome.storage.local.set({ favorites: favorites })
    console.log(favorites);
    e.target.outerHTML = icons.star({ user_login: e.target.dataset.user_login }, e.target.getAttribute('width'))
  },
  trash: e => {
    console.log(e.target.dataset.vod_id, later[e.target.dataset.vod_id], later);
    let { vod_id, user_login } = e.target.dataset;
    delete later[vod_id];
    if (later[user_login]?.vod_id == vod_id) delete later[user_login]
    save({ later }, 1);
    e.target.parentElement.parentElement.parentElement.parentElement.remove()
  },
  'config-but': e => nav('config'),
  'later-but': e => nav('later'),
  'main-but': e => nav('main'),
  'vods': (e) => {
    nav('vods', e.target.dataset.user_login);
  },
  'x-but': e => clearSearch(),
  logout: e => {
    delete cred.access_token;
    save({ cred });
    document.getElementById('out').style.display = 'flex';
    document.getElementById('in').style.display = 'none';
  },
  reset: e => {
    cred = {};
    streamer_cache = {}
    favorites = {};
    config = {}
    later = {}
    save({ cred, streamer_cache, favorites, config, later })
    document.getElementById('out').style.display = 'flex';
    document.getElementById('in').style.display = 'none';
  },
  cbut: e => {
    let { type } = e.target.dataset
    if (type == 'fs') {
      let data = JSON.stringify({ favorites, config, later });
      let pom = document.createElement('a');
      pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
      pom.setAttribute('download', 'TSF' + new Date().toLocaleString() + '.json')
      if (document.createEvent) {
        var event = document.createEvent("MouseEvents");
        event.initEvent("click", true, true);
        pom.dispatchEvent(event);
      } else {
        pom.click();
      }
      pom.remove()
    }

    if (type == 'fl') {
      let pom = document.createElement('input');
      function change(e) {
        let file = e.target.files[0];
        let reader = new FileReader();

        reader.onload = e => {
          const contents = e.target.result;
          let data = JSON.parse(contents);
          save(data)
          // streamer_cache = data.streamer_cache;
          favorites = data.favorites;
          config = data.config;
          later = data.later;
          // if (cred.login != data.cred.login) cred = data.cred;

          nav('main')
          pom.remove()
        }
        reader.onerror = (e) => alert(e.target.error.name)
        reader.readAsText(file);
      }
      pom.setAttribute('type', 'file')
      pom.addEventListener('change', change)
      pom.click()
    }

    if (type == 'cs') {
      e.target.outerHTML = '<div>saved</div>';
      let data = { favorites, config, later };
      fetch(port + '/tsfSave', {
        method: 'POST',
        body: JSON.stringify({ login: cred.login, data: data }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    if (type == 'cl') {
      fetch(port + '/tsfLoad', {
        method: 'POST',
        body: JSON.stringify({ login: cred.login }),
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json()).then(res => {
        if (!res.data.data) return e.target.outerHTML = 'No Data Found'
        let data = JSON.parse(res.data.data);
        console.log('load data:', data);

        save({ favorites: data.favorites, later: data.later })
        // streamer_cache = data.streamer_cache;
        favorites = data.favorites;
        config = data.config;
        later = data.later;
        // if (cred?.login != data.cred.login) cred = data.cred;

        nav('main')
      })
    }
  },
  debug: e => console.log('debug:', { cred, streamer_cache, favorites, config, later, cache, fetches })
}

let page_cb = {
  main: async () => {
    let [lives, current] = await Promise.all([axi(`https://api.twitch.tv/helix/streams/followed?user_id=${cred.id}`), runtimeFetch({ current: 1 })]);
    console.log('lives', lives, cred);
    if (!lives?.data?.length) {
      console.log('fetch err: ', lives, current);
      delete cache[`https://api.twitch.tv/helix/streams/followed?user_id=${cred.id}`]
      return $('[page="main"]').innerHTML = '<div class="center" style="font-size: 24px; margin-top: 128px">Twitch API failed try again later</div>'
    }
    lives_save = lives.data.reduce((acc, e) => { acc[e.user_login.toLowerCase()] = 1; return acc }, {})

    let favs = lives.data.filter(e => favorites[e.user_name.toLowerCase()]);
    let str = "";
    console.log(current);

    if (current) {
      if (current.includes('videos')) {
        let { data } = await axi(`https://api.twitch.tv/helix/videos?type=archive&first=1&id=${current.split('/').pop()}`);
        if (data?.[0])
          str += `<div class="label" style="font-size: 18px; border-bottom: 1px solid">Currently watching </div>${vod(data[0])}`;
      }
      else if (lives.data.find(e => current.split('/').pop() == e.user_login)) str += `<div class="label" style="font-size: 18px; border-bottom: 1px solid">Currently watching </div>${stream(lives.data.find(e => current.split('/').pop() == e.user_login))}`;
    }
    str += `<div class="label" style="font-size: 18px; border-bottom: 1px solid">Favorites (${favs.length})</div>${favs.map(e => stream(e)).join("")}`;
    if (Object.keys(favorites).length)
      str += `<div class="get-vods button bg-dark hl cursor" data-live="${lives.data.map(e => e.user_login).join()}">Get Vods</div>`;
    str += `<div class="label" style="font-size: 18px; border-bottom: 1px solid">Streams (${lives.data.length})</div> ${lives.data.map(e => stream(e)).join("")}`;
    str += `<div class="button bg-dark hl cursor get-offline">Show All</div>`

    document.querySelector('.main').innerHTML = str;
    // fetchForCache()
  },
  later: async () => {
    console.log('later', { ...later });
    let now = Date.now();
    Object.entries(later).forEach(e => now > e[1].date + 1000 * 60 * 60 * 24 * 61 ? delete later[e[0]] : null)
    let vods = await axi(`https://api.twitch.tv/helix/videos?type=archive&first=1${Object.values(later).map(e => '&id=' + (+e.vod_id || 123)).join("")}`);
    let str = vods.data.map(e => vod(e, now)).join("")
    // console.log(Object.values(later).length);
    document.querySelector('[page="later"]').innerHTML = str;
  },
  vods: async (arg) => {
    // clearSearch()
    document.querySelector('[page="vods"]').innerHTML = '';
    let str = `<div style="font-size: 24px"></div>`
    let vods = await axi(`https://api.twitch.tv/helix/videos?type=archive&first=10&user_id=${streamer_cache[arg].id}`)
    str += vods.data.map(e => vod(e)).join("");
    str += `<div class="get-more button bg-dark hl cursor" data-user_name="${arg}">More</div>`
    document.querySelector('[page="vods"]').innerHTML = str;
  },
  config: async () => {
    let str = `
      <div class="flex gap space-evenly">
        <div class="button hl cbut" data-type="cs" style="font-size: 14px; width: 150px; height: 45px">Cloud Save</div>
        <div class="button hl cbut" data-type="cl" style="font-size: 14px; width: 150px; height: 45px">Cloud Load</div>
      </div>
      <div class="flex gap space-evenly">
        <div class="button hl cbut" data-type="fs" style="font-size: 14px; width: 150px; height: 45px">File Save</div>
        <div class="button hl cbut" data-type="fl" style="font-size: 14px; width: 150px; height: 45px">File Load</div>
      </div>
    `;
    str += `<div class="flex space-evenly">
      <div style="height: 40px" class="logout button cursor bg-purple">Logout</div>
      <div style="height: 40px" class="reset button cursor bg-red">Reset Profile</div>
    </div>
    
    <div class="button hl debug">Debug</div>
    `

    document.querySelector('[page="config"]').innerHTML = str;
  },

}

//#endregion


//#region UI
function stream(e) {
  if (!e) return;
  let later_on;

  if (!streamer_cache[e.user_login]) {
    let uid = Math.random().toString(27).slice(5);
    fetches.push({ type: 'stream', e, uid, login: e.user_login });
    fetchForCache()
    return `<div a${uid} ></div>`
  }

  let img = streamer_cache[e.user_login].profile_image_url;

  later[e.user_login] && Date.now() < later[e.user_login].date ? later_on = 1 : delete later[e.user_login];

  return `<div title="${escapeHTML(e.title)}" class="stream hl" data-user_login="${e.user_login}">

  <div class="img-containter"  style="width: 25%; ">
    <img class="thumbnail" src="https://static-cdn.jtvnw.net/previews-ttv/live_user_${e.user_login}.jpg" alt="" class="" />
  </div>

    <div class="info " style="width: 60%;  ">
      <div class="truncate text-center" style="font-size: 18px; height:40% ">
       <img class="profile_pic" src="${img}" />
         ${favorites[e.user_name.toLowerCase()] ? icons.starFilled(e) : icons.star(e)}
         ${e.user_name}
      </div>
      <div class=" text-center" style="font-size: 16px; height:30%"><div class="truncate">${e.title}</div></div>
      <div class="truncate text-center " style="font-size: 12px; height:30%">${e.game_name}</div>
    </div>

    <div class="misc" style="width: 15%; ">
      <div class="flex" style="justify-content: end; ">
        <div class="reddot"></div>
        <div class="" style="font-size: 14px">${e.viewer_count}</div>
      </div>

     <div class="flex buts" style="flex-gap: 3px">
        <div title="vods">
         ${icons.vods(e)}
        </div>

        <div title="watch later">
          ${icons.later(e, later_on)}
        </div>
       </div>
    </div>
  </div>`
}

function vod(e, now = Date.now(), src, show = 1, vods = 1) {
  if (!e) return;
  if (!streamer_cache[e.user_login]) {
    let uid = Math.random().toString(27).slice(5);
    fetches.push({ type: 'vod', e, uid, login: e.user_login });
    fetchForCache()
    return `<div a${uid} ></div>`
  }

  return `<div title="${escapeHTML(e.title)}" class="vod hl" data-vod_id="${e.id}" data-user_login="${e.user_login}" style="display: ${show ? 'flex' : 'none'};">
  
    <div class="img-containter"  style="width: 25%; ">
      <img class="thumbnail" src="${src || e.thumbnail_url.slice(0, -22)}360x200.${e.thumbnail_url.split('.').at(-1)}" alt="" class="" />
    </div>
  
      <div class="info " style="width: 60%;  ">
        <div class="truncate text-center" style="font-size: 18px; height:40% ">
         <img class="profile_pic" src="${streamer_cache[e.user_login]?.profile_image_url}" />
         ${favorites[e.user_name.toLowerCase()] ? icons.starFilled(e) : icons.star(e)}
         ${e.user_name}
        </div>
        <div class=" text-center" style="font-size: 16px; height:30%"><div class="truncate">${e.title}</div></div>
        <div class="truncate text-center " style="font-size: 12px; height:30%">${e.duration}</div>
      </div>
  
      <div class="misc" style="width: 15%; ">
        <div class="flex" style="justify-content: end; ">
          ${icons.duration(e)}
          <div class="" style="font-size: 12px">${timeAgo(now - durToSecs(e.duration) - new Date(e.created_at).getTime())}</div>
        </div>
  
       <div class="flex" style="flex-gap: 3px">
          <div title="vods">
            ${icons.vods(e)}
          </div>
  
          <div title="watch later">
            ${current_page == 'later' ? icons.trash({ id: e.id, login: e.user_login }) : icons.later(e, later[e.id], e.id)}
          </div>
         </div>
      </div>
    </div>`
}

function channel(e, show) {
  if (!e) return console.log(e);

  let img;
  if (!streamer_cache[e.broadcaster_login]) {
    let uid = Math.random().toString(27).slice(5);
    fetches.push({ type: 'channel', e, uid, login: e.broadcaster_login });
    fetchForCache()
    return `<div a${uid} ></div>`
  }

  img = streamer_cache[e.broadcaster_login].profile_image_url;

  let uj = { user_login: e.broadcaster_login };
  // console.log(show);

  return `
    <div class="channel" data-user_login="${e.broadcaster_name}" style="display: ${show ? 'flex' : 'none'}">
      <img src="${img}" class="channelImg" />
      ${favorites[e.broadcaster_login] ? icons.starFilled(uj, 24) : icons.star(uj, 24)}
      ${e.broadcaster_name}
      <div style="margin-left: auto;">${icons.vods(uj)}</div>
    </div>
  `
}
//#endregion

//#region FUNCTIONS
function save(j, debug) {
  chrome.storage.local.set(j);
  if (debug) console.log(j)
}

async function test() {
  // axi("https://api.twitch.tv/helix/streams?type=all&user_id=517475551").then(console.log)
  // axi("https://api.twitch.tv/helix/videos?type=archive&first=1&user_id=517475551").then(console.log)
  // axi("https://api.twitch.tv/helix/streams?type=all&user_id=517475551").then(console.log)
  // axi("https://api.twitch.tv/helix/streams?type=all&user_id=517475551").then(console.log)
  // axi("https://api.twitch.tv/helix/streams?type=all&user_id=517475551").then(console.log)
}

function timeAgo(s) {
  if (!s) return;
  s = ~~(s / 1000);
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${~~(s / 60)}m ago`
  if (s < 86400) return `${~~(s / 3600)}h ago`
  return `${~~(s / 86400)}d ago`
}

function durToSecs(s) {
  if (!s) return;
  let t = {
    s: 1, m: 60, h: 3600
  }
  let temp = '';
  let acc = 0;
  for (let e of s) {
    if (+e > -1) { temp += e; continue }
    acc += +temp * t[e]
    temp = '';
  }
  return (acc * 1000) || 0;
}

function nav(s, arg) {
  // clearSearch()
  [...document.querySelectorAll('[page]')].forEach(e => e.style.display = 'none');
  document.querySelector(`[page="${s}"]`).style.display = 'flex';
  page_cb[s] && page_cb[s](arg);
  current_page = s
}

async function axi(s) {
  if (cache[s]) {
    if (cache[s].expire < Date.now()) delete cache[s];
    else return cache[s].res;
  }
  let ax = await fetch(s, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${cred.access_token}`,
      'Client-Id': '0helgn8mxggk3ffv53sxgqrmkdojb3'
    }
  }).then(res => res.json());
  cache[s] = { expire: Date.now() + 60000, res: ax }
  save({ cache })
  return ax;
}

function $(s) {
  let a = [...document.querySelectorAll(s)];
  return !a.length ? null : a.length == 1 ? a[0] : a
}

async function auth() {
  chrome.runtime.sendMessage({ authing: 1 }) //channel%3Amanage%3Apolls+channel%3Aread%3Apolls
  let popup = window.open(`https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=0helgn8mxggk3ffv53sxgqrmkdojb3&redirect_uri=${port}/twotch&scope=user%3Aread%3Afollows&state=${window.location.href}`, 'popup', 'popup=true');
  const checkPopup = setInterval(() => {
    chrome.runtime.sendMessage({ get: 1 }, res => {
      if (!res) return;
      popup.close();
      cred.access_token = res;
    })
    if (!popup || !popup.closed) return;
    clearInterval(checkPopup);
    axi('https://api.twitch.tv/helix/users').then(res => {
      console.log(res);
      cred = { ...cred, ...res.data[0] };
      console.log(cred);
      save({ cred });
      // fetch(port + '/tsfLoad', {
      //   method: 'POST',
      //   body: JSON.stringify({ login: cred.login }),
      //   headers: { 'Content-Type': 'application/json' }
      // }).then(res => res.json()).then(res => {
      //   if(!res.data.data) return;
      //   let data = JSON.parse(res.data.data);
      //   save(data)
      //     streamer_cache = data.streamer_cache;
      //     favorites = data.favorites;
      //     config = data.config;
      //     later = data.later;
      //     if (cred.login != data.cred.login) cred = data.cred;

      //     nav('main')
      // })
      document.getElementById('in').style.display = 'flex';
      document.getElementById('out').style.display = 'none';
      nav('main');
    })
  }, 400);
}

function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

var fetchForCache = debounce(async () => {
  if (fetches.length) {
    if (fetches.length > 99) fetches.length = 99;
    let res = await axi('https://api.twitch.tv/helix/users?' + fetches.map(e => `login=${e.login}&`).join("")).catch(console.log);
    console.log('getty: ', res);
    res.data.forEach(e => streamer_cache[e.login] = e);
    save({ streamer_cache })
    fetches.forEach(el => document.querySelector(`[a${el.uid}]`).outerHTML = el.type == 'stream' ? stream(el.e) : el.type == 'vod' ? vod(el.e) : channel(el.e, 1));
    fetches = [];
  }
}, 750);

function logout() {
  chrome.storage.local.set({ streamer_cache: {}, cred: {} })
}

async function runtimeFetch(json) {
  return new Promise((y, n) => chrome.runtime.sendMessage(json, res => y(res)))
}

async function main() {
  [streamer_cache, favorites, cred, config, later, cache] = await Promise.all([
    chrome.storage.local.get(['streamer_cache']).then(res => res.streamer_cache || {}),
    chrome.storage.local.get(['favorites']).then(res => res.favorites || {}),
    chrome.storage.local.get(['cred']).then(res => res.cred || {}),
    chrome.storage.local.get(['config']).then(res => res.config || {}),
    chrome.storage.local.get(['later']).then(res => res.later || {}),
    chrome.storage.local.get(['cache']).then(res => res.cache || {}),
  ]);

  let now = Date.now()
  if (now > (cache.expire || 0)) cache = { expire: Date.now() + 1000 * 60 * 60 * 24 * 3 }

  // console.log(cred); 
  if (!cred || !cred.access_token) {
    document.getElementById('out').style.display = 'flex';
    document.getElementById('in').style.display = 'none';
  } else {
    document.getElementById('in').style.display = 'flex';
    document.getElementById('out').style.display = 'none';
    nav('main');
  }
  test()
}

main();

//#endregion

//#region EVENTS
document.querySelector('.auth').addEventListener('click', e => {
  auth()
})

document.addEventListener('click', function (e) {
  // console.log(e.target);
  if (e.target?.classList) [...e.target.classList].forEach(el => clickable[el] && clickable[el](e));
})

document.addEventListener('contextmenu', function (e) {
  // console.log(e.target);
  if (e.target?.classList) [...e.target.classList].forEach(el => {
    if (!contexts[el]) return;
    console.log(el);
    e.preventDefault();
    e.stopPropagation();
    contexts[el](e);
  });
})

document.addEventListener('mouseover', e => {
  if (e.target?.classList?.contains('hl')) {
    e.target.style.backgroundColor = 'rgb(100, 100, 100)'
  }
})

document.addEventListener('mouseout', e => {
  if (e.target?.classList?.contains('hl')) {
    e.target.style.backgroundColor = 'rgb(0, 0, 0)'
  }
})

function clearSearch() {
  search = '';
  document.querySelector('#search').value = "";
  [...document.querySelectorAll('[data-user_login]')].forEach(e => e.style.display = 'flex')
}

let bounceSearch = debounce(s => {
  s = s.toLowerCase();
  [...document.querySelectorAll(`div[data-user_login]`)].forEach((el) => {
    // console.log(s, el.getAttribute('data-user_login'), el.getAttribute('data-user_login').toLowerCase().includes(s));
    if (!el.style) return;
    el.style.display = el.getAttribute('data-user_login').toLowerCase().includes(s) ? 'flex' : 'none';
  })
}, 400);

document.querySelector('#search').addEventListener('keyup', (e) => {
  search = e.target.value;
  bounceSearch(e.target.value);
  // search(e.target.value)
  // console.log('???????????????')
})

document.addEventListener('keydown', e => {
  keys[e.key] = 1
})

document.addEventListener('keyup', e => {
  keys[e.key] = 0
})

// let sb = document.querySelector('.scroll-bar')

// function move(e) {
//   // console.log(e.y);
//   sb.style.top = e.y + 'px';
// }

// function up(e) {
//   document.removeEventListener('mousemove', move)
//   document.removeEventListener('mouseup', up)
// }

// sb.addEventListener('mousedown', e => {
//   console.log(e);
//   document.addEventListener('mouseup', up)
//   document.addEventListener('mousemove', move)
// })

//#endregion

/*notes:
cant use get stream() for vods
*/

/* done
  5/8 offine tab, saving/loading file and server, 
*/