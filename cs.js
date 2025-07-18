//#region init

var favorites = {};
var cred = {};
var streamer_cache = {};
var later = {};
var config = { cs: 1 };
var cache = {};

let sidebar_query = ".Layout-sc-1xcs6mc-0.kHqXhd.side-nav";
let list = [".haGrcr", '[role="group"]'];
let imgs = [];
let interval;
const regex = /{([^{}]*)}$/;
let hl = `onmouseover=this.style.backgroundColor='#3c3f43' onmouseout=this.style.backgroundColor=''`;
let center = `display: flex; align-items: center;`;
let icon = `${center} padding: 2px;`;
let current_name;
let lon = "#813ade";
let la;

let observer;

let ctx = {};
let channels = {};
let cur_ctx;

function check() {
  if (!document.querySelector(".tsf-favs"))
    document.querySelector(".simplebar-content").insertAdjacentHTML(
      "afterbegin",
      `<div class="tsf-favs" style="padding: 2px; margin-top: 9px ">
      </div>`
    );
  getFavs();
  addBar();
}

let icons = {
  later: (e = {}) => {
    let user_login =
      e.user_login ||
      document.querySelector("h1.tw-title")?.innerHTML.toLowerCase() ||
      null;
    let ind =
      e.ind == -1
        ? false
        : window.location.href.includes("videos")
        ? window.location.pathname.split("/").at(-1)
        : current_name ||
          document.querySelector("h1.tw-title").innerHTML.toLowerCase();
    let ref = document.createElement("div");
    ref.style.display = "flex";
    ref.style.alignItems = "center";
    ref.style.padding = "6px";
    ref.style.borderRadius = "6px";
    ref.style.backgroundColor = "#292d33";
    ref.style.margin = "0 4px";
    ref.style.cursor = "pointer";
    ref.classList.add("icon-tabler-clock-hour-4");
    ref.setAttribute("onmouseover", `this.style.backgroundColor='#3c3f43'`);
    ref.setAttribute("onmouseout", `this.style.backgroundColor='#292d33'`);
    ref.setAttribute("title", "Watch Later");
    ref.innerHTML = `<svg  xmlns="http://www.w3.org/2000/svg" user_login="${user_login}" style="pointer-events: none"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="${
      ind && later[ind] && Date.now() < later[ind].date ? lon : "#ffffff"
    }"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-clock-hour-4"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 12l3 2" /><path d="M12 7v5" /></svg>`;
    return ref;
  },
  star: (e = {}) => {
    let user_login =
      e.user_login ||
      document.querySelector("h1.tw-title")?.innerHTML.toLowerCase() ||
      null;
    let ref = document.createElement("div");
    ref.style.display = "flex";
    ref.style.alignItems = "center";
    ref.style.padding = "6px";
    ref.style.borderRadius = "6px";
    ref.style.backgroundColor = "#292d33";
    ref.style.margin = "0 4px";
    ref.style.cursor = "pointer";
    ref.classList.add("icon-tabler-star");
    ref.setAttribute("onmouseover", `this.style.backgroundColor='#3c3f43'`);
    ref.setAttribute("onmouseout", `this.style.backgroundColor='#292d33'`);
    ref.setAttribute("title", "Favorite");
    ref.innerHTML = favorites[user_login]
      ? `<svg data-fill='on' user_login="${user_login}" style="pointer-events: none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-star icon-tabler icons-tabler-filled icon-tabler-star">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
  </svg>`
      : `<svg data-fill='off' user_login="${user_login}" style="pointer-events: none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-star">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
  </svg>`;
    return ref;
  },
  vods: (e = {}) => {
    let user_login =
      e.user_login ||
      document.querySelector("h1.tw-title")?.innerHTML.toLowerCase() ||
      null;
    let ref = document.createElement("div");
    ref.style.display = "flex";
    ref.style.alignItems = "center";
    ref.style.padding = "6px";
    ref.style.borderRadius = "6px";
    ref.style.backgroundColor = "#292d33";
    ref.style.margin = "0 4px";
    ref.style.cursor = "pointer";
    ref.classList.add("icon-tabler-movie");
    ref.setAttribute("onmouseover", `this.style.backgroundColor='#3c3f43'`);
    ref.setAttribute("onmouseout", `this.style.backgroundColor='#292d33'`);
    ref.setAttribute("title", "Vods (right click for current stream's vod)");
    ref.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" user_login="${user_login}" style="pointer-events: none" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-movie">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
    <path d="M8 4l0 16" />
    <path d="M16 4l0 16" />
    <path d="M4 8l4 0" />
    <path d="M4 16l4 0" />
    <path d="M4 12l16 0" />
    <path d="M16 8l4 0" />
    <path d="M16 16l4 0" />
  </svg>`;
    return ref;
  },
  sumb: (e = {}) => {
    // <div adss style="position: fixed; width: 50px; height: 50px; backgorund-color: green; z-index: 9999999"></div>
    let ref = document.createElement("div");
    ref.id = `sumb_${e.user_login}`;
    ref.setAttribute("sumb", "");
    ref.innerHTML = `
      <div style="position: absolute; max-width: 330px; max-height: 46px; z-index: 100; border-radius: 4px; box-shadow: 5px 5px 10px 2px rgba(0,0,0,.8); background-color: #292d33; padding: 6px; overflow: hidden; text-overflow: ellipsis">${
        e.title
      }</div>
      <img src="https://static-cdn.jtvnw.net/previews-ttv/live_user_${
        e.user_login
      }.jpg?timestamp=${Date.now()}" style="position: absolute; width: full; height: 248px; bottom: 0px; z-index: 99; border-radius: 4px; box-shadow: 5px 5px 10px 2px rgba(0,0,0,.8); " />
    `;
    ref.style.display = "none";
    ref.style.width = "640px";
    ref.style.height = "278px";
    ref.style.position = "absolute";

    return ref;
  },

  ctx: (e = {}) => {
    // <div adss style="position: fixed; width: 50px; height: 50px; backgorund-color: green; z-index: 9999999"></div>
    ctx = document.createElement("div");
    ctx.id = "tsf_ctx";
    ctx.style.display = "none";
    ctx.style.backgroundColor = "#292d33";
    ctx.style.minWidth = "50px";
    ctx.style.minHeight = "50px";
    ctx.style.padding = "2px";
    ctx.style.position = "absolute";
    ctx.style.zIndex = "101";
    ctx.style.border = "solid 2px #813ade";

    return ctx;
  },

  test: (e = {}) => {
    // <div adss style="position: fixed; width: 50px; height: 50px; backgorund-color: green; z-index: 9999999"></div>
    let ref = document.createElement("div");
    ref.style.display = "flex";
    ref.style.backgroundColor = "green";
    ref.style.minWidth = "50px";
    ref.style.minHeight = "50px";
    ref.style.cursor = "pointer";
    ref.style.position = "fixed";
    ref.style.transform = "translateY(-100px)";

    return ref;
  },
};

//#endregion

//#region funcs

async function axi(s) {
  let now = Date.now();

  if (cache[s]) {
    if (cache[s] == -1) return 0;
    if (cache[s].date > now) return cache[s].res;
    else delete cache[s];
  }
  cache[s] = -1;

  let ax = await fetch(s, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${cred.access_token}`,
      "Client-Id": "0helgn8mxggk3ffv53sxgqrmkdojb3",
    },
  })
    .then((res) => res.json())
    .catch((err) => delete cache[s]);

  cache[s] = { res: { ...ax, cached: true, now }, date: now + 1000 * 60 * 2 };
  return ax;
}

