//#region init
var cred = {};
var streamer_cache = {};
var favorites = {};
var config = {cs: 1};
var later = {};
var channels = [];
var cache = {};
var $unset = new Set();
let save_map = {
  streamer_cache,
  favorites,
  cred,
  config,
  later,
  channels,
  cache,
};

// let port = "http://localhost:3145"; 
let port = "https://misc.auraxium.dev"; 
let lives_save = {};
let temp;
let icon_size = 28;
let current_page = "";
let search = "";

let fetches = [];
let lives = {};
let favs = [];
let gnow = Date.now();
let changes = {};
let change_filt = new Set(["config", "favorites", "later"]);
let save_rdy, changes_str;

let vod_ct = 60 * 24 * 60;
let lives_ct = 1;

let debounce = function (cb, delay = 1000, timeout) {
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
};

let keys = {};

let icons = {
  star: (e, n) => `<svg title="favorite" data-user_login="${
    e.user_login
  }" xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-star star" width="${
    n || 18
  }" height="${n || 18}" 
  viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
   <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
   <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
 </svg>`,
  starFilled: (e, n) => `<svg title="remove favorite" data-user_login="${
    e.user_login
  }"  xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-star-filled star-filled" width="${
    n || 18
  }" height="${
    n || 18
  }" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
 <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
 <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" stroke-width="0" fill="currentColor" />
 </svg>`,
  later: (e, on, vod_id) => `<svg data-user_login="${
    e.user_login
  }" data-created_at="${e.created_at || e.started_at}" data-duration="${
    e.duration
  }" data-vod_id="${vod_id}" xmlns="http://www.w3.org/2000/svg" class="later ${
    on ? "icon-on bg-white" : "icon"
  }" width="${icon_size}" height="${icon_size}" viewBox="0 0 24 24" stroke-width="1.5" stroke="#${
    on ? "000000" : "ffffff"
  }" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
  <path d="M12 12l3 2" />
  <path d="M12 7v5" />
</svg>`,
  vods: (
    e
  ) => `<svg data-user_login="${e.user_login}" data-vod_id="${e.id}" xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-movie vods-but" width="${icon_size}" height="${icon_size}" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
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
  duration: (
    e
  ) => `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-eye" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#ffffff" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
  <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
</svg>`,
  trash: (
    e
  ) => `<svg data-vod_id="${e.id}" data-user_login="${e.login}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon trash icon icon-tabler icons-tabler-outline icon-tabler-trash">
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M4 7l16 0" />
  <path d="M10 11l0 6" />
  <path d="M14 11l0 6" />
  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
</svg>`,
  dur: (e) =>
    `<svg style="position:relative; top: 3px" xmlns="http://www.w3.org/2000/svg"  width="14"  height="14"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-stopwatch"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 13a7 7 0 1 0 14 0a7 7 0 0 0 -14 0z" /><path d="M14.5 10.5l-2.5 2.5" /><path d="M17 8l1 -1" /><path d="M14 3h-4" /></svg>`,
};

let contexts = {
  "vods-but": (e) => {
    let ctrl = e.ctrlKey;
    axi(
      `https://api.twitch.tv/helix/videos?type=archive&user_id=${
        streamer_cache[e.target.dataset.user_login].id
      }`
    ).then((res) => {
      ctrl
        ? window.open(`https://www.twitch.tv/videos/${res.data[0].id}`)
        : chrome.runtime.sendMessage({
            tab: `https://www.twitch.tv/videos/${res.data[0].id}`,
          });
      window.close();
    });
  },
};

function OpenLink(url, tab, incog) {
  if (!url) return null;
  // if (incog) return chrome.windows.create({ url, incognito: 1 })
  if (tab) return window.open(url);
  return chrome.runtime.sendMessage({ tab: url });
}

let midable = {
  stream: (e) =>
    OpenLink(`https://twitch.tv/${e.target.dataset.user_login}`, 1),
  vod: (e) =>
    OpenLink(`https://www.twitch.tv/videos/${e.target.dataset.vod_id}`, 1, 1),
  "vods-but": (e) =>
    axi(
      `https://api.twitch.tv/helix/videos?type=archive&user_id=${
        streamer_cache[e.target.dataset.user_login].id
      }`
    ).then((res) => {
      OpenLink(`https://www.twitch.tv/videos/${e.target.dataset.vod_id}`, 1, 1);
      window.close();
    }),
};

