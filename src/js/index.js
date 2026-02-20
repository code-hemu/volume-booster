/*******************************************************************************
 * 
    Volume Booster - Increase sound
    Copyright (C) 2020-present Hemanta gayen

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/code-hemu/volume-booster
*/
var background = {
  "port": null,
  "message": {},
  "receive": function (id, callback) {
    if (id) {
      background.message[id] = callback;
    }
  },
  "send": function (id, data) {
    if (id) {
      API.runtime.sendMessage({
        "method": id,
        "data": data,
        "path": "popup-to-background"
      }, function () {
        return API.runtime.lastError;
      });
    }
  },
  "connect": function (port) {
    API.runtime.onMessage.addListener(background.listener); 
    if (port) {
      background.port = port;
      background.port.onMessage.addListener(background.listener);
      background.port.onDisconnect.addListener(function () {
        background.port = null;
      });
    }
  },
  "post": function (id, data) {
    if (id) {
      if (background.port) {
        background.port.postMessage({
          "method": id,
          "data": data,
          "path": "popup-to-background",
          "port": background.port.name
        });
      }
    }
  },
  "listener": function (e) {
    if (e) {
      for (let id in background.message) {
        if (background.message[id]) {
          if ((typeof background.message[id]) === "function") {
            if (e.path === "background-to-popup") {
              if (e.method === id) {
                background.message[id](e.data);
              }
            }
          }
        }
      }
    }
  }
};

var app = {};

app.tab = {
  "id": {
    "active": function() {
      return new Promise(((resolve) => {
        API.tabs.query({
          active: true,
          currentWindow: true
        }, (tabs => {
          let tabId = null;
          if(!chrome.runtime.lastError){
            if(tabs[0].url != LINKS.options){
              tabId = tabs[0].id;
            }
          }
          resolve(tabId);
        }))
      }));
    },
    "params": function() {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams ? urlParams.get("tabId") ? urlParams.get("tabId") : null : null;
    }
  },
  "audible": function() {
    return new Promise(((resolve) => {
      API.tabs.query({
        audible: true,
        windowType: "normal"
      }, (tabs => {
        tabs.sort((currentTab, oldTab) => currentTab.id - oldTab.id);
        let row_tab = []
        tabs.forEach(tab => {
          if (NORMALIZE(LINKS.options) != NORMALIZE(tab.url)) {
            row_tab.push(tab);
          }
        });
        resolve(row_tab);
      }));
    }));
  },
  "update": function() {
    API.tabs.onUpdated.addListener(
      function (tabId, changeInfo, tab) {
          DEBOUNCE(app.list, 500)
      }
    );
  },
  "remove": function(){
    API.tabs.onRemoved.addListener(app.close);
  }
}


app.close = function(e) {
    if (app.tab.id.params() != null) {
      if (e == app.tab.id.params()) {
        window.close(); 
      }
    }
}

app.storage = {
  set: function(key, value) {
    return new Promise((resolve) => {
      API.storage.local.set({[key]: value}, resolve);
    });
  },
  get: function(key) {
    return new Promise((resolve) => {
      API.storage.local.get([key], (result) => {
        resolve(result[key]);
      });
    });
  }
}

app.trenslate = function() {
  return new Promise((resolve) => {
    const elements = document.querySelectorAll("[data-message]");
    for (const element of elements) {
      const key = element.dataset.message;
      const message = chrome.i18n.getMessage(key);
      if (message) {
        element.textContent = message;
      } else {
        console.error("Missing chrome.i18n message:", key);
      }
    }
    resolve();
  });
}

app.text = function() {
  $(".footer-text").innerText = `${API.runtime.getManifest().name} v.${API.runtime.getManifest().version}`;
}

app.link = function() {
    $("#header-icons a")? $("#header-icons a").href = LINKS.homepage : '';
    $(".footer-fb").addEventListener("click", function () {background.send("url", {"url": LINKS.facebook})});
    $(".footer-yt").addEventListener("click", function () {background.send("url", {"url": LINKS.youtube})});
    $(".footer-web").addEventListener("click", function () {background.send("url", {"url": LINKS.twitter})});
}

app.Speaker = {
  "init": function () {
    this.speaker = new SpeakerAnimation('#speaker');
  },
  "gain": function (value) {
    this.speaker.gain(value);
  }
}