function save(j, debug) {
  chrome.storage.local.set(j);
  if (debug) console.log(j);
}

function vc(s) {
  return s.length < 4 ? s : s.slice(0, -3) + "." + s.at(-2) + "K";
}

function showThumbnail(event) {
  // console.log(this);\
  this.style.backgroundColor = "#3c3f43";
  let img = document.querySelector("#sumb_" + this.dataset.user_login); //this.firstElementChild.style;
  if (!img) return console.log("no thumb");

  // console.log(img);
  let bound = this.getBoundingClientRect();
  img.style.left = bound.right + 12 + "px";
  img.style.top =
    event.clientY < screen.height / 2
      ? bound.bottom - 20 + "px"
      : bound.top - 248 + 120 + "px";
  img.style.display = "flex";
}

function hideThumbnail(event) {
  this.style.backgroundColor = "";
  [...document.querySelectorAll("[sumb]")].forEach(
    (el) => (el.style.display = "none")
  );
  // let sumb = document.querySelector('#sumb_' + this.dataset.user_login)
  // if (sumb) sumb.style.display = 'none';
}

function stream(e, now = Date.now()) {
  if (!e) return;
  // console.log(e);
  let img = streamer_cache[e.user_login]?.profile_image_url || null;
  if (!img) {
    img = e.user_login;
    imgs.push({ id: e.user_id, login: e.user_login, cb: img });
  } //else img = streamer_cache[e.user_login].profile_image_url;

  let sumb = document.querySelector(`#sumb_${e.user_login}`);
  if (!sumb)
    document.querySelector(".Layout-sc-1xcs6mc-0").prepend(icons.sumb(e));
  else {
    sumb.children[0].innerHTML = e.title;
    sumb.children[1].src = `https://static-cdn.jtvnw.net/previews-ttv/live_user_${e.user_login}.jpg?timestamp=${now}`;
  }

  return `<a style="all: unset; cursor: default; display: flex; padding: 0px 3px; box-sizing: border-box; align-items: center; justify-content: center; gap: 5px; height: 42px;"
  data-user_login="${e.user_login}" 
    
    <img src=${img} style="width: 16%; padding: 4px; aspect-ratio: 1; border-radius: 99%" />

    <div style="width: 59%; height: 100%; display: flex; flex-direction: column; justify-content: center; overflow-y: hidden; overflow-x: hidden;">
      <p style="font-weight: 600 !important; ">${e.user_name}</p>
      <span title="${
        e.game_name
      }" style="white-space: nowrap; font-weight: 400 !important; color: #ADADB8; display: inline-block; line-height: 1;">${
    e.game_name
  }</span>
    </div>

    <div style="width: 25%; height: 100%; display: flex; gap: 3px;  align-items: start; justify-content: center">
      <div style="display: flex; align-items: center; gap: 3px"  >
        <div style="width: 8px; height: 8px; border-radius: 99%; background-color: #eb0400; margin-right: 2px;"></div>
        ${vc(e.viewer_count + "")}
      </div>
    </div>
  </a>`;
}