let clickable = {
  fix: (e) => {
    for (let l in later) {
      if (!+l) delete later[l];
      // later[later[l].vod_id] = later[l];
    }
    save({ later });
  },
  "get-vods": async (event) => {
    // await fetchForElse(Object.keys(favorites).filter(e => !streamer_cache[e])
    let res = await Promise.all(
      Object.keys(favorites)
        .filter((e) => !lives_save[e])
        .map((e) =>
          axi(
            `https://api.twitch.tv/helix/videos?type=archive&first=1&user_id=${
              streamer_cache[e]?.id || 123
            }`,
            vod_ct
          )
        )
    );
    if (!res?.length) return console.log("no res", res);

    // console.log('res:', res);

    res = res
      .map((e) => e?.data?.[0] || null)
      .filter((e) => e)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() +
          durToSecs(b.duration) -
          (new Date(a.created_at).getTime() + durToSecs(a.duration))
      );
    let str = res.map((e) => vod(e)).join("");

    event.target.outerHTML =
      `<div style="font-size: 18px; border-bottom: 1px solid">Vods of Favorites (${res.length})</div>` +
      str;
  },
  "get-offline": async (e) => {
    let els = [];
    let offs = await axi(
      `https://api.twitch.tv/helix/channels/followed?first=100&user_id=${cred.id}`
    );
    els.push(...offs.data);
    while (offs.pagination?.cursor) {
      offs = await axi(
        `https://api.twitch.tv/helix/channels/followed?first=100&user_id=${cred.id}&after=${offs.pagination.cursor}`
      );
      els.push(...offs.data);
    }

    let str = `<div style="font-size: 18px; border-bottom: 1px solid">Offline (${els.length})</div>`;
    str += els
      .map((e) =>
        channel(e, !search.length || e.broadcaster_login.includes(search))
      )
      .join(""); //.filter(e => !lives_save[e.user_login])

    // console.log(els);
    e.target.outerHTML = str;

    // fetchForCache()
  },
  "get-more": (e) => {
    window.open(
      `https://www.twitch.tv/${e.target.dataset.user_name}/videos?filter=archives&sort=time`
    );
  },
  stream: (e) => {
    if (e.ctrlKey)
      return window.open(`https://twitch.tv/${e.target.dataset.user_login}`);
    chrome.runtime.sendMessage({
      tab: `https://twitch.tv/${e.target.dataset.user_login}`,
    });
    window.close();
  },
  vod: (e) => {
    if (e.ctrlKey)
      return window.open(
        `https://www.twitch.tv/videos/${e.target.dataset.vod_id}`
      );
    chrome.runtime.sendMessage({
      tab: `https://www.twitch.tv/videos/${e.target.dataset.vod_id}`,
    });
    window.close();
  },
  later: (e) => {
    if (e.target) e = e.target;
    let { user_login, vod_id, created_at, duration } = e.dataset;
    vod_id = +vod_id;
    let now = Date.now();

    if (e.classList.contains("bg-white")) {
      //is on
      e.outerHTML = icons.later(
        { user_login, created_at, duration, id: vod_id },
        0,
        vod_id
      );
      if (!vod_id) vod_id = later[user_login].vod_id;

      if (later[vod_id].user_login == user_login) {
        delete later[vod_id];
        delete later[user_login];
        save({
          [`later.${vod_id}`]: "$",
          [`later.${user_login}`]: "$",
        });
      } else {
        delete later[vod_id];
        save({ [`later.${vod_id}`]: "$" });
      }

      return;
    }

    e.outerHTML = icons.later(
      { user_login, created_at, duration, id: vod_id },
      1,
      vod_id
    );
    //is a vod
    if (vod_id) {
      later[vod_id] = {
        date: new Date(created_at).getTime() + durToSecs(duration),
        user_login,
        vod_id,
      };
      save({ [`later.${vod_id}`]: later[vod_id] });
      return; //(e.outerHTML = icons.later({ user_login, created_at, duration, id: vod_id }, 1, vod_id));
    }

    axi(
      `https://api.twitch.tv/helix/videos?type=archive&first=1&user_id=${
        streamer_cache[user_login]?.id || 123
      }`,
      1
    ).then((res) => {
      console.log("later res:", res);
      let date = new Date(res.data[0].created_at).getTime();
      if (
        !res ||
        !res.data[0]?.created_at ||
        Math.abs(date - new Date(res.data[0].created_at).getTime()) >
          1000 * 60 * 60
      ) {
        console.log("loss:", { now, ...res });
        return;
      }
      vod_id = res.data[0].id;
      let vod = {
        date,
        vod_id,
        user_login,
      };

      later[vod_id] = vod;
      later[user_login] = vod;
      save({
        [`later.${user_login}`]: vod,
        [`later.${vod_id}`]: vod,
      });
    });
  },
  star: (e) => {
    favorites[e.target.dataset.user_login.toLowerCase()] = 1;
    save({ [`favorites.${e.target.dataset.user_login.toLowerCase()}`]: 1 });
    // chrome.storage.local.set({ favorites: favorites });
    [
      ...document.querySelectorAll(
        `.star[data-user_login="${e.target.dataset.user_login}"]`
      ),
    ].forEach(
      (el) =>
        (el.outerHTML = icons.starFilled(
          { user_login: e.target.dataset.user_login },
          e.target.getAttribute("width")
        ))
    );
    // e.target.outerHTML = icons.starFilled({ user_login: e.target.dataset.user_login }, e.target.getAttribute('width'));
    let favsE = document.querySelector(".main_favs");
    let chan = document.querySelector(
      `.stream[data-user_login=${e.target.dataset.user_login.toLowerCase()}`
    );
    if (!favs || !chan) return;
    favsE.innerHTML = lives.data
      .filter((e) => favorites[e.user_name.toLowerCase()])
      .map((e) => stream(e))
      .join("");
  },
  "star-filled": (e) => {
    delete favorites[e.target.dataset.user_login.toLowerCase()];
    save({ [`favorites.${e.target.dataset.user_login.toLowerCase()}`]: "$" });
    // chrome.storage.local.set({ favorites: favorites });
    [
      ...document.querySelectorAll(
        `.star-filled[data-user_login="${e.target.dataset.user_login}"]`
      ),
    ].forEach(
      (el) =>
        (el.outerHTML = icons.star(
          { user_login: e.target.dataset.user_login },
          e.target.getAttribute("width")
        ))
    );
    // e.target.outerHTML = icons.star({ user_login: e.target.dataset.user_login }, e.target.getAttribute('width'))
    let favsE = document.querySelector(".main_favs");
    let chan = document.querySelector(
      `.stream[data-user_login=${e.target.dataset.user_login.toLowerCase()}`
    );
    if (!favs || !chan) return;
    favsE.innerHTML = lives.data
      .filter((e) => favorites[e.user_name.toLowerCase()])
      .map((e) => stream(e))
      .join("");
  },
  trash: (e) => {
    console.log(e.target.dataset.vod_id, later[e.target.dataset.vod_id], later);
    let { vod_id, user_login } = e.target.dataset;
    delete later[vod_id];
    if (later[user_login]?.vod_id == vod_id) delete later[user_login];
    save({ [`later.${user_login}`]: "$" }, 1);
    e.target.parentElement.parentElement.parentElement.parentElement.remove();
  },
  "config-but": (e) => nav("config"),
  "later-but": (e) => nav("later"),
  "main-but": (e) => nav("main"),
  "vof-but": (e) => nav("vof"),
  "channels-but": (e) => nav("channels"),
  "vods-but": (e) => nav("vods", e.target.dataset.user_login),
  "recent-but": (e) => nav("recent"),
  "x-but": (e) => clearSearch(),
  logout: (e) => {
    delete cred.access_token;
    save({ cred });
    document.getElementById("out").style.display = "flex";
    document.getElementById("in").style.display = "none";
  },
  reset: async (e) => {
    await chrome.storage.local.clear();
    await fetch(port+"/tsfDelete", {
      headers: {
        Authorization: `Bearer ${cred.jwt}`,
        'Content-Type': 'application/json'
      }
    });
    window.close();
    // document.getElementById("out").style.display = "flex";
    // document.getElementById("in").style.display = "none";
  },
  cloudload: (e) => {
    cloudLoad(1);
    nav("main");
  },
  fl: (e) => {
    let pom = document.createElement("input");
    function change(e) {
      let file = e.target.files[0];
      let reader = new FileReader();

      reader.onload = (e) => {
        const contents = e.target.result;
        let data = JSON.parse(contents);
        save(data);
        // streamer_cache = data.streamer_cache;
        favorites = data.favorites;
        config = data.config;
        later = data.later;

        // if (cred.login != data.cred.login) cred = data.cred;

        nav("main");
        pom.remove();
      };
      reader.onerror = (e) => alert(e.target.error.name);
      reader.readAsText(file);
    }
    pom.setAttribute("type", "file");
    pom.addEventListener("change", change);
    pom.click();
  },
  fs: (e) => {
    let data = JSON.stringify({ favorites, config, later });
    let pom = document.createElement("a");
    pom.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(data)
    );
    pom.setAttribute("download", "TSF" + new Date().toLocaleString() + ".json");
    if (document.createEvent) {
      var event = document.createEvent("MouseEvents");
      event.initEvent("click", true, true);
      pom.dispatchEvent(event);
    } else {
      pom.click();
    }
    pom.remove();
  },
  option: (e) => {
    let c = e.target.children[1];
    c.checked = !c.checked;
    config[e.target.dataset.option] = c.checked;
    save({ config });
    console.log(config);
  },
  debug: (e) =>
    console.log("debug:", {
      cred,
      streamer_cache,
      favorites,
      config,
      later,
      channels,
      cache,
      fetches,
    }),
  clca: (e) => {
    cache = {};
    save({ cache });
  },
  support: (e) => {
    window.open(`https://ko-fi.com/auraxium`);
  }
};