app.event = {
  "rate": function() {
    $(".star").forEach((event)=>{
      event.addEventListener("click",(target)=>{
        const atr = target.currentTarget.getAttribute("data-action");
        atr == 'support' ? 
        background.send("url", {"url":  LINKS.support}) :
        atr == 'review' ? 
        background.send("url", {"url":  LINKS.review}) : '';
      });
    });
  },
  "mode": function() {
    app.storage.get("darkMode").then((darkMode)=>{
      $("#toogle").checked = darkMode;
      if (darkMode) {
        if (!$("body").classList.contains('dark')){
          $("body").classList.add('dark')
        }
      }else{
        if ($("body").classList.contains('dark')){
          $("body").classList.remove('dark');
        }
      }
    });

    $("#toogle").addEventListener("click",async (event)=> {
      const darkMode = event.currentTarget.checked;
      await app.storage.set("darkMode", darkMode); 
      if (darkMode) {
        if (!$("body").classList.contains('dark')){
          $("body").classList.add('dark')
        }
      }else{
        if ($("body").classList.contains('dark')){
          $("body").classList.remove('dark');
        }
      }
    });
  },
  "list": function() {
    $(".tabs__list").addEventListener("click", (event) => {
      event.preventDefault();
      const ele = event.target.closest(".tab");
      const tabId = parseInt(ele.dataset.tabId, 10);
      API.tabs.update(tabId, {active: true}, (tab) => {
          API.windows.update(tab.windowId, {
              focused: true
          })
          API.runtime.lastError || (app.close(tabId));
      });
    },false);
  },
  "popup": function() {
    if(app.tab.id.params()==null && $(".popupbtn").disabled == true){
      $(".volume-slider").addEventListener("change", async ()=> {
        const audioStates = await app.storage.get("audioStates");
        if(audioStates){
          const tabId = await app.tab.id.active();
          console.log(audioStates)
          if(audioStates[tabId]){
            $(".popupbtn").disabled = false;
            $(".popupbtn").style.background = "var(--btn-color)";
            $(".popupbtn").style.cursor = "pointer";
            $(".popupbtn img").src = "../icons/popup.svg";
          }
        }
      });
      $(".popupbtn").addEventListener("click", async ()=>{
        background.send("popup", app.tab.id.params() == null ? {"tabId": await app.tab.id.active()} : null);
        window.close();
      });
    }
  },
  "input": function() {
    $(".volume-slider").addEventListener("input", async (event)=> {
      var range = event.currentTarget.value;
      $(".volume-current-value").innerText = range * 6;
      app.Speaker.gain(range * 6);
      const tabId = app.tab.id.params() != null ? app.tab.id.params() : (await app.tab.id.active());
      background.send("volume", {"value": parseInt(range * 6), "tabId": tabId});
    });

    $(".speaker").addEventListener("click", async ()=>{
      app.Speaker.gain(0);
      $(".volume-slider").value = 0;
      $(".volume-current-value").innerText = 0;
      const tabId = app.tab.id.params() != null ? app.tab.id.params() : (await app.tab.id.active());
      background.send("volume", {"value":"0", "tabId": tabId});
    });
  },
  "reset": function() {
    $(".resetbtn").addEventListener("click", ()=>{
      const reset_img = $(".resetbtn img");
      if (reset_img) {
        reset_img.style.transform =  
        reset_img.style.transform == '' ? "rotate(720deg) translateZ(0)" : '';        
      }
      app.set.value(1);
      background.send("reset");
    });
  }
}

app.set = {
  "size": function() {
    if (app.tab.id.params() == null) {
      const body = document.body;
      const html = document.documentElement;
      if (body && html) {
        body.style.width = "410px";
        html.style.height = "auto";
      }
    }
  },
  "value": function(val){
    $(".volume-current-value").innerText = Math.round(100 * val);
    $(".volume-slider").value = Math.round((100 * val) / 6) ;
    app.Speaker.gain(Math.round(100 * val));
  },
  "button": function(){
    if(app.tab.id.params()){
      $(".resetbtn").disabled = true;
      $(".resetbtn").style.background = "#fc6060";
      $(".resetbtn").style.cursor = "no-drop";

      $(".popupbtn").disabled = true;
      $(".popupbtn").style.background = "#4bb97f";
      $(".popupbtn").style.cursor = "no-drop";
      $(".popupbtn img").src = "../icons/window.svg";

    } else{
        $(".popupbtn").disabled = true;
        $(".popupbtn").style.background = "#fc6060";
        $(".popupbtn").style.cursor = "no-drop";
        $(".popupbtn img").src = "../icons/popup.svg";
    }
  },
  "list": function() {
    let allTab = document.querySelectorAll("a.tab");
    if (allTab) {
      for(element of allTab){
        const parentElement = element.parentNode; 
        parentElement.removeChild(element); 
      }
    }
    app.tab.audible().then((tabs) => {
      if (tabs) {
        $(".tabs__title").textContent = API.i18n.getMessage(0 < tabs.length ? 'active_tabs' : 'deactive_tabs');
        tabs.forEach(tab => {
            const ele = $("#template-tab").content;
            ele.querySelector(".tab").dataset.tabId = tab.id;
            ele.querySelector(".tab__icon-image").src = tab.favIconUrl;
            ele.querySelector(".tab__title").textContent = tab.title;
            if (tab.id == app.tab.id.params()) {
              $("title").textContent = tab.title;
            }
            $(".tabs__list").appendChild(document.importNode(ele, true));
          });
          if (2 < tabs.length) {
            if (!$(".tabs__list").classList.contains('more')){
              $(".tabs__list").classList.add('more');
            }
          }else{
            if ($(".tabs__list").classList.contains('more')){
              $(".tabs__list").classList.remove('more');
            }
          }
      }
    });
  },
  "close": function(tabId) {
    const params = app.tab.id.params();
    if(params){
      if(params == tabId){
        window.close();
      }
    }
  }
}
app.get = {
  "query": async ()=>{
    const tabId = app.tab.id.params() != null ? app.tab.id.params() : (await app.tab.id.active());
    background.send("query", {tabId: tabId, isPopup: app.tab.id.params() != null ? true : false});
  }
}

app.load = function() {
  app.get.query();
  app.set.size();
  app.set.list();
  app.set.button();


  app.trenslate().then(() => {
    app.text();
    app.link();
  });

  app.Speaker.init();
  app.event.rate();
  app.event.mode();
  app.event.list();
  app.event.input();
  app.event.reset();
  app.event.popup();
  app.tab.update();
  app.tab.remove();
}

background.connect(API.runtime.connect({"name": "popup"}));
background.receive("volume-value", app.set.value);
background.receive("is-close", app.set.close);
window.addEventListener("load", app.load, false);