async function getFavs(force) {
  // if(force) delete cache[`https://api.twitch.tv/helix/streams/followed?user_id=${cred.id}`];
  // if (!document.querySelector(".tsf-favs") && !document.querySelector(sidebar_query)) return;
  if (!document.querySelector(".tsf-favs")) {
    if (!document.querySelector(sidebar_query)) return;
    document
      .querySelector(sidebar_query)
      .insertAdjacentHTML(
        "afterbegin",
        `<div class="tsf-favs" style="padding: 2px; margin-top: 9px ">
        </div>`
      );
  }

  lives = await axi(
    `https://api.twitch.tv/helix/streams/followed?user_id=${cred.id}`
  );
  // console.log('lives', lives);
  if (lives == 0) return;
  if (
    lives.cached &&
    !force &&
    document.querySelector(".tsf-favs")?.offsetHeight > 15
  )
    return;
  if (!lives?.data?.length)
    return delete cache[
      `https://api.twitch.tv/helix/streams/followed?user_id=${cred.id}`
    ];
  // if(lives.cached && document.querySelector('.tsf-favs')) return;

  let { now } = lives;
  channels = lives.data.reduce((acc, e) => {
    acc[e.user_login] = 1;
    return acc;
  }, {});
  // console.log('channles:', channels, lives);
  let favs = lives.data.filter((e) => favorites[e.user_name.toLowerCase()]);

  let str = `<div id="tsf_head" style="display: flex; align-items: center"> 
      <h2 style="font-size: 14px; padding: 8px">TSF FAVORITES (${
        favs.length
      })</h2> 
     </div> 
      ${favs.map((e) => stream(e, now)).join("")}`;

  document.querySelector(".tsf-favs").innerHTML = str;

  // if (imgs.length) {
  //   let res = await axi(
  //     "https://api.twitch.tv/helix/users?" +
  //       imgs.map((e) => `id=${e.id}&`).join("")
  //   );
  //   res.data.forEach((e) => {
  //     streamer_cache[e.login] = e;
  //     document.querySelector(`[src="${e.login}"]`).src = e.profile_image_url;
  //   });
  //   save({ streamer_cache });
  //   imgs = [];
  // }

  // [...document.querySelectorAll("[sumb]")].forEach((el) =>
  //   el?.id && favorites[el.id.slice(5)] ? null : el.remove()
  // );

  // document.querySelector('#tsf_head').appendChild(icons.refresh());
}