let page_cb = {
  main: async () => {
    document.querySelector(".main-but").classList.add("active-tab");
    let current;
    gnow = Date.now();
    [lives, current, aa] = await Promise.all([
      axi(`https://api.twitch.tv/helix/streams/followed?user_id=${cred.id}`, 2),
      chrome.storage.local
        .get(["last_streamer"])
        .then((res) => res.last_streamer || null),
      runtimeFetch({ current: 1 }),
    ]);
    console.log("lives", lives, current || "nun", cred);
    if (!lives?.data?.length) {
      console.log("fetch err: ", lives, current);
      delete cache[
        `https://api.twitch.tv/helix/streams/followed?user_id=${cred.id}`
      ];
      return ($('[page="main"]').innerHTML =
        '<div class="center" style="font-size: 24px; margin-top: 128px">Twitch API failed try again later</div>');
    }
    lives_save = lives.data.reduce((acc, e) => {
      acc[e.user_login.toLowerCase()] = e;
      return acc;
    }, {});

    let favs = lives.data.filter((e) => favorites[e.user_name.toLowerCase()]);
    let str = "";

    if (current) {
      // console.log(current);
      str +=
        '<div class="label" style="font-size: 18px; border-bottom: 1px solid">Currently watching </div>';
      if (+current) {
        let { data } = await axi(
          `https://api.twitch.tv/helix/videos?type=archive&first=1&id=${current}`,
          vod_ct
        );
        // console.log(data);
        if (data?.[0]) str += vod(data[0]);
      } else if (lives_save[current]) str += stream(lives_save[current]);
      else str = "";
    }

    str += `<div class="label section" >Favorites (${favs.length})</div>`;
    str += `<div class="main_favs">${favs
      .map((e) => stream(e))
      .join("")}</div>`;
    if (favs.length)
      str += `<div class="get-vods button bg-dark hl cursor vof-but, get-vods">Get Vods</div>`;
    str += `<div class="label" style="font-size: 18px; border-bottom: 1px solid">Streams (${lives.data.length})</div>`;
    str += lives.data.map((e) => stream(e)).join("");
    // lives.data.forEach(e => str += stream(e));
    str += `<div class="button bg-dark hl cursor get-offline, channels-but">Show All</div>`;

    document.querySelector(".main").innerHTML = str;
    // bounceSearch($('#search').value)
    // fetchForCache()
  },
  later: async () => {
    document.querySelector(".later-but").classList.add("active-tab");
    console.log("later", { ...later });
    let later_arr = Object.entries(later);
    let now = Date.now();
    later_arr.forEach((e) =>
      now > e[1].date + 1000 * 60 * 60 * 24 * 61 ? delete later[e[0]] : null
    );
    if (!later_arr.length)
      return (document.querySelector(
        '[page="later"]'
      ).innerHTML = `<div class="center fs18 grey"> No streams saved </div>`);
    // let vods = await axi(`https://api.twitch.tv/helix/videos?type=archive&first=1${Object.values(later).map(e => '&id=' + (+e.vod_id || 123)).join("")}`);
    let vods = await Promise.all(
      Object.keys(later).map(
        (e) =>
          +e &&
          axi(
            `https://api.twitch.tv/helix/videos?type=archive&first=1&id=${e}`,
            vod_ct,
            0
          ).then((res) => {
            return res?.data?.[0] || null;
          })
      )
    );
    console.log(vods);
    vods = vods.filter((e) => e);
    let str = `<div class="section" >Watch Later (${vods.length})</div>`;
    str += vods
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((e) => vod(e, now))
      .join("");
    // console.log(Object.values(later).length);
    document.querySelector('[page="later"]').innerHTML = str;
    // bounceSearch($('#search').value)
  },
  vods: async (arg) => {
    // clearSearch()
    document.querySelector('[page="vods"]').innerHTML = "";
    let str = `<div style="font-size: 24px"></div>`;
    let vods = await axi(
      `https://api.twitch.tv/helix/videos?type=archive&first=10&user_id=${streamer_cache[arg].id}`,
      5
    );
    str += vods.data.map((e) => vod(e)).join("");
    str += `<div class="get-more button bg-dark hl cursor" data-user_name="${arg}">More</div>`;
    document.querySelector('[page="vods"]').innerHTML = str;
  },
  recent: async () => {
    document.querySelector(".recent-but").classList.add("active-tab");
    let recents = await chrome.storage.local
      .get(["recents"])
      .then((res) => res.recents || {});
    console.log("recent:", { ...recents });
    let now = Date.now();

    let map = await Promise.all(
      Object.keys(recents)
        .map((e) => {
          if (now > recents[e] + 1000 * 60 * 60 * 20) {
            delete recents[e];
            return null;
          }
          let s = e.split("/");
          if (s[4])
            return axi(
              `https://api.twitch.tv/helix/videos?type=archive&first=1&id=${s[4]}`,
              vod_ct
            ).then((res) => res?.data?.[0] || null);
          if (lives_save[s[3]]) return lives_save[s[3]];
          return axi(
            `https://api.twitch.tv/helix/videos?type=archive&first=1&user_id=${
              streamer_cache[s[3]]?.id || 123
            }`,
            vod_ct
          ).then((res) => res?.data?.[0] || null); // live in recent but not anymoer
        })
        .filter((e) => e)
    );

    if (!map.length)
      return ($(
        '[page="recent"]'
      ).innerHTML = `<div class="center fs18 grey"> No recent streams </div>`);

    console.log("recent map:", map);

    let str = `<div class="label section" >Recent (${map.length})</div>`;

    str += map.map((e) => (e?.type == "live" ? stream(e) : vod(e))).join("");

    $('[page="recent"]').innerHTML = str;

    save({ recents });
  },
  vof: async () => {
    document.querySelector(".vof-but").classList.add("active-tab");
    let res = await Promise.all(
      Object.keys(favorites).map((e) =>
        axi(
          `https://api.twitch.tv/helix/videos?type=archive&first=2&user_id=${
            streamer_cache[e]?.id || 123
          }`,
          30
        )
      )
    );
    //let res = await axi(`https://api.twitch.tv/helix/videos?type=archive&first=2${Object.keys(favorites).map(e => '&user_id=' + e).join("")}`) //maybe a way to get multiple vods without vod ids
    if (!res?.length)
      return (document.querySelector(
        '[page="vof"]'
      ).innerHTML = `<div class="center fs18 grey"> No vods available</div>`);

    let now = Date.now();

    console.log("res:", res);

    res = res
      .map((e) =>
        !e?.data?.[0]?.user_login
          ? null
          : !lives_save[e.data[0].user_login] ||
            now - new Date(e.data[0].created_at).getTime() > 1000 * 60 * 60 * 24
          ? e.data[0]
          : e.data[1] || null
      )
      .filter((e) => e)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() +
          durToSecs(b.duration) -
          (new Date(a.created_at).getTime() + durToSecs(a.duration))
      );

    let str =
      `<div class="center, section">Favorite\'s VODs (${res.length}) </div>` +
      res.map((e) => vod(e)).join("");

    document.querySelector('[page="vof"]').innerHTML = str;
  },
  channels: async (e) => {
    document.querySelector(".channels-but").classList.add("active-tab");
    let i = 0;
    let offs = {};

    if (!channels.length) {
      offs = await axi(
        `https://api.twitch.tv/helix/channels/followed?first=100&user_id=${cred.id}`
      );
      channels = [...offs.data];
      while (offs.pagination?.cursor) {
        offs = await axi(
          `https://api.twitch.tv/helix/channels/followed?first=100&user_id=${cred.id}&after=${offs.pagination.cursor}`
        );
        channels.push(...offs.data);
      }
    } else {
      offs = await axi(
        `https://api.twitch.tv/helix/channels/followed?first=5&user_id=${cred.id}`
      );
      console.log(offs.data);

      let bool = !offs.data.find(
        (e) => ++i && e.broadcaster_login == channels[0].broadcaster_login
      );

      if (bool) {
        offs = await axi(
          `https://api.twitch.tv/helix/channels/followed?first=100&user_id=${cred.id}`
        );
        channels = [...offs.data];
        while (offs.pagination?.cursor) {
          offs = await axi(
            `https://api.twitch.tv/helix/channels/followed?first=100&user_id=${cred.id}&after=${offs.pagination.cursor}`
          );
          channels.push(...offs.data);
        }
      } else {
        channels = [...offs.data.slice(0, i - 1), ...channels];
      }
    }

    // console.log(els);

    let str = `<div style="font-size: 18px; border-bottom: 1px solid">Channels (${channels.length})</div>`;
    str += channels
      .map((e) =>
        channel(e, !search.length || e.broadcaster_login.includes(search))
      )
      .join(""); //.filter(e => !lives_save[e.user_login])

    // console.log(els);
    document.querySelector('[page="channels"]').innerHTML = str;

    save({ channels });
  },
  config: (e) =>
    [...document.querySelectorAll(".option")].forEach((e) => {
      console.log(e);
      e.children[1].checked = Boolean(config[e.dataset.option]);
    }),
};