async function addBar() {
  if (document.querySelector("svg[data-fill]")) return;

  let laq = "div.Layout-sc-1xcs6mc-0.hnHqxZ"; //'[data-target="channel-header-right"]' //'.Layout-sc-1xcs6mc-0.ktLpvM'
  console.log("searching for staringing");

  while (!document.querySelector(laq)) {
    console.log("searching for laq", document.querySelector(laq));
    await Delay(1000);
  }
  console.log("found laq:", document.querySelector(laq));

  // while (!document.querySelector('.Layout-sc-1xcs6mc-0.lmNILC')) {
  //   console.log('searching for laq container', document.querySelector(laq));
  //   await Delay(1000);
  // }
  // console.log('and therfore found layout:', document.querySelector('.Layout-sc-1xcs6mc-0.lmNILC'))

  la = document.querySelector(laq);
  current_name = document.querySelector("h1.tw-title").innerHTML.toLowerCase();

  if (document.querySelector("svg[data-fill]")) return;

  la.prepend(icons.later());
  la.prepend(icons.vods());
  la.prepend(icons.star());
  document.querySelector(".Layout-sc-1xcs6mc-0").prepend(icons.ctx());
}

async function main() {
  // let observer = new MutationObserver(callback);
  // observer.observe(document.body, { childList: true, subtree: true });
  // return
  console.log("TSF: GETTING KEYS");
  const keys = [
    "streamer_cache",
    "favorites",
    "cred",
    "config",
    "later",
    "channels",
    "cache",
  ];
  let res = await chrome.storage.local.get(keys);
  for (const key of keys) if (res[key]) globalThis[key] = res[key];
  if (!config.cs) return console.log("TSF cs disabled");
  if (Date.now() > (cache.expire || 0))
    cache = { expire: Date.now() + 1000 * 60 * 60 * 24 * 13 };

  chrome.runtime.sendMessage({ open: window.location.href });

  if (!cred.access_token || !cred.jwt) {
    let getAuths = () => {
      if (
        !document.querySelector(".tsf-favs") ||
        document.querySelector(".tsf-favs").offsetHeight < 20
      ) {
        document.querySelector(".simplebar-content").insertAdjacentHTML(
          "afterbegin",
          `<div class="tsf-favs" style="padding: 2px; margin-top: 9px ">
        <h2 style="font-size: 14px; padding: 8px">TSF FAVORITES</h2>
        <div style="width: 100%; display: flex; justify-content: center">
         <div class="auth" style="border: 1px solid white; background-color: blac,k; padding: 8px; cursor: pointer;" >Authorize</div>
        </div> 
        </div>`
        );
      }
    };

    let check = () => {
      if (!cred.access_token && !document.querySelector(".tsf-favs"))
        getAuths();
    };
    observer = setInterval(check, 2000);
    Delay(1000 * 60 * 1).then(() => clearInterval(observer));

    return console.log("TSF no access token");
  }

  getFavs();
  interval = setInterval(getFavs, 1000 * 60 * 2.5);
  addBar();
  observer = setInterval(check, 2000);
  Delay(1000 * 60 * 1).then(() => clearInterval(observer));
}

async function Delay(secs) {
  return new Promise((res) => setTimeout(() => res(""), secs));
}

main();

//#endregion

//#region events

document.addEventListener("contextmenu", (e) => {
  let temp = e.target;
  do {
    if (temp.matches("a")) break;
    temp = temp.parentElement;
  } while (temp);
  if (!temp) return;
  // console.log(temp);

  let split = temp.getAttribute("href").split("/");
  if (split.length != 2) return;
  let user_login = split.at(-1);
  if (!user_login) return;
  if (user_login == cur_ctx) return;

  if (!document.querySelector("#tsf_ctx")) return; //document.querySelector('.Layout-sc-1xcs6mc-0').prepend(icons.ctx());

  cur_ctx = user_login;

  e.preventDefault();
  e.stopPropagation();
  // ctx = document.querySelector('#tsf_ctx')
  ctx.style.left = e.pageX - 4 + "px";
  ctx.style.top = e.pageY - 4 + "px";
  ctx.style.display = "flex";
  ctx.setAttribute("user_login", user_login);

  ctx.innerHTML = `
    ${
      streamer_cache[user_login]
        ? `<img src="${
            streamer_cache[user_login]?.profile_image_url || -1
          }" onpointerdown="window.open('https://www.twitch.tv/${user_login}')" style="width: 50px; padding: 4px; aspect-ratio: 1; border-radius: 99%" />`
        : ""
    }
    ${channels[user_login] ? icons.star({ user_login }).outerHTML : ""}
    ${icons.vods({ user_login }).outerHTML}
    ${icons.later({ user_login, ind: -1 }).outerHTML}
    `;
});

let clickable = {
  "icon-tabler-star": async (e) => {
    let el = e.target.dataset.fill ? e.target : e.target.firstElementChild;
    // console.log(el);
    let user_login =
      el.getAttribute("user_login") ||
      document.querySelector("h1.tw-title")?.innerHTML.toLowerCase() ||
      null;
    if (!user_login) return console.log("no ul");
    // console.log(user_login);
    favorites = await chrome.storage.local
      .get(["favorites"])
      .then((res) => res.favorites || {});
    if (el.getAttribute("data-fill") == "off") {
      favorites[user_login] = 1;
      el.outerHTML = `<svg data-fill='on' user_login="${user_login}" style="pointer-events: none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="icon icon-tabler icons-tabler-filled icon-tabler-star">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
      </svg>`;
    } else {
      delete favorites[user_login];
      el.outerHTML = `<svg data-fill='off' user_login="${user_login}" style="pointer-events: none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-star">
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
      </svg>`;
    }

    save({ favorites });
    getFavs(1);
  },
  "icon-tabler-movie": (e) => {
    let ctrl = e.ctrlKey;
    let el = e.target.firstElementChild;
    ctrl
      ? window.open(
          `https://www.twitch.tv/${el.getAttribute(
            "user_login"
          )}/videos?filter=archives&sort=time`
        )
      : (window.location = `https://www.twitch.tv/${el.getAttribute(
          "user_login"
        )}/videos?filter=archives&sort=time`);
  },
  "icon-tabler-clock-hour-4": async (e) => {
    let el = e.target.firstElementChild;
    let user_login =
      el.getAttribute("user_login") ||
      document.querySelector("h1.tw-title")?.innerHTML.toLowerCase() ||
      null;
    let ind = window.location.href.includes("videos")
      ? window.location.pathname.split("/").at(-1)
      : current_name ||
        document.querySelector("h1.tw-title").innerHTML.toLowerCase();

    later = await chrome.storage.local
      .get(["later"])
      .then((res) => res.later || {});
    if (el.getAttribute("stroke") == lon) {
      // wl on, turn it off
      el.setAttribute("stroke", "#ffffff");
      let { user_login, vod_id } = later[ind];
      delete later[user_login];
      delete later[vod_id];
      console.log(later[ind], later);
    } else {
      // wl off, turn it on
      el.setAttribute("stroke", lon);

      if (
        window.location.href.includes("videos") &&
        user_login ==
          document.querySelector("h1.tw-title")?.innerHTML.toLowerCase()
      ) {
        later[ind] = {
          date: Date.now(),
          user_login: current_name,
          vod_id: ind,
        };
        // console.log(later[ind], later);
        save({ later });
        return;
      }

      if (!streamer_cache[user_login])
        await axi(`https://api.twitch.tv/helix/users?login=${user_login}`).then(
          (res) => {
            if (!res.data[0]) return console.log("huh");
            streamer_cache[user_login] = res.data[0];
            save({ streamer_cache });
          }
        );

      axi(
        `https://api.twitch.tv/helix/videos?type=archive&first=1&user_id=${
          streamer_cache[user_login]?.id || 123
        }`
      ).then((res) => {
        if (
          !res ||
          !res.data[0]?.created_at ||
          Date.now() - new Date(res.data[0].created_at).getTime() >
            1000 * 60 * 60 * 24
        ) {
          return console.log("loss:", res);
        }
        let date = Date.now() + 1000 * 60 * 60 * 10;
        later[res.data[0].id] = {
          date,
          vod_id: res.data[0].id,
          user_login,
        };
        later[user_login] = {
          date,
          vod_id: res.data[0].id,
          user_login,
        };
        save({ later });
        // console.log(later);
      });
    }
    save({ later });
  },
  auth: (e) => {
    let popup = window.open(
      "https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=0helgn8mxggk3ffv53sxgqrmkdojb3&redirect_uri=https://misc.auraxium.dev/twotch&scope=user%3Aread%3Afollows&state=${window.location.href}",
      "popup",
      "popup=true"
    );

    let auth = (event) => {
      // console.log(event.data);
      if (!event.data?.slice || event.data.slice(0, 4) != "tsf_") return;
      let ind = event.data.indexOf("access_token=");
      // console.log(ind);
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
      axi("https://api.twitch.tv/helix/users").then((res) => {
        console.log(res);
        cred = { ...cred, ...res.data[0] };
        console.log(cred);
        save({ cred });
        main();
        // window.location.reload()
      });
    };

    window.addEventListener("message", auth, false);
  },
};