//#endregion

//#region UI
function stream(e) {
  if (!e) return;
  let later_on;

  if (!streamer_cache[e.user_login]) {
    let uid = Math.random().toString(27).slice(5);
    fetches.push({ type: "stream", e, uid, login: e.user_login });
    fetchForCache();
    return `<div a${uid} ></div>`;
  }

  let img = streamer_cache[e.user_login].profile_image_url;
  if (
    later[e.user_login] &&
    Date.now() - later[e.user_login].date < 1000 * 60 * 60 * 20
  ) {
    later_on = 1;
  } else if (later[e.user_login]) {
    delete later[e.user_login];
    save({ [`later.${e.user_login}`]: "$" });
  }
  // later_on = later[e.user_login] && Date.now() - later[e.user_login].date < 1000*360*18

  return `<div title="${escapeHTML(
    e.title
  )}" class="stream hl" data-user_login="${e.user_login}">

  <div class="img-containter"  style="width: 25%; ">
    <img class="thumbnail" src="https://static-cdn.jtvnw.net/previews-ttv/live_user_${
      e.user_login
    }.jpg" alt="" class="" />
  </div>

    <div class="info " style="width: 60%;  ">
      <div class="truncate text-center" style="font-size: 18px; height:40% ">
       <img class="profile_pic" src="${img}" />
         ${
           favorites[e.user_name.toLowerCase()]
             ? icons.starFilled(e)
             : icons.star(e)
         }
         ${e.user_name}
      </div>
      <div class=" text-center" style="font-size: 16px; height:30%"><div class="truncate">${
        e.title
      }</div></div>
      <div class=" w-full text-center justify-between " style="font-size: 12px; height:30%">
        <div>${e.game_name}</div>
      </div>
    </div>

    <div class="misc" style="width: 15%; ">
      <div class="flex" style="justify-content: end; ">
        <div class="reddot"></div>
        <div class="" style="font-size: 14px">${e.viewer_count}</div>
      </div>
        <div>${icons.dur()}${secsToDur(
    gnow - new Date(e.started_at).getTime()
  )}</div>

     <div class="flex buts" style="flex-gap: 3px">
        <div title="Vods (right click for recent vod)">
          ${icons.vods(e)}
        </div>

        <div title="Watch Later">
          ${icons.later(e, later_on, 0)}
        </div>
       </div>
    </div>
  </div>`;
}

function vod(e, now = Date.now(), src, show = 1, vods = 1) {
  if (!e) return;
  if (!streamer_cache[e.user_login]) {
    let uid = Math.random().toString(27).slice(5);
    fetches.push({ type: "vod", e, uid, login: e.user_login });
    fetchForCache();
    return `<div a${uid} ></div>`;
  }
  // console.log(e.thumbnail_url, lives_save[e.user_login]);
  // if(e.thumbnail_url.length < 75) e.thumbnail_url = lives_save[e.user_login].thumbnail_url
  let thumb =
    e.thumbnail_url.length < 75
      ? `https://static-cdn.jtvnw.net/previews-ttv/live_user_${e.user_login}.jpg`
      : `${e.thumbnail_url.slice(0, -22)}360x200.${e.thumbnail_url
          .split(".")
          .at(-1)}`;

  return `<div title="${escapeHTML(e.title)}" class="vod hl" data-vod_id="${
    e.id
  }" data-user_login="${e.user_login}" style="display: ${
    show ? "flex" : "none"
  };">
  
    <div class="img-containter"  style="width: 25%; ">
      <img class="thumbnail" src="${src || thumb}" alt="" class="" />
    </div>
  
      <div class="info " style="width: 60%;  ">
        <div class="truncate text-center" style="font-size: 18px; height:40% ">
         <img class="profile_pic" src="${
           streamer_cache[e.user_login]?.profile_image_url
         }" />
         ${
           favorites[e.user_name.toLowerCase()]
             ? icons.starFilled(e)
             : icons.star(e)
         }
         ${e.user_name}
        </div>
        <div class=" text-center" style="font-size: 16px; height:30%"><div class="truncate">${
          e.title
        }</div></div>
        <div class="truncate text-center " style="font-size: 12px; height:30%">${
          e.duration
        }</div>
      </div>
  
      <div class="misc" style="width: 15%; ">
        <div class="flex" style="justify-content: end; ">
          ${icons.duration(e)}
          <div class="" style="font-size: 12px">${timeAgo(
            now - durToSecs(e.duration) - new Date(e.created_at).getTime()
          )}</div>
        </div>
  
       <div class="flex" style="flex-gap: 3px">
          <div title="Vods (right click for recent vod)">
            ${icons.vods(e)}
          </div>
  
          <div title="Watch Later">
            ${
              current_page == "later"
                ? icons.trash({ id: e.id, login: e.user_login })
                : icons.later(e, later[e.id], e.id)
            }
          </div>
         </div>
      </div>
    </div>`;
}