document.addEventListener("click", (e) => {
  if (e.target?.classList)
    [...e.target.classList].forEach((el) => clickable[el] && clickable[el](e));
  if (ctx?.style?.display == "flex") {
    ctx.style.display = "none";
    cur_ctx = "";
  }
});

let ctxable = {
  "icon-tabler-movie": async (e) => {
    let ctrl = e.ctrlKey;
    let el = e.target.firstElementChild;
    let user_login =
      el.getAttribute("user_login") ||
      document.querySelector("h1.tw-title")?.innerHTML.toLowerCase() ||
      null;
    e.preventDefault();
    e.stopPropagation();
    if (!streamer_cache[user_login])
      await axi(`https://api.twitch.tv/helix/users?login=${user_login}`).then(
        (res) => {
          if (!res.data[0]) return console.log("huh");
          streamer_cache[user_login] = res.data[0];
          save({ streamer_cache });
        }
      );
    let id = streamer_cache[user_login].id;
    axi(`https://api.twitch.tv/helix/videos?type=archive&user_id=${id}`).then(
      (res) =>
        ctrl
          ? window.open(`https://www.twitch.tv/videos/${res.data[0].id}`)
          : (window.location = `https://www.twitch.tv/videos/${res.data[0].id}`)
    );
    // .then(res => ctrl ? window.open(`https://www.twitch.tv/videos/${res.data[0].id}`) : window.location = `https://www.twitch.tv/videos/${res.data[0].id}`);
  },
};

document.addEventListener("contextmenu", (e) => {
  if (e.target?.classList)
    [...e.target.classList].forEach((el) => ctxable[el] && ctxable[el](e));
});

let midable = {
  // 'stream': (e) => window.open(`https://twitch.tv/${e.target.dataset.user_login}`),
  // 'vod': (e) => window.open(`https://www.twitch.tv/videos/${e.target.dataset.vod_id}`),
  "icon-tabler-movie": async (e) => {
    // let el = e.target.firstElementChild;
    // window.open(`https://www.twitch.tv/${el.getAttribute('user_login')}/videos?filter=archives&sort=time`);
    let el = e.target.firstElementChild;
    let user_login =
      el.getAttribute("user_login") ||
      document.querySelector("h1.tw-title")?.innerHTML.toLowerCase() ||
      null;
    e.preventDefault();
    e.stopPropagation();
    if (!streamer_cache[user_login])
      await axi(`https://api.twitch.tv/helix/users?login=${user_login}`).then(
        (res) => {
          if (!res.data[0]) return console.log("huh");
          streamer_cache[user_login] = res.data[0];
          save({ streamer_cache });
        }
      );
    let id = streamer_cache[user_login].id;
    axi(`https://api.twitch.tv/helix/videos?type=archive&user_id=${id}`).then(
      (res) => window.open(`https://www.twitch.tv/videos/${res.data[0].id}`)
    );
  },
};

document.addEventListener("mousedown", (e) => {
  if (e.button != 1) return;
  if (e.target?.classList)
    [...e.target.classList].forEach((el) => midable[el] && midable[el](e));
});

// cmt = {
//   'username': (msg, res) => res(document.querySelector('h1.tw-title')?.innerHTML.toLowerCase() || null),
// };

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   cmt[message.type] && cmt[message.type](message, sendResponse, sender);
// });

// chrome.runtime.sendMessage

// document.addEventListener('click', e => {
//   if(e.target.dataset.fiie) console.log(e.target.dataset.fiie)
// })

//#endregion

/* notes
  cant just click button cause the function is not in page doc; long arjous work around 

    let now = Date.now()

   if(now < window.cc?.date) lives = window.cc.res;
   else if (!window.cc || (window.cc != -1 && window.cc.date < now)) {
     window.cc = -1;
     lives = await axi(`https://api.twitch.tv/helix/streams/followed?user_id=${cred.id}`);
     if (!lives?.data?.length) {
       delete cache[`https://api.twitch.tv/helix/streams/followed?user_id=${cred.id}`]
       delete window.cc
       return;
     } 
     window.cc = { res: { ...lives }, date: now + 60 * 1000 * 3 }
     console.log('lives:', lives);
   }

*/