function channel(e, show) {
  if (!e) return console.log(e);

  let img;
  if (!streamer_cache[e.broadcaster_login]) {
    let uid = Math.random().toString(27).slice(5);
    fetches.push({ type: "channel", e, uid, login: e.broadcaster_login });
    fetchForCache();
    return `<div a${uid} ></div>`;
  }

  img = streamer_cache[e.broadcaster_login].profile_image_url;

  let uj = { user_login: e.broadcaster_login };
  // console.log(show);

  return `
    <div class="channel" data-user_login="${
      e.broadcaster_name
    }" style="display: ${show ? "flex" : "none"}">
      <img src="${img}" class="channelImg" />
      ${
        favorites[e.broadcaster_login]
          ? icons.starFilled(uj, 24)
          : icons.star(uj, 24)
      }
      ${e.broadcaster_name}
      <div title="Vods (right click for recent vod)" style="margin-left: auto;">${icons.vods(
        uj
      )}</div>
    </div>
  `;
}
//#endregion

//#region FUNCTIONS

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
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${~~(s / 60)}m ago`;
  if (s < 86400) return `${~~(s / 3600)}h ago`;
  return `${~~(s / 86400)}d ago`;
}

function durToSecs(s) {
  if (!s) return;
  let t = {
    s: 1,
    m: 60,
    h: 3600,
  };
  let temp = "";
  let acc = 0;
  for (let e of s) {
    if (+e > -1) {
      temp += e;
      continue;
    }
    acc += +temp * t[e];
    temp = "";
  }
  return acc * 1000 || 0;
}

function secsToDur(secs) {
  if (!secs && secs !== 0) return null;
  if (!+secs) return null;
  secs /= 1000;
  secs = ~~secs;
  let str = "";
  if (secs >= 3600) {
    str += ~~(secs / 3600) + ":";
    secs %= 3600;
  }
  if (secs >= 60) {
    let t = ~~(secs / 60) + "";
    str += str.length && t.length == 1 ? `0${t}:` : `${t}:`;
    secs %= 60;
  } else str += str.length ? "00:" : "0:";
  str += (secs + "").length == 1 ? `0${secs}` : `${secs}`;

  return str;
}

function clamp(val, min, max) {
  return val > max ? max : val < min ? min : val;
}

function nav(s, arg) {
  // clearSearch()
  document.querySelector(".active-tab")?.classList.remove("active-tab") || null;
  [...document.querySelectorAll("[page]")].forEach(
    (e) => (e.style.display = "none")
  );
  document.querySelector(`[page="${s}"]`).style.display = "flex";
  document.querySelector(".in").scrollTo(0, 0);
  page_cb[s] && page_cb[s](arg);
  current_page = s;
}

async function axi(s, ct, debug) {
  // console.log(arguments);
  ct ??= 1;
  if (cache[s]) {
    if (cache[s].expire < Date.now()) delete cache[s];
    else return cache[s].res;
  }
  let ax = await fetch(s, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${cred.access_token}`,
      "Client-Id": "0helgn8mxggk3ffv53sxgqrmkdojb3",
    },
  })
    .then((res) => res.json())
    .catch(console.log);
  if (!ax) return null;
  if (debug) console.log("axi debug:", { url: s, ct, ...ax });
  if (ax?.data?.[0]?.thumbnail_url?.length < 73) ct = 10;
  cache[s] = { expire: Date.now() + 60000 * ct, res: ax };
  save({ cache });
  return ax;
}

function $(s) {
  let a = [...document.querySelectorAll(s)];
  return !a.length ? null : a.length == 1 ? a[0] : a;
}

async function auth() {
  let popup = window.open(
    `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=0helgn8mxggk3ffv53sxgqrmkdojb3&redirect_uri=https://misc.auraxium.dev/twotch&scope=user%3Aread%3Afollows&state=${window.location.href}`,
    "popup",
    "popup=true"
  );

  let auth = (event) => {
    console.log(event);
    if (event.origin != "https://misc.auraxium.dev") return;
    // if (!event.data?.slice || event.data.slice(0, 4) != 'tsf_') return;
    let ind = event.data.indexOf("access_token=");
    if (ind == -1) {
      window.removeEventListener("message", auth);
      popup.close();
      return;
    }
    let ac = event.data.slice(ind + 13, event.data.length);
    if (ac == "null") {
      window.removeEventListener("message", auth);
      popup.close();
      return;
    }
    // console.log('ac:', ac);
    window.removeEventListener("message", auth);
    popup.close();

    cred.access_token = ac;
    fetch(port + "/tsfJWT", {
      method: "POST",
      body: JSON.stringify({ access_token: ac }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(async (res) => {
        console.log(1);
        cred = {
          ...cred,
          ...res.cred,
          device: Math.random().toString(27).slice(2, 12),
        };
        // save({ cred });
        console.log("cred", cred);
        await chrome.storage.local.set({ cred });
        if (res.data) {
          for (let key in res.data) globalThis[key] = res.data[key];
          console.log("had data:", res.data);
          await chrome.storage.local.set(res.data);
          cache.last_load = Date.now(); //{ expire: Date.now() + 60000, res: res.data };
          await chrome.storage.local.set({ cache });
        } else {
          changes = {favorites, config, later} //chrome.storage.local.get(['favorites', 'config', 'later'])
          bounceSave()
        }
        // console.log("ahjksldfhaik");
        document.getElementById("in").style.display = "flex";
        document.getElementById("out").style.display = "none";
        nav("main");
        // main();
        // window.location.reload()
      })
      .catch(console.log);
  };

  window.addEventListener("message", auth, false);
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
    let res = await axi(
      "https://api.twitch.tv/helix/users?" +
        fetches.map((e) => `login=${e.login}&`).join("")
    ).catch(console.log);
    // console.log('getty: ', res);
    res.data.forEach((e) => (streamer_cache[e.login] = e));
    save({ streamer_cache });
    fetches.forEach(
      (el) =>
        (document.querySelector(`[a${el.uid}]`).outerHTML =
          el.type == "stream"
            ? stream(el.e)
            : el.type == "vod"
            ? vod(el.e)
            : channel(el.e, 1))
    );
    fetches = [];
  }
}, 750);

function logout() {
  chrome.storage.local.set({ streamer_cache: {}, cred: {} });
}

async function runtimeFetch(json) {
  return new Promise((y, n) =>
    chrome.runtime.sendMessage(json, (res) => y(res))
  );
}

var $ = (s) => {
  let a = [...document.querySelectorAll(s)];
  return !a.length ? null : a.length == 1 ? a[0] : a;
};

function hardSave() {
  if (!cred.jwt) return;
}

async function save(part, debug, nochange) {
  let log = new Set();

  let j = {};
  let c = 1;
  part = { ...part };
  for (let key in part) {
    let arr = [changes];
    let spl = key.split(".");
    log.add(spl[0]);
    if (!change_filt.has(spl[0])) continue;
    let path = spl.slice(0, -1).join(".");

    if (!path) {
      if (part[key] == "$") {
        delete changes[key];
        $unset.add(key);
      } else changes[key] = part[key];
      continue;
    }
    spl.forEach((el, i) => {
      arr[i][el] ??= {};
      arr[i + 1] = arr[i][el];
    });
    if (part[key] == "$") {
      $unset.add(key);
      delete arr.at(-2)[spl.at(-1)];
      continue;
    }
    arr.at(-2)[spl.at(-1)] = part[key];
    $unset.delete(key);
  }

  let k = [...log].reduce((acc, e) => {
    acc[e] = globalThis[e];
    return acc;
  }, {});
  await chrome.storage.local.set(k);
  // console.log("changes:", changes);
  bounceSave();
  save_rdy = 1;
}

function cloudSave() {
  if (!Object.keys(changes).length && !$unset.size) return;
  console.log("cloud saving:", changes);
  changes.device = cred.device;
  changes.date = Date.now();
  let morph = {};
  for (let key in changes) {
    let j = {};
    let arr = [j];
    let spl = key.split(".");
    spl.forEach((el, i) => {
      arr[i][el] ??= {};
      arr[i + 1] = arr[i][el];
    });
    arr.at(-2)[spl.at(-1)] = changes[key];
    morph[key] = JSON.stringify(j);
  }
  console.log("morph:", morph);
  fetch(port + "/tsfSave", {
    method: "POST",
    body: JSON.stringify({ changes: morph, $unset: [...$unset] }),
    headers: {
      Authorization: `Bearer ${cred.jwt}`,
      "Content-Type": "application/json",
    },
    keepalive: true,
  })
    .then(console.log)
    .catch(console.log);
  changes = {};
  $unset.clear();
  save_rdy = 0;
}

var bounceSave = debounce(cloudSave, 1000 * 30);

async function cloudLoad(force) {
  let now = Date.now();
  let cd = now - (cache.last_load || 0);
  console.log(cache.last_load, now - cache.last_load, 1000 * 40 * 1);
  if (force && cd < 1000 * 40 * 1) return console.log("too soon load");
  else if (!force && cd < 1000 * 60 * 10) return console.log("too soon load");
  cache.last_load = now;
  await chrome.storage.local.set({ cache });
  let res = await fetch(port + "/tsfLoad", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${cred.jwt}`,
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .catch(console.log);
  console.log("load:", res);
  if (!res) return console.log("no account");
  if (res.device == cred.device) return console.log("no new save");
  console.log("syncing save");
  for (let key in res.data) if (res[key]) globalThis[key] = res[key];
  await chrome.storage.local.set(res);
  nav("main");
  // main();
}

async function main() {
  const keys = [
    "streamer_cache",
    "favorites",
    "cred",
    "config",
    "later",
    "channels",
    "cache",
  ];
  // chrome.storage.local.clear()
  chrome.storage.local.get(keys).then((res) => {
    for (const key of keys) if (res[key]) globalThis[key] = res[key];

    if (!cred || !cred.access_token || !cred.jwt) {
      document.getElementById("out").style.display = "flex";
      document.getElementById("in").style.display = "none";
      return;
    } else {
      document.getElementById("in").style.display = "flex";
      document.getElementById("out").style.display = "none";
    }
    if (Date.now() > (cache.expire || 0))
      cache = { expire: Date.now() + 1000 * 60 * 60 * 24 * 13 };
    nav("main");
    cloudLoad();
  });
  // console.log(res)
}

main();

//#endregion

//#region EVENTS
window.addEventListener("unload", () => {
  cloudSave();
});

document.querySelector(".auth").addEventListener("click", (e) => {
  auth();
});

document.addEventListener("click", function (e) {
  // console.log(e.target);
  if (e.target?.classList)
    [...e.target.classList].forEach((el) => clickable[el] && clickable[el](e));
});

document.addEventListener("contextmenu", function (e) {
  // console.log(e.target);
  if (e.target?.classList)
    [...e.target.classList].forEach((el) => {
      if (!contexts[el]) return;
      console.log(el);
      e.preventDefault();
      e.stopPropagation();
      contexts[el](e);
    });
});

document.addEventListener("mousedown", (e) => {
  if (e.button != 1) return;
  if (e.target?.classList)
    [...e.target.classList].forEach((el) => midable[el] && midable[el](e));
});

document.addEventListener("mouseover", (e) => {
  if (e.target?.classList?.contains("hl")) {
    e.target.style.backgroundColor = "rgb(100, 100, 100)";
  }
});

document.addEventListener("mouseout", (e) => {
  if (e.target?.classList?.contains("hl")) {
    e.target.style.backgroundColor = "rgb(0, 0, 0)";
  }
});

function clearSearch() {
  search = "";
  document.querySelector("#search").value = "";
  [...document.querySelectorAll("[data-user_login]")].forEach(
    (e) => (e.style.display = "flex")
  );
}

var bounceSearch = debounce((s) => {
  s = s.toLowerCase();
  [...document.querySelectorAll(`div[data-user_login]`)].forEach((el) => {
    // console.log(s, el.getAttribute('data-user_login'), el.getAttribute('data-user_login').toLowerCase().includes(s));
    if (!el.style) return;
    el.style.display = el
      .getAttribute("data-user_login")
      .toLowerCase()
      .includes(s)
      ? "flex"
      : "none";
  });
}, 400);

document.querySelector("#search").addEventListener("keyup", (e) => {
  search = e.target.value;
  bounceSearch(e.target.value);
  // search(e.target.value)
  // console.log('???????????????')
});

document.addEventListener("keydown", (e) => {
  keys[e.key] = 1;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = 0;
});

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
docs: https://dev.twitch.tv/docs/api/reference/
cant use get stream() for vods
channels too much api data, only do recent follow?
*/

/* done
  5/8 offine tab, saving/loading file and server, 
*/
